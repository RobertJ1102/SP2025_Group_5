# backend/app/profile.py
from fastapi import APIRouter, Depends, HTTPException, Request, Body
from sqlalchemy.orm import Session
from itsdangerous import URLSafeTimedSerializer
from .database import get_db
from .config import SECRET_KEY
from .models import User, Address
from .auth import verify_session  # Assuming verify_session is a function in auth.py
from datetime import datetime

router = APIRouter()
serializer = URLSafeTimedSerializer(SECRET_KEY)


@router.get("/info")
def get_user_info(request: Request, db: Session = Depends(get_db)):
    """Fetch user information using session token."""
    # Extract session token from cookies
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Verify session to get the username
    username = verify_session(session_token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid session")

    # Query the database for user information
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "home_address": user.home_address
    }

@router.put("/infoupdate")
def update_user_info(
    request: Request,
    db: Session = Depends(get_db),
    user_data: dict = Body(...)
):
    """Update user information using session token."""
    # Extract session token from cookies
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Verify session to get the username
    username = verify_session(session_token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid session")

    # Query the database for the user
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update user information
    user.first_name = user_data.get("first_name", user.first_name)
    user.last_name = user_data.get("last_name", user.last_name)
    user.home_address = user_data.get("home_address", user.home_address)

    # Commit changes to the database
    db.commit()

    return {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "home_address": user.home_address
    }

@router.get("/history")
def get_user_history(request: Request, db: Session = Depends(get_db)):
    """Fetch user address history using session token."""
    # Extract session token from cookies
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Verify session to get the username
    username = verify_session(session_token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid session")

    # Query the database for user information
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch the user's address history
    address_history = db.query(Address).filter(Address.user_id == user.id).all()

    # Format the response
    history_data = [
        {
            "address": address.final_address,
            "timestamp": address.timestamp
        }
        for address in address_history
    ]

    return history_data

@router.get("/preferences")
def get_user_preferences(request: Request, db: Session = Depends(get_db)):
    """Fetch user preferences using session token."""
    # Extract session token from cookies
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Verify session to get the username
    username = verify_session(session_token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid session")

    # Query the database for user preferences
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "search_range": user.search_range,
        "price_range": user.max_price
    }

@router.put("/preferencesupdate")
def update_user_preferences(
    request: Request,
    db: Session = Depends(get_db),
    preferences_data: dict = Body(...)
):
    """Update user preferences using session token."""
    # Extract session token from cookies
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Verify session to get the username
    username = verify_session(session_token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid session")

    # Query the database for the user
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update user preferences
    user.search_range = preferences_data.get("search_range", user.search_range)
    user.max_price = preferences_data.get("price_range", user.max_price)

    # Commit changes to the database
    db.commit()

    return {
        "search_range": user.search_range,
        "price_range": user.max_price
    }

@router.post("/history/add")
def add_user_history(
    request: Request,
    db: Session = Depends(get_db),
    address_data: dict = Body(...)
):
    """Add a new entry to the user's address history using session token."""
    # Extract session token from cookies
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Verify session to get the username
    username = verify_session(session_token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid session")

    # Query the database for the user
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Create a new address entry
    new_address = Address(
        user_id=user.id,
        written_address=address_data.get("written_address"),
        final_address=address_data.get("final_address"),
        longitude_start=address_data.get("longitude_start"),
        latitude_start=address_data.get("latitude_start"),
        longitude_end=address_data.get("longitude_end"),
        latitude_end=address_data.get("latitude_end"),
        timestamp=datetime.now()
    )

    # Add the new address to the session and commit
    db.add(new_address)
    db.commit()

    return {"message": "Address history entry added successfully"}

