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
* **Real-time Analytics Dashboard:** Visual breakdowns of network inventory by vendor, operational status (Active, Offline, Maintenance), and device role[cite: 1].
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
