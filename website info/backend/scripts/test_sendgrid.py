#!/usr/bin/env python3
"""
Test script for SendGrid email integration.
Usage: python test_sendgrid.py recipient@example.com
"""

import os
import sys
import argparse
from pathlib import Path

# Add the parent directory to sys.path to access app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.email_service import EmailService
from app.core.config import settings

def parse_args():
    parser = argparse.ArgumentParser(description='Test SendGrid email integration')
    parser.add_argument('recipient', help='Email address to send the test email to')
    parser.add_argument('--api-key', help='SendGrid API key (if not set in environment variables)')
    return parser.parse_args()

def test_sendgrid_email(recipient_email, api_key=None):
    """Test sending an email via SendGrid."""
    
    # If API key is provided as argument, use it temporarily
    if api_key:
        original_api_key = os.environ.get('SENDGRID_API_KEY')
        os.environ['SENDGRID_API_KEY'] = api_key
        settings.SENDGRID_API_KEY = api_key
    
    print(f"Testing SendGrid email integration...")
    print(f"Recipient: {recipient_email}")
    print(f"API Key configured: {'Yes' if settings.SENDGRID_API_KEY else 'No'}")
    
    # Send a test email
    result = EmailService.send_welcome_email(
        email=recipient_email,
        first_name="Test User"
    )
    
    # Restore original API key if we set it temporarily
    if api_key and original_api_key:
        os.environ['SENDGRID_API_KEY'] = original_api_key
        settings.SENDGRID_API_KEY = original_api_key
    
    if result:
        print("✅ Test email sent successfully!")
    else:
        print("❌ Failed to send test email. Check logs for details.")
        print("   Make sure your SendGrid API key is configured correctly.")
    
    return result

if __name__ == "__main__":
    args = parse_args()
    test_sendgrid_email(args.recipient, args.api_key) 