import json
import logging
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user_dep
from app.models.user import User
from app.models.brand import Brand
from app.schemas.report import MarketReportOut, CompetitorEntry
from app.services import report_services
from app.services.llm_services import LLMError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/responses", tags=["responses"])


@router.post("/analyze/{brand_id}", response_model=MarketReportOut)
async def analyze_market(
    brand_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep),
):
    """
    Triggers the full market research pipeline:
    - 5 parallel web searches (Tavily)
    - LLM report generation
    - Save to DB
    - Index into ChromaDB (RAG)
    """
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    if brand.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        report = await report_services.generate_full_report(db=db, brand_id=brand_id)
    except LLMError as e:
        logger.error("Report generation failed: %s", e)
        raise HTTPException(
            status_code=503,
            detail=f"Impossible de générer le rapport : {e}",
        )
    return _serialize_report(report)


@router.get("/report/{brand_id}", response_model=MarketReportOut)
def get_report(
    brand_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep),
):
    """Fetch the most recent market report for a brand."""
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    if brand.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    report = report_services.get_latest_report(db=db, brand_id=brand_id)
    if not report:
        raise HTTPException(status_code=404, detail="No report found for this brand")
    return _serialize_report(report)


@router.get("/export/{brand_id}")
def export_report(
    brand_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep),
):
    """Download the full brand + market report as a JSON file."""
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    if brand.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    report = report_services.get_latest_report(db=db, brand_id=brand_id)
    if not report:
        raise HTTPException(status_code=404, detail="No report found for this brand")

    report_data = json.loads(report.report_json) if report.report_json else {}
    competitor_map = json.loads(report.competitor_map_json) if report.competitor_map_json else []

    payload = {
        "brand": {
            "id": brand.id,
            "name": brand.name,
            "description": brand.description,
            "mission": brand.mission,
            "industry": brand.industry,
            "target_audience": brand.target_audience,
            "brand_tone": brand.brand_tone,
            "competitors": [c.name for c in brand.competitors],
        },
        "report": {
            "id": report.id,
            "health_score": report.health_score,
            "executive_summary": report_data.get("executive_summary"),
            "market_trends": report_data.get("market_trends"),
            "opportunities": report_data.get("opportunities", []),
            "threats": report_data.get("threats", []),
            "recommendations": report_data.get("recommendations", []),
            "competitor_map": competitor_map,
            "created_at": report.created_at.isoformat() if report.created_at else None,
        },
    }

    filename = f"market_report_brand_{brand_id}.json"
    return JSONResponse(
        content=payload,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _serialize_report(report) -> MarketReportOut:
    """Parse the stored JSON fields back into the response schema."""
    data = json.loads(report.report_json) if report.report_json else {}
    competitor_map_raw = json.loads(report.competitor_map_json) if report.competitor_map_json else []
    competitor_map = [CompetitorEntry(**c) for c in competitor_map_raw if isinstance(c, dict)]

    return MarketReportOut(
        id=report.id,
        brand_id=report.brand_id,
        health_score=report.health_score,
        executive_summary=data.get("executive_summary"),
        market_trends=data.get("market_trends"),
        opportunities=data.get("opportunities"),
        threats=data.get("threats"),
        recommendations=data.get("recommendations"),
        competitor_map=competitor_map,
        created_at=report.created_at,
    )
