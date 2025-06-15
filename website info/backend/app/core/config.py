import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Application
    PROJECT_NAME: str = "SteppersLife 2025"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite:///./steppers_life.db"  # Default to SQLite for easy development
    
    # JWT Security
    SECRET_KEY: str = "dev-secret-key-change-in-production-must-be-32-chars-or-more"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Supabase Configuration
    SUPABASE_URL: str = "https://revmdncwzztxxinjlzoc.supabase.co"
    SUPABASE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJldm1kbmN3enp0eHhpbmpsem9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NzY4NjEsImV4cCI6MjA2NDQ1Mjg2MX0.J7Wj8t8gYsErt29TsFXyPGAR7YbUEKdlbCeUTJwK7ic"
    SUPABASE_JWT_SECRET: Optional[str] = None
    
    # Email Configuration - SMTP
    SMTP_SERVER: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: str = "noreply@stepperslife.com"
    SMTP_FROM_NAME: str = "SteppersLife"
    
    # Email Configuration - SendGrid
    SENDGRID_API_KEY: Optional[str] = os.environ.get("SENDGRID_API_KEY")
    SENDGRID_FROM_EMAIL: Optional[str] = os.environ.get("SENDGRID_FROM_EMAIL", "noreply@stepperslife.com")
    SENDGRID_FROM_NAME: Optional[str] = os.environ.get("SENDGRID_FROM_NAME", "SteppersLife")
    
    # File Upload
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_FILE_EXTENSIONS: str = "jpg,jpeg,png,gif,pdf"
    UPLOAD_PATH: str = "./uploads"
    
    # External Services
    STRIPE_PUBLIC_KEY: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    # Square Payment Settings (for receiving payments)
    SQUARE_ACCESS_TOKEN: Optional[str] = None
    SQUARE_APPLICATION_ID: Optional[str] = None
    SQUARE_ENVIRONMENT: str = "sandbox"  # sandbox or production
    
    # PayPal Payment Settings
    PAYPAL_CLIENT_ID: Optional[str] = None
    PAYPAL_CLIENT_SECRET: Optional[str] = None
    PAYPAL_MODE: str = "sandbox"  # sandbox or live
    
    # CashApp Settings (for disbursements/payouts)
    CASHAPP_API_KEY: Optional[str] = None
    CASHAPP_CLIENT_ID: Optional[str] = None
    CASHAPP_ENVIRONMENT: str = "sandbox"  # sandbox or production
    
    # Zelle Settings (for tracking manual payments)
    ZELLE_TRACKING_ENABLED: bool = True
    
    # Bank Transfer Settings (for tracking manual payments)
    BANK_TRANSFER_TRACKING_ENABLED: bool = True
    
    # Frontend URL for payment redirects
    FRONTEND_URL: str = "http://localhost:8082"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create global settings instance
settings = Settings()

# Helper functions
def get_database_url() -> str:
    """Get the configured database URL."""
    return settings.DATABASE_URL

def get_secret_key() -> str:
    """Get the JWT secret key."""
    return settings.SECRET_KEY

def is_development() -> bool:
    """Check if running in development mode."""
    return settings.ENVIRONMENT.lower() == "development"

def is_production() -> bool:
    """Check if running in production mode."""
    return settings.ENVIRONMENT.lower() == "production"

def get_upload_config() -> dict:
    """Get file upload configuration."""
    return {
        "max_size_mb": settings.MAX_FILE_SIZE_MB,
        "allowed_extensions": settings.ALLOWED_FILE_EXTENSIONS.split(","),
        "upload_path": settings.UPLOAD_PATH
    }

def get_email_config() -> dict:
    """Get email configuration."""
    return {
        "smtp": {
            "server": settings.SMTP_SERVER,
            "port": settings.SMTP_PORT,
            "username": settings.SMTP_USERNAME,
            "password": settings.SMTP_PASSWORD,
            "from_email": settings.SMTP_FROM_EMAIL,
            "from_name": settings.SMTP_FROM_NAME,
        },
        "sendgrid": {
            "api_key": settings.SENDGRID_API_KEY,
            "from_email": settings.SENDGRID_FROM_EMAIL or settings.SMTP_FROM_EMAIL,
            "from_name": settings.SENDGRID_FROM_NAME or settings.SMTP_FROM_NAME,
        }
    } 