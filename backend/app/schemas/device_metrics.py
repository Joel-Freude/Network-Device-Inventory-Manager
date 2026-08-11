from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.base import BaseSchema


class DeviceMetricsBase(BaseModel):
    """Base device metrics schema."""
    device_id: int = Field(..., description="Device ID")
    cpu_usage: float = Field(..., ge=0, le=100, description="CPU usage percentage (0-100)")
    memory_usage: float = Field(..., ge=0, le=100, description="Memory usage percentage (0-100)")
    load_average_1m: Optional[float] = Field(None, description="1-minute load average")
    load_average_5m: Optional[float] = Field(None, description="5-minute load average")
    load_average_15m: Optional[float] = Field(None, description="15-minute load average")
    network_in: Optional[float] = Field(None, ge=0, description="Network input in MB/s")
    network_out: Optional[float] = Field(None, ge=0, description="Network output in MB/s")
    disk_usage: Optional[float] = Field(None, ge=0, le=100, description="Disk usage percentage (0-100)")


class DeviceMetricsCreate(DeviceMetricsBase):
    """Schema for creating device metrics."""
    timestamp: Optional[datetime] = None


class DeviceMetricsUpdate(BaseModel):
    """Schema for updating device metrics."""
    cpu_usage: Optional[float] = Field(None, ge=0, le=100)
    memory_usage: Optional[float] = Field(None, ge=0, le=100)
    load_average_1m: Optional[float] = None
    load_average_5m: Optional[float] = None
    load_average_15m: Optional[float] = None
    network_in: Optional[float] = Field(None, ge=0)
    network_out: Optional[float] = Field(None, ge=0)
    disk_usage: Optional[float] = Field(None, ge=0, le=100)


class DeviceMetricsResponse(BaseSchema):
    """Schema for device metrics response."""
    device_id: int
    cpu_usage: float
    memory_usage: float
    load_average_1m: Optional[float]
    load_average_5m: Optional[float]
    load_average_15m: Optional[float]
    network_in: Optional[float]
    network_out: Optional[float]
    disk_usage: Optional[float]
    timestamp: datetime


class DeviceMetricsSummary(BaseModel):
    """Schema for metrics summary statistics."""
    device_id: int
    avg_cpu_usage: float
    max_cpu_usage: float
    min_cpu_usage: float
    avg_memory_usage: float
    max_memory_usage: float
    min_memory_usage: float
    sample_count: int
