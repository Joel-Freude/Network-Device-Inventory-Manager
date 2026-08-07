from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.api.v1 import locations, devices, analytics, gns3, websocket
from app.database import engine, Base
import asyncio

# Create FastAPI app
app = FastAPI(
    title="NDIM API",
    description="Network Device Inventory Manager - Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(locations.router, prefix="/api/v1")
app.include_router(devices.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(gns3.router, prefix="/api/v1")
app.include_router(websocket.router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    """Create database tables on startup and start background metrics collection."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Start background metrics collection task
    asyncio.create_task(websocket.metrics_background_task())


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "NDIM API - Network Device Inventory Manager",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "ndim-backend",
        "database": "connected"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
