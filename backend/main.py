from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal
import random
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

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
    Device(id="dev-001", hostname="core-sw-nyc01", ip=random_public_ip(), vendor="Juniper", model="QFX5120", site="New York DC", lat=40.7128, lng=-74.0060, status="online"),
    Device(id="dev-002", hostname="edge-rtr-nyc01", ip=random_public_ip(), vendor="Cisco", model="ASR 9001", site="New York DC", lat=40.7128, lng=-74.0060, status="online"),
    Device(id="dev-003", hostname="fw-nyc01", ip=random_public_ip(), vendor="Palo Alto", model="PA-5200", site="New York DC", lat=40.7128, lng=-74.0060, status="warning"),
    Device(id="dev-004", hostname="srv-nyc01", ip=random_public_ip(), vendor="Dell", model="PowerEdge R750", site="New York DC", lat=40.7128, lng=-74.0060, status="online"),
    Device(id="dev-005", hostname="ap-nyc01", ip=random_public_ip(), vendor="Cisco", model="Catalyst 9300", site="New York DC", lat=40.7128, lng=-74.0060, status="online"),
    Device(id="dev-006", hostname="core-sw-lon01", ip=random_public_ip(), vendor="Arista", model="7060CX2", site="London DC", lat=51.5074, lng=-0.1278, status="online"),
    Device(id="dev-007", hostname="edge-rtr-lon01", ip=random_public_ip(), vendor="Cisco", model="ASR 9001", site="London DC", lat=51.5074, lng=-0.1278, status="online"),
    Device(id="dev-008", hostname="fw-lon01", ip=random_public_ip(), vendor="Fortinet", model="FortiGate 600E", site="London DC", lat=51.5074, lng=-0.1278, status="online"),
    Device(id="dev-009", hostname="srv-lon01", ip=random_public_ip(), vendor="HP", model="ProLiant DL380", site="London DC", lat=51.5074, lng=-0.1278, status="warning"),
    Device(id="dev-010", hostname="sw-lon01", ip=random_public_ip(), vendor="Juniper", model="EX4300", site="London DC", lat=51.5074, lng=-0.1278, status="online"),
    Device(id="dev-011", hostname="acc-lon01", ip=random_public_ip(), vendor="Ubiquiti", model="U6 Pro", site="London DC", lat=51.5074, lng=-0.1278, status="offline"),
    Device(id="dev-012", hostname="core-sw-tky01", ip=random_public_ip(), vendor="Cisco", model="Nexus 9300", site="Tokyo DC", lat=35.6762, lng=139.6503, status="online"),
    Device(id="dev-013", hostname="edge-rtr-tky01", ip=random_public_ip(), vendor="Juniper", model="MX204", site="Tokyo DC", lat=35.6762, lng=139.6503, status="online"),
    Device(id="dev-014", hostname="fw-tky01", ip=random_public_ip(), vendor="Palo Alto", model="PA-5200", site="Tokyo DC", lat=35.6762, lng=139.6503, status="warning"),
    Device(id="dev-015", hostname="srv-tky01", ip=random_public_ip(), vendor="Dell", model="PowerEdge R750", site="Tokyo DC", lat=35.6762, lng=139.6503, status="online"),
    Device(id="dev-016", hostname="core-sw-syd01", ip=random_public_ip(), vendor="Arista", model="7280R", site="Sydney DC", lat=-33.8688, lng=151.2093, status="online"),
    Device(id="dev-017", hostname="edge-rtr-syd01", ip=random_public_ip(), vendor="Cisco", model="ASR 9001", site="Sydney DC", lat=-33.8688, lng=151.2093, status="online"),
    Device(id="dev-018", hostname="fw-syd01", ip=random_public_ip(), vendor="Fortinet", model="FortiGate 100F", site="Sydney DC", lat=-33.8688, lng=151.2093, status="online"),
    Device(id="dev-019", hostname="srv-syd01", ip=random_public_ip(), vendor="HP", model="ProLiant DL380", site="Sydney DC", lat=-33.8688, lng=151.2093, status="warning"),
    Device(id="dev-020", hostname="sw-syd01", ip=random_public_ip(), vendor="Juniper", model="EX4300", site="Sydney DC", lat=-33.8688, lng=151.2093, status="online"),
    Device(id="dev-021", hostname="core-sw-par01", ip=random_public_ip(), vendor="Cisco", model="Catalyst 9500", site="Paris DC", lat=48.8566, lng=2.3522, status="online"),
    Device(id="dev-022", hostname="edge-rtr-par01", ip=random_public_ip(), vendor="Juniper", model="MX204", site="Paris DC", lat=48.8566, lng=2.3522, status="online"),
    Device(id="dev-023", hostname="fw-par01", ip=random_public_ip(), vendor="Palo Alto", model="PA-5200", site="Paris DC", lat=48.8566, lng=2.3522, status="online"),
    Device(id="dev-024", hostname="srv-par01", ip=random_public_ip(), vendor="Dell", model="PowerEdge R750", site="Paris DC", lat=48.8566, lng=2.3522, status="online"),
    Device(id="dev-025", hostname="sw-par01", ip=random_public_ip(), vendor="Arista", model="7060CX2", site="Paris DC", lat=48.8566, lng=2.3522, status="online"),
    Device(id="dev-026", hostname="ap-par01", ip=random_public_ip(), vendor="Ubiquiti", model="U6 Pro", site="Paris DC", lat=48.8566, lng=2.3522, status="online"),
    Device(id="dev-027", hostname="srv-par02", ip=random_public_ip(), vendor="HP", model="ProLiant DL380", site="Paris DC", lat=48.8566, lng=2.3522, status="warning"),
    Device(id="dev-028", hostname="fw-par02", ip=random_public_ip(), vendor="Fortinet", model="FortiGate 100F", site="Paris DC", lat=48.8566, lng=2.3522, status="online"),
    Device(id="dev-029", hostname="core-sw-ber01", ip=random_public_ip(), vendor="Cisco", model="Nexus 9300", site="Berlin DC", lat=52.52, lng=13.405, status="online"),
    Device(id="dev-030", hostname="edge-rtr-ber01", ip=random_public_ip(), vendor="Juniper", model="MX204", site="Berlin DC", lat=52.52, lng=13.405, status="online"),
    Device(id="dev-031", hostname="fw-ber01", ip=random_public_ip(), vendor="Palo Alto", model="PA-5200", site="Berlin DC", lat=52.52, lng=13.405, status="online"),
    Device(id="dev-032", hostname="srv-ber01", ip=random_public_ip(), vendor="Dell", model="PowerEdge R750", site="Berlin DC", lat=52.52, lng=13.405, status="online"),
    Device(id="dev-033", hostname="sw-ber01", ip=random_public_ip(), vendor="Arista", model="7280R", site="Berlin DC", lat=52.52, lng=13.405, status="online"),
    Device(id="dev-034", hostname="ap-ber01", ip=random_public_ip(), vendor="Ubiquiti", model="U6 Pro", site="Berlin DC", lat=52.52, lng=13.405, status="online"),
    Device(id="dev-035", hostname="srv-ber02", ip=random_public_ip(), vendor="HP", model="ProLiant DL380", site="Berlin DC", lat=52.52, lng=13.405, status="warning"),
    Device(id="dev-036", hostname="fw-ber02", ip=random_public_ip(), vendor="Fortinet", model="FortiGate 600E", site="Berlin DC", lat=52.52, lng=13.405, status="offline"),
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


LATLNG_API_KEY = os.environ.get("LATLNG_API_KEY", "")
LATLNG_BASE_URL = "https://api.latlng.work"


@app.get("/api/geocode")
async def geocode(q: str):
    if not LATLNG_API_KEY:
        return {"error": "missing_api_key", "features": []}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{LATLNG_BASE_URL}/api",
                params={"q": q},
                headers={"X-Api-Key": LATLNG_API_KEY},
            )
            resp.raise_for_status()
            return resp.json()
    except Exception as exc:
        return {"error": str(exc), "features": []}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)