""" Authentication routes for the FastAPI application """
import random
import string
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response
from fastapi_mail import FastMail, MessageSchema, MessageType
from passlib.context import CryptContext
from itsdangerous import URLSafeTimedSerializer, BadData, SignatureExpired
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from .config import conf
from .config import SECRET_KEY
from .models import User
from .schemas import UserLogin, UserCreate
from .database import get_db

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
serializer = URLSafeTimedSerializer(SECRET_KEY)

# Hash password
def hash_password(password: str):
    """ Hash the password """
    return pwd_context.hash(password)

@router.post("/register")
def register(user: UserCreate, response: Response, db: Session = Depends(get_db)):
    """Registers a new user."""
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    new_user = User(username=user.username, email=user.email, password=hash_password(user.password))
    db.add(new_user)
    db.commit()
    session_token = create_session(new_user.email)
    response.set_cookie(key="session", value=session_token, httponly=True)

    return {"message": "User registered successfully"}


# Verify password
def verify_password(plain_password, hashed_password):
    """ Verify the password """
    return pwd_context.verify(plain_password, hashed_password)

# Create session token
def create_session(username: str):
    """ Create a session token """
    return serializer.dumps(username, salt="session")

# Verify session
def verify_session(token: str):
    """ Verify the session token """
    try:
        print("Verifying session....")
        return serializer.loads(token, salt="session", max_age=3600)  # Session expires in 1 hour
    except SignatureExpired:
        # Handle expired session
        return None
    except BadData:
        # Handle invalid or tampered session
        return None

@router.post("/login")
def login(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    """ Login with username and password """
    print(f"Received login data: {user}")
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid username or password")

    session_token = create_session(db_user.username)
    response.set_cookie(
        key="session",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="None",
        max_age=3600,
        path="/",
    )
    return {"message": "Login successful"}

# Logout Route (Clear Cookie)
@router.post("/logout")
def logout(response: Response):
    """ Logout the user """
    response.delete_cookie("session")
    return {"message": "Logged out"}

# Get Current User (Protected)
@router.get("/me")
def get_current_user(request: Request, db: Session = Depends(get_db)):
    """ Get the current logged-in user """
    session_token = request.cookies.get("session")
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    username = verify_session(session_token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid session")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"username": user.username}

# Generate a random password
def generate_random_password(length=12):
    """Generate a random password with letters, digits, and special characters."""
    characters = string.ascii_letters + string.digits + "!@#$%^&*()"
    return ''.join(random.choice(characters) for i in range(length))

# Function to send email
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

# Route to handle password reset
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

    # Generate and hash new password
    new_password = generate_random_password()
    hashed_password = pwd_context.hash(new_password)
    user.password = hashed_password
    db.commit()

    try:
        # Send reset email as a background task
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

# Route to handle user changing password
@router.post("/change-password")
async def change_password(
    request: PasswordChangeRequest,
    db: Session = Depends(get_db)):
    """Change user password"""
    # confirm user exists in db, then change password to a new password
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")
    if not verify_password(request.old_password, user.password):
        raise HTTPException(status_code=400, detail="Invalid password")
    user.password = hash_password(request.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
