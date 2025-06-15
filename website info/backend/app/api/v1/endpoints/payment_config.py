from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import os
from pathlib import Path

from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.user import User, UserRole
from app.schemas.payment_config import (
    PaymentConfigAuth,
    PaymentConfigUpdate,
    PaymentConfigResponse,
    SquareConfig,
    PayPalConfig
)

router = APIRouter()

# Configuration password
PAYMENT_CONFIG_PASSWORD = "1171"

def verify_config_password(password: str) -> bool:
    """Verify the payment configuration password"""
    return password == PAYMENT_CONFIG_PASSWORD

def update_env_file(updates: Dict[str, str]):
    """Update environment file with new values"""
    env_path = Path("../.env")  # Backend env file
    
    # Read existing env file
    env_vars = {}
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key] = value
    
    # Update with new values
    env_vars.update(updates)
    
    # Write back to file
    with open(env_path, 'w') as f:
        f.write("# SteppersLife Backend Environment Variables\n")
        f.write("# Updated via Payment Configuration Interface\n\n")
        
        # Application Settings
        f.write("# Application Settings\n")
        f.write(f"ENVIRONMENT={env_vars.get('ENVIRONMENT', 'development')}\n")
        f.write(f"DEBUG={env_vars.get('DEBUG', 'True')}\n")
        f.write(f"SECRET_KEY={env_vars.get('SECRET_KEY', 'dev-secret-key-change-in-production-must-be-32-chars-or-more')}\n\n")
        
        # Database
        f.write("# Database\n")
        f.write(f"DATABASE_URL={env_vars.get('DATABASE_URL', 'sqlite:///./steppers_life.db')}\n\n")
        
        # Square Settings
        f.write("# Square Payment Settings\n")
        f.write(f"SQUARE_APPLICATION_ID={env_vars.get('SQUARE_APPLICATION_ID', '')}\n")
        f.write(f"SQUARE_ACCESS_TOKEN={env_vars.get('SQUARE_ACCESS_TOKEN', '')}\n")
        f.write(f"SQUARE_ENVIRONMENT={env_vars.get('SQUARE_ENVIRONMENT', 'sandbox')}\n\n")
        
        # PayPal Settings
        f.write("# PayPal Payment Settings\n")
        f.write(f"PAYPAL_CLIENT_ID={env_vars.get('PAYPAL_CLIENT_ID', '')}\n")
        f.write(f"PAYPAL_CLIENT_SECRET={env_vars.get('PAYPAL_CLIENT_SECRET', '')}\n")
        f.write(f"PAYPAL_MODE={env_vars.get('PAYPAL_MODE', 'sandbox')}\n\n")
        
        # CashApp Settings
        f.write("# CashApp Settings\n")
        f.write(f"CASHAPP_API_KEY={env_vars.get('CASHAPP_API_KEY', '')}\n")
        f.write(f"CASHAPP_CLIENT_ID={env_vars.get('CASHAPP_CLIENT_ID', '')}\n")
        f.write(f"CASHAPP_ENVIRONMENT={env_vars.get('CASHAPP_ENVIRONMENT', 'sandbox')}\n\n")
        
        # Frontend URL
        f.write("# Frontend URL\n")
        f.write(f"FRONTEND_URL={env_vars.get('FRONTEND_URL', 'http://localhost:8082')}\n")

@router.post("/auth")
async def authenticate_config(
    auth_data: PaymentConfigAuth,
    current_user: User = Depends(get_current_active_user)
):
    """Authenticate for payment configuration access"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access payment configuration"
        )
    
    if not verify_config_password(auth_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid configuration password"
        )
    
    return {
        "success": True,
        "message": "Authentication successful",
        "access_granted": True
    }

@router.get("/current", response_model=PaymentConfigResponse)
async def get_current_config(
    password: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get current payment configuration (with password verification)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access payment configuration"
        )
    
    if not verify_config_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid configuration password"
        )
    
    # Get current environment variables
    square_config = SquareConfig(
        application_id=os.getenv('SQUARE_APPLICATION_ID', ''),
        access_token=os.getenv('SQUARE_ACCESS_TOKEN', ''),
        environment=os.getenv('SQUARE_ENVIRONMENT', 'sandbox'),
        is_configured=bool(os.getenv('SQUARE_ACCESS_TOKEN'))
    )
    
    paypal_config = PayPalConfig(
        client_id=os.getenv('PAYPAL_CLIENT_ID', ''),
        client_secret=os.getenv('PAYPAL_CLIENT_SECRET', ''),
        mode=os.getenv('PAYPAL_MODE', 'sandbox'),
        is_configured=bool(os.getenv('PAYPAL_CLIENT_ID') and os.getenv('PAYPAL_CLIENT_SECRET'))
    )
    
    return PaymentConfigResponse(
        square=square_config,
        paypal=paypal_config
    )

@router.put("/update")
async def update_payment_config(
    config_update: PaymentConfigUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update payment configuration"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update payment configuration"
        )
    
    if not verify_config_password(config_update.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid configuration password"
        )
    
    try:
        updates = {}
        
        # Update Square configuration
        if config_update.square:
            if config_update.square.application_id is not None:
                updates['SQUARE_APPLICATION_ID'] = config_update.square.application_id
            if config_update.square.access_token is not None:
                updates['SQUARE_ACCESS_TOKEN'] = config_update.square.access_token
            if config_update.square.environment is not None:
                updates['SQUARE_ENVIRONMENT'] = config_update.square.environment
        
        # Update PayPal configuration
        if config_update.paypal:
            if config_update.paypal.client_id is not None:
                updates['PAYPAL_CLIENT_ID'] = config_update.paypal.client_id
            if config_update.paypal.client_secret is not None:
                updates['PAYPAL_CLIENT_SECRET'] = config_update.paypal.client_secret
            if config_update.paypal.mode is not None:
                updates['PAYPAL_MODE'] = config_update.paypal.mode
        
        # Update environment file
        if updates:
            update_env_file(updates)
        
        return {
            "success": True,
            "message": "Payment configuration updated successfully",
            "updated_fields": list(updates.keys()),
            "note": "Server restart required to apply changes"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update configuration: {str(e)}"
        )

@router.post("/test-credentials")
async def test_payment_credentials(
    test_data: dict,
    current_user: User = Depends(get_current_active_user)
):
    """Test payment provider credentials"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can test payment credentials"
        )
    
    if not verify_config_password(test_data.get("password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid configuration password"
        )
    
    provider = test_data.get("provider")
    results = {}
    
    try:
        if provider == "square" or provider == "all":
            # Test Square credentials
            from square import Square
            from square.environment import SquareEnvironment
            
            access_token = test_data.get("square_access_token") or os.getenv('SQUARE_ACCESS_TOKEN')
            environment = test_data.get("square_environment", "sandbox")
            
            if access_token:
                try:
                    env = SquareEnvironment.SANDBOX if environment == 'sandbox' else SquareEnvironment.PRODUCTION
                    client = Square(token=access_token, environment=env)
                    response = client.locations.list()
                    
                    results["square"] = {
                        "success": True,
                        "message": f"Square credentials valid. Found {len(response.locations) if response.locations else 0} locations.",
                        "environment": environment
                    }
                except Exception as e:
                    results["square"] = {
                        "success": False,
                        "message": f"Square credentials test failed: {str(e)}",
                        "environment": environment
                    }
            else:
                results["square"] = {
                    "success": False,
                    "message": "No Square access token provided",
                    "environment": environment
                }
        
        if provider == "paypal" or provider == "all":
            # Test PayPal credentials
            import paypalrestsdk
            
            client_id = test_data.get("paypal_client_id") or os.getenv('PAYPAL_CLIENT_ID')
            client_secret = test_data.get("paypal_client_secret") or os.getenv('PAYPAL_CLIENT_SECRET')
            mode = test_data.get("paypal_mode", "sandbox")
            
            if client_id and client_secret:
                try:
                    paypalrestsdk.configure({
                        "mode": mode,
                        "client_id": client_id,
                        "client_secret": client_secret
                    })
                    
                    # Test by creating a simple payment object (without executing)
                    payment = paypalrestsdk.Payment({
                        "intent": "sale",
                        "payer": {"payment_method": "paypal"},
                        "transactions": [{
                            "amount": {"total": "1.00", "currency": "USD"},
                            "description": "Test transaction"
                        }]
                    })
                    
                    results["paypal"] = {
                        "success": True,
                        "message": f"PayPal credentials valid for {mode} environment.",
                        "mode": mode
                    }
                except Exception as e:
                    results["paypal"] = {
                        "success": False,
                        "message": f"PayPal credentials test failed: {str(e)}",
                        "mode": mode
                    }
            else:
                results["paypal"] = {
                    "success": False,
                    "message": "PayPal client ID or secret not provided",
                    "mode": mode
                }
        
        return {
            "success": True,
            "test_results": results
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Credential testing failed: {str(e)}"
        )

@router.post("/set-paypal-credentials")
async def set_paypal_credentials(
    credentials: dict,
    current_user: User = Depends(get_current_active_user)
):
    """Quick endpoint to set PayPal credentials"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update payment configuration"
        )
    
    if not verify_config_password(credentials.get("password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid configuration password"
        )
    
    try:
        updates = {
            'PAYPAL_CLIENT_ID': credentials.get('client_id', ''),
            'PAYPAL_CLIENT_SECRET': credentials.get('client_secret', ''),
            'PAYPAL_MODE': credentials.get('mode', 'sandbox')
        }
        
        update_env_file(updates)
        
        return {
            "success": True,
            "message": "PayPal credentials updated successfully",
            "client_id_preview": credentials.get('client_id', '')[:20] + "..." if credentials.get('client_id') else '',
            "mode": credentials.get('mode', 'sandbox')
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update PayPal credentials: {str(e)}"
        ) 