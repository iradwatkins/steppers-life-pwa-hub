from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
import uuid # For generating placeholder IDs

from app.schemas.category import EventCategory # Assuming this is the response model
# We'll need schemas for Create and Update later
# from app.schemas.category import EventCategoryCreate, EventCategoryUpdate

# We will also need dependency injection for DB session and current admin user later
# from app.api import deps

router = APIRouter()

# Placeholder for a database or in-memory store for categories
# In a real app, this would come from a database service/repository
_db_categories = [
    EventCategory(id=uuid.uuid4(), name="Tech Conferences", is_active=True),
    EventCategory(id=uuid.uuid4(), name="Music Festivals", is_active=True),
    EventCategory(id=uuid.uuid4(), name="Food & Drink Workshops", is_active=True),
    EventCategory(id=uuid.uuid4(), name="Art Exhibitions", is_active=False),
]

@router.get(
    "/",
    response_model=List[EventCategory],
    summary="List All Event Categories",
    description="Retrieve a list of all event categories available in the system.",
    # dependencies=[Depends(deps.get_current_active_admin_user)] # To be added later for auth
)
async def list_event_categories(
    # skip: int = 0, # For pagination, to be added later
    # limit: int = 100 # For pagination, to be added later
    # db: Session = Depends(deps.get_db) # For DB access, to be added later
):
    """
    Retrieve all event categories.
    Permissions: Admin only (to be enforced later).
    """
    # For now, return hardcoded data. Later, this will fetch from the database.
    return _db_categories

# Placeholder for POST endpoint (Create Category)
# @router.post("/", response_model=EventCategory, status_code=status.HTTP_201_CREATED)
# async def create_event_category():
#     pass

# Placeholder for PUT endpoint (Update Category)
# @router.put("/{category_id}", response_model=EventCategory)
# async def update_event_category(category_id: uuid.UUID):
#     pass

# Placeholder for DELETE endpoint (or PATCH for status toggle)
# @router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
# async def delete_event_category(category_id: uuid.UUID):
#     pass 