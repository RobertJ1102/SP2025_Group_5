"""This module contains the Pydantic models for the FastAPI application."""
from pydantic import BaseModel, EmailStr

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
        orm_mode = True

