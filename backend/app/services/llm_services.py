import logging
import json
from app.core.config import settings

logger = logging.getLogger(__name__)

# Max characters for search context injected into prompts
MAX_SEARCH_CONTEXT_CHARS = 4000


class LLMError(Exception):
    """Raised when an LLM or external API call fails."""


def _get_groq_client():
    """Lazy-init the Groq client to avoid import-time side effects."""
    from groq import AsyncGroq
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise LLMError(
            "GROQ_API_KEY non configurée. "
            "Ajoutez-la dans le fichier .env (obtenez-la sur https://console.groq.com)."
        )
    return AsyncGroq(api_key=api_key, timeout=30.0, max_retries=1)


def _get_tavily_client():
    """Lazy-init the Tavily client."""
    from tavily import TavilyClient
    api_key = settings.TAVILY_API_KEY
    if not api_key or "your-tavily-key" in api_key:
        return None
    return TavilyClient(api_key=api_key)


def _trim_context(text: str, max_chars: int = MAX_SEARCH_CONTEXT_CHARS) -> str:
    """Truncate search context to avoid exceeding LLM context limits."""
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "\n\n[...contexte tronqué pour limiter la taille du prompt...]"


def web_search(query: str) -> str:
    """Run a live Tavily web search, fall back to stub if key is not set."""
    tavily = _get_tavily_client()
    if tavily is None:
        logger.warning("TAVILY_API_KEY manquante — retour de données simulées")
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
        logger.error("Tavily search failed for '%s': %s", query, e)
        return "Mock search result: Strong growth in premium car accessories market."


async def generate_brand_understanding(description: str, search_context: str = "") -> dict:
    """Use Groq LLM to analyze a brand description and return structured suggestions."""
    groq_client = _get_groq_client()

    context_block = ""
    if search_context.strip():
        context_block = f"""

Real web-search results about this market (use ONLY these to ground your
competitor suggestions — do not invent competitors that are not present here
or not known to operate in this market):
\"\"\"
{_trim_context(search_context)}
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
    except LLMError:
        raise
    except Exception as e:
        logger.error("Groq brand understanding failed: %s", e)
        raise LLMError(f"Échec de l'analyse de la marque : {e}") from e


async def answer_question(question: str, context: str) -> str:
    """Answer a user question about their brand using retrieved report context."""
    groq_client = _get_groq_client()

    prompt = f"""Tu es un expert en stratégie de marque et en marketing digital. Tu coaches un chef d'entreprise qui te pose une question sur sa marque.

Ton rôle : l'aider à prendre des décisions concrètes. Tu ne te contentes pas de lire le rapport — tu analyses, tu conseilles, tu proposes des actions.

DONNÉES DU RAPPORT DE MARCHÉ (utilise-les comme base, cite-les quand pertinent) :
{context if context else "(pas encore de rapport disponible)"}

RÈGLES :
- Réponds TOUJOURS de façon utile et actionnable. Jamais "je ne sais pas".
- Si le contexte contient des infos pertinentes, appuie-toi dessus et cite-les.
- Si le contexte ne couvre pas exactement la question, utilise tes connaissances en marketing/stratégie pour donner un conseil éclairé, tout en précisant que ce n'est pas issu du rapport.
- Propose des actions concrètes (étapes, priorités, quick wins).
- Sois direct et pragmatique, pas vague ni générique.
- Réponds en français.

Question : {question}

Réponse (actionnable et concrète) :"""

    try:
        response = await groq_client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
        )
        return response.choices[0].message.content
    except LLMError:
        raise
    except Exception as e:
        logger.error("Groq chat answer failed: %s", e)
        raise LLMError(f"Échec de la génération de réponse : {e}") from e


async def generate_market_report(brand_data: dict, search_context: str) -> dict:
    """Use Groq LLM to generate a comprehensive market analysis report."""
    groq_client = _get_groq_client()

    prompt = f"""You are a rigorous market research analyst. Write a market report using ONLY the web search context provided below.

Brand Data:
{json.dumps(brand_data, indent=2, ensure_ascii=False)}

Web Search Context (real results from live search):
{_trim_context(search_context) if search_context.strip() else "(no search results were returned)"}

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
        data.setdefault("health_score", 5.0)
        data.setdefault("executive_summary", "")
        data.setdefault("market_trends", "")
        data.setdefault("opportunities", [])
        data.setdefault("threats", [])
        data.setdefault("recommendations", [])
        data.setdefault("competitor_map", [])
        return data
    except LLMError:
        raise
    except Exception as e:
        logger.error("Groq report generation failed: %s", e)
        raise LLMError(f"Échec de la génération du rapport : {e}") from e
