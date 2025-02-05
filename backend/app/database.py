"""Importing the necessary libraries and creating the database connection"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL",
        "mysql+pymysql://farefinder_user:password@db:3306/farefinder_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

"""Function to get the database connection"""
def get_db():
    """Get the database connection"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()