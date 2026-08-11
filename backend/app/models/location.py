from sqlalchemy import String, Text, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import BaseModel


class Location(BaseModel):
    """Location model for sites, buildings, and racks."""
    __tablename__ = "locations"
    
    site_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    building_rack: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
