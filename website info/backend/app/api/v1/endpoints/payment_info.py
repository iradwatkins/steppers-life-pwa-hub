from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.user import User, UserRole
from app.models.user_payment_info import UserPaymentInfo, PaymentMethodType
from app.schemas.payment_info import (
    UserPaymentInfoCreate,
    UserPaymentInfoUpdate,
    UserPaymentInfo as UserPaymentInfoSchema,
    PaymentMethodVerification,
    PaymentMethodStatus
)

router = APIRouter()

@router.get("/me", response_model=UserPaymentInfoSchema)
async def get_my_payment_info(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's payment information"""
    payment_info = db.query(UserPaymentInfo).filter(UserPaymentInfo.user_id == current_user.id).first()
    
    if not payment_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment information not found"
        )
    
    return payment_info

@router.post("/me", response_model=UserPaymentInfoSchema)
async def create_my_payment_info(
    payment_info_data: UserPaymentInfoCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create payment information for current user"""
    # Check if payment info already exists
    existing_info = db.query(UserPaymentInfo).filter(UserPaymentInfo.user_id == current_user.id).first()
    if existing_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment information already exists. Use PUT to update."
        )
    
    # Create new payment info
    payment_info = UserPaymentInfo(
        user_id=current_user.id,
        **payment_info_data.dict()
    )
    
    db.add(payment_info)
    db.commit()
    db.refresh(payment_info)
    
    return payment_info

@router.put("/me", response_model=UserPaymentInfoSchema)
async def update_my_payment_info(
    payment_info_update: UserPaymentInfoUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user's payment information"""
    payment_info = db.query(UserPaymentInfo).filter(UserPaymentInfo.user_id == current_user.id).first()
    
    if not payment_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment information not found. Create it first."
        )
    
    # Update only provided fields
    update_data = payment_info_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(payment_info, field, value)
    
    db.commit()
    db.refresh(payment_info)
    
    return payment_info

@router.get("/me/methods", response_model=List[PaymentMethodStatus])
async def get_my_payment_methods(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get status of all payment methods for current user"""
    payment_info = db.query(UserPaymentInfo).filter(UserPaymentInfo.user_id == current_user.id).first()
    
    if not payment_info:
        return []
    
    methods = []
    
    # CashApp
    methods.append(PaymentMethodStatus(
        method_type=PaymentMethodType.CASHAPP,
        is_verified=payment_info.cashapp_verified,
        is_available=bool(payment_info.cashapp_tag or payment_info.cashapp_phone),
        display_info=payment_info.cashapp_tag or f"***{payment_info.cashapp_phone[-4:]}" if payment_info.cashapp_phone else "Not configured"
    ))
    
    # Zelle
    methods.append(PaymentMethodStatus(
        method_type=PaymentMethodType.ZELLE,
        is_verified=payment_info.zelle_verified,
        is_available=bool(payment_info.zelle_phone or payment_info.zelle_email),
        display_info=f"***{payment_info.zelle_email[-10:]}" if payment_info.zelle_email else f"***{payment_info.zelle_phone[-4:]}" if payment_info.zelle_phone else "Not configured"
    ))
    
    # Bank Transfer
    methods.append(PaymentMethodStatus(
        method_type=PaymentMethodType.BANK_TRANSFER,
        is_verified=payment_info.bank_verified,
        is_available=bool(payment_info.bank_account_number),
        display_info=f"{payment_info.bank_name} ***{payment_info.bank_account_number[-4:]}" if payment_info.bank_account_number else "Not configured"
    ))
    
    # PayPal
    methods.append(PaymentMethodStatus(
        method_type=PaymentMethodType.PAYPAL,
        is_verified=payment_info.paypal_verified,
        is_available=bool(payment_info.paypal_email),
        display_info=f"***{payment_info.paypal_email[-10:]}" if payment_info.paypal_email else "Not configured"
    ))
    
    return methods

@router.post("/me/verify/{method_type}")
async def request_payment_method_verification(
    method_type: PaymentMethodType,
    verification: PaymentMethodVerification,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Request verification for a payment method"""
    payment_info = db.query(UserPaymentInfo).filter(UserPaymentInfo.user_id == current_user.id).first()
    
    if not payment_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment information not found. Create it first."
        )
    
    # For now, this is a placeholder - in production you'd implement actual verification
    return {
        "success": True,
        "message": f"Verification request submitted for {method_type.value}",
        "method_type": method_type.value,
        "status": "pending_review"
    }

# Admin endpoints
@router.get("/{user_id}", response_model=UserPaymentInfoSchema)
async def get_user_payment_info(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get payment information for a specific user (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    payment_info = db.query(UserPaymentInfo).filter(UserPaymentInfo.user_id == user_id).first()
    
    if not payment_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment information not found"
        )
    
    return payment_info

@router.post("/{user_id}/verify/{method_type}")
async def verify_payment_method(
    user_id: int,
    method_type: PaymentMethodType,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Verify a user's payment method (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    payment_info = db.query(UserPaymentInfo).filter(UserPaymentInfo.user_id == user_id).first()
    
    if not payment_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment information not found"
        )
    
    # Update verification status
    if method_type == PaymentMethodType.CASHAPP:
        payment_info.cashapp_verified = True
    elif method_type == PaymentMethodType.ZELLE:
        payment_info.zelle_verified = True
    elif method_type == PaymentMethodType.BANK_TRANSFER:
        payment_info.bank_verified = True
    elif method_type == PaymentMethodType.PAYPAL:
        payment_info.paypal_verified = True
    
    db.commit()
    
    return {
        "success": True,
        "message": f"{method_type.value} verified for user {user_id}",
        "method_type": method_type.value,
        "verified": True
    }

@router.post("/{user_id}/kyc/approve")
async def approve_kyc(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Approve KYC for a user (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    payment_info = db.query(UserPaymentInfo).filter(UserPaymentInfo.user_id == user_id).first()
    
    if not payment_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment information not found"
        )
    
    payment_info.kyc_verified = True
    db.commit()
    
    return {
        "success": True,
        "message": f"KYC approved for user {user_id}",
        "kyc_verified": True
    } 