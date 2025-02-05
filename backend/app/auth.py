""" Authentication routes for the FastAPI application """
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from passlib.context import CryptContext
from itsdangerous import URLSafeTimedSerializer, BadData, SignatureExpired
from sqlalchemy.orm import Session
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
    new_user = User(email=user.email, password=hash_password(user.password))
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
        return serializer.loads(token, salt="session", max_age=3600)  # Session expires in 1 hour
    except SignatureExpired:
        # Handle expired session
        return None
    except BadData:
        # Handle invalid or tampered session
        return None

@router.post("/login")
def login(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    """ Login with email and password """
    print(f"Received login data: {user}")
    db_user = db.query(User).filter(User.email == user.email).first()
    
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    session_token = create_session(db_user.email)
    response.set_cookie(key="session", value=session_token, httponly=True)
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

    email = verify_session(session_token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"email": user.email}

