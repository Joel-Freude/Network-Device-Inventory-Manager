from sqlalchemy import String, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import INET, MACADDR
from enum import Enum
from app.models.base import BaseModel
from app.models.location import Location


class DeviceType(str, Enum):
    """Device type enumeration."""
    ROUTER = "router"
    SWITCH = "switch"
    FIREWALL = "firewall"
    ACCESS_POINT = "access_point"
    SERVER = "server"


class DeviceStatus(str, Enum):
    """Device status enumeration."""
    ACTIVE = "active"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"
    DECOMMISSIONED = "decommissioned"


class Device(BaseModel):
    """Device model for network hardware assets."""
    __tablename__ = "devices"
    
    hostname: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False, index=True)  # Changed from INET to String to avoid issues
    mac_address: Mapped[str] = mapped_column(String(17), nullable=False, index=True)  # Changed from MACADDR to String
    device_type: Mapped[DeviceType] = mapped_column(SQLEnum(DeviceType), nullable=False)
    vendor: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    model: Mapped[str] = mapped_column(String(255), nullable=False)
    serial_number: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    firmware_version: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[DeviceStatus] = mapped_column(SQLEnum(DeviceStatus), default=DeviceStatus.ACTIVE, nullable=False, index=True)
    location_id: Mapped[int] = mapped_column(Integer, ForeignKey("locations.id"), nullable=True, index=True)
    
    # Relationship
    location: Mapped["Location"] = relationship("Location", backref="devices")
    
    @property
    def ip_address_str(self) -> str:
        """Convert IP address to string."""
        if isinstance(self.ip_address, (IPv4Address, IPv6Address)):
            return str(self.ip_address)
        return self.ip_address
