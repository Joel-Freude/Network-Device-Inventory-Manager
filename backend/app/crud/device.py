from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.crud.base import CRUDBase
from app.models.device import Device, DeviceStatus
from app.schemas.device import DeviceCreate, DeviceUpdate


class CRUDDevice(CRUDBase[Device, DeviceCreate, DeviceUpdate]):
    """CRUD operations for devices."""
    
    async def get_by_hostname(
        self, 
        db: AsyncSession, 
        hostname: str
    ) -> Device | None:
        """Get device by hostname."""
        result = await db.execute(
            select(Device).where(Device.hostname == hostname)
        )
        return result.scalar_one_or_none()
    
    async def get_by_ip_address(
        self, 
        db: AsyncSession, 
        ip_address: str
    ) -> Device | None:
        """Get device by IP address."""
        result = await db.execute(
            select(Device).where(Device.ip_address == ip_address)
        )
        return result.scalar_one_or_none()
    
    async def get_by_mac_address(
        self, 
        db: AsyncSession, 
        mac_address: str
    ) -> Device | None:
        """Get device by MAC address."""
        result = await db.execute(
            select(Device).where(Device.mac_address == mac_address)
        )
        return result.scalar_one_or_none()
    
    async def get_by_serial_number(
        self, 
        db: AsyncSession, 
        serial_number: str
    ) -> Device | None:
        """Get device by serial number."""
        result = await db.execute(
            select(Device).where(Device.serial_number == serial_number)
        )
        return result.scalar_one_or_none()
    
    async def get_by_location(
        self, 
        db: AsyncSession, 
        location_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Device]:
        """Get devices by location ID."""
        result = await db.execute(
            select(Device)
            .where(Device.location_id == location_id)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_status(
        self, 
        db: AsyncSession, 
        status: DeviceStatus,
        skip: int = 0,
        limit: int = 100
    ) -> List[Device]:
        """Get devices by status."""
        result = await db.execute(
            select(Device)
            .where(Device.status == status)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_vendor(
        self, 
        db: AsyncSession, 
        vendor: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Device]:
        """Get devices by vendor."""
        result = await db.execute(
            select(Device)
            .where(Device.vendor == vendor)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def search(
        self,
        db: AsyncSession,
        search_term: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Device]:
        """Search devices by hostname or serial number."""
        result = await db.execute(
            select(Device)
            .where(
                or_(
                    Device.hostname.ilike(f"%{search_term}%"),
                    Device.serial_number.ilike(f"%{search_term}%")
                )
            )
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()


device = CRUDDevice(Device)
