from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import os
from typing import Generator

# Database configuration
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

# Create SQLAlchemy engine
if DATABASE_URL.startswith("sqlite"):
    # SQLite specific configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=True  # Set to False in production
    )
else:
    # PostgreSQL configuration
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=True  # Set to False in production
    )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    Database dependency that provides a database session.
    Use this as a FastAPI dependency.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

def init_db() -> None:
    """
    Initialize database tables.
    Call this on application startup.
    """
    # Import all models here to ensure they are registered
    from app.models import (
        User, Event, EventCategory, Ticket, 
        MagazineCategory, MagazineArticle, ArticleContentBlock,
        UserPaymentInfo, PaymentDisbursement, UserAccount
    )
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
    
    # Print table information for debugging
    print("Created tables:")
    for table_name in Base.metadata.tables.keys():
        print(f"  - {table_name}")

def get_db_connection_info() -> dict:
    """
    Get database connection information for debugging.
    """
    return {
        "database_url": DATABASE_URL.replace(DATABASE_URL.split('@')[0].split('://')[-1], "***") if '@' in DATABASE_URL else DATABASE_URL,
        "engine_pool_size": engine.pool.size() if hasattr(engine.pool, 'size') else 'N/A',
        "is_sqlite": DATABASE_URL.startswith("sqlite"),
        "is_postgresql": DATABASE_URL.startswith("postgresql")
    }

# Health check function
def check_db_health() -> bool:
    """
    Check if database connection is healthy.
    """
    try:
        db = SessionLocal()
        # Use SQLAlchemy 2.0 syntax
        result = db.execute(text("SELECT 1"))
        result.fetchone()
        db.close()
        return True
    except Exception as e:
        print(f"Database health check failed: {e}")
        return False