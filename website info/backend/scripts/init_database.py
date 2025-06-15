#!/usr/bin/env python3
"""
Database Initialization Script
Run this script to create all database tables for the SteppersLife backend.
"""

import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import init_db, check_db_health, get_db_connection_info
from app.core.config import settings

def main():
    """Initialize the database and create all tables."""
    print("🚀 SteppersLife Database Initialization")
    print("=" * 50)
    
    # Show database configuration
    db_info = get_db_connection_info()
    print(f"Database URL: {db_info['database_url']}")
    print(f"Database Type: {'SQLite' if db_info['is_sqlite'] else 'PostgreSQL'}")
    print()
    
    # Check database health before initialization
    print("Checking database connection...")
    if not check_db_health():
        print("❌ Database connection failed!")
        print("Please check your database configuration and try again.")
        sys.exit(1)
    
    print("✅ Database connection successful!")
    print()
    
    # Initialize database tables
    print("Creating database tables...")
    try:
        init_db()
        print("✅ Database initialization completed successfully!")
        print()
        
        # Verify tables were created
        print("Verifying table creation...")
        if check_db_health():
            print("✅ Database health check passed!")
            
            # Print summary
            print()
            print("🎉 Database Setup Complete!")
            print("The following components are now ready:")
            print("  ✅ User management")
            print("  ✅ Event management") 
            print("  ✅ Ticket system")
            print("  ✅ Payment processing")
            print("  ✅ Magazine content")
            print("  ✅ User accounts & disbursements")
            print()
            print("You can now start the FastAPI backend server.")
            
        else:
            print("⚠️  Database health check failed after initialization")
            
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        print("Please check the error message above and fix any issues.")
        sys.exit(1)

if __name__ == "__main__":
    main()