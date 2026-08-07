from datetime import datetime
from pydantic import BaseModel


class BaseSchema(BaseModel):
    """Base schema with common fields."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
