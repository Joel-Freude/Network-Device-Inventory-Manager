"""
Migration script to add latitude and longitude to locations table.
Run this script to update the database schema for globe visualization.
"""
import asyncio
import os
from dotenv import load_dotenv
import asyncpg

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def migrate():
    """Execute the migration."""
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        print("Adding coordinates to locations table...")
        
        # Add latitude column
        await conn.execute("""
            ALTER TABLE locations 
            ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION
        """)
        print("Added latitude column")
        
        # Add longitude column
        await conn.execute("""
            ALTER TABLE locations 
            ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION
        """)
        print("Added longitude column")
        
        # Update existing locations with some default coordinates (you can customize these)
        await conn.execute("""
            UPDATE locations 
            SET latitude = 40.7128, longitude = -74.0060
            WHERE latitude IS NULL
        """)
        print("Updated existing locations with default coordinates (New York)")
        
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        raise
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate())