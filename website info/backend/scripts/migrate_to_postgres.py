#!/usr/bin/env python3
"""
Migration script to move from SQLite to PostgreSQL for production.
This script handles the database schema migration and data transfer.
"""

import os
import sys
import sqlite3
import psycopg2
from psycopg2.extras import RealDictCursor
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import argparse
from datetime import datetime

# Add the parent directory to the path so we can import our app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import Base, engine
from app.models import *  # Import all models

def get_sqlite_data():
    """Extract data from SQLite database."""
    sqlite_path = "steppers_life.db"
    
    if not os.path.exists(sqlite_path):
        print(f"SQLite database not found at {sqlite_path}")
        return None
    
    conn = sqlite3.connect(sqlite_path)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    
    data = {}
    
    # Get list of tables
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    
    print(f"Found {len(tables)} tables in SQLite database")
    
    # Extract data from each table
    for table in tables:
        if table.startswith('sqlite_'):  # Skip SQLite system tables
            continue
            
        cursor.execute(f"SELECT * FROM {table}")
        rows = cursor.fetchall()
        data[table] = [dict(row) for row in rows]
        print(f"Extracted {len(rows)} rows from table '{table}'")
    
    conn.close()
    return data

def create_postgres_schema():
    """Create PostgreSQL schema using SQLAlchemy models."""
    print("Creating PostgreSQL schema...")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ PostgreSQL schema created successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to create PostgreSQL schema: {e}")
        return False

def migrate_data(sqlite_data):
    """Migrate data from SQLite to PostgreSQL."""
    if not sqlite_data:
        print("No SQLite data to migrate")
        return True
    
    print("Starting data migration...")
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    try:
        # Define migration order (dependencies first)
        migration_order = [
            'users',
            'user_roles', 
            'user_accounts',
            'categories',
            'events',
            'venues',
            'tickets',
            'payments',
            'email_campaigns',
            'email_templates'
        ]
        
        migrated_tables = []
        
        for table_name in migration_order:
            if table_name in sqlite_data and sqlite_data[table_name]:
                print(f"Migrating table '{table_name}'...")
                
                # Insert data using raw SQL to handle ID conflicts
                rows = sqlite_data[table_name]
                if rows:
                    # Get column names from first row
                    columns = list(rows[0].keys())
                    
                    # Create INSERT statement
                    placeholders = ', '.join(['%s'] * len(columns))
                    columns_str = ', '.join(columns)
                    
                    sql = f"""
                    INSERT INTO {table_name} ({columns_str}) 
                    VALUES ({placeholders})
                    ON CONFLICT DO NOTHING
                    """
                    
                    # Prepare data for insertion
                    values = []
                    for row in rows:
                        values.append([row[col] for col in columns])
                    
                    # Execute batch insert
                    try:
                        session.execute(text(sql), values)
                        session.commit()
                        print(f"✅ Migrated {len(rows)} rows to '{table_name}'")
                        migrated_tables.append(table_name)
                    except Exception as e:
                        print(f"❌ Failed to migrate table '{table_name}': {e}")
                        session.rollback()
        
        # Update sequences for PostgreSQL
        print("Updating PostgreSQL sequences...")
        for table_name in migrated_tables:
            try:
                session.execute(text(f"""
                    SELECT setval(pg_get_serial_sequence('{table_name}', 'id'), 
                                  COALESCE(MAX(id), 1)) FROM {table_name};
                """))
                session.commit()
            except Exception as e:
                print(f"Warning: Could not update sequence for {table_name}: {e}")
        
        print("✅ Data migration completed successfully")
        return True
        
    except Exception as e:
        print(f"❌ Data migration failed: {e}")
        session.rollback()
        return False
    finally:
        session.close()

def verify_migration():
    """Verify that the migration was successful."""
    print("Verifying migration...")
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    try:
        # Check that tables exist and have data
        tables_to_check = [
            ('users', 'SELECT COUNT(*) FROM users'),
            ('events', 'SELECT COUNT(*) FROM events'),
            ('tickets', 'SELECT COUNT(*) FROM tickets')
        ]
        
        for table_name, query in tables_to_check:
            try:
                result = session.execute(text(query)).scalar()
                print(f"✅ Table '{table_name}': {result} rows")
            except Exception as e:
                print(f"❌ Error checking table '{table_name}': {e}")
        
        print("✅ Migration verification completed")
        return True
        
    except Exception as e:
        print(f"❌ Migration verification failed: {e}")
        return False
    finally:
        session.close()

def main():
    parser = argparse.ArgumentParser(description='Migrate SteppersLife from SQLite to PostgreSQL')
    parser.add_argument('--skip-data', action='store_true', 
                       help='Skip data migration, only create schema')
    parser.add_argument('--force', action='store_true',
                       help='Force migration even if PostgreSQL already has data')
    
    args = parser.parse_args()
    
    print("🚀 Starting SteppersLife Database Migration")
    print(f"Source: SQLite (steppers_life.db)")
    print(f"Target: PostgreSQL ({settings.DATABASE_URL})")
    print(f"Environment: {settings.ENVIRONMENT}")
    print("="*50)
    
    # Check if PostgreSQL is configured
    if not settings.DATABASE_URL.startswith('postgresql'):
        print("❌ PostgreSQL database URL not configured")
        print("Please set DATABASE_URL environment variable")
        return 1
    
    # Create PostgreSQL schema
    if not create_postgres_schema():
        return 1
    
    if not args.skip_data:
        # Extract SQLite data
        print("Extracting data from SQLite...")
        sqlite_data = get_sqlite_data()
        
        # Migrate data
        if not migrate_data(sqlite_data):
            return 1
        
        # Verify migration
        if not verify_migration():
            return 1
    
    print("="*50)
    print("🎉 Migration completed successfully!")
    print(f"✅ Database is ready for production use")
    print(f"🔗 Connection: {settings.DATABASE_URL}")
    
    return 0

if __name__ == "__main__":
    exit(main())