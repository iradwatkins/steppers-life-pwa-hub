from pydantic import BaseModel, Field
import uuid
from typing import Optional

class EventCategoryBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=100, description="Name of the event category")
    is_active: bool = True

class EventCategoryCreate(EventCategoryBase):
    pass

class EventCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100, description="New name of the event category")
    is_active: Optional[bool] = None
    # display_order: Optional[int] = None # Future consideration

class EventCategoryInDBBase(EventCategoryBase):
    id: uuid.UUID
    # display_order: Optional[int] = None # Future consideration

    class Config:
        from_attributes = True # For Pydantic v2 (orm_mode for v1)

class EventCategory(EventCategoryInDBBase):
    """Schema for returning a category to the client."""
    pass

class EventCategoryPublic(BaseModel):
    """Schema for public consumption of category, if different fields are needed."""
    id: uuid.UUID
    name: str
    # display_order: Optional[int] = None # Future consideration 