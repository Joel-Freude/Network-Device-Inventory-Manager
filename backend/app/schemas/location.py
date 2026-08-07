from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.base import BaseSchema


class LocationBase(BaseModel):
    """Base location schema."""
    site_name: str = Field(..., min_length=1, max_length=255)
    building_rack: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class LocationCreate(LocationBase):
    """Schema for creating a location."""
    pass


class LocationUpdate(BaseModel):
    """Schema for updating a location."""
    site_name: Optional[str] = Field(None, min_length=1, max_length=255)
    building_rack: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class LocationResponse(BaseSchema, LocationBase):
    """Schema for location response."""
    pass
