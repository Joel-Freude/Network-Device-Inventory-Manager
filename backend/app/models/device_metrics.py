from sqlalchemy import String, ForeignKey, Integer, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.models.base import BaseModel
from app.models.device import Device


class DeviceMetrics(BaseModel):
    """Device performance metrics model for CPU monitoring."""
    __tablename__ = "device_metrics"
    
    device_id: Mapped[int] = mapped_column(Integer, ForeignKey("devices.id"), nullable=False, index=True)
    cpu_usage: Mapped[float] = mapped_column(Float, nullable=False)  # CPU usage percentage (0-100)
    memory_usage: Mapped[float] = mapped_column(Float, nullable=False)  # Memory usage percentage (0-100)
    load_average_1m: Mapped[float] = mapped_column(Float, nullable=True)  # 1-minute load average
    load_average_5m: Mapped[float] = mapped_column(Float, nullable=True)  # 5-minute load average
    load_average_15m: Mapped[float] = mapped_column(Float, nullable=True)  # 15-minute load average
    network_in: Mapped[float] = mapped_column(Float, nullable=True)  # Network input in MB/s
    network_out: Mapped[float] = mapped_column(Float, nullable=True)  # Network output in MB/s
    disk_usage: Mapped[float] = mapped_column(Float, nullable=True)  # Disk usage percentage (0-100)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationship
    device: Mapped["Device"] = relationship("Device", backref="metrics")
