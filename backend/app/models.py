"""This module contains the SQLAlchemy model for the User table."""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
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
    home_longitude = Column(String(50), default="")
    home_latitude = Column(String(50), default="")

    addresses = relationship("Address", back_populates="user")

class Address(Base):
    """Address model"""
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    written_address = Column(String(255))
    longitude = Column(String(50))
    latitude = Column(String(50))

    user = relationship("User", back_populates="addresses")