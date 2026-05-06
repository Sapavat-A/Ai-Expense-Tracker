"""
Configuration file for AI Expense Tracker Backend
Handles environment variables and application settings
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    """
    Application settings using Pydantic for validation
    Environment variables are automatically loaded and validated
    """
    
    # Database Configuration
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "ai_expense_tracker"
    
    # JWT Configuration
    JWT_SECRET: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 30
    
    # CORS Configuration
    FRONTEND_URL: list[str] = ["http://localhost:3000"]
    
    # Application Configuration
    APP_NAME: str = "AI Expense Tracker API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Security Configuration
    BCRYPT_ROUNDS: int = 12
    
    @field_validator("FRONTEND_URL", mode='before')
    @classmethod
    def assemble_cors_origins(cls, v: Optional[str]) -> str:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create a single settings instance to be used throughout the application
settings = Settings()
