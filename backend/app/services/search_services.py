import asyncio
from app.services.llm_services import web_search


async def run_market_research(brand_name: str, industry: str, competitors: list[str]) -> str:
    """
    Run 5 parallel Tavily web searches and return all results as a single
    aggregated string to be fed into the LLM report generator.
    """
    queries = [
        f"{brand_name} competitors analysis {industry}",
        f"{industry} market trends 2024 2025",
        f"{industry} industry news latest developments",
        f"{brand_name} {industry} customer discussions reviews",
        f"{industry} growth opportunities emerging markets",
    ]

    # Run all searches concurrently in a thread pool (tavily is sync)
    loop = asyncio.get_event_loop()
    tasks = [
        loop.run_in_executor(None, web_search, query)
        for query in queries
    ]
    results = await asyncio.gather(*tasks)

    sections = [
        "=== COMPETITOR ANALYSIS ===",
        "=== MARKET TRENDS ===",
        "=== INDUSTRY NEWS ===",
        "=== CUSTOMER DISCUSSIONS ===",
        "=== GROWTH OPPORTUNITIES ===",
    ]

    aggregated = ""
    for section, result in zip(sections, results):
        aggregated += f"\n\n{section}\n{result}"

    return aggregated
