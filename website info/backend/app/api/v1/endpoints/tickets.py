from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from uuid import UUID
import secrets

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.ticket import Ticket, TicketStatus, PaymentStatus
from app.models.event import Event
from app.models.user import User
from app.schemas.ticket import (
    TicketCreate, TicketUpdate, TicketPayment, TicketCheckIn,
    Ticket as TicketSchema, TicketPublic, TicketSummary
)
from app.utils.ticket import generate_ticket_number, generate_verification_token

router = APIRouter()

@router.post("/", response_model=TicketSchema, status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new ticket (purchase)."""
    # Check if event exists
    event = db.query(Event).filter(Event.id == ticket.event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if event is available for purchase
    if event.status.value not in ["published"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event is not available for purchase"
        )
    
    # Check capacity
    if event.capacity:
        current_tickets = db.query(func.sum(Ticket.quantity)).filter(
            Ticket.event_id == ticket.event_id,
            Ticket.status.in_([TicketStatus.CONFIRMED, TicketStatus.CHECKED_IN])
        ).scalar() or 0
        
        if current_tickets + ticket.quantity > event.capacity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough tickets available"
            )
    
    # Calculate pricing
    unit_price = event.price or 0.0
    total_price = unit_price * ticket.quantity
    
    # Generate ticket details
    ticket_number = generate_ticket_number()
    verification_token = generate_verification_token()
    
    # Create ticket
    db_ticket = Ticket(
        **ticket.dict(),
        ticket_number=ticket_number,
        user_id=current_user.id,
        unit_price=unit_price,
        total_price=total_price,
        currency=event.currency,
        verification_token=verification_token
    )
    
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@router.get("/", response_model=List[TicketPublic])
def list_user_tickets(
    skip: int = 0,
    limit: int = 100,
    event_id: Optional[int] = None,
    status: Optional[TicketStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List current user's tickets."""
    query = db.query(Ticket).filter(Ticket.user_id == current_user.id)
    
    if event_id:
        query = query.filter(Ticket.event_id == event_id)
    if status:
        query = query.filter(Ticket.status == status)
    
    return query.order_by(desc(Ticket.created_at)).offset(skip).limit(limit).all()

@router.get("/{ticket_id}", response_model=TicketPublic)
def get_ticket(
    ticket_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific ticket."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check if user owns the ticket or is admin/moderator
    if (ticket.user_id != current_user.id and 
        current_user.role.value not in ["admin", "moderator"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this ticket"
        )
    
    return ticket

@router.put("/{ticket_id}/payment", response_model=TicketSchema)
def process_payment(
    ticket_id: UUID,
    payment: TicketPayment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Process payment for a ticket."""
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
            detail="Not authorized to modify this ticket"
        )
    
    # Check if ticket is in pending status
    if ticket.status != TicketStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket payment has already been processed"
        )
    
    # Update payment information
    ticket.payment_method = payment.payment_method
    ticket.payment_intent_id = payment.payment_intent_id
    ticket.payment_status = PaymentStatus.COMPLETED
    ticket.status = TicketStatus.CONFIRMED
    
    db.commit()
    db.refresh(ticket)
    return ticket

@router.put("/{ticket_id}", response_model=TicketSchema)
def update_ticket(
    ticket_id: UUID,
    ticket_update: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update ticket details."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check permissions
    if (ticket.user_id != current_user.id and 
        current_user.role.value not in ["admin", "moderator"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this ticket"
        )
    
    # Update ticket fields
    update_data = ticket_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ticket, field, value)
    
    db.commit()
    db.refresh(ticket)
    return ticket

@router.post("/check-in", response_model=TicketSchema)
def check_in_ticket(
    check_in: TicketCheckIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check in a ticket using verification token."""
    ticket = db.query(Ticket).filter(
        Ticket.verification_token == check_in.verification_token
    ).first()
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid verification token"
        )
    
    # Check if ticket is confirmed
    if ticket.status != TicketStatus.CONFIRMED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket is not confirmed or already checked in"
        )
    
    # Update check-in status
    ticket.status = TicketStatus.CHECKED_IN
    ticket.checked_in_at = func.now()
    ticket.checked_in_by = current_user.id
    
    db.commit()
    db.refresh(ticket)
    return ticket

@router.get("/event/{event_id}/summary", response_model=TicketSummary)
def get_event_ticket_summary(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get ticket summary for an event (organizers/admins only)."""
    # Check if event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check permissions
    if (event.created_by != current_user.id and 
        current_user.role.value not in ["admin", "moderator"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view ticket summary"
        )
    
    # Calculate summary statistics
    total_tickets = db.query(func.sum(Ticket.quantity)).filter(
        Ticket.event_id == event_id
    ).scalar() or 0
    
    confirmed_tickets = db.query(func.sum(Ticket.quantity)).filter(
        Ticket.event_id == event_id,
        Ticket.status.in_([TicketStatus.CONFIRMED, TicketStatus.CHECKED_IN])
    ).scalar() or 0
    
    checked_in_tickets = db.query(func.sum(Ticket.quantity)).filter(
        Ticket.event_id == event_id,
        Ticket.status == TicketStatus.CHECKED_IN
    ).scalar() or 0
    
    total_revenue = db.query(func.sum(Ticket.total_price)).filter(
        Ticket.event_id == event_id,
        Ticket.payment_status == PaymentStatus.COMPLETED
    ).scalar() or 0.0
    
    return TicketSummary(
        total_tickets=total_tickets,
        confirmed_tickets=confirmed_tickets,
        checked_in_tickets=checked_in_tickets,
        total_revenue=total_revenue,
        currency=event.currency
    )

@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_ticket(
    ticket_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a ticket."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check permissions
    if (ticket.user_id != current_user.id and 
        current_user.role.value not in ["admin", "moderator"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this ticket"
        )
    
    # Check if ticket can be cancelled
    if ticket.status == TicketStatus.CHECKED_IN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel a checked-in ticket"
        )
    
    # Update ticket status
    ticket.status = TicketStatus.CANCELLED
    
    db.commit()
    return None 