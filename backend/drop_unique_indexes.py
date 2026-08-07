"""
Drop unique indexes on ip_address and mac_address columns.
"""
import asyncio
import os
from dotenv import load_dotenv
import asyncpg

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def migrate():
    """Drop unique indexes on ip_address and mac_address."""
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        print("Dropping unique indexes...")
        
        # Drop unique index on ip_address
        await conn.execute("""
            DROP INDEX IF EXISTS ix_devices_ip_address
        """)
        print("Dropped unique index on ip_address")
        
        # Drop unique index on mac_address
        await conn.execute("""
            DROP INDEX IF EXISTS ix_devices_mac_address
        """)
        print("Dropped unique index on mac_address")
        
        # Also drop unique index on hostname if it exists
        await conn.execute("""
            DROP INDEX IF EXISTS ix_devices_hostname
        """)
        print("Dropped unique index on hostname")
        
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        raise
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate())
