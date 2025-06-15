from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal

from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.user import User, UserRole
from app.models.user_account import AccountTransaction, TransactionType
from app.services.account_service import account_service, AccountError
from app.schemas.account import (
    AccountBalance,
    TransferRequest,
    WithdrawalRequest,
    AccountTransactionSchema,
    AccountStatistics
)

router = APIRouter()

@router.get("/balance", response_model=AccountBalance)
async def get_account_balance(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's account balance"""
    try:
        balance_info = account_service.get_account_balance(db, current_user.id)
        return AccountBalance(**balance_info)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get account balance: {str(e)}"
        )

@router.get("/transactions", response_model=List[AccountTransactionSchema])
async def get_transaction_history(
    transaction_type: Optional[TransactionType] = Query(None, description="Filter by transaction type"),
    limit: int = Query(50, le=100, description="Number of transactions to return"),
    offset: int = Query(0, description="Number of transactions to skip"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's transaction history"""
    try:
        transactions = account_service.get_transaction_history(
            db=db,
            user_id=current_user.id,
            transaction_type=transaction_type,
            limit=limit,
            offset=offset
        )
        
        return [
            AccountTransactionSchema(
                id=t.id,
                transaction_type=t.transaction_type,
                amount=float(t.amount),
                description=t.description,
                reference_type=t.reference_type,
                reference_id=t.reference_id,
                balance_before=float(t.balance_before),
                balance_after=float(t.balance_after),
                created_at=t.created_at,
                from_user_id=t.from_user_id,
                to_user_id=t.to_user_id
            ) for t in transactions
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get transaction history: {str(e)}"
        )

@router.post("/transfer")
async def transfer_funds(
    transfer_request: TransferRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Transfer funds to another user"""
    try:
        # Verify recipient exists
        recipient = db.query(User).filter(User.id == transfer_request.to_user_id).first()
        if not recipient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipient user not found"
            )
        
        # Perform transfer
        result = account_service.transfer_between_users(
            db=db,
            from_user_id=current_user.id,
            to_user_id=transfer_request.to_user_id,
            amount=Decimal(str(transfer_request.amount)),
            description=transfer_request.description,
            processed_by=current_user.id
        )
        
        return {
            "success": True,
            "message": f"Successfully transferred ${transfer_request.amount} to {recipient.email}",
            **result
        }
        
    except AccountError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transfer failed: {str(e)}"
        )

@router.post("/withdraw")
async def withdraw_funds(
    withdrawal_request: WithdrawalRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Withdraw funds from account balance"""
    try:
        result = await account_service.create_withdrawal(
            db=db,
            user_id=current_user.id,
            amount=Decimal(str(withdrawal_request.amount)),
            payment_method=withdrawal_request.payment_method,
            description=withdrawal_request.description,
            auto_process=False  # Manual processing for now
        )
        
        return {
            "success": True,
            "message": f"Withdrawal request created for ${withdrawal_request.amount}",
            **result
        }
        
    except AccountError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Withdrawal failed: {str(e)}"
        )

@router.get("/statistics", response_model=AccountStatistics)
async def get_account_statistics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get account statistics for current user"""
    try:
        stats = account_service.get_account_statistics(db, current_user.id)
        return AccountStatistics(**stats)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get account statistics: {str(e)}"
        )

# Admin endpoints
@router.get("/{user_id}/balance", response_model=AccountBalance)
async def get_user_balance_admin(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get any user's account balance (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        balance_info = account_service.get_account_balance(db, user_id)
        return AccountBalance(**balance_info)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get account balance: {str(e)}"
        )

@router.post("/{user_id}/credit")
async def credit_user_account(
    user_id: int,
    credit_data: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Credit a user's account (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        amount = Decimal(str(credit_data["amount"]))
        description = credit_data.get("description", "Admin credit")
        transaction_type = TransactionType(credit_data.get("transaction_type", "credit"))
        
        transaction = account_service.add_credit(
            db=db,
            user_id=user_id,
            amount=amount,
            transaction_type=transaction_type,
            description=description,
            processed_by=current_user.id
        )
        
        return {
            "success": True,
            "message": f"Successfully credited ${amount} to user account",
            "transaction_id": transaction.id,
            "new_balance": float(transaction.balance_after)
        }
        
    except (KeyError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid request data: {str(e)}"
        )
    except AccountError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Credit failed: {str(e)}"
        )

@router.post("/{user_id}/freeze")
async def freeze_account(
    user_id: int,
    freeze_data: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Freeze a user's account (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        account = account_service.get_or_create_account(db, user_id)
        account.is_frozen = True
        db.commit()
        
        reason = freeze_data.get("reason", "No reason provided")
        
        return {
            "success": True,
            "message": f"Account frozen for user {user_id}",
            "reason": reason
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to freeze account: {str(e)}"
        )

@router.post("/{user_id}/unfreeze")
async def unfreeze_account(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Unfreeze a user's account (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        account = account_service.get_or_create_account(db, user_id)
        account.is_frozen = False
        db.commit()
        
        return {
            "success": True,
            "message": f"Account unfrozen for user {user_id}"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unfreeze account: {str(e)}"
        ) 