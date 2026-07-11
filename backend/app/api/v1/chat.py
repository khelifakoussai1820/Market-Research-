import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user_dep
from app.models.user import User
from app.models.brand import Brand
from app.schemas.chat import ChatRequest, ChatResponse
from app.services import chat_services
from app.services.llm_services import LLMError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/{brand_id}", response_model=ChatResponse)
async def chat_with_brand(
    brand_id: int,
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep),
):
    """Ask a question about a brand's market report (RAG-powered)."""
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    if brand.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        result = await chat_services.ask_about_brand(brand_id=brand_id, question=payload.question)
    except LLMError as e:
        logger.error("Chat failed for brand %s: %s", brand_id, e)
        raise HTTPException(
            status_code=503,
            detail=f"Impossible de générer une réponse : {e}",
        )
    return ChatResponse(**result)
