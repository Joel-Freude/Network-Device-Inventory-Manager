"""
GNS3 API Client for interacting with GNS3 server.
"""
import httpx
from typing import List, Dict, Any, Optional
from app.config import settings


class GNS3Client:
    """Client for GNS3 API interactions."""
    
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or settings.gns3_server_url
        if not self.base_url:
            raise ValueError("GNS3_SERVER_URL not configured in environment variables")
        
        # Remove trailing slash
        self.base_url = self.base_url.rstrip("/")
    
    async def get_projects(self) -> List[Dict[str, Any]]:
        """Get all GNS3 projects."""
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(f"{self.base_url}/v2/projects")
            response.raise_for_status()
            return response.json()
    
    async def get_project(self, project_id: str) -> Dict[str, Any]:
        """Get a specific GNS3 project."""
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(f"{self.base_url}/v2/projects/{project_id}")
            response.raise_for_status()
            return response.json()
    
    async def get_nodes(self, project_id: str) -> List[Dict[str, Any]]:
        """Get all nodes in a GNS3 project."""
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(f"{self.base_url}/v2/projects/{project_id}/nodes")
            response.raise_for_status()
            return response.json()
    
    async def get_node(self, project_id: str, node_id: str) -> Dict[str, Any]:
        """Get a specific node in a GNS3 project."""
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(f"{self.base_url}/v2/projects/{project_id}/nodes/{node_id}")
            response.raise_for_status()
            return response.json()
    
    async def get_links(self, project_id: str) -> List[Dict[str, Any]]:
        """Get all links in a GNS3 project."""
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(f"{self.base_url}/v2/projects/{project_id}/links")
            response.raise_for_status()
            return response.json()
    
    async def start_project(self, project_id: str) -> Dict[str, Any]:
        """Start a GNS3 project."""
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.post(f"{self.base_url}/v2/projects/{project_id}/start")
            response.raise_for_status()
            return response.json()
    
    async def stop_project(self, project_id: str) -> Dict[str, Any]:
        """Stop a GNS3 project."""
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.post(f"{self.base_url}/v2/projects/{project_id}/stop")
            response.raise_for_status()
            return response.json()
