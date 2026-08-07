"""
Remove unique constraint on ip_address column.
"""
import asyncio
import os
from dotenv import load_dotenv
import asyncpg

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def migrate():
    """Remove unique constraint on ip_address."""
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        print("Removing unique constraint on ip_address...")
        
        # Drop the unique constraint if it exists
        await conn.execute("""
            ALTER TABLE devices 
            DROP CONSTRAINT IF EXISTS ix_devices_ip_address
        """)
        print("Removed unique constraint on ip_address")
        
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        raise
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate())
