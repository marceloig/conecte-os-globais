from pydantic_settings import BaseSettings
from typing import Optional
from os import getenv
from dotenv import load_dotenv

load_dotenv()
class Settings(BaseSettings):
    app_name: str = "Conecte os Globais API"
    version: str = "1.0.0"
    debug: bool = False
    api_v1_str: str = "/api/v1"
    
    # Database
    database_url: Optional[str] = None
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    backend_cors_origins: list[str] = [getenv("FRONTEND_URL", "http://localhost:5173")]
    
    class Config:
        env_file = ".env"


settings = Settings()