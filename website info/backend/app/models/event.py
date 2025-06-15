from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Text, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.core.database import Base

class EventStatus(enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    POSTPONED = "postponed"

class EventType(enum.Enum):
    WORKSHOP = "workshop"
    CLASS = "class"
    SOCIAL = "social"
    COMPETITION = "competition"
    PERFORMANCE = "performance"
    OTHER = "other"

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # Event details
    event_type = Column(Enum(EventType), nullable=False)
    status = Column(Enum(EventStatus), default=EventStatus.DRAFT, nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("event_categories.id"), nullable=True)
    
    # Location and timing
    venue_name = Column(String(255), nullable=True)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    zip_code = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    
    # Capacity and pricing
    capacity = Column(Integer, nullable=True)
    price = Column(Float, nullable=True)
    currency = Column(String(3), default="USD", nullable=False)
    
    # Media and content
    cover_image = Column(String(255), nullable=True)
    gallery_images = Column(JSON, nullable=True)
    video_url = Column(String(255), nullable=True)
    
    # Additional settings
    is_featured = Column(Boolean, default=False, nullable=False)
    is_private = Column(Boolean, default=False, nullable=False)
    requires_approval = Column(Boolean, default=False, nullable=False)
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    category = relationship("EventCategory", back_populates="events")
    creator = relationship("User", back_populates="created_events")
    tickets = relationship("Ticket", back_populates="event")
    
    def __repr__(self):
        return f"<Event(id={self.id}, title='{self.title}', status='{self.status.value}')>" 