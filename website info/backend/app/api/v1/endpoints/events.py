from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.event import Event, EventStatus
from app.models.user import User
from app.schemas.event import EventCreate, EventUpdate, Event as EventSchema, EventPublic
from app.utils.slug import generate_slug

router = APIRouter()

@router.post("/", response_model=EventSchema, status_code=status.HTTP_201_CREATED)
def create_event(
    event: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new event."""
    # Generate slug from title
    slug = generate_slug(event.title)
    
    # Check if slug already exists
    if db.query(Event).filter(Event.slug == slug).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An event with this title already exists"
        )
    
    # Create new event
    db_event = Event(
        **event.dict(),
        slug=slug,
        created_by=current_user.id
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/", response_model=List[EventPublic])
def list_events(
    skip: int = 0,
    limit: int = 100,
    status: Optional[EventStatus] = None,
    category_id: Optional[UUID] = None,
    db: Session = Depends(get_db)
):
    """List all events with optional filtering."""
    query = db.query(Event)
    
    if status:
        query = query.filter(Event.status == status)
    if category_id:
        query = query.filter(Event.category_id == category_id)
    
    return query.order_by(desc(Event.created_at)).offset(skip).limit(limit).all()

@router.get("/{event_id}", response_model=EventPublic)
def get_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific event by ID."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    return event

@router.get("/slug/{slug}", response_model=EventPublic)
def get_event_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """Get a specific event by slug."""
    event = db.query(Event).filter(Event.slug == slug).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    return event

@router.put("/{event_id}", response_model=EventSchema)
def update_event(
    event_id: int,
    event_update: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an event."""
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if user has permission to update
    if db_event.created_by != current_user.id and current_user.role.value not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this event"
        )
    
    # Update event fields
    update_data = event_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_event, field, value)
    
    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an event."""
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if user has permission to delete
    if db_event.created_by != current_user.id and current_user.role.value not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this event"
        )
    
    db.delete(db_event)
    db.commit()
    return None 