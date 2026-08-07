"""
Test script to verify Neon PostgreSQL database connection.
Run this from the backend directory after configuring your .env file.
"""
import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text

# Load environment variables
load_dotenv()

async def test_connection():
    """Test database connection and run a simple query."""
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL not found in environment variables.")
        print("Please create a .env file with your Neon connection string.")
        return
    
    # Remove SSL parameters from URL for asyncpg
    database_url = database_url.split("?")[0]
    
    # Convert to asyncpg format if needed
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")
    
    print(f"🔗 Testing connection to: {database_url.split('@')[1] if '@' in database_url else database_url}")
    
    try:
        # Create async engine with SSL configuration
        engine = create_async_engine(
            database_url,
            echo=True,
            connect_args={"ssl": "require"}
        )
        
        # Test connection
        async with engine.connect() as connection:
            print("✅ Successfully connected to Neon PostgreSQL!")
            
            # Run a simple query
            result = await connection.execute(text("SELECT version();"))
            version = result.scalar()
            print(f"📊 Database version: {version}")
            
            # Test table creation capability
            result = await connection.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            tables = result.fetchall()
            print(f"📋 Existing tables: {[table[0] for table in tables]}")
        
        await engine.dispose()
        print("\n✅ All tests passed! Your Neon database connection is working correctly.")
        
    except Exception as e:
        print(f"\n❌ Connection failed: {str(e)}")
        print("\nTroubleshooting tips:")
        print("1. Verify your DATABASE_URL in .env file is correct")
        print("2. Ensure your Neon project is active")
        print("3. Make sure asyncpg is installed: pip install asyncpg")

if __name__ == "__main__":
    print("🧪 Testing Neon Database Connection\n")
    asyncio.run(test_connection())
