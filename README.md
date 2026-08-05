# Network Device Inventory Manager

An enterprise-grade, single-source-of-truth web application designed for Network Engineers and System Administrators to systematically track, monitor, and manage network hardware assets across corporate subnets.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.11%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688)
![Next.js](https://img.shields.io/badge/Next.js-14.1.3-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![Docker](https://img.shields.io/badge/Docker-WSL2-2496ED)

---

## Key Features

* **Centralized Asset Management:** Full CRUD (Create, Read, Update, Delete) operations for network devices including Routers, Switches, Firewalls, Access Points, and Servers.
* **Network Data Validation:** Built-in IPv4/IPv6 string validation and automatic MAC address normalization (`XX:XX:XX:XX:XX:XX`).
* **Relational Location Mapping:** Track device placement by sites, buildings, and specific server racks.
* **Real-time Analytics Dashboard:** Visual breakdowns of network inventory by vendor, operational status (Active, Offline, Maintenance), and device role.
* **Automated API Documentation:** Interactive OpenAPI/Swagger docs generated directly by FastAPI.

---

## Tech Stack & Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                     USER BROWSER (Next.js 14 Dashboard)                  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP / REST API
┌────────────────────────────────────▼────────────────────────────────────┐
│                    FASTAPI BACKEND (Python 3.11+)                       │
│  - Pydantic v2 (Validation)        - SQLAlchemy 2.0 (ORM)               │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Database Queries
┌────────────────────────────────────▼────────────────────────────────────┐
│                      POSTGRESQL 16 DATABASE                             │
│  - Native INET & MACADDR Data Types                                     │
└─────────────────────────────────────────────────────────────────────────┘
