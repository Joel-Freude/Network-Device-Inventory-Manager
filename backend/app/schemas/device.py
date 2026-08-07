from pydantic import BaseModel, Field, validator
from typing import Optional, Any
from datetime import datetime
from app.schemas.base import BaseSchema
from app.models.device import DeviceType, DeviceStatus
import re
from ipaddress import IPv4Address, IPv6Address


class DeviceBase(BaseModel):
    """Base device schema."""
    hostname: str = Field(..., min_length=1, max_length=255)
    ip_address: str = Field(..., description="IPv4 or IPv6 address")
    mac_address: str = Field(..., description="MAC address in any format")
    device_type: DeviceType
    vendor: str = Field(..., min_length=1, max_length=255)
    model: str = Field(..., min_length=1, max_length=255)
    serial_number: str = Field(..., min_length=1, max_length=255)
    firmware_version: Optional[str] = Field(None, max_length=255)
    status: DeviceStatus = DeviceStatus.ACTIVE
    location_id: Optional[int] = None
    
    @validator('mac_address')
    def normalize_mac_address(cls, v):
        """Normalize MAC address to XX:XX:XX:XX:XX:XX format."""
        # Remove all non-hex characters
        cleaned = re.sub(r'[^a-fA-F0-9]', '', v)
        if len(cleaned) != 12:
            raise ValueError('Invalid MAC address format')
        # Format as XX:XX:XX:XX:XX:XX
        return ':'.join([cleaned[i:i+2].upper() for i in range(0, 12, 2)])


class DeviceCreate(DeviceBase):
    """Schema for creating a device."""
    pass


class DeviceUpdate(BaseModel):
    """Schema for updating a device."""
    hostname: Optional[str] = Field(None, min_length=1, max_length=255)
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    device_type: Optional[DeviceType] = None
    vendor: Optional[str] = Field(None, min_length=1, max_length=255)
    model: Optional[str] = Field(None, min_length=1, max_length=255)
    serial_number: Optional[str] = Field(None, min_length=1, max_length=255)
    firmware_version: Optional[str] = Field(None, max_length=255)
    status: Optional[DeviceStatus] = None
    location_id: Optional[int] = None
    
    @validator('mac_address')
    def normalize_mac_address(cls, v):
        """Normalize MAC address to XX:XX:XX:XX:XX:XX format."""
        if v is None:
            return v
        cleaned = re.sub(r'[^a-fA-F0-9]', '', v)
        if len(cleaned) != 12:
            raise ValueError('Invalid MAC address format')
        return ':'.join([cleaned[i:i+2].upper() for i in range(0, 12, 2)])


class DeviceResponse(BaseSchema):
    """Schema for device response."""
    hostname: str
    ip_address: str
    mac_address: str
    device_type: DeviceType
    vendor: str
    model: str
    serial_number: str
    firmware_version: Optional[str]
    status: DeviceStatus
    location_id: Optional[int]
    
    @validator('ip_address', pre=True)
    def convert_ip_address(cls, v):
        """Convert IP address to string."""
        if isinstance(v, (IPv4Address, IPv6Address)):
            return str(v)
        return v
