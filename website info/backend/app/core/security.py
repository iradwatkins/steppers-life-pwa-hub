from app.core.auth import AuthService

# Expose commonly used functions for easy import
def get_password_hash(password: str) -> str:
    """Hash a password."""
    return AuthService.get_password_hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return AuthService.verify_password(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta=None) -> str:
    """Create a JWT access token."""
    return AuthService.create_access_token(data, expires_delta)

def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token."""
    return AuthService.create_refresh_token(data)

def verify_token(token: str):
    """Verify and decode a JWT token."""
    return AuthService.verify_token(token) 