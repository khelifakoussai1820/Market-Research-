import json
from sqlalchemy.orm import Session
from app.models.response import MarketReport
from app.models.brand import Brand
from app.services.search_services import run_market_research
from app.services.llm_services import generate_market_report
from app.services.rag_services import index_report


async def generate_full_report(db: Session, brand_id: int) -> MarketReport:
    """
    Main orchestrator for the "Analyze Market" button.
    1. Load brand from DB
    2. Run 5 parallel web searches
    3. Feed all results into GPT-4o to generate the report
    4. Save report to DB
    5. Index report text into ChromaDB for RAG
    """
    brand: Brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise ValueError(f"Brand with id {brand_id} not found")

    competitors = [c.name for c in brand.competitors]

    # Step 1: Run parallel web searches
    search_context = await run_market_research(
        brand_name=brand.name,
        industry=brand.industry or "",
        competitors=competitors,
    )

    # Step 2: Generate the report via LLM
    brand_data = {
        "name": brand.name,
        "mission": brand.mission,
        "industry": brand.industry,
        "target_audience": brand.target_audience,
        "brand_tone": brand.brand_tone,
        "competitors": competitors,
    }
    report_data = await generate_market_report(brand_data, search_context)

    # Step 3: Persist to DB
    competitor_map = report_data.get("competitor_map", [])
    report = MarketReport(
        brand_id=brand_id,
        health_score=report_data.get("health_score"),
        report_json=json.dumps(report_data),
        competitor_map_json=json.dumps(competitor_map),
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Step 4: Index into RAG
    report_text = f"""
Brand: {brand.name}
Industry: {brand.industry}
Mission: {brand.mission}

Executive Summary:
{report_data.get("executive_summary", "")}

Market Trends:
{report_data.get("market_trends", "")}

Opportunities: {", ".join(report_data.get("opportunities", []))}
Threats: {", ".join(report_data.get("threats", []))}
Recommendations: {", ".join(report_data.get("recommendations", []))}
"""
    await index_report(brand_id=brand_id, report_id=report.id, report_text=report_text)

    return report


def get_latest_report(db: Session, brand_id: int) -> MarketReport | None:
    return (
        db.query(MarketReport)
        .filter(MarketReport.brand_id == brand_id)
        .order_by(MarketReport.created_at.desc())
        .first()
    )
