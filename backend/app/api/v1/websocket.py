"""
WebSocket endpoint for real-time CPU metrics broadcasting.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import asyncio
import json
import random
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.device import Device, DeviceStatus

router = APIRouter()

class ConnectionManager:
    """Manages WebSocket connections for real-time broadcasting."""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Connection added. Total active connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        try:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
                print(f"Connection removed. Total active connections: {len(self.active_connections)}")
        except ValueError:
            print("Attempted to remove connection that was not in active connections")
    
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast message to all connected clients."""
        if not self.active_connections:
            return
            
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending to connection: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

async def generate_mock_metrics(device_id: int, device_type: str) -> Dict[str, Any]:
    """Generate mock CPU metrics for demonstration (replace with real SNMP/SSH collection)."""
    # Simulate realistic CPU patterns based on device type
    base_cpu = random.uniform(10, 40) if device_type == "server" else random.uniform(5, 25)
    cpu_spike = random.uniform(0, 30) if random.random() < 0.1 else 0
    
    return {
        "device_id": device_id,
        "cpu_usage": min(100, base_cpu + cpu_spike),
        "memory_usage": random.uniform(30, 80),
        "load_average_1m": random.uniform(0.5, 3.0),
        "load_average_5m": random.uniform(0.3, 2.5),
        "load_average_15m": random.uniform(0.2, 2.0),
        "network_in": random.uniform(0, 100),
        "network_out": random.uniform(0, 50),
        "disk_usage": random.uniform(40, 90),
        "timestamp": datetime.utcnow().isoformat()
    }

async def metrics_background_task():
    """Background task to collect and broadcast CPU metrics every 100ms."""
    print("Starting metrics background task...")
    while True:
        try:
            # Get database session
            db_gen = get_db()
            db = await db_gen.__anext__()
            
            try:
                result = await db.execute(
                    select(Device).where(Device.status == DeviceStatus.ACTIVE)
                )
                devices = result.scalars().all()
                
                # Generate and broadcast metrics for each device
                for device in devices:
                    metrics = await generate_mock_metrics(device.id, device.device_type)
                    await manager.broadcast(metrics)
                
            except Exception as e:
                print(f"Error in metrics collection loop: {e}")
            finally:
                await db.close()
                try:
                    await db_gen.aclose()
                except:
                    pass
                
        except Exception as e:
            print(f"Error in metrics background task: {e}")
        
        # Wait 100ms before next collection
        await asyncio.sleep(0.1)

@router.websocket("/ws/cpu-metrics")
async def websocket_cpu_metrics(websocket: WebSocket):
    """WebSocket endpoint for real-time CPU metrics."""
    print(f"New WebSocket connection attempt from {websocket.client}")
    
    try:
        await websocket.accept()
        print(f"WebSocket connection accepted for {websocket.client}")
        
        # Add to manager
        manager.active_connections.append(websocket)
        print(f"Connection added. Total active connections: {len(manager.active_connections)}")
        
        # Send initial connection confirmation
        await websocket.send_json({"status": "connected", "message": "CPU metrics streaming active"})
        print("Sent initial connection confirmation")
        
        try:
            while True:
                # Keep connection alive and handle client messages if needed
                try:
                    data = await asyncio.wait_for(websocket.receive_text(), timeout=1.0)
                    print(f"Received message from client: {data}")
                    # Echo back or handle client commands
                    await websocket.send_json({"status": "received", "message": data})
                except asyncio.TimeoutError:
                    # Send periodic ping to keep connection alive
                    await websocket.send_json({"type": "ping"})
                
        except WebSocketDisconnect:
            print(f"WebSocket disconnected normally: {websocket.client}")
            if websocket in manager.active_connections:
                manager.active_connections.remove(websocket)
                print(f"Connection removed. Total active connections: {len(manager.active_connections)}")
        except Exception as e:
            print(f"WebSocket error during message handling: {e}")
            if websocket in manager.active_connections:
                manager.active_connections.remove(websocket)
                print(f"Connection removed due to error. Total active connections: {len(manager.active_connections)}")
            
    except Exception as e:
        print(f"WebSocket connection error: {e}")
        if websocket in manager.active_connections:
            manager.active_connections.remove(websocket)
