"""Brand schemas."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class BrandDescribeRequest(BaseModel):
    description: str


class BrandSuggestionResponse(BaseModel):
    mission: str
    industry: str
    target_audience: str
    brand_tone: str
    suggested_competitors: List[str]
    market: Optional[str] = None


class BrandConfirmRequest(BaseModel):
    name: str
    description: str
    mission: str
    industry: str
    target_audience: str
    brand_tone: str
    competitors: List[str]


class BrandOut(BaseModel):
    id: int
    name: str
    description: str
    mission: Optional[str]
    industry: Optional[str]
    target_audience: Optional[str]
    brand_tone: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
