from fastapi import APIRouter
from app.schemas.auth import RefreshRequest, TokenResponse
from app.services import refresh_services

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest):
    access, refresh = refresh_services.rotate_tokens(payload.refresh_token)
    return TokenResponse(access_token=access, refresh_token=refresh)
