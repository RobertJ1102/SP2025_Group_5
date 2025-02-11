"""Database Configuration for FastAPI App"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variable or fallback to default MySQL connection
DATABASE_URL = os.getenv(
    "DATABASE_URL", "mysql+pymysql://farefinder_user:password@db:3306/farefinder_db"
)

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL, echo=True)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define base for ORM models
Base = declarative_base()

# Function to initialize the database and create tables
def init_db():
    """Initialize the database and create tables."""
    Base.metadata.create_all(bind=engine)

# Function to get the database session
def get_db():
    """Provides a database session for request lifecycle."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
