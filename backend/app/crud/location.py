from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.crud.base import CRUDBase
from app.models.location import Location
from app.schemas.location import LocationCreate, LocationUpdate


class CRUDLocation(CRUDBase[Location, LocationCreate, LocationUpdate]):
    """CRUD operations for locations."""
    
    async def get_by_site_name(
        self, 
        db: AsyncSession, 
        site_name: str
    ) -> Location | None:
        """Get location by site name."""
        result = await db.execute(
            select(Location).where(Location.site_name == site_name)
        )
        return result.scalar_one_or_none()
    
    async def get_with_devices(
        self, 
        db: AsyncSession, 
        id: int
    ) -> Location | None:
        """Get location with associated devices."""
        result = await db.execute(
            select(Location).where(Location.id == id)
        )
        return result.scalar_one_or_none()


location = CRUDLocation(Location)
