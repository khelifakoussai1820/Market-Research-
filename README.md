<div align="center">

# Market Research — Brand Decision Studio

**Plateforme d'aide à la décision de marque propulsée par l'IA**

Collecte de retours, analyse concurrentielle, génération de rapports de marché
et assistant conversationnel réunis dans un seul environnement de travail.

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b-F55036?style=flat)](https://groq.com/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-RAG-green?style=flat)](https://www.trychroma.com/)

</div>

---

## Table des matieres

1. [Presentation](#presentation)
2. [Fonctionnalites](#fonctionnalites)
3. [Demonstration du flux](#demonstration-du-flux)
4. [Stack technique](#stack-technique)
5. [Systeme de design](#systeme-de-design)
6. [Architecture systeme](#architecture-systeme)
7. [Demarrage rapide](#demarrage-rapide)
8. [API — Endpoints](#api--endpoints)
9. [Modeles de donnees](#modeles-de-donnees)
10. [Plans tarifaires](#plans-tarifaires)
11. [Structure du projet](#structure-du-projet)
12. [Configuration avancee](#configuration-avancee)
13. [Contribution](#contribution)
14. [Licence](#licence)

---

## Presentation

**Market Research** est un studio de decision de marque qui transforme les retours clients et les donnees du marche en decisions eclairees. Concu pour les entrepreneurs, chefs de produit et strateges de marque, il elimine la dependence aux etudes de marche couteuses en combinant :

- **La recherche web en temps reel** via Tavily (5 requetes paralleles par analyse)
- **Le raisonnement strategique** via Groq LLM (llama-3.3-70b-versatile)
- **La memoire vectorielle** via ChromaDB (RAG sur les rapports generes)
- **Une interface guidée** qui conduit l'utilisateur de l'idée initiale au rapport final

> L'objectif : passer d'une intuition de marque a une strategie documentee en moins de 5 minutes.

---

## Fonctionnalites

### Moteur d'analyse de marque
- Description libre de l'idée en langage naturel
- Analyse IA : mission, industrie, audience cible, ton de marque, marche
- Suggestions de concurrents locaux bases sur la recherche web
- Edition et validation par l'utilisateur avant sauvegarde

### Rapport de marche automatique
- 5 recherches web paralleles : concurrence, tendances, actualites, avis clients, opportunites
- Generation d'un rapport structure : score de sante, synthese, tendances, opportunites, menaces, recommandations, carte concurrentielle
- Export JSON telechargeable
- Indexation RAG pour questioning post-analyse

### Assistant strategique (Chat)
- Questions / reponses basees sur le rapport de marque
- Contexte RAG : retrieval des chunks pertinents depuis ChromaDB
- Reponses actionnables en francais, style conseiller strategique
- Mode demonstrable sans marque associee

### Authentification
- Inscription / connexion par email + mot de passe
- JWT access token (24h) + refresh token (30j)
- Rotation automatique des tokens
- Rafraichissement transparent cote client

### Interface multi-etapes
- Wizard en 4 etapes : Idee → Profil → Concurrents → Rapport
- Stepper visuel avec progression
- Mode sombre / clair automatique (prefers-color-scheme)

---

## Demonstration du flux

```
Page d'accueil
    │
    ├── "Lancer le studio"
    │       │
    │       ▼
    │   ┌─────────────────────────────┐
    │   │  ETAPE 1 — Votre idee       │  ← Description libre (min. 10 car.)
    │   └──────────┬──────────────────┘
    │              │  Analyse IA
    │              ▼
    │   ┌─────────────────────────────┐
    │   │  ETAPE 2 — Profil de marque │  ← Vérifier / éditer les suggestions
    │   └──────────┬──────────────────┘
    │              │
    │              ▼
    │   ┌─────────────────────────────┐
    │   │  ETAPE 3 — Concurrents      │  ← Ajouter / supprimer / modifier
    │   └──────────┬──────────────────┘
    │              │  Sauvegarde + 5 recherches web
    │              ▼
    │   ┌─────────────────────────────┐
    │   │  ETAPE 4 — Rapport          │  ← Score, synthese, tendances,
    │   │                             │     opportunites, menaces, concurrence
    │   └──────────┬──────────────────┘
    │              │
    │              ▼
    │   ┌─────────────────────────────┐
    │   │  Chat strategique           │  ← Posez vos questions au rapport
    │   └─────────────────────────────┘
    │
    └── "Découvrir les modules"
            │
            ▼
        Fonctionnement en 3 temps :
        Collectez → Analysez → Décidez
```

---

## Stack technique

### Backend

| Composant | Technologie | Role |
|-----------|-------------|------|
| Framework web | **FastAPI** + Uvicorn | API REST async, auto-doc `/docs` |
| Authentification | **python-jose** + **bcrypt** | JWT HS256, hashage mot de passe |
| ORM | **SQLAlchemy 2.x** | Mapping objet-relationnel |
| Base de donnees | **SQLite** (defaut) / PostgreSQL | Persistance des profils et rapports |
| Validation | **Pydantic v2** | Schemas de request/response |
| LLM | **Groq** — llama-3.3-70b-versatile | Raisonnement strategique, generation de rapports |
| Recherche web | **Tavily API** | 5 recherches paralleles par analyse |
| RAG | **ChromaDB** + ONNX MiniLM-L6-V2 | Vectorisation locale, retrieval semantique |
| Migrations | **Alembic** | Versionnage du schema DB |

### Frontend

| Composant | Technologie | Role |
|-----------|-------------|------|
| UI | **React 19** + JSX | Composants fonctionnels |
| Routing | **React Router DOM 7** | Navigation SPA |
| Build | **Vite 8** | Dev server HMR, bundling |
| CSS | **Vanilla CSS** (variables custom) | Systeme de design complet |
| HTTP | **Fetch API** + AbortController | Client API avec timeout |

### Infrastructure

| Composant | Technologie | Role |
|-----------|-------------|------|
| Conteneurisation | **Docker** + Docker Compose | Isolation des services |
| Backend image | `python:3.11-slim` | Runtime Python optimise |
| Frontend image | `node:22-alpine` | Runtime Node.js leger |
| Persistance vecteurs | Volume Docker `chroma_db` | Conservation entre les redemarrages |

---

## Architecture systeme

### Flux haute niveau

```mermaid
flowchart TB
    Client["Frontend React<br/>(browser)"]

    subgraph API["FastAPI Application"]
        CORS["CORS Middleware"]
        subgraph Routers["API Routers (/api/v1)"]
            AuthR["auth — register / login / logout"]
            BrandR["brands — describe / confirm / get"]
            RespR["responses — analyze / report / export"]
            ChatR["chat — ask about brand"]
        end
    end

    subgraph Services["Couche metier"]
        AuthS["auth_services"]
        BrandS["brand_services"]
        ReportS["report_services (orchestrateur)"]
        SearchS["search_services (5 recherches paralleles)"]
        LLMS["llm_services"]
        RAGS["rag_services"]
        ChatS["chat_services"]
    end

    subgraph External["Fournisseurs externes"]
        Groq["Groq LLM<br/>llama-3.3-70b-versatile"]
        Tavily["Tavily<br/>Web Search API"]
    end

    subgraph Storage["Persistance"]
        DB[("SQLite / PostgreSQL")]
        Chroma[("ChromaDB<br/>vecteurs RAG")]
    end

    Client -->|HTTPS + Bearer JWT| CORS --> Routers
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

    LLMS --> Groq
    LLMS --> Tavily
    RAGS --> Chroma
    AuthS --> DB
    BrandS --> DB
    ReportS --> DB
```

### Pipeline d'analyse de marche (sequence)

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant API as FastAPI
    participant RS as report_services
    participant SS as search_services
    participant LLM as Groq LLM
    participant TAV as Tavily
    participant DB as SQLite
    participant CH as ChromaDB

    U->>API: POST /responses/analyze/{brand_id}
    API->>RS: generate_full_report()
    RS->>SS: run_market_research()
    par 5 recherches paralleles
        SS->>TAV: analyse concurrence
        SS->>TAV: tendances marche
        SS->>TAV: actualites industrie
        SS->>TAV: avis clients
        SS->>TAV: opportunites
    end
    TAV-->>SS: contexte agrege
    SS-->>RS: search_context
    RS->>LLM: generate_market_report()
    LLM-->>RS: score, synthese, tendances, opportunites, menaces, recommandations
    RS->>DB: sauvegarde MarketReport
    RS->>CH: indexation RAG (vecteurs)
    RS-->>U: Rapport complet
```

### Schema de la base de donnees

```mermaid
erDiagram
    USER ||--o{ BRAND : possede
    BRAND ||--o{ COMPETITOR : a
    BRAND ||--o{ MARKET_REPORT : a

    USER {
        int id PK
        string name
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

---

## Demarrage rapide

### Prérequis

- [Docker](https://www.docker.com/get-started) + Docker Compose
- Cles API :
  - **Groq** : [console.groq.com](https://console.groq.com/) (gratuit)
  - **Tavily** : [tavily.com](https://tavily.com/) (plan gratuit disponible)

### 1. Cloner le depot

```bash
git clone https://github.com/votre-org/market-research.git
cd market-research
```

### 2. Configurer les variables d'environnement

Creer un fichier `.env` a la racine :

```env
# API Keys
GROQ_API_KEY=gsk_votre_cle_groq
TAVILY_API_KEY=tvly-dev-votre_cle_tavily

# JWT
SECRET_KEY=votre-secret-ultra-securise

# URLs
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

### 3. Lancer avec Docker Compose

```bash
docker compose up -d --build
```

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | [http://localhost:5173](http://localhost:5173) | Interface utilisateur |
| Backend API | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger UI (auto-genere) |
| Backend API | [http://localhost:8000/redoc](http://localhost:8000/redoc) | Documentation ReDoc |

### 4. Utilisation

1. Ouvrir `http://localhost:5173`
2. Cliquer sur **"Lancer le studio"**
3. Decrire votre marque dans la zone de texte
4. Verifier et valider les suggestions IA
5. Editer la liste des concurrents
6. Lancer l'analyse (~30-90 secondes)
7. Consulter le rapport et poser des questions au chat

---

## API — Endpoints

### Authentification

| Methode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/v1/auth/register` | Non | Inscription — retourne JWT |
| `POST` | `/api/v1/auth/login` | Non | Connexion — retourne JWT |
| `POST` | `/api/v1/auth/logout` | Non | Deconnexion (stateless) |
| `POST` | `/api/v1/auth/refresh` | Non | Rotation du refresh token |

### Marques

| Methode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/v1/brands/describe` | Non | Analyse IA d'une description libre |
| `POST` | `/api/v1/brands/confirm` | Oui | Sauvegarde du profil + concurrents |
| `GET` | `/api/v1/brands/{brand_id}` | Oui | Recuperation d'une marque |

### Rapports

| Methode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/v1/responses/analyze/{brand_id}` | Oui | Pipeline complet : 5 recherches + LLM |
| `GET` | `/api/v1/responses/report/{brand_id}` | Oui | Dernier rapport genere |
| `GET` | `/api/v1/responses/export/{brand_id}` | Oui | Telechargement JSON |

### Chat

| Methode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/v1/chat/{brand_id}` | Oui | Question / reponse RAG |

### Exemple de requete

```bash
# Inscription
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Jean", "email": "jean@example.com", "password": "secret123"}'

# Decrir une marque
curl -X POST http://localhost:8000/api/v1/brands/describe \
  -H "Content-Type: application/json" \
  -d '{"description": "Application mobile de livraison de repas faits maison par des chefs locaux"}'

# Lancer l'analyse
curl -X POST http://localhost:8000/api/v1/responses/analyze/1 \
  -H "Authorization: Bearer VOTRE_TOKEN"

# Poser une question
curl -X POST http://localhost:8000/api/v1/chat/1 \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question": "Quels sont les principaux concurrents ?"}'
```

---

## Modeles de donnees

### Request Schemas

| Schema | Champs | Utilise par |
|--------|--------|-------------|
| `RegisterRequest` | `name`, `email`, `password` | `POST /auth/register` |
| `LoginRequest` | `email`, `password` | `POST /auth/login` |
| `BrandDescribeRequest` | `description` | `POST /brands/describe` |
| `BrandConfirmRequest` | `name`, `description`, `mission`, `industry`, `target_audience`, `brand_tone`, `competitors[]` | `POST /brands/confirm` |
| `ChatRequest` | `question` | `POST /chat/{brand_id}` |

### Response Schemas

| Schema | Champs | Utilise par |
|--------|--------|-------------|
| `TokenResponse` | `access_token`, `refresh_token`, `token_type` | Register, Login, Refresh |
| `BrandSuggestionResponse` | `mission`, `industry`, `target_audience`, `brand_tone`, `suggested_competitors[]`, `market` | `POST /brands/describe` |
| `BrandOut` | `id`, `name`, `description`, `mission`, `industry`, `target_audience`, `brand_tone`, `created_at` | `POST /brands/confirm` |
| `MarketReportOut` | `id`, `brand_id`, `health_score`, `executive_summary`, `market_trends`, `opportunities[]`, `threats[]`, `recommendations[]`, `competitor_map[]`, `created_at` | `POST /responses/analyze`, `GET /responses/report` |
| `ChatResponse` | `answer`, `sources[]` | `POST /chat/{brand_id}` |

---

## Plans tarifaires

> Les plans ci-dessous definissent la structure tarifaire visee pour la plateforme.
> Actuellement, l'application est entierement gratuite et ne contient pas d'integration de paiement.

### Gratuit

| Element | Limite |
|---------|--------|
| Marques analysees | 3 |
| Rapports de marche | 3 |
| Questions chat | 10 par marque |
| Recherches web | 5 par analyse |
| Export JSON | Inclus |
| Support | Communaute |

### Pro — 19,90 EUR/mois

| Element | Limite |
|---------|--------|
| Marques analysees | Illimite |
| Rapports de marche | Illimite |
| Questions chat | Illimite |
| Recherches web | 5 par analyse |
| Export JSON + PDF | Inclus |
| Historique complet | 12 mois |
| Priorite LLM | Reponses plus rapides |
| Support | Email |

### Entreprise — 79,90 EUR/mois

| Element | Limite |
|---------|--------|
| Tout le plan Pro | |
| Equipes | Jusqu'a 10 utilisateurs |
| Rapports personnalises | Templates brandes |
| API access | Integregation tierce |
| Donnees d'equipe | Tableau de bord partage |
| SLA | Reponse sous 24h |
| Account manager | Contact dedie |

### Fonctionnalites prevues par plan

| Fonctionnalite | Gratuit | Pro | Entreprise |
|----------------|---------|-----|------------|
| Analyse de marque IA | 3/mois | Illimite | Illimite |
| Rapport de marche | 3/mois | Illimite | Illimite |
| Chat RAG | 10 questions/marque | Illimite | Illimite |
| Recherche web | 5 requetes/analyse | 10 requetes/analyse | 20 requetes/analyse |
| Export JSON | Oui | Oui | Oui |
| Export PDF | — | Oui | Oui + personnalise |
| Tableau de bord equipes | — | — | Oui |
| API access | — | — | Oui |
| Support prioritaire | — | — | Oui |

---

## Structure du projet

```
market-research/
├── .env                          # Variables d'environnement (secrets)
├── .gitignore
├── docker-compose.yml            # Orchestration des services
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                   # Point d'entree FastAPI
│   ├── init_db.py                # Initialisation de la base
│   ├── sql_app.db                # SQLite (defaut)
│   ├── alembic/                  # Migrations DB
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py         # Settings (pydantic-settings)
│   │   │   ├── database.py       # Engine SQLAlchemy
│   │   │   ├── security.py       # JWT + bcrypt
│   │   │   └── dependencies.py   # get_current_user_dep
│   │   ├── models/
│   │   │   ├── user.py           # Table users
│   │   │   ├── brand.py          # Table brands
│   │   │   ├── competitor.py     # Table competitors
│   │   │   └── report.py         # Table market_reports
│   │   ├── schemas/
│   │   │   ├── auth.py           # Register/Login/Token
│   │   │   ├── brand.py          # Describe/Confirm/Out
│   │   │   └── report.py         # MarketReportOut
│   │   ├── services/
│   │   │   ├── auth_services.py  # Hashage, JWT, login
│   │   │   ├── brand_services.py # Analyse + sauvegarde marque
│   │   │   ├── report_services.py # Orchestrateur pipeline
│   │   │   ├── search_services.py # 5 recherches Tavily
│   │   │   ├── llm_services.py   # Groq LLM (3 fonctions)
│   │   │   ├── rag_services.py   # ChromaDB index + query
│   │   │   └── chat_services.py  # Q/R RAG
│   │   └── api/
│   │       └── v1/
│   │           ├── auth.py       # Routes auth
│   │           ├── brands.py     # Routes marques
│   │           ├── responses.py  # Routes rapports
│   │           └── chat.py       # Routes chat
│   └── chroma_db/                # Persistance vecteurs (volume Docker)
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── eslint.config.js
    └── src/
        ├── index.css             # Variables CSS, reset global
        ├── App.jsx               # Page d'accueil
        ├── App.css               # Styles page d'accueil
        ├── main.jsx              # Routeur React
        ├── api/
        │   └── client.js         # Client HTTP (fetch + JWT refresh)
        ├── pages/
        │   ├── Login.jsx/css     # Connexion
        │   ├── Signup.jsx/css    # Inscription
        │   ├── Idea.jsx/css      # Etape 1 — Description
        │   ├── BrandReview.jsx/css  # Etape 2 — Profil
        │   ├── BrandCompetitors.jsx/css # Etape 3 — Concurrents
        │   ├── Research.jsx/css  # Etape 4 — Rapport
        │   ├── Results.jsx/css   # Resultats editables
        │   ├── Chat.jsx/css      # Assistant strategique
        │   ├── Dashboard.jsx/css # Tableau de bord (placeholder)
        │   ├── Formulaire.jsx/css # Formulaire (placeholder)
        │   └── NotFound.jsx/css  # Page 404
        └── components/
            ├── AppShell.jsx/css  # Layout wizard + stepper
            ├── SentimentChart.jsx # Graphique sentiment (placeholder)
            ├── FormRenderer.jsx  # Rendu de formulaire
            ├── DecisionCard.jsx  # Carte de decision
            └── XPBar.jsx         # Barre de progression
```

---

## Configuration avancee

### Variables d'environnement

| Variable | Defaut | Description |
|----------|--------|-------------|
| `GROQ_API_KEY` | — | Cle API Groq (requis) |
| `TAVILY_API_KEY` | — | Cle API Tavily (requis) |
| `SECRET_KEY` | `changeme-super-secret` | Secret JWT |
| `DATABASE_URL` | `sqlite:///./sql_app.db` | URL de connexion DB |
| `BACKEND_URL` | `http://localhost:8000` | URL du backend (CORS) |
| `FRONTEND_URL` | `http://localhost:5173` | URL du frontend (CORS) |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Modele LLM utilise |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` (24h) | Duree de validite du access token |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `30` | Duree de validite du refresh token |

### Passer a PostgreSQL

Modifier `DATABASE_URL` dans le `.env` :

```env
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/market_research
```

Puis lancer les migrations Alembic :

```bash
docker compose exec backend alembic upgrade head
```

### Configuration LLM

Le modele LLM et les parametres peuvent etre ajustes dans `backend/app/services/llm_services.py` :

- **Temperature rapport** : `0.3` (plus precis)
- **Temperature brand** : `0.4` (equilibre)
- **Temperature chat** : `0.5` (plus creatif)
- **Timeout** : `30` secondes
- **Contexte max** : `4000` caracteres (trim)

---

## Contribution

### Convention de code

- **Backend** : Python 3.11+, style PEP 8, type hints
- **Frontend** : JSX, React hooks, CSS variables (pas de framework CSS)
- **Commits** : messages en francais, format court
- **Branches** : `main` (production), `dev` (developpement)

### Demarrer en mode developpement

```bash
# Backend (sans Docker)
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (sans Docker)
cd frontend
npm install
npm run dev
```

### Tests

```bash
# Backend — test d'integration
cd backend
python test_flow.py
```

---

## Licence

Propritaire. Tous droits reserves.

---

<div align="center">

**Market Research** — Transformez les opinions de vos clients en decisions de marque assumees.

</div>
