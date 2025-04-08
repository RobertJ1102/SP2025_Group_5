# backend/app/profile.py
"""Profile management routes."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, Body
from sqlalchemy.orm import Session
from itsdangerous import URLSafeTimedSerializer
from .database import get_db
from .config import SECRET_KEY
from .models import User, Address, UserAddress
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
            "starting_address": address.written_address,
            "final_address": address.final_address,
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

@router.get("/saved-addresses")
def get_saved_addresses(request: Request, db: Session = Depends(get_db)):
    """Fetch user's saved addresses including home address using session token."""
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    username = verify_session(session_token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid session")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch addresses saved by the user
    saved_addresses = db.query(UserAddress).filter(UserAddress.user_id == user.id).all()
    
    address_list = [{
        "id": addr.id,
        "address": addr.address,
        "nickname": addr.nickname,
        "latitude": addr.latitude,
        "longitude": addr.longitude
    } for addr in saved_addresses]

    # Add home address if it exists and has coordinates
    if user.home_address and user.home_latitude is not None and user.home_longitude is not None:
        home_address_data = {
            "id": "home",  # Special ID for home address
            "address": user.home_address,
            "nickname": "Home",
            "latitude": user.home_latitude,
            "longitude": user.home_longitude
        }
        # Prepend home address to the list
        address_list.insert(0, home_address_data)
    
    return address_list

@router.post("/saved-addresses/add")
def add_saved_address(
    request: Request,
    db: Session = Depends(get_db),
    address_data: dict = Body(...)
):
    """Add a new saved address for the user."""
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    username = verify_session(session_token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid session")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_address = UserAddress(
        user_id=user.id,
        address=address_data.get("address"),
        nickname=address_data.get("nickname"),
        latitude=address_data.get("latitude"),
        longitude=address_data.get("longitude")
    )

    db.add(new_address)
    db.commit()

    return {"message": "Address saved successfully"}

@router.delete("/saved-addresses/{address_id}")
def delete_saved_address(
    request: Request,
    address_id: int,
    db: Session = Depends(get_db)
):
    """Delete a saved address."""
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    username = verify_session(session_token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid session")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    address = db.query(UserAddress).filter(
        UserAddress.id == address_id,
        UserAddress.user_id == user.id
    ).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    db.delete(address)
    db.commit()

    return {"message": "Address deleted successfully"}
