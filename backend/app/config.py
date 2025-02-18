""" configuration variables."""
import os
from fastapi_mail import ConnectionConfig
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_key")
SESSION_COOKIE_NAME = "session"
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "your_email@gmail.com")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "your_email_password")
MAIL_FROM = os.getenv("MAIL_FROM", "your_email@gmail.com")
MAIL_SERVER = "smtp.gmail.com"
MAIL_PORT = 587
MAIL_FROM_NAME = "FareFinder Support"

GMAP_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "123")
UBER_CLIENT_ID = os.getenv("UBER_CLIENT_ID", "123")
UBER_CLIENT_SECRET = os.getenv("UBER_CLIENT_SECRET", "123")

conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=MAIL_PASSWORD,
    MAIL_FROM=MAIL_FROM,
    MAIL_PORT=MAIL_PORT,
    MAIL_SERVER=MAIL_SERVER,
    MAIL_FROM_NAME=MAIL_FROM_NAME,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)
