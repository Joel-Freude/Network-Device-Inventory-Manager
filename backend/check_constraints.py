"""
Check and list all constraints on the devices table.
"""
import asyncio
import os
from dotenv import load_dotenv
import asyncpg

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def check_constraints():
    """Check all constraints on devices table."""
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        # Get all constraints on devices table
        constraints = await conn.fetch("""
            SELECT 
                conname as constraint_name,
                contype as constraint_type
            FROM pg_constraint 
            WHERE conrelid = 'devices'::regclass
        """)
        
        print("Constraints on devices table:")
        for constraint in constraints:
            print(f"  - {constraint['constraint_name']} ({constraint['constraint_type']})")
        
        # Get all indexes on devices table
        indexes = await conn.fetch("""
            SELECT 
                indexname as index_name,
                indexdef as index_def
            FROM pg_indexes 
            WHERE tablename = 'devices'
        """)
        
        print("\nIndexes on devices table:")
        for index in indexes:
            print(f"  - {index['index_name']}")
            print(f"    {index['index_def']}")
        
    except Exception as e:
        print(f"Error: {e}")
        raise
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_constraints())
