"""
Database setup and migration script.
Run this to create all tables in the database.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.core.config import settings
from app.models import *  # Import all models

def create_database():
    """Create all database tables."""
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

def drop_database():
    """Drop all database tables."""
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.drop_all(bind=engine)
    print("Database tables dropped successfully!")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "drop":
        drop_database()
    else:
        create_database() 