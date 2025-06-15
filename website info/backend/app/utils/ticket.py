import secrets
import string
from datetime import datetime

def generate_ticket_number() -> str:
    """
    Generate a unique ticket number.
    Format: TK-YYYYMMDD-XXXXXX
    """
    date_str = datetime.now().strftime("%Y%m%d")
    random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
    return f"TK-{date_str}-{random_part}"

def generate_verification_token() -> str:
    """
    Generate a secure verification token for QR codes.
    """
    return secrets.token_urlsafe(32) 