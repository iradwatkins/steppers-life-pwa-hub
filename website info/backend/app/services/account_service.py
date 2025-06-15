import logging
from typing import Dict, Any, Optional, List
from decimal import Decimal
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User
from app.models.user_account import UserAccount, AccountTransaction, TransactionType
from app.models.payment_disbursement import DisbursementType
from app.services.disbursement_service import disbursement_service, DisbursementError

logger = logging.getLogger(__name__)

class AccountError(Exception):
    def __init__(self, message: str, error_code: str = None):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)

class AccountService:
    def __init__(self):
        pass
    
    def get_or_create_account(self, db: Session, user_id: int) -> UserAccount:
        """Get existing account or create new one for user"""
        account = db.query(UserAccount).filter(UserAccount.user_id == user_id).first()
        
        if not account:
            account = UserAccount(user_id=user_id)
            db.add(account)
            db.commit()
            db.refresh(account)
            logger.info(f"Created new account for user {user_id}")
        
        return account
    
    def get_account_balance(self, db: Session, user_id: int) -> Dict[str, Any]:
        """Get account balance information"""
        account = self.get_or_create_account(db, user_id)
        
        return {
            "user_id": user_id,
            "balance": float(account.balance),
            "available_balance": float(account.available_balance()),
            "pending_balance": float(account.pending_balance),
            "total_earned": float(account.total_earned),
            "total_withdrawn": float(account.total_withdrawn),
            "is_active": account.is_active,
            "is_frozen": account.is_frozen,
            "min_withdrawal_amount": float(account.min_withdrawal_amount)
        }
    
    def add_credit(
        self,
        db: Session,
        user_id: int,
        amount: Decimal,
        transaction_type: TransactionType,
        description: str = None,
        reference_type: str = None,
        reference_id: str = None,
        processed_by: int = None
    ) -> AccountTransaction:
        """Add credit to user account"""
        if amount <= 0:
            raise AccountError("Credit amount must be positive")
        
        account = self.get_or_create_account(db, user_id)
        
        if not account.is_active:
            raise AccountError("Account is not active")
        
        # Create transaction record
        balance_before = account.balance
        balance_after = balance_before + amount
        
        transaction = AccountTransaction(
            account_id=account.id,
            transaction_type=transaction_type,
            amount=amount,
            description=description,
            reference_type=reference_type,
            reference_id=reference_id,
            balance_before=balance_before,
            balance_after=balance_after,
            processed_by=processed_by
        )
        
        # Update account balance
        account.balance = balance_after
        if transaction_type in [TransactionType.COMMISSION, TransactionType.CREDIT]:
            account.total_earned += amount
        
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        logger.info(f"Added ${amount} credit to user {user_id} account. New balance: ${balance_after}")
        return transaction
    
    def debit_account(
        self,
        db: Session,
        user_id: int,
        amount: Decimal,
        transaction_type: TransactionType,
        description: str = None,
        reference_type: str = None,
        reference_id: str = None,
        processed_by: int = None
    ) -> AccountTransaction:
        """Debit amount from user account"""
        if amount <= 0:
            raise AccountError("Debit amount must be positive")
        
        account = self.get_or_create_account(db, user_id)
        
        if not account.is_active:
            raise AccountError("Account is not active")
        
        if account.is_frozen:
            raise AccountError("Account is frozen")
        
        if amount > account.available_balance():
            raise AccountError(f"Insufficient funds. Available: ${account.available_balance()}, Required: ${amount}")
        
        # Create transaction record
        balance_before = account.balance
        balance_after = balance_before - amount
        
        transaction = AccountTransaction(
            account_id=account.id,
            transaction_type=transaction_type,
            amount=amount,
            description=description,
            reference_type=reference_type,
            reference_id=reference_id,
            balance_before=balance_before,
            balance_after=balance_after,
            processed_by=processed_by
        )
        
        # Update account balance
        account.balance = balance_after
        if transaction_type == TransactionType.WITHDRAWAL:
            account.total_withdrawn += amount
        
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        logger.info(f"Debited ${amount} from user {user_id} account. New balance: ${balance_after}")
        return transaction
    
    async def create_withdrawal(
        self,
        db: Session,
        user_id: int,
        amount: Decimal,
        payment_method: str = None,
        description: str = None,
        auto_process: bool = False
    ) -> Dict[str, Any]:
        """Create withdrawal (disbursement) from account balance"""
        account = self.get_or_create_account(db, user_id)
        
        if not account.can_withdraw(amount):
            available = account.available_balance()
            min_amount = account.min_withdrawal_amount
            
            if account.is_frozen:
                raise AccountError("Account is frozen - withdrawals not allowed")
            elif not account.is_active:
                raise AccountError("Account is not active")
            elif amount < min_amount:
                raise AccountError(f"Minimum withdrawal amount is ${min_amount}")
            elif amount > available:
                raise AccountError(f"Insufficient funds. Available: ${available}")
            else:
                raise AccountError("Withdrawal not allowed")
        
        try:
            # Create disbursement
            disbursement = await disbursement_service.create_disbursement(
                db=db,
                recipient_id=user_id,
                amount=amount,
                disbursement_type=DisbursementType.MANUAL,
                payment_method=payment_method,
                description=description or f"Account withdrawal - ${amount}",
                reference_type="withdrawal",
                reference_id=None,
                initiated_by=user_id,
                auto_process=auto_process
            )
            
            # Debit the account
            transaction = self.debit_account(
                db=db,
                user_id=user_id,
                amount=amount,
                transaction_type=TransactionType.WITHDRAWAL,
                description=f"Withdrawal via {payment_method or 'default method'}",
                reference_type="disbursement",
                reference_id=str(disbursement.id),
                processed_by=user_id
            )
            
            return {
                "success": True,
                "disbursement_id": disbursement.id,
                "transaction_id": transaction.id,
                "amount": float(amount),
                "new_balance": float(account.balance),
                "status": disbursement.status.value
            }
            
        except DisbursementError as e:
            raise AccountError(f"Failed to create withdrawal: {e.message}")
    
    def transfer_between_users(
        self,
        db: Session,
        from_user_id: int,
        to_user_id: int,
        amount: Decimal,
        description: str = None,
        processed_by: int = None
    ) -> Dict[str, Any]:
        """Transfer money between user accounts"""
        if amount <= 0:
            raise AccountError("Transfer amount must be positive")
        
        if from_user_id == to_user_id:
            raise AccountError("Cannot transfer to the same account")
        
        # Get both accounts
        from_account = self.get_or_create_account(db, from_user_id)
        to_account = self.get_or_create_account(db, to_user_id)
        
        # Check sender can transfer
        if not from_account.can_transfer(amount):
            raise AccountError("Transfer not allowed - insufficient funds or account restrictions")
        
        if not to_account.is_active:
            raise AccountError("Recipient account is not active")
        
        # Create debit transaction for sender
        from_balance_before = from_account.balance
        from_balance_after = from_balance_before - amount
        
        debit_transaction = AccountTransaction(
            account_id=from_account.id,
            transaction_type=TransactionType.TRANSFER_OUT,
            amount=amount,
            description=description or f"Transfer to user {to_user_id}",
            reference_type="transfer",
            from_user_id=from_user_id,
            to_user_id=to_user_id,
            balance_before=from_balance_before,
            balance_after=from_balance_after,
            processed_by=processed_by
        )
        
        # Create credit transaction for recipient
        to_balance_before = to_account.balance
        to_balance_after = to_balance_before + amount
        
        credit_transaction = AccountTransaction(
            account_id=to_account.id,
            transaction_type=TransactionType.TRANSFER_IN,
            amount=amount,
            description=description or f"Transfer from user {from_user_id}",
            reference_type="transfer",
            from_user_id=from_user_id,
            to_user_id=to_user_id,
            balance_before=to_balance_before,
            balance_after=to_balance_after,
            processed_by=processed_by
        )
        
        # Update balances
        from_account.balance = from_balance_after
        to_account.balance = to_balance_after
        to_account.total_earned += amount
        
        # Save transactions
        db.add(debit_transaction)
        db.add(credit_transaction)
        db.commit()
        db.refresh(debit_transaction)
        db.refresh(credit_transaction)
        
        logger.info(f"Transferred ${amount} from user {from_user_id} to user {to_user_id}")
        
        return {
            "success": True,
            "amount": float(amount),
            "from_user_id": from_user_id,
            "to_user_id": to_user_id,
            "from_new_balance": float(from_balance_after),
            "to_new_balance": float(to_balance_after),
            "debit_transaction_id": debit_transaction.id,
            "credit_transaction_id": credit_transaction.id
        }
    
    def get_transaction_history(
        self,
        db: Session,
        user_id: int,
        transaction_type: TransactionType = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[AccountTransaction]:
        """Get transaction history for user"""
        account = self.get_or_create_account(db, user_id)
        
        query = db.query(AccountTransaction).filter(AccountTransaction.account_id == account.id)
        
        if transaction_type:
            query = query.filter(AccountTransaction.transaction_type == transaction_type)
        
        transactions = query.order_by(AccountTransaction.created_at.desc())\
                           .limit(limit)\
                           .offset(offset)\
                           .all()
        
        return transactions
    
    def get_account_statistics(self, db: Session, user_id: int) -> Dict[str, Any]:
        """Get account statistics for user"""
        account = self.get_or_create_account(db, user_id)
        
        # Get transaction counts by type
        transaction_stats = db.query(
            AccountTransaction.transaction_type,
            func.count(AccountTransaction.id).label('count'),
            func.coalesce(func.sum(AccountTransaction.amount), 0).label('total')
        ).filter(AccountTransaction.account_id == account.id)\
         .group_by(AccountTransaction.transaction_type)\
         .all()
        
        stats = {
            "account_info": self.get_account_balance(db, user_id),
            "transaction_stats": {
                stat.transaction_type.value: {
                    "count": stat.count,
                    "total": float(stat.total)
                } for stat in transaction_stats
            }
        }
        
        return stats

# Global account service instance
account_service = AccountService() 