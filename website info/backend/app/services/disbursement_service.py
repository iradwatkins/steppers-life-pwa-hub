import os
import json
import uuid
import logging
from typing import Dict, Any, Optional, List
from decimal import Decimal
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.user_payment_info import UserPaymentInfo, PaymentMethodType
from app.models.payment_disbursement import PaymentDisbursement, DisbursementStatus, DisbursementType

logger = logging.getLogger(__name__)

class DisbursementError(Exception):
    def __init__(self, message: str, provider: str = None, error_code: str = None):
        self.message = message
        self.provider = provider
        self.error_code = error_code
        super().__init__(self.message)

class PaymentDisbursementService:
    def __init__(self):
        self.cashapp_configured = bool(settings.CASHAPP_API_KEY)
        self.zelle_tracking_enabled = settings.ZELLE_TRACKING_ENABLED
        self.bank_transfer_tracking_enabled = settings.BANK_TRANSFER_TRACKING_ENABLED
        
    def get_available_methods(self, user_id: int, db: Session) -> List[str]:
        """Get available disbursement methods for a user"""
        payment_info = db.query(UserPaymentInfo).filter(UserPaymentInfo.user_id == user_id).first()
        if not payment_info:
            return []
        
        return [method.value for method in payment_info.get_active_payment_methods()]
    
    async def create_disbursement(
        self,
        db: Session,
        recipient_id: int,
        amount: Decimal,
        disbursement_type: DisbursementType,
        payment_method: str = None,
        description: str = None,
        reference_type: str = None,
        reference_id: str = None,
        initiated_by: int = None,
        auto_process: bool = False
    ) -> PaymentDisbursement:
        """Create a new payment disbursement"""
        
        # Get recipient and their payment info
        recipient = db.query(User).filter(User.id == recipient_id).first()
        if not recipient:
            raise DisbursementError("Recipient not found")
        
        payment_info = db.query(UserPaymentInfo).filter(UserPaymentInfo.user_id == recipient_id).first()
        if not payment_info:
            raise DisbursementError("Recipient has no payment information configured")
        
        if not payment_info.can_receive_payments():
            raise DisbursementError("Recipient is not eligible to receive payments (KYC not verified or no verified payment methods)")
        
        # Determine payment method
        if not payment_method:
            if payment_info.preferred_method:
                payment_method = payment_info.preferred_method.value
            else:
                available_methods = payment_info.get_active_payment_methods()
                if not available_methods:
                    raise DisbursementError("No available payment methods for recipient")
                payment_method = available_methods[0].value
        
        # Validate payment method is available for user
        if payment_method not in [method.value for method in payment_info.get_active_payment_methods()]:
            raise DisbursementError(f"Payment method {payment_method} not available for recipient")
        
        # Get masked account info for display
        account_info = self._get_masked_account_info(payment_info, payment_method)
        
        # Create disbursement record
        disbursement = PaymentDisbursement(
            recipient_id=recipient_id,
            amount=amount,
            gross_amount=amount,
            disbursement_type=disbursement_type,
            payment_method=payment_method,
            payment_account_info=account_info,
            description=description,
            reference_type=reference_type,
            reference_id=reference_id,
            initiated_by=initiated_by,
            tax_year=datetime.now().year
        )
        
        # Calculate fees and net amount
        fee_percentage = self._get_fee_percentage(payment_method)
        disbursement.calculate_net_amount(fee_percentage)
        
        db.add(disbursement)
        db.commit()
        db.refresh(disbursement)
        
        logger.info(f"Created disbursement {disbursement.id} for user {recipient_id}, amount ${amount}, method {payment_method}")
        
        # Auto-process if requested
        if auto_process:
            await self.process_disbursement(db, disbursement.id)
        
        return disbursement
    
    async def process_disbursement(self, db: Session, disbursement_id: int) -> Dict[str, Any]:
        """Process a pending disbursement"""
        disbursement = db.query(PaymentDisbursement).filter(PaymentDisbursement.id == disbursement_id).first()
        if not disbursement:
            raise DisbursementError("Disbursement not found")
        
        if not disbursement.is_processable():
            raise DisbursementError(f"Disbursement cannot be processed (status: {disbursement.status.value}, retry count: {disbursement.retry_count})")
        
        try:
            disbursement.status = DisbursementStatus.PROCESSING
            disbursement.processed_at = datetime.now()
            db.commit()
            
            # Route to appropriate payment method
            if disbursement.payment_method == PaymentMethodType.CASHAPP.value:
                result = await self._process_cashapp_disbursement(db, disbursement)
            elif disbursement.payment_method == PaymentMethodType.ZELLE.value:
                result = await self._process_zelle_disbursement(db, disbursement)
            elif disbursement.payment_method == PaymentMethodType.BANK_TRANSFER.value:
                result = await self._process_bank_transfer_disbursement(db, disbursement)
            elif disbursement.payment_method == PaymentMethodType.PAYPAL.value:
                result = await self._process_paypal_disbursement(db, disbursement)
            else:
                raise DisbursementError(f"Unsupported payment method: {disbursement.payment_method}")
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to process disbursement {disbursement_id}: {e}")
            disbursement.mark_failed(str(e))
            db.commit()
            raise
    
    async def _process_cashapp_disbursement(self, db: Session, disbursement: PaymentDisbursement) -> Dict[str, Any]:
        """Process CashApp disbursement"""
        if not self.cashapp_configured:
            # For now, mark as manual processing required
            disbursement.status = DisbursementStatus.PENDING
            disbursement.error_message = "CashApp API not configured - manual processing required"
            db.commit()
            
            return {
                'success': False,
                'requires_manual_processing': True,
                'message': 'CashApp disbursement created but requires manual processing',
                'disbursement_id': disbursement.id
            }
        
        # TODO: Implement actual CashApp API integration
        # For now, simulate successful processing
        transaction_id = f"cashapp_{uuid.uuid4().hex[:12]}"
        disbursement.mark_completed(transaction_id)
        disbursement.completed_at = datetime.now()
        db.commit()
        
        logger.info(f"Processed CashApp disbursement {disbursement.id}")
        
        return {
            'success': True,
            'transaction_id': transaction_id,
            'disbursement_id': disbursement.id,
            'amount': float(disbursement.net_amount),
            'method': 'cashapp'
        }
    
    async def _process_zelle_disbursement(self, db: Session, disbursement: PaymentDisbursement) -> Dict[str, Any]:
        """Process Zelle disbursement (manual processing)"""
        # Zelle transfers are typically manual, so we mark for manual processing
        disbursement.status = DisbursementStatus.PENDING
        disbursement.error_message = "Zelle transfer requires manual processing"
        db.commit()
        
        return {
            'success': False,
            'requires_manual_processing': True,
            'message': 'Zelle disbursement created but requires manual bank transfer',
            'disbursement_id': disbursement.id,
            'instructions': 'Complete Zelle transfer manually using the recipient information'
        }
    
    async def _process_bank_transfer_disbursement(self, db: Session, disbursement: PaymentDisbursement) -> Dict[str, Any]:
        """Process bank transfer disbursement (manual processing)"""
        # Bank transfers are typically manual for smaller operations
        disbursement.status = DisbursementStatus.PENDING
        disbursement.error_message = "Bank transfer requires manual processing"
        db.commit()
        
        return {
            'success': False,
            'requires_manual_processing': True,
            'message': 'Bank transfer disbursement created but requires manual processing',
            'disbursement_id': disbursement.id,
            'instructions': 'Complete bank transfer manually using the recipient bank information'
        }
    
    async def _process_paypal_disbursement(self, db: Session, disbursement: PaymentDisbursement) -> Dict[str, Any]:
        """Process PayPal disbursement"""
        # TODO: Implement PayPal Payouts API
        # For now, mark as manual processing
        disbursement.status = DisbursementStatus.PENDING
        disbursement.error_message = "PayPal payout requires manual processing"
        db.commit()
        
        return {
            'success': False,
            'requires_manual_processing': True,
            'message': 'PayPal disbursement created but requires manual processing',
            'disbursement_id': disbursement.id
        }
    
    def mark_disbursement_completed(
        self,
        db: Session,
        disbursement_id: int,
        external_transaction_id: str = None,
        completed_by: int = None
    ) -> PaymentDisbursement:
        """Manually mark a disbursement as completed"""
        disbursement = db.query(PaymentDisbursement).filter(PaymentDisbursement.id == disbursement_id).first()
        if not disbursement:
            raise DisbursementError("Disbursement not found")
        
        disbursement.mark_completed(external_transaction_id)
        if completed_by:
            disbursement.initiated_by = completed_by
        
        db.commit()
        db.refresh(disbursement)
        
        logger.info(f"Manually marked disbursement {disbursement_id} as completed")
        return disbursement
    
    def get_user_disbursements(
        self,
        db: Session,
        user_id: int,
        limit: int = 50,
        offset: int = 0
    ) -> List[PaymentDisbursement]:
        """Get disbursements for a specific user"""
        return db.query(PaymentDisbursement)\
            .filter(PaymentDisbursement.recipient_id == user_id)\
            .order_by(PaymentDisbursement.created_at.desc())\
            .limit(limit)\
            .offset(offset)\
            .all()
    
    def get_pending_disbursements(self, db: Session) -> List[PaymentDisbursement]:
        """Get all pending disbursements requiring manual processing"""
        return db.query(PaymentDisbursement)\
            .filter(PaymentDisbursement.status == DisbursementStatus.PENDING)\
            .order_by(PaymentDisbursement.created_at.asc())\
            .all()
    
    def _get_masked_account_info(self, payment_info: UserPaymentInfo, payment_method: str) -> str:
        """Get masked account information for display"""
        if payment_method == PaymentMethodType.CASHAPP.value:
            return payment_info.cashapp_tag or f"***{payment_info.cashapp_phone[-4:]}" if payment_info.cashapp_phone else "CashApp Account"
        elif payment_method == PaymentMethodType.ZELLE.value:
            if payment_info.zelle_email:
                return f"***{payment_info.zelle_email[-10:]}"
            elif payment_info.zelle_phone:
                return f"***{payment_info.zelle_phone[-4:]}"
            return "Zelle Account"
        elif payment_method == PaymentMethodType.BANK_TRANSFER.value:
            if payment_info.bank_account_number:
                return f"{payment_info.bank_name} ***{payment_info.bank_account_number[-4:]}"
            return f"{payment_info.bank_name} Account"
        elif payment_method == PaymentMethodType.PAYPAL.value:
            return f"***{payment_info.paypal_email[-10:]}" if payment_info.paypal_email else "PayPal Account"
        return "Payment Account"
    
    def _get_fee_percentage(self, payment_method: str) -> float:
        """Get fee percentage for payment method"""
        # Define fees per payment method
        fees = {
            PaymentMethodType.CASHAPP.value: 1.5,  # 1.5% for CashApp
            PaymentMethodType.ZELLE.value: 0.0,    # No fees for Zelle
            PaymentMethodType.BANK_TRANSFER.value: 0.0,  # No fees for bank transfer
            PaymentMethodType.PAYPAL.value: 2.9,   # 2.9% for PayPal
        }
        return fees.get(payment_method, 0.0)

# Global disbursement service instance
disbursement_service = PaymentDisbursementService() 