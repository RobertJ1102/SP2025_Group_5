"""This module contains the Pydantic models for the FastAPI application."""
from pydantic import BaseModel, EmailStr

class UserLogin(BaseModel):
    """UserLogin model"""
    email: EmailStr
    password: str
