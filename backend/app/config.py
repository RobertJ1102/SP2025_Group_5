""" configuration variables."""
import os

SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_key")
SESSION_COOKIE_NAME = "session"
