"""This module contains the SQLAlchemy model for the User table."""
from typing import List
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from .database import Base

# pylint: disable=too-few-public-methods
class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True)
    password = Column(String(255))

class PriceEstimate(BaseModel):
    """ PriceEstimate model """
    localized_display_name: str
    distance: float
    display_name: str
    product_id: str
    high_estimate: float
    low_estimate: float
    duration: int
    estimate: str
    currency_code: str

class PriceEstimatesResponse(BaseModel):
    """ PriceEstimatesResponse model """
    prices: List[PriceEstimate]
