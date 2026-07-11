from sqlalchemy.orm import Session

from fastapi import HTTPException, status

from app.models.user import User
from app.core.config import settings
from app.core import security


def register_user(db: Session, name: str, email: str, password: str) -> User:
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=name,
        email=email,
        hashed_password=security.hash_password(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, email: str, password: str) -> tuple[str, str]:
    user = db.query(User).filter(User.email == email).first()
    if not user or not security.verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return security.create_access_token(user.id), security.create_refresh_token(user.id)


def refresh_access_token(refresh_token: str) -> tuple[str, str]:
    user_id = security.decode_refresh_token(refresh_token)
    return security.create_access_token(user_id), security.create_refresh_token(user_id)


def get_current_user(token: str, db: Session) -> User:
    user_id = security.decode_access_token(token)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
