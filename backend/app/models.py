"""This module contains the SQLAlchemy model for the User table."""
from typing import List
from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from .database import Base

# pylint: disable=too-few-public-methods
class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    password = Column(String(255))
    first_name = Column(String(50), default="")
    last_name = Column(String(50), default="")
    home_address = Column(String(255), default="")
    home_longitude = Column(Float, default=0.0)
    home_latitude = Column(Float, default=0.0)
    search_range = Column(Integer, default=400)  # Search range in feet
    max_price = Column(Integer, default=50)  # Maximum price willing to pay

    addresses = relationship("Address", back_populates="user")

class Address(Base):
    """Address model"""
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    written_address = Column(String(255))
    final_address = Column(String(255))
    longitude_start = Column(Float)
    latitude_start = Column(Float)
    longitude_end = Column(Float)
    latitude_end = Column(Float)
    timestamp = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="addresses")

# Uber Prices
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


# Lyft Cost Estimates Endpoint
class LyftCostEstimate(BaseModel):
    """ LyftCostEstimate model """
    cost_token: str
    display_name: str
    estimated_cost_cents_min: int
    estimated_cost_cents_max: int
    estimated_distance_miles: float
    estimated_duration_seconds: int
    is_valid_estimate: bool
    primetime_confirmation_token: str
    primetime_percentage: str
    ride_type: str

class LyftCostEstimatesResponse(BaseModel):
    """ LyftCostEstimatesResponse model """
    cost_estimates: List[LyftCostEstimate]