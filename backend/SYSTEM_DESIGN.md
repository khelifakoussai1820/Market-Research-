# Market Research API — System Design

## 1. High-Level Architecture

```mermaid
flowchart TB
    Client["Client / Frontend<br/>(browser, Swagger /docs)"]

    subgraph API["FastAPI Application (main.py)"]
        CORS["CORS Middleware"]
        subgraph Routers["API Routers (/api/v1)"]
            AuthR["auth<br/>register / login / logout"]
            BrandR["brands<br/>describe / confirm / get"]
            RespR["responses<br/>analyze / report / export"]
            ChatR["chat<br/>ask about brand"]
        end
        Dep["Dependency:<br/>get_current_user_dep<br/>(JWT Bearer auth)"]
    end

    subgraph Services["Service Layer"]
        AuthS["auth_services<br/>hash, JWT, login"]
        BrandS["brand_services"]
        ReportS["report_services<br/>(orchestrator)"]
        SearchS["search_services<br/>(5 parallel searches)"]
        LLMS["llm_services"]
        RAGS["rag_services"]
        ChatS["chat_services"]
    end

    subgraph External["External Providers"]
        Groq["Groq LLM<br/>llama-3.3-70b-versatile"]
        Tavily["Tavily<br/>Web Search API"]
    end

    subgraph Storage["Persistence"]
        DB[("SQLite<br/>sql_app.db")]
        Chroma[("ChromaDB<br/>chroma_db/ (vectors)")]
    end

    Client -->|HTTPS + Bearer JWT| CORS --> Routers
    Routers --> Dep
    AuthR --> AuthS
    BrandR --> BrandS
    RespR --> ReportS
    ChatR --> ChatS

    BrandS --> LLMS
    ReportS --> SearchS
    ReportS --> LLMS
    ReportS --> RAGS
    ChatS --> RAGS
    ChatS --> LLMS
    SearchS --> LLMS

    LLMS --> Groq
    LLMS --> Tavily
    RAGS --> Chroma
    AuthS --> DB
    BrandS --> DB
    ReportS --> DB
```

## 2. Core User Flow — "Analyze Market" Pipeline

```mermaid
sequenceDiagram
    actor U as User
    participant API as FastAPI
    participant BS as brand_services
    participant RS as report_services
    participant SS as search_services
    participant LLM as Groq LLM
    participant TAV as Tavily
    participant DB as SQLite
    participant CH as ChromaDB

    U->>API: POST /auth/register + /auth/login
    API-->>U: JWT access_token

    U->>API: POST /brands/describe {description}
    API->>BS: analyze_brand_description()
    BS->>LLM: generate_brand_understanding()
    LLM-->>BS: mission, industry, audience, tone, competitors
    BS-->>U: suggestions (editable)

    U->>API: POST /brands/confirm {edited fields}
    API->>DB: save Brand + Competitors
    API-->>U: brand_id

    U->>API: POST /responses/analyze/{brand_id}
    API->>RS: generate_full_report()
    RS->>SS: run_market_research()
    par 5 parallel searches
        SS->>TAV: competitors
        SS->>TAV: market trends
        SS->>TAV: industry news
        SS->>TAV: customer discussions
        SS->>TAV: opportunities
    end
    TAV-->>SS: aggregated context
    SS-->>RS: search_context
    RS->>LLM: generate_market_report(brand, context)
    LLM-->>RS: health_score, summary, trends,<br/>opportunities, threats, recs, competitor_map
    RS->>DB: save MarketReport (JSON)
    RS->>CH: index_report() (RAG vectors)
    RS-->>U: Market Report JSON

    U->>API: GET /responses/export/{brand_id}
    API-->>U: downloadable .json file

    U->>API: POST /chat/{brand_id} {question}
    API->>CH: query_rag() retrieve context
    API->>LLM: answer_question(context)
    LLM-->>U: answer + sources
```

## 3. Database Schema (ER Diagram)

```mermaid
erDiagram
    USER ||--o{ BRAND : owns
    BRAND ||--o{ COMPETITOR : has
    BRAND ||--o{ MARKET_REPORT : has

    USER {
        int id PK
        string email UK
        string hashed_password
        datetime created_at
    }
    BRAND {
        int id PK
        int user_id FK
        string name
        text description
        text mission
        string industry
        text target_audience
        string brand_tone
        datetime created_at
    }
    COMPETITOR {
        int id PK
        int brand_id FK
        string name
        string url
        text summary
    }
    MARKET_REPORT {
        int id PK
        int brand_id FK
        float health_score
        text report_json
        text competitor_map_json
        datetime created_at
    }
```

## 4. API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | No | Create user, return JWT |
| POST | `/api/v1/auth/login` | No | Login, return JWT |
| POST | `/api/v1/auth/logout` | No | Stateless logout |
| POST | `/api/v1/brands/describe` | Yes | LLM suggests mission/industry/audience/tone/competitors |
| POST | `/api/v1/brands/confirm` | Yes | Save (edited) brand + competitors |
| GET | `/api/v1/brands/{brand_id}` | Yes | Fetch a brand |
| POST | `/api/v1/responses/analyze/{brand_id}` | Yes | Run full research pipeline |
| GET | `/api/v1/responses/report/{brand_id}` | Yes | Get latest saved report |
| GET | `/api/v1/responses/export/{brand_id}` | Yes | Download report as JSON file |
| POST | `/api/v1/chat/{brand_id}` | Yes | RAG-powered Q&A on report |

## 5. Technology Stack

| Layer | Technology |
|-------|-----------|
| Web framework | FastAPI + Uvicorn |
| Auth | JWT (python-jose) + bcrypt |
| ORM / DB | SQLAlchemy + SQLite |
| LLM | Groq `llama-3.3-70b-versatile` |
| Web search | Tavily API |
| Vector store / RAG | ChromaDB (persistent) |
| Validation | Pydantic v2 |

## 6. Component Responsibilities

- **Routers** (`app/api/v1`): HTTP layer, request/response validation, auth dependency.
- **Services** (`app/services`): business logic; keep routers thin.
  - `report_services` is the orchestrator: search -> LLM -> DB -> RAG index.
  - `llm_services` is the single integration point for Groq + Tavily.
  - `rag_services` wraps ChromaDB (index + query).
- **Models** (`app/models`): SQLAlchemy tables (all imported in `__init__.py`).
- **Schemas** (`app/schemas`): Pydantic request/response contracts.
- **Core** (`app/core`): config, database session, security, dependencies.
```
