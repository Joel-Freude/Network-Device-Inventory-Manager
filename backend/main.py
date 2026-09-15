from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal
import random

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


def random_public_ip() -> str:
    octets = [
        random.randint(1, 223),
        random.randint(0, 255),
        random.randint(0, 255),
        random.randint(1, 254),
    ]
    if octets[0] == 10 or (octets[0] == 172 and 16 <= octets[1] <= 31) or (octets[0] == 192 and octets[1] == 168):
        octets[1] = (octets[1] + 32) % 256
    return ".".join(map(str, octets))


random.seed(42)
DEVICES: list[Device] = [
    Device(id="dev-001", hostname="edge-rtr-fra01", ip=random_public_ip(), vendor="Cisco", model="ASR 9001", site="Frankfurt DC", lat=50.1109, lng=8.6821, status="online"),
    Device(id="dev-002", hostname="core-sw-nyc01", ip=random_public_ip(), vendor="Juniper", model="QFX5120", site="New York DC", lat=40.7128, lng=-74.0060, status="online"),
    Device(id="dev-003", hostname="edge-rtr-sgp01", ip=random_public_ip(), vendor="Cisco", model="ASR 9001", site="Singapore DC", lat=1.3521, lng=103.8198, status="warning"),
    Device(id="dev-004", hostname="fw-lon01", ip=random_public_ip(), vendor="Fortinet", model="FortiGate 600E", site="London DC", lat=51.5074, lng=-0.1278, status="online"),
    Device(id="dev-005", hostname="core-sw-sao01", ip=random_public_ip(), vendor="Arista", model="7280R", site="São Paulo DC", lat=-23.5505, lng=-46.6333, status="offline"),
    Device(id="dev-006", hostname="edge-rtr-syd01", ip=random_public_ip(), vendor="Juniper", model="MX204", site="Sydney DC", lat=-33.8688, lng=151.2093, status="online"),
    Device(id="dev-007", hostname="core-sw-yao01", ip=random_public_ip(), vendor="Cisco", model="Catalyst 9500", site="Yaoundé POP", lat=3.8480, lng=11.5021, status="online"),
    Device(id="dev-008", hostname="edge-rtr-dxb01", ip=random_public_ip(), vendor="Cisco", model="ASR 9001", site="Dubai DC", lat=25.2048, lng=55.2708, status="online"),
    Device(id="dev-009", hostname="srv-fra01", ip=random_public_ip(), vendor="Dell", model="PowerEdge R750", site="Frankfurt DC", lat=50.1109, lng=8.6821, status="online"),
    Device(id="dev-010", hostname="fw-fra01", ip=random_public_ip(), vendor="Fortinet", model="FortiGate 100F", site="Frankfurt DC", lat=50.1109, lng=8.6821, status="warning"),
    Device(id="dev-011", hostname="srv-nyc01", ip=random_public_ip(), vendor="HP", model="ProLiant DL380", site="New York DC", lat=40.7128, lng=-74.0060, status="online"),
    Device(id="dev-012", hostname="ap-nyc01", ip=random_public_ip(), vendor="Cisco", model="Catalyst 9300", site="New York DC", lat=40.7128, lng=-74.0060, status="online"),
    Device(id="dev-013", hostname="srv-sgp01", ip=random_public_ip(), vendor="Dell", model="PowerEdge R750", site="Singapore DC", lat=1.3521, lng=103.8198, status="warning"),
    Device(id="dev-014", hostname="fw-sgp01", ip=random_public_ip(), vendor="Palo Alto", model="PA-5200", site="Singapore DC", lat=1.3521, lng=103.8198, status="online"),
    Device(id="dev-015", hostname="srv-lon01", ip=random_public_ip(), vendor="HP", model="ProLiant DL380", site="London DC", lat=51.5074, lng=-0.1278, status="online"),
    Device(id="dev-016", hostname="sw-lon01", ip=random_public_ip(), vendor="Arista", model="7060CX2", site="London DC", lat=51.5074, lng=-0.1278, status="online"),
    Device(id="dev-017", hostname="srv-sao01", ip=random_public_ip(), vendor="Dell", model="PowerEdge R750", site="São Paulo DC", lat=-23.5505, lng=-46.6333, status="offline"),
    Device(id="dev-018", hostname="fw-sao01", ip=random_public_ip(), vendor="Fortinet", model="FortiGate 600E", site="São Paulo DC", lat=-23.5505, lng=-46.6333, status="offline"),
    Device(id="dev-019", hostname="srv-syd01", ip=random_public_ip(), vendor="HP", model="ProLiant DL380", site="Sydney DC", lat=-33.8688, lng=151.2093, status="online"),
    Device(id="dev-020", hostname="sw-syd01", ip=random_public_ip(), vendor="Cisco", model="Nexus 9300", site="Sydney DC", lat=-33.8688, lng=151.2093, status="online"),
    Device(id="dev-021", hostname="srv-yao01", ip=random_public_ip(), vendor="Dell", model="PowerEdge R750", site="Yaoundé POP", lat=3.8480, lng=11.5021, status="online"),
    Device(id="dev-022", hostname="fw-yao01", ip=random_public_ip(), vendor="Fortinet", model="FortiGate 100F", site="Yaoundé POP", lat=3.8480, lng=11.5021, status="online"),
    Device(id="dev-023", hostname="srv-dxb01", ip=random_public_ip(), vendor="HP", model="ProLiant DL380", site="Dubai DC", lat=25.2048, lng=55.2708, status="online"),
    Device(id="dev-024", hostname="sw-dxb01", ip=random_public_ip(), vendor="Arista", model="7280R", site="Dubai DC", lat=25.2048, lng=55.2708, status="warning"),
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