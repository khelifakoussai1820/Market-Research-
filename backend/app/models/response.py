"""Market report model."""
from datetime import datetime
from sqlalchemy import Column, Integer, Float, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class MarketReport(Base):
    __tablename__ = "market_reports"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False)
    health_score = Column(Float, nullable=True)
    report_json = Column(Text, nullable=True)       # full JSON report string
    competitor_map_json = Column(Text, nullable=True)  # JSON list of competitors with data
    created_at = Column(DateTime, default=datetime.utcnow)

    brand = relationship("Brand", back_populates="reports")
