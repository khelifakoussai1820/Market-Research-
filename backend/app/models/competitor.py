
from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Competitor(Base):
    __tablename__ = "competitors"
    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False)
    name = Column(String, nullable=False)
    url = Column(String, nullable=True)
    summary = Column(Text, nullable=True)

    brand = relationship("Brand", back_populates="competitors")

