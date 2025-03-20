import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Base settings
    PROJECT_NAME: str = "Grace Harbor Real Estate Analytics"
    PROJECT_DESCRIPTION: str = "API for real estate market analytics in Massachusetts"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Database settings
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://graceharbor:GraceHarbor2025!!@gh-housing.c5cg280s45ed.us-east-2.rds.amazonaws.com:5432/property"
    )
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",     # Local development frontend
        "http://3.147.77.205:3000",  # Old production frontend
        "http://3.147.48.113:3000",  # Current production frontend
    ]
    
    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    
    # API rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings() 