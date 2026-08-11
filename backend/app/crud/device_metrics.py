from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.crud.base import CRUDBase
from app.models.device_metrics import DeviceMetrics
from app.schemas.device_metrics import DeviceMetricsCreate, DeviceMetricsUpdate


class CRUDDeviceMetrics(CRUDBase[DeviceMetrics, DeviceMetricsCreate, DeviceMetricsUpdate]):
    """CRUD operations for device metrics."""
    
    async def get_by_device(
        self, 
        db: AsyncSession, 
        device_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[DeviceMetrics]:
        """Get metrics for a specific device with pagination."""
        result = await db.execute(
            select(DeviceMetrics)
            .where(DeviceMetrics.device_id == device_id)
            .order_by(DeviceMetrics.timestamp.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_device_and_time_range(
        self,
        db: AsyncSession,
        device_id: int,
        start_time: datetime,
        end_time: datetime,
        skip: int = 0,
        limit: int = 100
    ) -> List[DeviceMetrics]:
        """Get metrics for a specific device within a time range."""
        result = await db.execute(
            select(DeviceMetrics)
            .where(
                and_(
                    DeviceMetrics.device_id == device_id,
                    DeviceMetrics.timestamp >= start_time,
                    DeviceMetrics.timestamp <= end_time
                )
            )
            .order_by(DeviceMetrics.timestamp.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_latest_by_device(
        self,
        db: AsyncSession,
        device_id: int
    ) -> Optional[DeviceMetrics]:
        """Get the most recent metrics for a specific device."""
        result = await db.execute(
            select(DeviceMetrics)
            .where(DeviceMetrics.device_id == device_id)
            .order_by(DeviceMetrics.timestamp.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def get_summary_stats(
        self,
        db: AsyncSession,
        device_id: int,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> dict:
        """Get summary statistics for a device's metrics."""
        query = select(DeviceMetrics).where(DeviceMetrics.device_id == device_id)
        
        if start_time:
            query = query.where(DeviceMetrics.timestamp >= start_time)
        if end_time:
            query = query.where(DeviceMetrics.timestamp <= end_time)
        
        result = await db.execute(query)
        metrics = result.scalars().all()
        
        if not metrics:
            return {
                "device_id": device_id,
                "avg_cpu_usage": 0,
                "max_cpu_usage": 0,
                "min_cpu_usage": 0,
                "avg_memory_usage": 0,
                "max_memory_usage": 0,
                "min_memory_usage": 0,
                "sample_count": 0
            }
        
        cpu_values = [m.cpu_usage for m in metrics]
        memory_values = [m.memory_usage for m in metrics]
        
        return {
            "device_id": device_id,
            "avg_cpu_usage": sum(cpu_values) / len(cpu_values),
            "max_cpu_usage": max(cpu_values),
            "min_cpu_usage": min(cpu_values),
            "avg_memory_usage": sum(memory_values) / len(memory_values),
            "max_memory_usage": max(memory_values),
            "min_memory_usage": min(memory_values),
            "sample_count": len(metrics)
        }
    
    async def delete_old_metrics(
        self,
        db: AsyncSession,
        days_to_keep: int = 30
    ) -> int:
        """Delete metrics older than specified days."""
        cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
        result = await db.execute(
            select(DeviceMetrics).where(DeviceMetrics.timestamp < cutoff_date)
        )
        old_metrics = result.scalars().all()
        
        count = len(old_metrics)
        for metric in old_metrics:
            await db.delete(metric)
        
        await db.commit()
        return count
    
    async def create(
        self, 
        db: AsyncSession, 
        obj_in: DeviceMetricsCreate
    ) -> DeviceMetrics:
        """Create a new metrics record."""
        obj_in_data = obj_in.model_dump() if hasattr(obj_in, 'model_dump') else obj_in.dict()
        # Set timestamp to current time if not provided
        if 'timestamp' not in obj_in_data or obj_in_data['timestamp'] is None:
            obj_in_data['timestamp'] = datetime.utcnow()
        
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


device_metrics = CRUDDeviceMetrics(DeviceMetrics)
