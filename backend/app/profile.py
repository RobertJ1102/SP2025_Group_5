# backend/app/profile.py
from fastapi import APIRouter, Depends, HTTPException, Request, Body
from sqlalchemy.orm import Session
from .database import get_db
from .config import SECRET_KEY
from itsdangerous import URLSafeTimedSerializer
from .models import User
from .auth import verify_session  # Assuming verify_session is a function in auth.py

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