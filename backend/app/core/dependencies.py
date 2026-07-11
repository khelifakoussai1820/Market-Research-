"""Reusable FastAPI dependencies."""
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.auth_services import get_current_user
from app.models.user import User


def get_current_user_dep(
    authorization: str = Header(..., description="Bearer <token>"),
    db: Session = Depends(get_db),
) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.removeprefix("Bearer ")
    return get_current_user(token=token, db=db)
