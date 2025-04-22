""" Authentication routes for the FastAPI application """
import random
import string
import re
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response
from fastapi_mail import FastMail, MessageSchema, MessageType
from passlib.context import CryptContext
from itsdangerous import URLSafeTimedSerializer, BadData, SignatureExpired
from pydantic import BaseModel, EmailStr, validator
from sqlalchemy.orm import Session
from .config import conf
from .config import SECRET_KEY
from .models import User
from .schemas import UserLogin, UserCreate
from .database import get_db

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
serializer = URLSafeTimedSerializer(SECRET_KEY)

def validate_password_strength(password: str) -> bool:
    """Validate password strength requirements"""
    if len(password) < 8 or len(password) > 20:
        return False
    if not re.search(r'[A-Z]', password):  # Check for uppercase
        return False
    if not re.search(r'[a-z]', password):  # Check for lowercase
        return False
    if not re.search(r'[0-9]', password):  # Check for numbers
        return False
    return True

# Hash password
def hash_password(password: str):
    """ Hash the password """
    return pwd_context.hash(password)

@router.post("/register")
def register(user: UserCreate, response: Response, db: Session = Depends(get_db)):
    """Registers a new user."""
    # Validate password strength
    if not validate_password_strength(user.password):
        raise HTTPException(
            status_code=400,
            detail="Password must be 8-20 characters long and contain uppercase, lowercase, and numbers"
        )

    # Check if user exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    # Check if username exists
    existing_username = db.query(User).filter(User.username == user.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create new user with a hashed password
    new_user = User(username=user.username, email=user.email, password=hash_password(user.password))
    db.add(new_user)
    db.commit()
    # Create session token using the username for consistency
    session_token = create_session(new_user.username)
    response.set_cookie(
        key="session",
        value=session_token,
        secure=True,      # Use False for HTTP testing; set to True when using HTTPS
        samesite="None",    # Lax is suitable for HTTP and most navigation scenarios
        max_age=3600,
        path="/",
    )
    return {"message": "User registered successfully"}

# Verify password
def verify_password(plain_password, hashed_password):
    """ Verify the password """
    return pwd_context.verify(plain_password, hashed_password)

# Create session token using username
def create_session(username: str):
    """ Create a session token """
    return serializer.dumps(username, salt="session")

# Verify session token and decode the username
def verify_session(token: str):
    """ Verify the session token """
    try:
        print("Verifying session token:", token)
        username = serializer.loads(token, salt="session", max_age=3600)
        print("Decoded username:", username)
        return username
    except SignatureExpired as e:
        print("Session expired:", e)
        return None
    except BadData as e:
        print("Bad token data:", e)
        return None

@router.post("/login")
def login(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    """ Login with username and password """
    print(f"Received login data: {user}")
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    # Create session token based on username (consistent with registration)
    session_token = create_session(db_user.username)
    response.set_cookie(
        key="session",
        value=session_token,
        secure=True,      # For HTTP testing; update this when deploying with TLS
        samesite="None",    # Use lax to allow the cookie on HTTP connections
        max_age=3600,
        path="/",
    )
    return {"message": "Login successful"}

@router.post("/logout")
def logout(response: Response):
    """ Logout the user """
    response.delete_cookie("session")
    return {"message": "Logged out"}

@router.get("/me")
def get_current_user(request: Request, db: Session = Depends(get_db)):
    """ Get the current logged-in user """
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    username = verify_session(session_token)
    print(f"Session token: {session_token}")
    print(f"Decoded username: {username}")
    print(f"Request cookies: {request.cookies}")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid session")
    # Query based on username since our token is created from the username
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"username": user.username}

# Generate a random password
def generate_random_password(length=12):
    """Generate a random password with letters, digits, and special characters."""
    characters = string.ascii_letters + string.digits + "!@#$%^&*()"
    return ''.join(random.choice(characters) for i in range(length))

# Function to send password reset email
async def send_reset_email(email: str, new_password: str):
    """Send password reset email"""
    message = MessageSchema(
        subject="Password Reset Request",
        recipients=[email],
        body=f"Hello,\n\nYour new password is: {new_password}\n\nPlease log in and change it.",
        subtype=MessageType.plain
    )
    fm = FastMail(conf)
    await fm.send_message(message)

class PasswordResetRequest(BaseModel):
    """Request body for password reset"""
    email: EmailStr

@router.post("/reset-password")
async def reset_password(
    request: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Reset user password and send new password via email."""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")
    
    new_password = generate_random_password()
    hashed_password = pwd_context.hash(new_password)
    user.password = hashed_password
    db.commit()
    
    try:
        background_tasks.add_task(send_reset_email, request.email, new_password)
        return {"message": "A new password has been sent to your email."}
    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send reset email.") from e

class PasswordChangeRequest(BaseModel):
    """Request body for changing password"""
    email: EmailStr
    old_password: str
    new_password: str

@router.post("/change-password")
async def change_password(
    request: PasswordChangeRequest,
    db: Session = Depends(get_db)
):
    """Change user password"""
    # Validate new password strength
    if not validate_password_strength(request.new_password):
        raise HTTPException(
            status_code=400,
            detail="New password must be 8-20 characters long and contain uppercase, lowercase, and numbers"
        )

    # confirm user exists in db, then change password to a new password
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")
    if not verify_password(request.old_password, user.password):
        raise HTTPException(status_code=400, detail="Invalid password")
    user.password = hash_password(request.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
