"""This module contains the SQLAlchemy model for the User table."""
from sqlalchemy import Column, Integer, String
from .database import Base

# pylint: disable=too-few-public-methods
class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True)
    password = Column(String(255))
