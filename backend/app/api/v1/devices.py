from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.database import get_db
from app.schemas.device import DeviceCreate, DeviceUpdate, DeviceResponse
from app.crud.device import device
from app.models.device import DeviceStatus

router = APIRouter(prefix="/devices", tags=["devices"])


@router.get("/", response_model=List[DeviceResponse])
async def get_devices(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[DeviceStatus] = None,
    vendor: Optional[str] = None,
    location_id: Optional[int] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all devices with filtering and pagination."""
    if search:
        devices = await device.search(db, search_term=search, skip=skip, limit=limit)
    elif status:
        devices = await device.get_by_status(db, status=status, skip=skip, limit=limit)
    elif vendor:
        devices = await device.get_by_vendor(db, vendor=vendor, skip=skip, limit=limit)
    elif location_id:
        devices = await device.get_by_location(db, location_id=location_id, skip=skip, limit=limit)
    else:
        devices = await device.get_multi(db, skip=skip, limit=limit)
    return devices


@router.post("/", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
async def create_device(
    device_in: DeviceCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new device."""
    # Check for uniqueness constraints
    if await device.get_by_hostname(db, device_in.hostname):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Device with this hostname already exists"
        )
    if await device.get_by_ip_address(db, device_in.ip_address):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Device with this IP address already exists"
        )
    if await device.get_by_mac_address(db, device_in.mac_address):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Device with this MAC address already exists"
        )
    if await device.get_by_serial_number(db, device_in.serial_number):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Device with this serial number already exists"
        )
    
    return await device.create(db, device_in)


@router.get("/{device_id}", response_model=DeviceResponse)
async def get_device(
    device_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific device by ID."""
    dev = await device.get(db, device_id)
    if not dev:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    return dev


@router.put("/{device_id}", response_model=DeviceResponse)
async def update_device(
    device_id: int,
    device_in: DeviceUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a device."""
    dev = await device.get(db, device_id)
    if not dev:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    # Check uniqueness constraints for updated fields
    if device_in.hostname and device_in.hostname != dev.hostname:
        if await device.get_by_hostname(db, device_in.hostname):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Device with this hostname already exists"
            )
    if device_in.ip_address and device_in.ip_address != dev.ip_address:
        if await device.get_by_ip_address(db, device_in.ip_address):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Device with this IP address already exists"
            )
    if device_in.mac_address and device_in.mac_address != dev.mac_address:
        if await device.get_by_mac_address(db, device_in.mac_address):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Device with this MAC address already exists"
            )
    if device_in.serial_number and device_in.serial_number != dev.serial_number:
        if await device.get_by_serial_number(db, device_in.serial_number):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Device with this serial number already exists"
            )
    
    return await device.update(db, dev, device_in)


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(
    device_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a device."""
    dev = await device.get(db, device_id)
    if not dev:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    await device.delete(db, device_id)
    return None
