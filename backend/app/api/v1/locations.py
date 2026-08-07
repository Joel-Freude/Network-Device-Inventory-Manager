from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.schemas.location import LocationCreate, LocationUpdate, LocationResponse
from app.crud.location import location

router = APIRouter(prefix="/locations", tags=["locations"])


@router.get("/", response_model=List[LocationResponse])
async def get_locations(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Get all locations with pagination."""
    locations = await location.get_multi(db, skip=skip, limit=limit)
    return locations


@router.post("/", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
async def create_location(
    location_in: LocationCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new location."""
    # Check if location with same site name exists
    existing = await location.get_by_site_name(db, location_in.site_name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location with this site name already exists"
        )
    
    return await location.create(db, location_in)


@router.get("/{location_id}", response_model=LocationResponse)
async def get_location(
    location_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific location by ID."""
    loc = await location.get(db, location_id)
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    return loc


@router.put("/{location_id}", response_model=LocationResponse)
async def update_location(
    location_id: int,
    location_in: LocationUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a location."""
    loc = await location.get(db, location_id)
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    # Check if updating site_name and it conflicts with existing
    if location_in.site_name:
        existing = await location.get_by_site_name(db, location_in.site_name)
        if existing and existing.id != location_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Location with this site name already exists"
            )
    
    return await location.update(db, loc, location_in)


@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_location(
    location_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a location."""
    loc = await location.get(db, location_id)
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    await location.delete(db, location_id)
    return None
