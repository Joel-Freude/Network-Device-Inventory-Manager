from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal

app = FastAPI(title="Network Device Inventory Manager API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Device(BaseModel):
    id: str
    hostname: str
    ip: str
    vendor: str
    model: str
    site: str
    lat: float
    lng: float
    status: Literal["online", "warning", "offline"]


# In-memory seed data until a real DB layer exists. Swap this for a
# PostgreSQL-backed repository once the `db/` layer lands — the shape of
# Device is what the frontend globe consumes, so keep it stable.
DEVICES: list[Device] = [
    Device(id="dev-001", hostname="edge-rtr-fra01", ip="10.10.1.1", vendor="Cisco", model="ASR 9001", site="Frankfurt DC", lat=50.1109, lng=8.6821, status="online"),
    Device(id="dev-002", hostname="core-sw-nyc01", ip="10.20.1.1", vendor="Juniper", model="QFX5120", site="New York DC", lat=40.7128, lng=-74.0060, status="online"),
    Device(id="dev-003", hostname="edge-rtr-sgp01", ip="10.30.1.1", vendor="Cisco", model="ASR 9001", site="Singapore DC", lat=1.3521, lng=103.8198, status="warning"),
    Device(id="dev-004", hostname="fw-lon01", ip="10.40.1.1", vendor="Fortinet", model="FortiGate 600E", site="London DC", lat=51.5074, lng=-0.1278, status="online"),
    Device(id="dev-005", hostname="core-sw-sao01", ip="10.50.1.1", vendor="Arista", model="7280R", site="São Paulo DC", lat=-23.5505, lng=-46.6333, status="offline"),
    Device(id="dev-006", hostname="edge-rtr-syd01", ip="10.60.1.1", vendor="Juniper", model="MX204", site="Sydney DC", lat=-33.8688, lng=151.2093, status="online"),
    Device(id="dev-007", hostname="core-sw-yao01", ip="10.70.1.1", vendor="Cisco", model="Catalyst 9500", site="Yaoundé POP", lat=3.8480, lng=11.5021, status="online"),
]


@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Backend is running"}


@app.get("/api/devices")
async def get_devices():
    return {
        "devices": [d.model_dump() for d in DEVICES],
        "total": len(DEVICES),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)