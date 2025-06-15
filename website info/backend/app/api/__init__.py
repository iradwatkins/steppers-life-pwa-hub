"""API Router initialization

This module initializes the main API router and includes all route modules.
"""

from fastapi import APIRouter
from app.api.routes import email

api_router = APIRouter()

# Include all route modules
api_router.include_router(email.router)

# Add more routers as they are created
# api_router.include_router(users.router)
# api_router.include_router(events.router)
# api_router.include_router(tickets.router)
# etc. 