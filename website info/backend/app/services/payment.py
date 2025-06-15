"""
Payment service for handling Stripe payments and webhooks.
"""

import stripe
from typing import Dict, Any, Optional, List
from decimal import Decimal
import logging

from app.core.config import settings

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

logger = logging.getLogger(__name__)

class PaymentService:
    """Service for handling payment operations with Stripe."""
    
    @staticmethod
    def create_payment_intent(
        amount: float,
        currency: str = "USD",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a Stripe payment intent.
        
        Args:
            amount: Payment amount in dollars
            currency: Currency code (default: USD)
            metadata: Additional metadata for the payment
            
        Returns:
            Dict containing payment intent details
        """
        try:
            # Convert to cents for Stripe
            amount_cents = int(amount * 100)
            
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency.lower(),
                metadata=metadata or {},
                automatic_payment_methods={'enabled': True}
            )
            
            return {
                "client_secret": payment_intent.client_secret,
                "payment_intent_id": payment_intent.id,
                "amount": amount,
                "currency": currency,
                "status": payment_intent.status
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe payment intent creation failed: {str(e)}")
            raise Exception(f"Payment processing error: {str(e)}")
    
    @staticmethod
    def confirm_payment(payment_intent_id: str) -> Dict[str, Any]:
        """
        Confirm a payment intent and get its status.
        
        Args:
            payment_intent_id: Stripe payment intent ID
            
        Returns:
            Dict containing payment status and details
        """
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return {
                "payment_intent_id": payment_intent.id,
                "status": payment_intent.status,
                "amount": payment_intent.amount / 100,  # Convert back to dollars
                "currency": payment_intent.currency.upper(),
                "payment_method": payment_intent.payment_method,
                "created": payment_intent.created
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe payment confirmation failed: {str(e)}")
            raise Exception(f"Payment confirmation error: {str(e)}")
    
    @staticmethod
    def create_refund(
        payment_intent_id: str,
        amount: Optional[float] = None,
        reason: str = "requested_by_customer"
    ) -> Dict[str, Any]:
        """
        Create a refund for a payment.
        
        Args:
            payment_intent_id: Stripe payment intent ID
            amount: Refund amount in dollars (None for full refund)
            reason: Reason for refund
            
        Returns:
            Dict containing refund details
        """
        try:
            refund_data = {
                "payment_intent": payment_intent_id,
                "reason": reason
            }
            
            if amount:
                refund_data["amount"] = int(amount * 100)  # Convert to cents
            
            refund = stripe.Refund.create(**refund_data)
            
            return {
                "refund_id": refund.id,
                "payment_intent_id": payment_intent_id,
                "amount": refund.amount / 100,  # Convert back to dollars
                "currency": refund.currency.upper(),
                "status": refund.status,
                "reason": refund.reason
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe refund creation failed: {str(e)}")
            raise Exception(f"Refund processing error: {str(e)}")
    
    @staticmethod
    def verify_webhook_signature(payload: bytes, sig_header: str) -> Dict[str, Any]:
        """
        Verify and parse a Stripe webhook.
        
        Args:
            payload: Raw webhook payload
            sig_header: Stripe signature header
            
        Returns:
            Dict containing webhook event data
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
            return event
            
        except ValueError as e:
            logger.error(f"Invalid webhook payload: {str(e)}")
            raise Exception("Invalid payload")
            
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid webhook signature: {str(e)}")
            raise Exception("Invalid signature")
    
    @staticmethod
    def get_payment_methods(customer_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get available payment methods for a customer.
        
        Args:
            customer_id: Stripe customer ID
            
        Returns:
            List of payment methods
        """
        try:
            if customer_id:
                payment_methods = stripe.PaymentMethod.list(
                    customer=customer_id,
                    type="card"
                )
            else:
                return []
            
            return [
                {
                    "id": pm.id,
                    "type": pm.type,
                    "card": {
                        "brand": pm.card.brand,
                        "last4": pm.card.last4,
                        "exp_month": pm.card.exp_month,
                        "exp_year": pm.card.exp_year
                    } if pm.card else None
                }
                for pm in payment_methods.data
            ]
            
        except stripe.error.StripeError as e:
            logger.error(f"Failed to retrieve payment methods: {str(e)}")
            return []
    
    @staticmethod
    def create_customer(email: str, name: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a Stripe customer.
        
        Args:
            email: Customer email
            name: Customer name
            
        Returns:
            Dict containing customer details
        """
        try:
            customer_data = {"email": email}
            if name:
                customer_data["name"] = name
            
            customer = stripe.Customer.create(**customer_data)
            
            return {
                "customer_id": customer.id,
                "email": customer.email,
                "name": customer.name,
                "created": customer.created
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe customer creation failed: {str(e)}")
            raise Exception(f"Customer creation error: {str(e)}") 