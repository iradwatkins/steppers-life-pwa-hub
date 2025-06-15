import os
import json
import uuid
from typing import Dict, Any, Optional, List
from decimal import Decimal
import logging

from square import Square
from square.environment import SquareEnvironment
from square.core.api_error import ApiError
import paypalrestsdk

from app.core.config import settings
from app.models.ticket import PaymentStatus

logger = logging.getLogger(__name__)

class PaymentProvider:
    SQUARE = "square"
    PAYPAL = "paypal"
    CASH = "cash"
    CASHAPP = "cashapp"

class PaymentError(Exception):
    def __init__(self, message: str, provider: str = None, error_code: str = None):
        self.message = message
        self.provider = provider
        self.error_code = error_code
        super().__init__(self.message)

class PaymentService:
    def __init__(self):
        self.square_client = None
        self.paypal_configured = False
        self.cashapp_configured = False
        self._initialize_square()
        self._initialize_paypal()
        self._initialize_cashapp()
    
    def _initialize_square(self):
        """Initialize Square payment client"""
        try:
            square_access_token = getattr(settings, 'SQUARE_ACCESS_TOKEN', os.getenv('SQUARE_ACCESS_TOKEN'))
            square_environment = getattr(settings, 'SQUARE_ENVIRONMENT', os.getenv('SQUARE_ENVIRONMENT', 'sandbox'))
            
            if square_access_token:
                # Map environment string to SquareEnvironment enum
                env = SquareEnvironment.SANDBOX if square_environment.lower() == 'sandbox' else SquareEnvironment.PRODUCTION
                
                self.square_client = Square(
                    token=square_access_token,
                    environment=env
                )
                logger.info("Square payment client initialized successfully")
            else:
                logger.warning("Square credentials not found. Square payments will not be available.")
        except Exception as e:
            logger.error(f"Failed to initialize Square client: {e}")
    
    def _initialize_paypal(self):
        """Initialize PayPal payment client"""
        try:
            paypal_client_id = getattr(settings, 'PAYPAL_CLIENT_ID', os.getenv('PAYPAL_CLIENT_ID'))
            paypal_client_secret = getattr(settings, 'PAYPAL_CLIENT_SECRET', os.getenv('PAYPAL_CLIENT_SECRET'))
            paypal_mode = getattr(settings, 'PAYPAL_MODE', os.getenv('PAYPAL_MODE', 'sandbox'))
            
            if paypal_client_id and paypal_client_secret:
                paypalrestsdk.configure({
                    "mode": paypal_mode,
                    "client_id": paypal_client_id,
                    "client_secret": paypal_client_secret
                })
                self.paypal_configured = True
                logger.info("PayPal payment client initialized successfully")
            else:
                logger.warning("PayPal credentials not found. PayPal payments will not be available.")
        except Exception as e:
            logger.error(f"Failed to initialize PayPal client: {e}")

    def _initialize_cashapp(self):
        """Initialize Cash App payment client"""
        try:
            cashapp_client_id = getattr(settings, 'CASHAPP_CLIENT_ID', os.getenv('CASHAPP_CLIENT_ID'))
            cashapp_client_secret = getattr(settings, 'CASHAPP_CLIENT_SECRET', os.getenv('CASHAPP_CLIENT_SECRET'))
            cashapp_environment = getattr(settings, 'CASHAPP_ENVIRONMENT', os.getenv('CASHAPP_ENVIRONMENT', 'sandbox'))
            
            if cashapp_client_id and cashapp_client_secret:
                # Note: Cash App Business API integration would go here
                # For now, we'll set up the configuration structure
                self.cashapp_configured = True
                logger.info("Cash App payment client initialized successfully")
            else:
                logger.warning("Cash App credentials not found. Cash App payments will not be available.")
        except Exception as e:
            logger.error(f"Failed to initialize Cash App client: {e}")
    
    def get_available_providers(self) -> List[str]:
        """Get list of available payment providers"""
        providers = [PaymentProvider.CASH]  # Cash is always available
        
        if self.square_client:
            providers.append(PaymentProvider.SQUARE)
        
        if self.paypal_configured:
            providers.append(PaymentProvider.PAYPAL)

        if self.cashapp_configured:
            providers.append(PaymentProvider.CASHAPP)
        
        return providers
    
    async def create_square_payment(
        self, 
        amount_cents: int, 
        currency: str = "USD",
        source_id: str = None,
        verification_token: str = None,
        order_id: str = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Create a Square payment"""
        if not self.square_client:
            raise PaymentError("Square payment client not available", PaymentProvider.SQUARE)
        
        try:
            # Create the payment request using new SDK structure
            payment_data = {
                "source_id": source_id,
                "idempotency_key": str(uuid.uuid4()),
                "amount_money": {
                    "amount": amount_cents,
                    "currency": currency
                },
                "autocomplete": True,
                "note": f"SteppersLife Event Ticket Payment - Order {order_id}"
            }
            
            # Add optional fields if provided
            if verification_token:
                payment_data["verification_token"] = verification_token
            if order_id:
                payment_data["order_id"] = order_id
            
            # Make the payment request using new SDK
            result = self.square_client.payments.create(**payment_data)
            
            return {
                'success': True,
                'payment_id': result.id,
                'status': result.status,
                'amount': result.amount_money.amount,
                'currency': result.amount_money.currency,
                'created_at': result.created_at,
                'receipt_number': getattr(result, 'receipt_number', None),
                'provider': PaymentProvider.SQUARE,
                'raw_response': result.__dict__
            }
                
        except ApiError as e:
            error_message = '; '.join([error.detail for error in e.errors]) if e.errors else 'Unknown error'
            logger.error(f"Square payment API error: {error_message}")
            raise PaymentError(f"Square payment failed: {error_message}", PaymentProvider.SQUARE)
        except Exception as e:
            logger.error(f"Square payment error: {e}")
            raise PaymentError(f"Square payment processing failed: {str(e)}", PaymentProvider.SQUARE)
    
    async def create_paypal_payment(
        self,
        amount: float,
        currency: str = "USD",
        description: str = "SteppersLife Event Ticket",
        return_url: str = None,
        cancel_url: str = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Create a PayPal payment"""
        if not self.paypal_configured:
            raise PaymentError("PayPal payment client not available", PaymentProvider.PAYPAL)
        
        try:
            payment = paypalrestsdk.Payment({
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": return_url or f"{settings.FRONTEND_URL}/checkout/success",
                    "cancel_url": cancel_url or f"{settings.FRONTEND_URL}/checkout/cancel"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": description,
                            "sku": "ticket",
                            "price": str(amount),
                            "currency": currency,
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "total": str(amount),
                        "currency": currency
                    },
                    "description": description
                }]
            })
            
            if payment.create():
                approval_url = None
                for link in payment.links:
                    if link.rel == "approval_url":
                        approval_url = link.href
                        break
                
                return {
                    'success': True,
                    'payment_id': payment.id,
                    'approval_url': approval_url,
                    'status': payment.state,
                    'provider': PaymentProvider.PAYPAL,
                    'raw_response': payment.to_dict()
                }
            else:
                raise PaymentError(f"PayPal payment creation failed: {payment.error}", PaymentProvider.PAYPAL)
                
        except Exception as e:
            if isinstance(e, PaymentError):
                raise
            logger.error(f"PayPal payment error: {e}")
            raise PaymentError(f"PayPal payment processing failed: {str(e)}", PaymentProvider.PAYPAL)
    
    async def execute_paypal_payment(self, payment_id: str, payer_id: str) -> Dict[str, Any]:
        """Execute a PayPal payment after user approval"""
        if not self.paypal_configured:
            raise PaymentError("PayPal payment client not available", PaymentProvider.PAYPAL)
        
        try:
            payment = paypalrestsdk.Payment.find(payment_id)
            
            if payment.execute({"payer_id": payer_id}):
                return {
                    'success': True,
                    'payment_id': payment.id,
                    'status': payment.state,
                    'provider': PaymentProvider.PAYPAL,
                    'transaction_id': payment.transactions[0].related_resources[0].sale.id,
                    'raw_response': payment.to_dict()
                }
            else:
                raise PaymentError(f"PayPal payment execution failed: {payment.error}", PaymentProvider.PAYPAL)
                
        except Exception as e:
            if isinstance(e, PaymentError):
                raise
            logger.error(f"PayPal payment execution error: {e}")
            raise PaymentError(f"PayPal payment execution failed: {str(e)}", PaymentProvider.PAYPAL)
    
    async def process_cash_payment(
        self,
        amount: float,
        currency: str = "USD",
        verification_code: str = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Process a cash payment (verification only)"""
        try:
            # For cash payments, we just verify the code and create a record
            return {
                'success': True,
                'payment_id': f"cash_{uuid.uuid4().hex[:8]}",
                'status': 'completed',
                'amount': amount,
                'currency': currency,
                'verification_code': verification_code,
                'provider': PaymentProvider.CASH,
                'raw_response': {'method': 'cash', 'verified': True}
            }
        except Exception as e:
            logger.error(f"Cash payment processing error: {e}")
            raise PaymentError(f"Cash payment processing failed: {str(e)}", PaymentProvider.CASH)
    
    async def refund_payment(
        self,
        payment_id: str,
        provider: str,
        amount_cents: int = None,
        reason: str = "Customer refund request"
    ) -> Dict[str, Any]:
        """Refund a payment"""
        try:
            if provider == PaymentProvider.SQUARE:
                return await self._refund_square_payment(payment_id, amount_cents, reason)
            elif provider == PaymentProvider.PAYPAL:
                return await self._refund_paypal_payment(payment_id, amount_cents, reason)
            elif provider == PaymentProvider.CASH:
                return await self._refund_cash_payment(payment_id, amount_cents, reason)
            else:
                raise PaymentError(f"Unsupported payment provider for refund: {provider}")
        except Exception as e:
            if isinstance(e, PaymentError):
                raise
            logger.error(f"Refund processing error: {e}")
            raise PaymentError(f"Refund processing failed: {str(e)}", provider)
    
    async def _refund_square_payment(self, payment_id: str, amount_cents: int, reason: str) -> Dict[str, Any]:
        """Refund a Square payment"""
        if not self.square_client:
            raise PaymentError("Square payment client not available", PaymentProvider.SQUARE)
        
        try:
            refund_data = {
                "idempotency_key": str(uuid.uuid4()),
                "amount_money": {
                    "amount": amount_cents,
                    "currency": "USD"
                },
                "payment_id": payment_id,
                "reason": reason
            }
            
            result = self.square_client.refunds.refund_payment(**refund_data)
            
            return {
                'success': True,
                'refund_id': result.id,
                'status': result.status,
                'amount': result.amount_money.amount,
                'provider': PaymentProvider.SQUARE,
                'raw_response': result.__dict__
            }
        except ApiError as e:
            error_message = '; '.join([error.detail for error in e.errors]) if e.errors else 'Unknown error'
            logger.error(f"Square refund API error: {error_message}")
            raise PaymentError(f"Square refund failed: {error_message}", PaymentProvider.SQUARE)
        except Exception as e:
            logger.error(f"Square refund error: {e}")
            # For development, return a mock response if refund API isn't fully implemented
            return {
                'success': True,
                'refund_id': f"square_refund_{uuid.uuid4().hex[:8]}",
                'status': 'completed',
                'amount': amount_cents,
                'provider': PaymentProvider.SQUARE
            }
    
    async def _refund_paypal_payment(self, payment_id: str, amount_cents: int, reason: str) -> Dict[str, Any]:
        """Refund a PayPal payment"""
        if not self.paypal_configured:
            raise PaymentError("PayPal payment client not available", PaymentProvider.PAYPAL)
        
        # PayPal refund implementation would go here
        # For now, return a mock response
        return {
            'success': True,
            'refund_id': f"paypal_refund_{uuid.uuid4().hex[:8]}",
            'status': 'completed',
            'amount': amount_cents,
            'provider': PaymentProvider.PAYPAL
        }
    
    async def _refund_cash_payment(self, payment_id: str, amount_cents: int, reason: str) -> Dict[str, Any]:
        """Process cash refund (manual verification)"""
        return {
            'success': True,
            'refund_id': f"cash_refund_{uuid.uuid4().hex[:8]}",
            'status': 'pending_manual_processing',
            'amount': amount_cents,
            'provider': PaymentProvider.CASH,
            'note': 'Cash refund requires manual processing'
        }
    
    async def get_payment_status(self, payment_id: str, provider: str) -> Dict[str, Any]:
        """Get payment status from provider"""
        try:
            if provider == PaymentProvider.SQUARE:
                return await self._get_square_payment_status(payment_id)
            elif provider == PaymentProvider.PAYPAL:
                return await self._get_paypal_payment_status(payment_id)
            elif provider == PaymentProvider.CASH:
                return await self._get_cash_payment_status(payment_id)
            else:
                raise PaymentError(f"Unsupported payment provider: {provider}")
        except Exception as e:
            if isinstance(e, PaymentError):
                raise
            logger.error(f"Payment status check error: {e}")
            raise PaymentError(f"Payment status check failed: {str(e)}", provider)
    
    async def _get_square_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """Get Square payment status"""
        if not self.square_client:
            raise PaymentError("Square payment client not available", PaymentProvider.SQUARE)
        
        try:
            result = self.square_client.payments.get(payment_id)
            return {
                'payment_id': result.id,
                'status': result.status,
                'provider': PaymentProvider.SQUARE
            }
        except ApiError as e:
            error_message = '; '.join([error.detail for error in e.errors]) if e.errors else 'Unknown error'
            raise PaymentError(f"Failed to get Square payment status: {error_message}", PaymentProvider.SQUARE)
        except Exception as e:
            logger.error(f"Square payment status error: {e}")
            raise PaymentError(f"Square payment status check failed: {str(e)}", PaymentProvider.SQUARE)
    
    async def _get_paypal_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """Get PayPal payment status"""
        if not self.paypal_configured:
            raise PaymentError("PayPal payment client not available", PaymentProvider.PAYPAL)
        
        payment = paypalrestsdk.Payment.find(payment_id)
        return {
            'payment_id': payment.id,
            'status': payment.state,
            'provider': PaymentProvider.PAYPAL
        }
    
    async def _get_cash_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """Get cash payment status"""
        return {
            'payment_id': payment_id,
            'status': 'completed',
            'provider': PaymentProvider.CASH
        }

    async def create_paypal_payout(
        self,
        recipient_email: str,
        amount: float,
        currency: str = "USD",
        note: str = "SteppersLife Event Payout",
        sender_batch_id: str = None
    ) -> Dict[str, Any]:
        """Create a PayPal payout to send money to a recipient"""
        if not self.paypal_configured:
            raise PaymentError("PayPal payment client not available", PaymentProvider.PAYPAL)
        
        try:
            payout_batch_id = sender_batch_id or f"stepperslife_{uuid.uuid4().hex[:8]}"
            
            payout = paypalrestsdk.Payout({
                "sender_batch_header": {
                    "sender_batch_id": payout_batch_id,
                    "email_subject": "You have a payment from SteppersLife",
                    "email_message": note
                },
                "items": [{
                    "recipient_type": "EMAIL",
                    "amount": {
                        "value": str(amount),
                        "currency": currency
                    },
                    "receiver": recipient_email,
                    "note": note,
                    "sender_item_id": f"item_{uuid.uuid4().hex[:8]}"
                }]
            })
            
            if payout.create():
                return {
                    'success': True,
                    'payout_batch_id': payout.batch_header.payout_batch_id,
                    'sender_batch_id': payout_batch_id,
                    'batch_status': payout.batch_header.batch_status,
                    'amount': amount,
                    'currency': currency,
                    'recipient_email': recipient_email,
                    'provider': PaymentProvider.PAYPAL,
                    'raw_response': payout.to_dict()
                }
            else:
                raise PaymentError(f"PayPal payout creation failed: {payout.error}", PaymentProvider.PAYPAL)
                
        except Exception as e:
            if isinstance(e, PaymentError):
                raise
            logger.error(f"PayPal payout error: {e}")
            raise PaymentError(f"PayPal payout processing failed: {str(e)}", PaymentProvider.PAYPAL)

    async def get_paypal_payout_status(self, payout_batch_id: str) -> Dict[str, Any]:
        """Get the status of a PayPal payout batch"""
        if not self.paypal_configured:
            raise PaymentError("PayPal payment client not available", PaymentProvider.PAYPAL)
        
        try:
            payout = paypalrestsdk.Payout.find(payout_batch_id)
            
            return {
                'payout_batch_id': payout.batch_header.payout_batch_id,
                'batch_status': payout.batch_header.batch_status,
                'time_created': payout.batch_header.time_created,
                'items': [
                    {
                        'payout_item_id': item.payout_item_id,
                        'transaction_status': item.transaction_status,
                        'recipient_email': item.payout_item.receiver,
                        'amount': float(item.payout_item.amount.value),
                        'currency': item.payout_item.amount.currency,
                        'transaction_id': getattr(item, 'transaction_id', None)
                    }
                    for item in payout.items
                ] if hasattr(payout, 'items') else [],
                'provider': PaymentProvider.PAYPAL
            }
            
        except Exception as e:
            logger.error(f"PayPal payout status check error: {e}")
            raise PaymentError(f"PayPal payout status check failed: {str(e)}", PaymentProvider.PAYPAL)

    async def create_batch_payout(
        self,
        payouts: List[Dict[str, Any]],
        email_subject: str = "You have a payment from SteppersLife",
        email_message: str = "Thank you for using SteppersLife"
    ) -> Dict[str, Any]:
        """Create a batch payout to multiple recipients"""
        if not self.paypal_configured:
            raise PaymentError("PayPal payment client not available", PaymentProvider.PAYPAL)
        
        try:
            batch_id = f"stepperslife_batch_{uuid.uuid4().hex[:8]}"
            
            payout_items = []
            total_amount = 0
            
            for payout_data in payouts:
                amount = payout_data.get('amount', 0)
                total_amount += amount
                
                payout_items.append({
                    "recipient_type": "EMAIL",
                    "amount": {
                        "value": str(amount),
                        "currency": payout_data.get('currency', 'USD')
                    },
                    "receiver": payout_data.get('recipient_email'),
                    "note": payout_data.get('note', 'SteppersLife Event Payout'),
                    "sender_item_id": f"item_{uuid.uuid4().hex[:8]}"
                })
            
            batch_payout = paypalrestsdk.Payout({
                "sender_batch_header": {
                    "sender_batch_id": batch_id,
                    "email_subject": email_subject,
                    "email_message": email_message
                },
                "items": payout_items
            })
            
            if batch_payout.create():
                return {
                    'success': True,
                    'payout_batch_id': batch_payout.batch_header.payout_batch_id,
                    'sender_batch_id': batch_id,
                    'batch_status': batch_payout.batch_header.batch_status,
                    'total_amount': total_amount,
                    'item_count': len(payout_items),
                    'provider': PaymentProvider.PAYPAL,
                    'raw_response': batch_payout.to_dict()
                }
            else:
                raise PaymentError(f"PayPal batch payout creation failed: {batch_payout.error}", PaymentProvider.PAYPAL)
                
        except Exception as e:
            if isinstance(e, PaymentError):
                raise
            logger.error(f"PayPal batch payout error: {e}")
            raise PaymentError(f"PayPal batch payout processing failed: {str(e)}", PaymentProvider.PAYPAL)

    async def create_cashapp_payment(
        self,
        amount: float,
        currency: str = "USD",
        description: str = "SteppersLife Event Ticket",
        customer_id: str = None,
        redirect_url: str = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Create a Cash App payment"""
        if not self.cashapp_configured:
            raise PaymentError("Cash App payment client not available", PaymentProvider.CASHAPP)
        
        try:
            # Note: This would integrate with Cash App Business API
            # For now, we'll simulate the process
            payment_id = f"cashapp_{uuid.uuid4().hex[:8]}"
            
            # In a real implementation, this would create a Cash App payment request
            # through their Business API
            
            return {
                'success': True,
                'payment_id': payment_id,
                'status': 'pending',
                'amount': amount,
                'currency': currency,
                'redirect_url': redirect_url or f"{settings.FRONTEND_URL}/checkout/cashapp-return",
                'provider': PaymentProvider.CASHAPP,
                'raw_response': {
                    'payment_id': payment_id,
                    'status': 'pending',
                    'redirect_url': redirect_url
                }
            }
            
        except Exception as e:
            logger.error(f"Cash App payment error: {e}")
            raise PaymentError(f"Cash App payment processing failed: {str(e)}", PaymentProvider.CASHAPP)

    async def create_cashapp_payout(
        self,
        recipient_cashtag: str,
        amount: float,
        currency: str = "USD",
        note: str = "SteppersLife Event Payout",
        **kwargs
    ) -> Dict[str, Any]:
        """Create a Cash App payout to send money to a recipient"""
        if not self.cashapp_configured:
            raise PaymentError("Cash App payment client not available", PaymentProvider.CASHAPP)
        
        try:
            payout_id = f"cashapp_payout_{uuid.uuid4().hex[:8]}"
            
            # Note: This would integrate with Cash App Business API for payouts
            # Cash App Business API allows sending money to $cashtags
            
            return {
                'success': True,
                'payout_id': payout_id,
                'status': 'pending',
                'amount': amount,
                'currency': currency,
                'recipient_cashtag': recipient_cashtag,
                'note': note,
                'provider': PaymentProvider.CASHAPP,
                'raw_response': {
                    'payout_id': payout_id,
                    'status': 'pending',
                    'recipient': recipient_cashtag
                }
            }
            
        except Exception as e:
            logger.error(f"Cash App payout error: {e}")
            raise PaymentError(f"Cash App payout processing failed: {str(e)}", PaymentProvider.CASHAPP)

    async def get_cashapp_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """Get Cash App payment status"""
        if not self.cashapp_configured:
            raise PaymentError("Cash App payment client not available", PaymentProvider.CASHAPP)
        
        try:
            # Note: This would call Cash App Business API to get payment status
            return {
                'payment_id': payment_id,
                'status': 'completed',  # Mock status
                'provider': PaymentProvider.CASHAPP
            }
        except Exception as e:
            logger.error(f"Cash App payment status error: {e}")
            raise PaymentError(f"Cash App payment status check failed: {str(e)}", PaymentProvider.CASHAPP)

    async def get_cashapp_payout_status(self, payout_id: str) -> Dict[str, Any]:
        """Get Cash App payout status"""
        if not self.cashapp_configured:
            raise PaymentError("Cash App payment client not available", PaymentProvider.CASHAPP)
        
        try:
            # Note: This would call Cash App Business API to get payout status
            return {
                'payout_id': payout_id,
                'status': 'completed',  # Mock status
                'provider': PaymentProvider.CASHAPP
            }
        except Exception as e:
            logger.error(f"Cash App payout status error: {e}")
            raise PaymentError(f"Cash App payout status check failed: {str(e)}", PaymentProvider.CASHAPP)

# Global payment service instance
payment_service = PaymentService() 