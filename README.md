# Network Device Inventory Manager

An enterprise-grade, single-source-of-truth web application designed for Network Engineers and System Administrators to systematically track, monitor, and manage network hardware assets across corporate subnets[cite: 1].

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.11%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688)
![Next.js](https://img.shields.io/badge/Next.js-14.1.3-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![Docker](https://img.shields.io/badge/Docker-WSL2-2496ED)

---

## Key Features

* **Centralized Asset Management:** Full CRUD (Create, Read, Update, Delete) operations for network devices including Routers, Switches, Firewalls, Access Points, and Servers[cite: 1].
* **Network Data Validation:** Built-in IPv4/IPv6 string validation and automatic MAC address normalization (`XX:XX:XX:XX:XX:XX`)[cite: 1].
* **Relational Location Mapping:** Track device placement by sites, buildings, and specific server racks[cite: 1].
* **Real-time Analytics Dashboard:** Live performance metrics with waveform visualization, CPU/MEM/TEMP/LAT monitoring, and bandwidth tracking.
* **Interactive Network Topology:** Visual SVG-based topology widget with datacenter navigation, status filtering, and clickable device nodes.
* **Organized Network Modal:** Split-view modal with network topology on the left and device details on the right, including Update, Delete, and New Device actions.
* **Automated API Documentation:** Interactive OpenAPI/Swagger docs generated directly by FastAPI[cite: 1].

---

## Tech Stack & Architecture

* **Frontend:** Next.js 14+ (App Router), React, Tailwind CSS, Lucide Icons[cite: 1].
* **Backend:** FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM[cite: 1].
* **Database:** PostgreSQL 16 (Utilizing native `INET` and `MACADDR` column types)[cite: 1].
* **Infrastructure:** Docker Desktop & WSL2 Ubuntu[cite: 1].

---

## Database Schema Overview

The application utilizes a relational schema to link network devices to physical site locations[cite: 1]:

* **`devices`**: Stores `hostname`, `ip_address`, `mac_address`, `device_type`, `vendor`, `model`, `serial_number`, `firmware_version`, `status`, and `location_id`[cite: 1].
* **`locations`**: Stores `site_name`, `building_rack`, and `description`[cite: 1].

---

## Waterfall Development Lifecycle Status

This repository strictly adheres to a structured development methodology[cite: 1]:

- [x] **Phase 1: Requirements & SRS Specification** (Completed)[cite: 1]
- [x] **Phase 2: System Design & Architecture** (Completed)[cite: 1]
- [ ] **Phase 3: Implementation & Development** (In Progress)[cite: 1]
- [ ] **Phase 4: Testing & Quality Assurance** (Pending)[cite: 1]
- [ ] **Phase 5: Deployment & Release** (Pending)[cite: 1]

---

## Interface & Functional Updates

### Analytics Widget
- Live signal waveform visualization with real-time updates.
- Dynamic CPU, Memory, Temperature, and Latency metrics with progress bars.
- Bandwidth in/out monitoring with simulated live data.

### Network Topology Widget
- SVG-based topology visualization with support for Star, Bus, Ring, Mesh, Tree, and Hybrid layouts.
- Datacenter navigation with arrow buttons.
- Status filtering (All, Online, Warning, Offline).
- Clickable device nodes that trigger selection.

### Organized Network Modal
- Left panel: Full network topology widget with datacenter arrows, status filters, and clickable device icons.
- Right panel: Selected device details including hostname, IP, vendor, model, site, coordinates, and status.
- Action buttons: Update, Delete, and New Device.
- Tree topology layout with Parent Node, Level 1, and Level 2 device tiers.

---

## Getting Started (Local Development)

### Prerequisites
* Windows 11 with **WSL2** (Ubuntu) installed
* **Docker Desktop** configured with WSL2 integration

### Installation
1. Clone the repository:
    ```bash
    git clone [https://github.com/Joel-Freude/Network-Device-Inventory-Manager.git](https://github.com/Joel-Freude/Network-Device-Inventory-Manager.git)
    cd Network-Device-Inventory-Manager
    
2. Start the application stack using Docker Compose:

```bash
docker compose up --build -d```

3. Access the application services:

* Frontend Dashboard: http://localhost:3000
* FastAPI Interactive Docs (Swagger): http://localhost:8000/docs
* PostgreSQL Engine: localhost:5432

4. License
* **Distributed under the MIT License.** 
