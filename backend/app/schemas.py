"""This module contains the Pydantic models for the FastAPI application."""
from pydantic import BaseModel, EmailStr

# pylint: disable=too-few-public-methods
class UserLogin(BaseModel):
    """UserLogin model"""
    username: str
    password: str

class UserCreate(UserLogin):
    """UserCreate model"""
    email: EmailStr
    username: str
    password: str

    class Config:
        """Config class"""
        orm_mode = True
