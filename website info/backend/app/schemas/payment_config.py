from pydantic import BaseModel, Field
from typing import Optional

class PaymentConfigAuth(BaseModel):
    password: str = Field(..., description="Configuration access password")

class SquareConfigUpdate(BaseModel):
    application_id: Optional[str] = Field(None, description="Square Application ID")
    access_token: Optional[str] = Field(None, description="Square Access Token")
    environment: Optional[str] = Field("sandbox", description="Square Environment (sandbox/production)")

class PayPalConfigUpdate(BaseModel):
    client_id: Optional[str] = Field(None, description="PayPal Client ID")
    client_secret: Optional[str] = Field(None, description="PayPal Client Secret")
    mode: Optional[str] = Field("sandbox", description="PayPal Mode (sandbox/live)")

class PaymentConfigUpdate(BaseModel):
    password: str = Field(..., description="Configuration access password")
    square: Optional[SquareConfigUpdate] = Field(None, description="Square configuration updates")
    paypal: Optional[PayPalConfigUpdate] = Field(None, description="PayPal configuration updates")

class SquareConfig(BaseModel):
    application_id: str = Field("", description="Square Application ID")
    access_token: str = Field("", description="Square Access Token (masked)")
    environment: str = Field("sandbox", description="Square Environment")
    is_configured: bool = Field(False, description="Whether Square is properly configured")
    
    def dict(self, **kwargs):
        """Override dict to mask sensitive data"""
        data = super().dict(**kwargs)
        if data['access_token']:
            # Mask the access token for security
            data['access_token'] = data['access_token'][:8] + "*" * (len(data['access_token']) - 12) + data['access_token'][-4:]
        return data

class PayPalConfig(BaseModel):
    client_id: str = Field("", description="PayPal Client ID")
    client_secret: str = Field("", description="PayPal Client Secret (masked)")
    mode: str = Field("sandbox", description="PayPal Mode")
    is_configured: bool = Field(False, description="Whether PayPal is properly configured")
    
    def dict(self, **kwargs):
        """Override dict to mask sensitive data"""
        data = super().dict(**kwargs)
        if data['client_id']:
            # Mask the client ID for security
            data['client_id'] = data['client_id'][:8] + "*" * (len(data['client_id']) - 12) + data['client_id'][-4:]
        if data['client_secret']:
            # Mask the client secret for security
            data['client_secret'] = data['client_secret'][:8] + "*" * (len(data['client_secret']) - 12) + data['client_secret'][-4:]
        return data

class PaymentConfigResponse(BaseModel):
    square: SquareConfig
    paypal: PayPalConfig

class PaymentCredentialTest(BaseModel):
    password: str = Field(..., description="Configuration access password")
    provider: str = Field(..., description="Provider to test (square/paypal/all)")
    square_access_token: Optional[str] = Field(None, description="Square access token to test")
    square_environment: Optional[str] = Field("sandbox", description="Square environment")
    paypal_client_id: Optional[str] = Field(None, description="PayPal client ID to test")
    paypal_client_secret: Optional[str] = Field(None, description="PayPal client secret to test")
    paypal_mode: Optional[str] = Field("sandbox", description="PayPal mode") 