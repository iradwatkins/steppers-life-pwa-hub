from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
from enum import Enum
from uuid import UUID

class EventType(str, Enum):
    WORKSHOP = "workshop"
    CLASS = "class"
    SOCIAL = "social"
    COMPETITION = "competition"
    PERFORMANCE = "performance"
    OTHER = "other"

class EventStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    POSTPONED = "postponed"

class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    event_type: EventType
    venue_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    start_time: datetime
    end_time: datetime
    capacity: Optional[int] = None
    price: Optional[float] = None
    currency: str = "USD"
    is_private: bool = False
    requires_approval: bool = False
    category_id: Optional[UUID] = None

    @validator('end_time')
    def end_time_must_be_after_start_time(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    event_type: Optional[EventType] = None
    status: Optional[EventStatus] = None
    venue_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    capacity: Optional[int] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    is_private: Optional[bool] = None
    requires_approval: Optional[bool] = None
    category_id: Optional[UUID] = None
    cover_image: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    video_url: Optional[str] = None
    is_featured: Optional[bool] = None

class EventInDBBase(EventBase):
    id: int
    slug: str
    status: EventStatus
    created_by: int
    created_at: datetime
    updated_at: datetime
    cover_image: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    video_url: Optional[str] = None
    is_featured: bool = False

    class Config:
        orm_mode = True

class Event(EventInDBBase):
    pass

class EventPublic(BaseModel):
    id: int
    title: str
    slug: str
    description: Optional[str]
    event_type: EventType
    status: EventStatus
    venue_name: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip_code: Optional[str]
    country: Optional[str]
    start_time: datetime
    end_time: datetime
    capacity: Optional[int]
    price: Optional[float]
    currency: str
    cover_image: Optional[str]
    gallery_images: Optional[List[str]]
    video_url: Optional[str]
    is_featured: bool
    category_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True 