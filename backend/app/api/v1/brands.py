import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user_dep
from app.models.user import User
from app.schemas.brand import BrandDescribeRequest, BrandSuggestionResponse, BrandConfirmRequest, BrandOut
from app.services import brand_services
from app.services.llm_services import LLMError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/brands", tags=["brands"])


@router.post("/describe", response_model=BrandSuggestionResponse)
async def describe_brand(
    payload: BrandDescribeRequest,
    current_user: User = Depends(get_current_user_dep),
):
    """
    Step 1: User describes their company in free text.
    AI returns suggested mission, industry, audience, tone, and competitor names.
    """
    try:
        result = await brand_services.analyze_brand_description(payload.description)
    except LLMError as e:
        logger.error("Brand analysis failed: %s", e)
        raise HTTPException(
            status_code=503,
            detail=f"Impossible d'analyser la marque : {e}",
        )
    return BrandSuggestionResponse(**result)


@router.post("/confirm", response_model=BrandOut)
def confirm_brand(
    payload: BrandConfirmRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep),
):
    """
    Step 2: User reviews & edits AI suggestions, then confirms.
    Saves the brand to the database.
    """
    brand = brand_services.confirm_brand(db=db, user_id=current_user.id, data=payload)
    return brand


@router.get("/{brand_id}", response_model=BrandOut)
def get_brand(
    brand_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep),
):
    brand = brand_services.get_brand(db=db, brand_id=brand_id)
    if not brand:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Brand not found")
    if brand.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return brand
