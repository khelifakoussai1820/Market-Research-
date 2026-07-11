from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class CompetitorEntry(BaseModel):
    name: str
    summary: Optional[str]
    url: Optional[str]


class MarketReportOut(BaseModel):
    id: int
    brand_id: int
    health_score: Optional[float]
    executive_summary: Optional[str]
    market_trends: Optional[str]
    opportunities: Optional[List[str]]
    threats: Optional[List[str]]
    recommendations: Optional[List[str]]
    competitor_map: Optional[List[CompetitorEntry]]
    created_at: datetime

    class Config:
        from_attributes = True
