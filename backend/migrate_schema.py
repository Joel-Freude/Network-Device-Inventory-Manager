"""
Manual migration script to change ip_address and mac_address to string types.
Run this script to update the database schema.
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
        print("Starting migration...")
        
        # Change ip_address from INET to VARCHAR
        await conn.execute("""
            ALTER TABLE devices 
            ALTER COLUMN ip_address TYPE VARCHAR(45)
        """)
        print("Changed ip_address to VARCHAR(45)")
        
        # Change mac_address from MACADDR to VARCHAR
        await conn.execute("""
            ALTER TABLE devices 
            ALTER COLUMN mac_address TYPE VARCHAR(17)
        """)
        print("Changed mac_address to VARCHAR(17)")
        
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        raise
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate())
