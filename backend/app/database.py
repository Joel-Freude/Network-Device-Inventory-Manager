from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

# Remove SSL parameters from URL for asyncpg
database_url = settings.database_url.split("?")[0]

# Create async engine for PostgreSQL with SSL configuration
engine = create_async_engine(
    database_url.replace("postgresql://", "postgresql+asyncpg://"),
    echo=True,
    future=True,
    connect_args={"ssl": "require"}
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


async def get_db() -> AsyncSession:
    """Dependency for getting async database sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
