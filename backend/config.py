from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Gemini AI
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    
    # Firebase
    firebase_project_id: str = os.getenv("FIREBASE_PROJECT_ID", "visaverse-fc9f3")
    firebase_storage_bucket: str = os.getenv("FIREBASE_STORAGE_BUCKET", "visaverse-fc9f3.firebasestorage.app")
    
    # Application
    backend_port: int = int(os.getenv("BACKEND_PORT", "8000"))
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Currency API
    currency_api_url: str = os.getenv("CURRENCY_API_URL", "https://api.exchangerate-api.com/v4/latest/USD")
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
