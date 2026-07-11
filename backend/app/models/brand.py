"""Brand model."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    mission = Column(Text, nullable=True)
    industry = Column(String, nullable=True)
    target_audience = Column(Text, nullable=True)
    brand_tone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    competitors = relationship("Competitor", back_populates="brand", cascade="all, delete-orphan")
    reports = relationship("MarketReport", back_populates="brand", cascade="all, delete-orphan")
