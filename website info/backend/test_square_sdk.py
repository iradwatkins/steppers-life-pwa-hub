#!/usr/bin/env python3
"""
Test script to verify Square SDK integration
Run this to check if the Square SDK is properly installed and configured.
"""

import os
import sys
sys.path.append('.')

try:
    from square import Square
    from square.environment import SquareEnvironment
    from square.core.api_error import ApiError
    print("✅ Square SDK imports successful!")
except ImportError as e:
    print(f"❌ Square SDK import failed: {e}")
    exit(1)

def test_square_client():
    """Test Square client initialization"""
    print("\n🔧 Testing Square client initialization...")
    
    # Test with mock token (will fail API calls but should initialize)
    test_token = "test_token_12345"
    
    try:
        client = Square(
            token=test_token,
            environment=SquareEnvironment.SANDBOX
        )
        print("✅ Square client initialized successfully!")
        print(f"   Environment: {client._environment}")
        return True
    except Exception as e:
        print(f"❌ Square client initialization failed: {e}")
        return False

def test_payment_service():
    """Test the payment service integration"""
    print("\n🔧 Testing PaymentService...")
    
    try:
        from app.services.payment_service import PaymentService
        service = PaymentService()
        providers = service.get_available_providers()
        print(f"✅ PaymentService initialized successfully!")
        print(f"   Available providers: {providers}")
        return True
    except Exception as e:
        print(f"❌ PaymentService initialization failed: {e}")
        return False

def check_environment_variables():
    """Check if Square environment variables are set"""
    print("\n🔧 Checking environment variables...")
    
    required_vars = [
        'SQUARE_ACCESS_TOKEN',
        'SQUARE_APPLICATION_ID', 
        'SQUARE_ENVIRONMENT'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"⚠️  Missing environment variables: {missing_vars}")
        print("   Square payments will not be available without proper configuration.")
        return False
    else:
        print("✅ All Square environment variables are set!")
        return True

def main():
    """Run all tests"""
    print("🧪 Square SDK Integration Test")
    print("=" * 40)
    
    success_count = 0
    total_tests = 3
    
    if test_square_client():
        success_count += 1
    
    if test_payment_service():
        success_count += 1
    
    if check_environment_variables():
        success_count += 1
    
    print("\n" + "=" * 40)
    print(f"📊 Results: {success_count}/{total_tests} tests passed")
    
    if success_count == total_tests:
        print("🎉 All tests passed! Square SDK is properly configured.")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        
        if success_count >= 2:
            print("💡 The SDK is installed correctly, but you may need to set up environment variables.")
    
    return success_count == total_tests

if __name__ == "__main__":
    main() 