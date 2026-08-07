"""
GNS3 Integration API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import logging

from app.database import get_db
from app.gns3.client import GNS3Client
from app.schemas.gns3 import GNS3Project, GNS3Node, SyncResult
from app.crud.device import device
from app.crud.location import location
from app.schemas.device import DeviceCreate, DeviceType, DeviceStatus
from app.schemas.location import LocationCreate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/gns3", tags=["GNS3 Integration"])


@router.get("/projects", response_model=List[GNS3Project])
async def list_gns3_projects():
    """List all GNS3 projects."""
    try:
        client = GNS3Client()
        projects = await client.get_projects()
        return projects
    except Exception as e:
        logger.error(f"Error fetching GNS3 projects: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch GNS3 projects: {str(e)}")


@router.get("/projects/{project_id}", response_model=GNS3Project)
async def get_gns3_project(project_id: str):
    """Get a specific GNS3 project."""
    try:
        client = GNS3Client()
        project = await client.get_project(project_id)
        return project
    except Exception as e:
        logger.error(f"Error fetching GNS3 project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch GNS3 project: {str(e)}")


@router.get("/nodes/{project_id}", response_model=List[GNS3Node])
async def list_gns3_nodes(project_id: str):
    """List all nodes in a GNS3 project."""
    try:
        client = GNS3Client()
        nodes = await client.get_nodes(project_id)
        return nodes
    except Exception as e:
        logger.error(f"Error fetching GNS3 nodes for project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch GNS3 nodes: {str(e)}")


@router.post("/sync/{project_id}", response_model=SyncResult)
async def sync_gns3_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    create_location: bool = True,
    location_name: str = "GNS3 Imported"
):
    """
    Sync devices from a GNS3 project to NDIM database.
    
    This endpoint:
    1. Fetches all nodes from the GNS3 project
    2. Creates a location for the project (optional)
    3. Imports network devices as NDIM devices
    """
    try:
        client = GNS3Client()
        
        # Get project info
        project = await client.get_project(project_id)
        
        # Get all nodes
        nodes = await client.get_nodes(project_id)
        
        # Filter for network device types (routers, switches, etc.)
        network_device_types = [
            "c7200", "c3745", "c3600", "c2691", "c2600", "c1700",  # Cisco routers
            "vpcs", "docker", "qemu", "vmware", "virtualbox",  # Virtual devices
            "iou", "iols",  # Cisco IOU/IOL
            "dynamips",  # Dynamips devices
        ]
        
        # Create location if requested
        location_id = None
        if create_location:
            # Check if location already exists
            existing_location = await location.get_by_site_name(db, location_name)
            if existing_location:
                location_id = existing_location.id
            else:
                location_data = LocationCreate(
                    site_name=location_name,
                    building_rack=f"GNS3 Project: {project['name']}",
                    description=f"Auto-imported from GNS3 project {project_id}"
                )
                created_location = await location.create(db, obj_in=location_data)
                location_id = created_location.id
        
        # Import devices
        synced_count = 0
        skipped_count = 0
        errors = []
        
        for node in nodes:
            # Skip non-network devices
            node_type = node.get("type", "")
            node_node_type = node.get("node_type", "")
            
            if node_node_type not in network_device_types and node_type not in network_device_types:
                skipped_count += 1
                continue
            
            try:
                # Map GNS3 node types to NDIM device types
                device_type = DeviceType.SERVER
                if "router" in node_type.lower() or node_node_type in ["c7200", "c3745", "c3600", "c2691", "c2600", "c1700", "dynamips"]:
                    device_type = DeviceType.ROUTER
                elif "switch" in node_type.lower():
                    device_type = DeviceType.SWITCH
                elif "firewall" in node_type.lower():
                    device_type = DeviceType.FIREWALL
                
                # Extract MAC address from first port if available
                mac_address = None
                if node.get("ports") and len(node["ports"]) > 0:
                    mac_address = node["ports"][0].get("mac_address")
                
                # Generate unique MAC address if not available
                if not mac_address or mac_address == "00:00:00:00:00:00":
                    # Use node_id to generate a unique MAC-like address
                    import hashlib
                    node_hash = hashlib.md5(node["node_id"].encode()).hexdigest()[:12]
                    mac_address = ":".join([node_hash[i:i+2] for i in range(0, 12, 2)])
                
                # Extract vendor from properties
                vendor = node.get("properties", {}).get("platform", "Unknown")
                if not vendor or vendor == "Unknown":
                    vendor = node.get("properties", {}).get("image", "Unknown").split("/")[0] if node.get("properties", {}).get("image") else "GNS3"
                
                # Create device
                device_data = DeviceCreate(
                    hostname=node["name"],
                    ip_address="0.0.0.0",  # GNS3 doesn't always provide IP
                    mac_address=mac_address,
                    device_type=device_type,
                    vendor=vendor,
                    model=node.get("properties", {}).get("platform", "Unknown"),
                    serial_number=node["node_id"],  # Use node_id as serial
                    firmware_version=node.get("properties", {}).get("image", ""),
                    status=DeviceStatus.ACTIVE if node["status"] == "started" else DeviceStatus.OFFLINE,
                    location_id=location_id
                )
                
                # Check if device already exists by serial number (node_id)
                existing_device = await device.get_by_serial_number(db, serial_number=node["node_id"])
                if existing_device:
                    # Update existing device
                    await device.update(db, db_obj=existing_device, obj_in=device_data)
                    synced_count += 1
                else:
                    # Create new device
                    await device.create(db, obj_in=device_data)
                    synced_count += 1
                    
            except Exception as e:
                logger.error(f"Error syncing node {node['name']}: {e}")
                errors.append(f"Node {node['name']}: {str(e)}")
                skipped_count += 1
                # Rollback transaction on error to continue with next node
                await db.rollback()
        
        return SyncResult(
            synced_devices=synced_count,
            skipped_devices=skipped_count,
            errors=errors,
            project_name=project["name"],
            project_id=project_id
        )
        
    except Exception as e:
        logger.error(f"Error syncing GNS3 project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to sync GNS3 project: {str(e)}")
