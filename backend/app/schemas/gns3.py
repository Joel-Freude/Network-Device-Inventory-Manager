"""
Pydantic schemas for GNS3 API responses.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class GNS3Project(BaseModel):
    """GNS3 Project schema."""
    project_id: str = Field(..., alias="project_id")
    name: str
    path: str
    status: str
    filename: str
    auto_start: bool = False
    auto_close: bool = True
    auto_open: bool = False
    scene_height: int = 2000
    scene_width: int = 2000
    zoom: int = 100
    show_grid: bool = True
    show_interface_labels: bool = True
    snap_to_grid: bool = True
    show_layers: bool = False
    grid_size: int = 50
    drawing_grid_size: int = 25
    supplier: Optional[str] = None
    variables: Optional[Dict[str, Any]] = None
    
    class Config:
        populate_by_name = True


class GNS3Port(BaseModel):
    """GNS3 Port schema."""
    adapter_number: int
    port_number: int
    name: str
    short_name: str
    type: str
    mac_address: Optional[str] = None
    link_type: str = "ethernet"
    data_link_types: List[str] = []
    mtu: Optional[int] = None
    interface_number: Optional[int] = None


class GNS3Node(BaseModel):
    """GNS3 Node schema."""
    node_id: str = Field(..., alias="node_id")
    project_id: str = Field(..., alias="project_id")
    type: str
    name: str
    status: str
    console_host: Optional[str] = None
    console_port: Optional[int] = None
    console_type: Optional[str] = None
    properties: Dict[str, Any] = {}
    port_name_format: str = "Ethernet{0}"
    port_segment_size: int = 0
    first_port_name: Optional[str] = None
    ports: List[GNS3Port] = []
    label: Optional[Dict[str, Any]] = None
    x: int = 0
    y: int = 0
    z: int = 0
    width: int = 0
    height: int = 0
    symbol: Optional[str] = None
    locked: bool = False
    compute_id: Optional[str] = None
    
    class Config:
        populate_by_name = True


class GNS3Link(BaseModel):
    """GNS3 Link schema."""
    link_id: str = Field(..., alias="link_id")
    project_id: str = Field(..., alias="project_id")
    nodes: List[Dict[str, Any]] = []
    link_type: str = "ethernet"
    capturing: bool = False
    suspend: bool = False
    
    class Config:
        populate_by_name = True


class SyncResult(BaseModel):
    """Result of GNS3 sync operation."""
    synced_devices: int
    skipped_devices: int
    errors: List[str] = []
    project_name: str
    project_id: str
