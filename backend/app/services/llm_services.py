from groq import AsyncGroq
from tavily import TavilyClient
import json
from app.core.config import settings

# Initialize Groq client
groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)

# Initialize Tavily client
tavily = TavilyClient(api_key=settings.TAVILY_API_KEY)


def web_search(query: str) -> str:
    """Run a live Tavily web search, fall back to stub if key is not set."""
    if not settings.TAVILY_API_KEY or "your-tavily-key" in settings.TAVILY_API_KEY:
        return "Recent articles show a 15% growth in premium car accessories."
    try:
        response = tavily.search(query=query, max_results=3)
        results = response.get("results", [])
        if not results:
            return f"No results found for: {query}"
        return "\n".join(
            [f"- {r.get('title')}: {r.get('content', '')} ({r.get('url')})" for r in results]
        )
    except Exception as e:
        print(f"Tavily search failed for '{query}': {e}")
        return "Mock search result: Strong growth in premium car accessories market."


async def generate_brand_understanding(description: str, search_context: str = "") -> dict:
    """Use Groq LLM to analyze a brand description and return structured suggestions.

    `search_context` (when provided) contains real web-search results so the
    model can ground its competitor suggestions in the actual local market
    instead of defaulting to generic global brands.
    """
    context_block = ""
    if search_context.strip():
        context_block = f"""

Real web-search results about this market (use ONLY these to ground your
competitor suggestions — do not invent competitors that are not present here
or not known to operate in this market):
\"\"\"
{search_context}
\"\"\" """

    prompt = f"""You are an expert, locally-aware brand strategist. Analyze the company description below and return structured brand intelligence.

Company Description:
"{description}"
{context_block}

STRICT RULES:
- Detect the geographic market (country / city / region) from the description (e.g. "Algérie", "Algeria", "France", "USA"). Set "market" to that place, or "International" if none is mentioned.
- "suggested_competitors": list ONLY real companies that ACTUALLY operate and compete in that detected market. NEVER default to generic global fashion brands (Zara, H&M, Uniqlo, etc.) unless they genuinely operate there. Prefer local and regional players that real customers would name. If the search results above list competitors, limit yourself to those (you may add at most one well-known player only if it truly competes locally). If uncertain, list the most plausible local competitors and keep it to 2-3.
- "target_audience": reflect local reality (purchasing power, local segments).

Return ONLY a valid JSON object with exactly these keys:
{{
  "mission": "A concise inspiring brand mission statement",
  "industry": "The specific industry or niche",
  "target_audience": "Primary target audience description (localized)",
  "brand_tone": "Suggested brand tone (e.g. sleek, friendly, luxury, authoritative)",
  "market": "Detected geographic market",
  "suggested_competitors": ["Local Competitor 1", "Local Competitor 2", "Local Competitor 3"]
}}"""

    try:
        response = await groq_client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.4,
        )
        data = json.loads(response.choices[0].message.content)
        data.setdefault("market", None)
        data.setdefault("suggested_competitors", [])
        return data
    except Exception as e:
        print(f"Groq brand understanding failed: {e}")
        return {
            "mission": f"To deliver excellent value in: {description}",
            "industry": "General Business",
            "target_audience": "General public",
            "brand_tone": "Professional",
            "market": None,
            "suggested_competitors": ["Competitor A", "Competitor B", "Competitor C"],
        }


async def answer_question(question: str, context: str) -> str:
    """Answer a user question about their brand using retrieved report context."""
    prompt = f"""You are a market research assistant. Answer the user's question using ONLY the context below.
If the context does not contain the answer, say you don't have that information yet.

Context:
{context if context else "(no report data available)"}

Question: {question}

Answer concisely and helpfully."""

    try:
        response = await groq_client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Groq chat answer failed: {e}")
        return "Sorry, I couldn't generate an answer right now. Please try again."


async def generate_market_report(brand_data: dict, search_context: str) -> dict:
    """Use Groq LLM to generate a comprehensive market analysis report.

    The report is STRICTLY grounded in `search_context` (real web-search
    results) so the model does not fabricate statistics, company facts, or
    URLs.
    """
    prompt = f"""You are a rigorous market research analyst. Write a market report using ONLY the web search context provided below.

Brand Data:
{json.dumps(brand_data, indent=2, ensure_ascii=False)}

Web Search Context (real results from live search):
{search_context if search_context.strip() else "(no search results were returned)"}

STRICT RULES — do not violate any of them:
- Every factual claim, statistic, company name, and URL MUST come directly from the Web Search Context above. NEVER invent numbers, facts, quotes, or websites.
- If the context lacks enough information for a section, write a short honest note such as "Données insuffisantes dans les sources consultées" instead of guessing.
- competitor_map: include ONLY competitors that actually appear in the context. For each, provide "name", a one-to-two sentence "summary" drawn from the context, and "url" set to the EXACT url from the context if present, otherwise null. NEVER guess or fabricate a URL.
- health_score: a float from 1.0 to 10.0 reflecting the brand's position based ONLY on the evidence (competitive intensity, opportunities/threats found). If evidence is thin, keep it between 5.0 and 6.0 and state the uncertainty in the executive summary. Justify it implicitly through the analysis.

Return ONLY a valid JSON object with exactly these keys:
{{
  "health_score": 7.5,
  "executive_summary": "An executive summary grounded strictly in the search context",
  "market_trends": "Current market trends, only those supported by the context",
  "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
  "threats": ["Threat 1", "Threat 2", "Threat 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "competitor_map": [
    {{"name": "Real Competitor", "summary": "Brief analysis from the context", "url": "https://real-url-from-context.com or null"}}
  ]
}}"""

    try:
        response = await groq_client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.3,
        )
        data = json.loads(response.choices[0].message.content)
        # Defensive normalisation so the frontend never breaks on bad shapes
        data.setdefault("health_score", 5.0)
        data.setdefault("executive_summary", "")
        data.setdefault("market_trends", "")
        data.setdefault("opportunities", [])
        data.setdefault("threats", [])
        data.setdefault("recommendations", [])
        data.setdefault("competitor_map", [])
        return data
    except Exception as e:
        print(f"Groq report generation failed: {e}")
        return {
            "health_score": 5.0,
            "executive_summary": "Analyse impossible à générer pour le moment (erreur du modèle).",
            "market_trends": "Données insuffisantes.",
            "opportunities": [],
            "threats": [],
            "recommendations": [],
            "competitor_map": [],
        }
