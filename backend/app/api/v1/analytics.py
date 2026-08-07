from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.device import Device, DeviceStatus

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
async def get_analytics_summary(db: AsyncSession = Depends(get_db)):
    """Get summary analytics for dashboard."""
    
    # Total devices count
    total_result = await db.execute(select(func.count(Device.id)))
    total_devices = total_result.scalar()
    
    # Devices by status
    status_result = await db.execute(
        select(Device.status, func.count(Device.id))
        .group_by(Device.status)
    )
    status_counts = {row[0]: row[1] for row in status_result.all()}
    
    # Devices by vendor
    vendor_result = await db.execute(
        select(Device.vendor, func.count(Device.id))
        .group_by(Device.vendor)
    )
    vendor_counts = {row[0]: row[1] for row in vendor_result.all()}
    
    # Devices by type
    type_result = await db.execute(
        select(Device.device_type, func.count(Device.id))
        .group_by(Device.device_type)
    )
    type_counts = {row[0]: row[1] for row in type_result.all()}
    
    # Active vs offline
    active_count = status_counts.get(DeviceStatus.ACTIVE, 0)
    offline_count = status_counts.get(DeviceStatus.OFFLINE, 0)
    maintenance_count = status_counts.get(DeviceStatus.MAINTENANCE, 0)
    
    return {
        "total_devices": total_devices or 0,
        "active_devices": active_count,
        "offline_devices": offline_count,
        "maintenance_devices": maintenance_count,
        "devices_by_status": status_counts,
        "devices_by_vendor": vendor_counts,
        "devices_by_type": type_counts
    }


@router.get("/warranties")
async def get_warranty_expirations(
    days: int = 30,
    db: AsyncSession = Depends(get_db)
):
    """Get devices with expiring warranties within specified days."""
    # This is a placeholder - actual warranty tracking would require
    # a warranty_expiration_date field in the Device model
    # For now, return empty list
    return {
        "message": "Warranty tracking requires warranty_expiration_date field",
        "expiring_soon": []
    }


@router.get("/locations")
async def get_location_analytics(db: AsyncSession = Depends(get_db)):
    """Get analytics by location."""
    from sqlalchemy import join
    from app.models.location import Location
    
    result = await db.execute(
        select(
            Location.site_name,
            Location.id,
            func.count(Device.id).label('device_count')
        )
        .outerjoin(Device, Device.location_id == Location.id)
        .group_by(Location.id, Location.site_name)
    )
    
    location_stats = []
    for row in result.all():
        location_stats.append({
            "location_id": row.id,
            "site_name": row.site_name,
            "device_count": row.device_count
        })
    
    return {"locations": location_stats}
