from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import computed_field
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

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
    frontend_url: str = "http://localhost:5173"

    @computed_field
    @property
    def backend_cors_origins(self) -> list[str]:
        return [self.frontend_url]


settings = Settings()