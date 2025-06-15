from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
from uuid import UUID
from pydantic import BaseModel
import logging

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.ticket import Ticket, PaymentStatus, TicketStatus
from app.models.user import User
from app.services.payment_service import payment_service, PaymentProvider, PaymentError

router = APIRouter()
logger = logging.getLogger(__name__)

class PaymentRequest(BaseModel):
    provider: str  # square, paypal, cash, cashapp
    source_id: Optional[str] = None  # Square payment token
    verification_token: Optional[str] = None  # Square CVV verification
    verification_code: Optional[str] = None  # Cash payment verification code
    cashtag: Optional[str] = None  # Cash App $cashtag
    return_url: Optional[str] = None  # PayPal/Cash App return URL
    cancel_url: Optional[str] = None  # PayPal/Cash App cancel URL

class PaymentConfirmation(BaseModel):
    payment_id: str
    provider: str
    payer_id: Optional[str] = None  # PayPal payer ID

class PayoutRequest(BaseModel):
    recipient_email: str
    amount: float
    currency: str = "USD"
    note: str = "SteppersLife Event Payout"
    cashtag: Optional[str] = None  # For Cash App payouts

class BatchPayoutRequest(BaseModel):
    payouts: List[PayoutRequest]
    email_subject: str = "You have a payment from SteppersLife"
    email_message: str = "Thank you for using SteppersLife"

class CashAppPayoutRequest(BaseModel):
    recipient_cashtag: str  # Must start with $
    amount: float
    currency: str = "USD"
    note: str = "SteppersLife Event Payout"

@router.get("/providers")
def get_payment_providers(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get available payment providers."""
    
    providers = payment_service.get_available_providers()
    
    return {
        "providers": providers,
        "details": {
            PaymentProvider.SQUARE: {
                "name": "Square / Cash App",
                "description": "Pay with credit/debit card or Cash App",
                "supports_cards": True,
                "supports_digital_wallets": True
            },
            PaymentProvider.PAYPAL: {
                "name": "PayPal",
                "description": "Pay with your PayPal account",
                "supports_cards": False,
                "supports_digital_wallets": True
            },
            PaymentProvider.CASHAPP: {
                "name": "Cash App",
                "description": "Pay with your Cash App account",
                "supports_cards": False,
                "supports_digital_wallets": True
            },
            PaymentProvider.CASH: {
                "name": "Cash Payment",
                "description": "Pay with cash at the event location",
                "supports_cards": False,
                "supports_digital_wallets": False
            }
        }
    }

@router.post("/create-payment/{ticket_id}")
async def create_payment(
    ticket_id: UUID,
    payment_request: PaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Create a payment for a ticket."""
    
    # Get the ticket
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check if user owns the ticket
    if ticket.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to pay for this ticket"
        )
    
    # Check if ticket is still pending
    if ticket.status != TicketStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket payment has already been processed"
        )
    
    try:
        # Convert price to cents for Square
        amount_cents = int(ticket.total_price * 100)
        
        # Process payment based on provider
        if payment_request.provider == PaymentProvider.SQUARE:
            payment_result = await payment_service.create_square_payment(
                amount_cents=amount_cents,
                currency=ticket.currency,
                source_id=payment_request.source_id,
                verification_token=payment_request.verification_token,
                order_id=str(ticket.id)
            )
            
        elif payment_request.provider == PaymentProvider.PAYPAL:
            payment_result = await payment_service.create_paypal_payment(
                amount=ticket.total_price,
                currency=ticket.currency,
                description=f"SteppersLife Event Ticket - {ticket.ticket_number}",
                return_url=payment_request.return_url,
                cancel_url=payment_request.cancel_url
            )
            
        elif payment_request.provider == PaymentProvider.CASHAPP:
            payment_result = await payment_service.create_cashapp_payment(
                amount=ticket.total_price,
                currency=ticket.currency,
                description=f"SteppersLife Event Ticket - {ticket.ticket_number}",
                customer_id=str(current_user.id),
                redirect_url=payment_request.return_url
            )
            
        elif payment_request.provider == PaymentProvider.CASH:
            payment_result = await payment_service.process_cash_payment(
                amount=ticket.total_price,
                currency=ticket.currency,
                verification_code=payment_request.verification_code
            )
            
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported payment provider: {payment_request.provider}"
            )
        
        # Store payment information in ticket
        ticket.payment_intent_id = payment_result['payment_id']
        ticket.payment_method = payment_request.provider
        
        # For Square, Cash App, and Cash payments, mark as completed immediately
        # For PayPal, wait for user to complete the flow
        if payment_request.provider in [PaymentProvider.SQUARE, PaymentProvider.CASH]:
            if payment_result.get('status') in ['COMPLETED', 'completed']:
                ticket.payment_status = PaymentStatus.COMPLETED
                ticket.status = TicketStatus.CONFIRMED
        elif payment_request.provider == PaymentProvider.CASHAPP:
            # Cash App payments need user approval, similar to PayPal
            if payment_result.get('status') == 'completed':
                ticket.payment_status = PaymentStatus.COMPLETED
                ticket.status = TicketStatus.CONFIRMED
        
        db.commit()
        
        response = {
            "success": payment_result['success'],
            "payment_id": payment_result['payment_id'],
            "provider": payment_result['provider'],
            "status": payment_result.get('status'),
            "amount": ticket.total_price,
            "currency": ticket.currency
        }
        
        # Add provider-specific data
        if payment_request.provider == PaymentProvider.PAYPAL:
            response["approval_url"] = payment_result.get('approval_url')
        elif payment_request.provider == PaymentProvider.CASHAPP:
            response["redirect_url"] = payment_result.get('redirect_url')
        elif payment_request.provider == PaymentProvider.SQUARE:
            response["receipt_number"] = payment_result.get('receipt_number')
        elif payment_request.provider == PaymentProvider.CASH:
            response["verification_code"] = payment_result.get('verification_code')
        
        return response
        
    except PaymentError as e:
        logger.error(f"Payment creation failed: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment processing failed: {e.message}"
        )
    except Exception as e:
        logger.error(f"Payment creation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment"
        )

@router.post("/confirm-payment/{ticket_id}")
async def confirm_payment(
    ticket_id: UUID,
    payment_confirmation: PaymentConfirmation,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Confirm payment for a ticket (mainly for PayPal)."""
    
    # Get the ticket
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check if user owns the ticket
    if ticket.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to confirm payment for this ticket"
        )
    
    try:
        # Execute payment based on provider
        if payment_confirmation.provider == PaymentProvider.PAYPAL:
            if not payment_confirmation.payer_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="PayPal payer ID is required"
                )
            
            payment_result = await payment_service.execute_paypal_payment(
                payment_id=payment_confirmation.payment_id,
                payer_id=payment_confirmation.payer_id
            )
            
            if payment_result['success'] and payment_result.get('status') in ['approved', 'completed']:
                ticket.payment_status = PaymentStatus.COMPLETED
                ticket.status = TicketStatus.CONFIRMED
                db.commit()
                
                return {
                    "status": "success",
                    "message": "Payment confirmed successfully",
                    "ticket_id": str(ticket.id),
                    "payment_id": payment_result['payment_id'],
                    "transaction_id": payment_result.get('transaction_id')
                }
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Payment execution failed"
                )
        
        else:
            # For Square, Cash App, and Cash, payment should already be confirmed
            return {
                "status": "success",
                "message": "Payment already confirmed",
                "ticket_id": str(ticket.id),
                "payment_id": payment_confirmation.payment_id
            }
            
    except PaymentError as e:
        logger.error(f"Payment confirmation failed: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment confirmation failed: {e.message}"
        )
    except Exception as e:
        logger.error(f"Payment confirmation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to confirm payment"
        )

@router.post("/refund/{ticket_id}")
async def create_refund(
    ticket_id: UUID,
    refund_amount: Optional[float] = None,
    reason: str = "Customer refund request",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Create a refund for a ticket (admin/organizer only)."""
    
    # Get the ticket
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check permissions (admin, moderator, or event organizer)
    if current_user.role.value not in ["admin", "moderator"]:
        # Check if user is event organizer
        if ticket.event.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to refund this ticket"
            )
    
    # Check if ticket has a successful payment
    if ticket.payment_status != PaymentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket payment was not completed"
        )
    
    if not ticket.payment_intent_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No payment ID found for this ticket"
        )
    
    try:
        # Calculate refund amount in cents
        refund_amount_to_process = refund_amount or ticket.total_price
        refund_amount_cents = int(refund_amount_to_process * 100)
        
        # Create refund
        refund_result = await payment_service.refund_payment(
            payment_id=ticket.payment_intent_id,
            provider=ticket.payment_method,
            amount_cents=refund_amount_cents,
            reason=reason
        )
        
        if refund_result['success']:
            # Update ticket status
            ticket.payment_status = PaymentStatus.REFUNDED
            ticket.status = TicketStatus.REFUNDED
            
            db.commit()
            
            return {
                "status": "success",
                "message": "Refund processed successfully",
                "refund_id": refund_result['refund_id'],
                "amount": refund_amount_to_process,
                "currency": ticket.currency,
                "provider": refund_result['provider']
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refund processing failed"
            )
            
    except PaymentError as e:
        logger.error(f"Refund creation failed: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Refund processing failed: {e.message}"
        )
    except Exception as e:
        logger.error(f"Refund creation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process refund"
        )

@router.get("/status/{ticket_id}")
async def get_payment_status(
    ticket_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get payment status for a ticket."""
    
    # Get the ticket
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check if user owns the ticket or is admin
    if ticket.user_id != current_user.id and current_user.role.value not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view payment status for this ticket"
        )
    
    try:
        if ticket.payment_intent_id and ticket.payment_method:
            # Get status from payment provider
            status_result = await payment_service.get_payment_status(
                payment_id=ticket.payment_intent_id,
                provider=ticket.payment_method
            )
            
            return {
                "ticket_id": str(ticket.id),
                "payment_status": ticket.payment_status.value,
                "ticket_status": ticket.status.value,
                "provider_status": status_result.get('status'),
                "provider": status_result.get('provider'),
                "payment_id": status_result.get('payment_id'),
                "amount": ticket.total_price,
                "currency": ticket.currency
            }
        else:
            return {
                "ticket_id": str(ticket.id),
                "payment_status": ticket.payment_status.value,
                "ticket_status": ticket.status.value,
                "amount": ticket.total_price,
                "currency": ticket.currency
            }
            
    except Exception as e:
        logger.error(f"Payment status check failed: {str(e)}")
        return {
            "ticket_id": str(ticket.id),
            "payment_status": ticket.payment_status.value,
            "ticket_status": ticket.status.value,
            "amount": ticket.total_price,
            "currency": ticket.currency,
            "error": "Could not retrieve provider status"
        }

@router.get("/config")
def get_payment_config(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get payment configuration for the frontend."""
    
    from app.core.config import settings
    
    # Get available payment providers
    providers = payment_service.get_available_providers()
    
    config = {
        "available_providers": providers,
        "supported_currencies": ["USD"],
        "test_mode": getattr(settings, 'ENVIRONMENT', 'development') != "production",
        "provider_config": {}
    }
    
    # Add provider-specific configuration
    if PaymentProvider.SQUARE in providers:
        config["provider_config"]["square"] = {
            "app_id": getattr(settings, 'SQUARE_APPLICATION_ID', None),
            "environment": getattr(settings, 'SQUARE_ENVIRONMENT', 'sandbox')
        }
    
    if PaymentProvider.PAYPAL in providers:
        config["provider_config"]["paypal"] = {
            "client_id": getattr(settings, 'PAYPAL_CLIENT_ID', None),
            "environment": getattr(settings, 'PAYPAL_MODE', 'sandbox')
        }
    
    return config 

@router.post("/webhook/paypal")
async def paypal_webhook(
    request: Request,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Handle PayPal webhook notifications."""
    
    try:
        # Get the raw request body
        body = await request.body()
        
        # PayPal webhook verification would go here
        # For now, we'll parse the JSON payload
        import json
        webhook_data = json.loads(body.decode('utf-8'))
        
        event_type = webhook_data.get('event_type')
        resource = webhook_data.get('resource', {})
        
        logger.info(f"Received PayPal webhook: {event_type}")
        
        # Handle different event types
        if event_type in ['PAYMENT.SALE.COMPLETED', 'CHECKOUT-ORDER.APPROVED']:
            await _handle_payment_completed(resource, db)
        elif event_type == 'PAYMENT.SALE.DENIED':
            await _handle_payment_failed(resource, db)
        elif event_type in ['PAYMENT.SALE.REFUNDED', 'PAYMENT.REFUND.COMPLETED']:
            await _handle_payment_refunded(resource, db)
        elif event_type in ['CUSTOMER.PAYOUT.COMPLETED', 'PAYMENT.PAYOUTS-ITEM.SUCCEEDED']:
            await _handle_payout_completed(resource, db)
        elif event_type in ['CUSTOMER.PAYOUT.FAILED', 'PAYMENT.PAYOUTS-ITEM.FAILED']:
            await _handle_payout_failed(resource, db)
        elif event_type in ['CUSTOMER.DISPUTE.CREATED']:
            await _handle_dispute_created(resource, db)
        else:
            logger.info(f"Unhandled PayPal webhook event: {event_type}")
        
        return {"status": "success", "event_type": event_type}
        
    except Exception as e:
        logger.error(f"PayPal webhook processing failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Webhook processing failed"
        )

async def _handle_payment_completed(resource: Dict[str, Any], db: Session):
    """Handle completed PayPal payment."""
    payment_id = resource.get('id') or resource.get('payment_id')
    
    if payment_id:
        # Find ticket by payment intent ID
        ticket = db.query(Ticket).filter(
            Ticket.payment_intent_id == payment_id,
            Ticket.payment_method == PaymentProvider.PAYPAL
        ).first()
        
        if ticket:
            ticket.payment_status = PaymentStatus.COMPLETED
            ticket.status = TicketStatus.CONFIRMED
            db.commit()
            logger.info(f"Updated ticket {ticket.id} status to COMPLETED")

async def _handle_payment_failed(resource: Dict[str, Any], db: Session):
    """Handle failed PayPal payment."""
    payment_id = resource.get('id') or resource.get('payment_id')
    
    if payment_id:
        ticket = db.query(Ticket).filter(
            Ticket.payment_intent_id == payment_id,
            Ticket.payment_method == PaymentProvider.PAYPAL
        ).first()
        
        if ticket:
            ticket.payment_status = PaymentStatus.FAILED
            ticket.status = TicketStatus.CANCELLED
            db.commit()
            logger.info(f"Updated ticket {ticket.id} status to FAILED")

async def _handle_payment_refunded(resource: Dict[str, Any], db: Session):
    """Handle PayPal payment refund."""
    # Handle refund logic based on resource data
    payment_id = resource.get('parent_payment') or resource.get('sale_id')
    
    if payment_id:
        ticket = db.query(Ticket).filter(
            Ticket.payment_intent_id == payment_id,
            Ticket.payment_method == PaymentProvider.PAYPAL
        ).first()
        
        if ticket:
            ticket.payment_status = PaymentStatus.REFUNDED
            ticket.status = TicketStatus.REFUNDED
            db.commit()
            logger.info(f"Updated ticket {ticket.id} status to REFUNDED")

async def _handle_payout_completed(resource: Dict[str, Any], db: Session):
    """Handle completed PayPal payout."""
    # This would handle payout notifications for organizers/admins
    payout_id = resource.get('payout_item_id') or resource.get('payout_batch_id')
    logger.info(f"PayPal payout completed: {payout_id}")
    # Add payout tracking logic here

async def _handle_payout_failed(resource: Dict[str, Any], db: Session):
    """Handle failed PayPal payout."""
    payout_id = resource.get('payout_item_id') or resource.get('payout_batch_id')
    logger.info(f"PayPal payout failed: {payout_id}")
    # Add payout failure handling logic here

async def _handle_dispute_created(resource: Dict[str, Any], db: Session):
    """Handle PayPal dispute creation."""
    dispute_id = resource.get('dispute_id')
    logger.warning(f"PayPal dispute created: {dispute_id}")
    # Add dispute notification logic here 

@router.post("/payout/create")
async def create_payout(
    payout_request: PayoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Create a PayPal payout (admin/organizer only)."""
    
    # Check permissions (admin, moderator only for now)
    if current_user.role.value not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create payouts"
        )
    
    try:
        payout_result = await payment_service.create_paypal_payout(
            recipient_email=payout_request.recipient_email,
            amount=payout_request.amount,
            currency=payout_request.currency,
            note=payout_request.note
        )
        
        if payout_result['success']:
            return {
                "status": "success",
                "message": "Payout created successfully",
                "payout_batch_id": payout_result['payout_batch_id'],
                "batch_status": payout_result['batch_status'],
                "amount": payout_result['amount'],
                "currency": payout_result['currency'],
                "recipient_email": payout_result['recipient_email']
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payout creation failed"
            )
            
    except PaymentError as e:
        logger.error(f"Payout creation failed: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payout processing failed: {e.message}"
        )
    except Exception as e:
        logger.error(f"Payout creation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payout"
        )

@router.post("/payout/batch")
async def create_batch_payout(
    batch_request: BatchPayoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Create a batch PayPal payout (admin only)."""
    
    # Check permissions (admin only for batch payouts)
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create batch payouts"
        )
    
    try:
        # Convert payout requests to dict format
        payouts_data = [
            {
                "recipient_email": payout.recipient_email,
                "amount": payout.amount,
                "currency": payout.currency,
                "note": payout.note
            }
            for payout in batch_request.payouts
        ]
        
        batch_result = await payment_service.create_batch_payout(
            payouts=payouts_data,
            email_subject=batch_request.email_subject,
            email_message=batch_request.email_message
        )
        
        if batch_result['success']:
            return {
                "status": "success",
                "message": "Batch payout created successfully",
                "payout_batch_id": batch_result['payout_batch_id'],
                "batch_status": batch_result['batch_status'],
                "total_amount": batch_result['total_amount'],
                "item_count": batch_result['item_count']
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Batch payout creation failed"
            )
            
    except PaymentError as e:
        logger.error(f"Batch payout creation failed: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch payout processing failed: {e.message}"
        )
    except Exception as e:
        logger.error(f"Batch payout creation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create batch payout"
        )

@router.get("/payout/status/{payout_batch_id}")
async def get_payout_status(
    payout_batch_id: str,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get PayPal payout status (admin/moderator only)."""
    
    # Check permissions
    if current_user.role.value not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view payout status"
        )
    
    try:
        status_result = await payment_service.get_paypal_payout_status(payout_batch_id)
        
        return {
            "payout_batch_id": status_result['payout_batch_id'],
            "batch_status": status_result['batch_status'],
            "time_created": status_result['time_created'],
            "items": status_result['items'],
            "provider": status_result['provider']
        }
        
    except PaymentError as e:
        logger.error(f"Payout status check failed: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payout status check failed: {e.message}"
        )
    except Exception as e:
        logger.error(f"Payout status check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check payout status"
        )

@router.post("/payout/cashapp")
async def create_cashapp_payout(
    payout_request: CashAppPayoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Create a Cash App payout (admin/organizer only)."""
    
    # Check permissions (admin, moderator only for now)
    if current_user.role.value not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create payouts"
        )
    
    # Validate Cash App tag format
    if not payout_request.recipient_cashtag.startswith('$'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cash App tag must start with $"
        )
    
    try:
        payout_result = await payment_service.create_cashapp_payout(
            recipient_cashtag=payout_request.recipient_cashtag,
            amount=payout_request.amount,
            currency=payout_request.currency,
            note=payout_request.note
        )
        
        if payout_result['success']:
            return {
                "status": "success",
                "message": "Cash App payout created successfully",
                "payout_id": payout_result['payout_id'],
                "status_detail": payout_result['status'],
                "amount": payout_result['amount'],
                "currency": payout_result['currency'],
                "recipient_cashtag": payout_result['recipient_cashtag']
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cash App payout creation failed"
            )
            
    except PaymentError as e:
        logger.error(f"Cash App payout creation failed: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cash App payout processing failed: {e.message}"
        )
    except Exception as e:
        logger.error(f"Cash App payout creation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create Cash App payout"
        )

@router.get("/payout/cashapp/status/{payout_id}")
async def get_cashapp_payout_status(
    payout_id: str,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get Cash App payout status (admin/moderator only)."""
    
    # Check permissions
    if current_user.role.value not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view payout status"
        )
    
    try:
        status_result = await payment_service.get_cashapp_payout_status(payout_id)
        
        return {
            "payout_id": status_result['payout_id'],
            "status": status_result['status'],
            "provider": status_result['provider']
        }
        
    except PaymentError as e:
        logger.error(f"Cash App payout status check failed: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cash App payout status check failed: {e.message}"
        )
    except Exception as e:
        logger.error(f"Cash App payout status check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check Cash App payout status"
        ) 