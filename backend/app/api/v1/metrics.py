from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.schemas.device_metrics import DeviceMetricsCreate, DeviceMetricsResponse, DeviceMetricsSummary
from app.crud.device_metrics import device_metrics
from app.models.device import Device

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.post("/", response_model=DeviceMetricsResponse, status_code=status.HTTP_201_CREATED)
async def create_metrics(
    metrics_in: DeviceMetricsCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create new device metrics."""
    # Verify device exists
    result = await db.execute(
        select(Device).where(Device.id == metrics_in.device_id)
    )
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    return await device_metrics.create(db, metrics_in)


@router.get("/device/{device_id}", response_model=List[DeviceMetricsResponse])
async def get_device_metrics(
    device_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get metrics for a specific device with optional time range filtering."""
    # Verify device exists
    result = await db.execute(
        select(Device).where(Device.id == device_id)
    )
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    if start_time and end_time:
        return await device_metrics.get_by_device_and_time_range(
            db, device_id, start_time, end_time, skip, limit
        )
    else:
        return await device_metrics.get_by_device(db, device_id, skip, limit)


@router.get("/device/{device_id}/latest", response_model=DeviceMetricsResponse)
async def get_latest_device_metrics(
    device_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get the most recent metrics for a specific device."""
    # Verify device exists
    result = await db.execute(
        select(Device).where(Device.id == device_id)
    )
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    metrics = await device_metrics.get_latest_by_device(db, device_id)
    if not metrics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No metrics found for this device"
        )
    
    return metrics


@router.get("/device/{device_id}/summary", response_model=DeviceMetricsSummary)
async def get_device_metrics_summary(
    device_id: int,
    hours: Optional[int] = Query(24, ge=1, le=720, description="Time range in hours (default: 24)"),
    db: AsyncSession = Depends(get_db)
):
    """Get summary statistics for a device's metrics over a time range."""
    # Verify device exists
    result = await db.execute(
        select(Device).where(Device.id == device_id)
    )
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(hours=hours)
    
    return await device_metrics.get_summary_stats(db, device_id, start_time, end_time)


@router.get("/", response_model=List[DeviceMetricsResponse])
async def get_all_metrics(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """Get all metrics with pagination."""
    return await device_metrics.get_multi(db, skip=skip, limit=limit)


@router.get("/{metrics_id}", response_model=DeviceMetricsResponse)
async def get_metrics(
    metrics_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific metrics record by ID."""
    metrics = await device_metrics.get(db, metrics_id)
    if not metrics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Metrics not found"
        )
    return metrics


@router.delete("/cleanup", status_code=status.HTTP_200_OK)
async def cleanup_old_metrics(
    days_to_keep: int = Query(30, ge=1, le=365, description="Number of days to keep metrics"),
    db: AsyncSession = Depends(get_db)
):
    """Delete metrics older than specified days."""
    count = await device_metrics.delete_old_metrics(db, days_to_keep)
    return {
        "message": f"Deleted {count} metrics records older than {days_to_keep} days",
        "deleted_count": count
    }
