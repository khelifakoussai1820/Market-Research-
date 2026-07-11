from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.services import auth_services
from app.core import security

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    user = auth_services.register_user(
        db, name=payload.name, email=payload.email, password=payload.password
    )
    access = security.create_access_token(user.id)
    refresh = security.create_refresh_token(user.id)
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    access, refresh = auth_services.login_user(
        db, email=payload.email, password=payload.password
    )
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/logout")
def logout():
    # JWT is stateless — client simply discards the tokens
    return {"message": "Logged out successfully"}
