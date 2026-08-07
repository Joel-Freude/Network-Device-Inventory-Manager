# Backend Setup Guide

## Prerequisites

- Python 3.11+ installed
- Neon PostgreSQL account (free tier available)
- Virtual environment (recommended)

## Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Neon Database Setup

1. **Create a Neon project:**
   ```bash
   npx neonctl@latest projects create --name ndim-db
   ```
   Follow the prompts to select your organization. Neon will provide a connection string like:
   ```
   postgresql://username:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

2. **Test the database connection (optional but recommended):**
   ```bash
   python test_db_connection.py
   ```
   This script verifies the connection and displays the PostgreSQL version.

3. **Configure environment variables:**
   Create a `.env` file in the backend directory:
   ```bash
   # Neon PostgreSQL Database Connection
   DATABASE_URL=postgresql://username:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

   # JWT Secret Key (change this in production!)
   SECRET_KEY=your-secret-key-here-change-in-production
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30

   # CORS Settings
   FRONTEND_URL=http://localhost:3000
   ```

   **Important:** Replace the `DATABASE_URL` with your actual Neon connection string from step 1.

## Running the Backend

1. **Start the FastAPI server:**
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   **Note:** Use `python -m uvicorn` instead of just `uvicorn` if the command is not in your PATH.

2. **Access the API:**
   - API Root: http://localhost:8000
   - Interactive Docs (Swagger): http://localhost:8000/docs
   - Alternative Docs (ReDoc): http://localhost:8000/redoc
   - Health Check: http://localhost:8000/health

3. **Automatic Table Creation:**
   On first startup, the application will automatically create the database tables in your Neon database.

## API Endpoints

### Locations (`/api/v1/locations`)
- `GET /api/v1/locations` - List all locations
- `POST /api/v1/locations` - Create new location
- `GET /api/v1/locations/{id}` - Get specific location
- `PUT /api/v1/locations/{id}` - Update location
- `DELETE /api/v1/locations/{id}` - Delete location

### Devices (`/api/v1/devices`)
- `GET /api/v1/devices` - List all devices (with filtering)
- `POST /api/v1/devices` - Create new device
- `GET /api/v1/devices/{id}` - Get specific device
- `PUT /api/v1/devices/{id}` - Update device
- `DELETE /api/v1/devices/{id}` - Delete device

**Query Parameters for GET /devices:**
- `skip`: Pagination offset (default: 0)
- `limit`: Results per page (default: 100, max: 100)
- `status`: Filter by status (active, offline, maintenance, decommissioned)
- `vendor`: Filter by vendor
- `location_id`: Filter by location ID
- `search`: Search by hostname or serial number

### Analytics (`/api/v1/analytics`)
- `GET /api/v1/analytics/summary` - Get dashboard summary metrics
- `GET /api/v1/analytics/warranties` - Get devices with expiring warranties
- `GET /api/v1/analytics/locations` - Get analytics by location

## Database Schema

The application uses PostgreSQL with native data types:

### Locations Table
- `id`: Primary key
- `site_name`: Site name (indexed)
- `building_rack`: Building and rack information
- `description`: Optional description
- `created_at`, `updated_at`: Timestamps

### Devices Table
- `id`: Primary key
- `hostname`: Device hostname (unique, indexed)
- `ip_address`: IP address using PostgreSQL INET type (unique, indexed)
- `mac_address`: MAC address using PostgreSQL MACADDR type (unique, indexed)
- `device_type`: Device type (router, switch, firewall, access_point, server)
- `vendor`: Vendor name (indexed)
- `model`: Device model
- `serial_number`: Serial number (unique)
- `firmware_version`: Optional firmware version
- `status`: Device status (active, offline, maintenance, decommissioned, indexed)
- `location_id`: Foreign key to locations table (indexed)
- `created_at`, `updated_at`: Timestamps

## Data Validation

The backend automatically validates and normalizes data:

- **MAC Addresses**: Automatically normalized to `XX:XX:XX:XX:XX:XX` format
- **IP Addresses**: Validated using PostgreSQL INET type
- **Uniqueness Constraints**: Enforced for hostname, IP address, MAC address, and serial number
- **Enum Validation**: Device types and statuses are restricted to predefined values

## Authentication (Optional)

The backend includes JWT authentication middleware but it's not enforced by default. To enable:

1. Import the auth dependencies in your routers:
   ```python
   from app.middleware.rbac import require_admin, require_readonly_or_admin
   ```

2. Add to route decorators:
   ```python
   @router.post("/", dependencies=[Depends(require_admin)])
   async def create_device(...):
       # Only admin can create devices
   ```

3. Generate tokens using the auth module:
   ```python
   from app.auth import create_access_token
   
   token = create_access_token(data={"sub": "user", "role": "admin"})
   ```

## Troubleshooting

**Database Connection Error:**
- Verify your Neon connection string is correct
- Ensure the `.env` file exists in the backend directory
- Check that Neon project is active

**Import Errors:**
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Make sure you're in the backend directory
- Virtual environment should be activated

**Port Already in Use:**
- Change the port: `uvicorn app.main:app --port 8001`
- Or stop the process using port 8000

## Development Notes

- The application uses SQLAlchemy 2.0 with async support
- Database tables are automatically created on startup (see `main.py`)
- CORS is configured to allow requests from the frontend
- All endpoints return JSON responses
- Error responses include descriptive messages
