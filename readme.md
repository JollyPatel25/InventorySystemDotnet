<div align="center">

# 🏢 Enterprise Inventory & Sales SaaS

**A multi-tenant platform for managing warehouses, inventory, and sales — built for teams that mean business.**

[![.NET](https://img.shields.io/badge/.NET-8%2F9-512BD4?style=flat-square&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

[Getting Started](#-getting-started) · [Architecture](#-architecture) · [Features](#-features) · [API Reference](#-api-reference) · [Contributing](#-contributing)

</div>

---

## 📖 What is this?

This is a **full-stack, multi-tenant SaaS system** that lets organizations manage their entire inventory and sales lifecycle from one place. A single **Platform Administrator** onboards and manages multiple tenant organizations — each completely isolated from one another — while **Organization Admins** run day-to-day operations: products, warehouses, stock, sales, and reporting.

On top of the core platform, an **AI microservice** (FastAPI/Python) provides demand forecasting using historical sales data, helping orgs stay ahead of stockouts before they happen.

> Built with ASP.NET Core Web API · Angular 20 · PostgreSQL · FastAPI

---

## ✨ Features

### 🏗️ Platform Level
- **Multi-tenant architecture** — strict data isolation between organizations via JWT-scoped queries
- **Platform Admin dashboard** — onboard orgs, manage users, view system-wide logs
- **Subscription management** — plan types (Basic / Standard / Premium), expiry enforcement
- **Organization switching** — users belonging to multiple orgs can hot-swap context without re-login

### 🏪 Organization Level
- **Warehouse management** — multiple warehouses per org, each with unique codes and address tracking
- **Product catalog** — SKU-based products with categories, barcodes, pricing (Indian Rupee)
- **Inventory control** — per-warehouse stock with low-stock thresholds and full adjustment audit trail
- **Sales & billing** — multi-item transactions with tax, discounts, and auto-generated invoice numbers
- **Invoice PDF generation** — client-side PDF export via jsPDF (no server rendering needed)

### 🤖 AI Demand Forecasting
- Predicts next-day demand per product/warehouse using the last 10 sales entries
- Confidence scores returned alongside predictions
- Decoupled FastAPI microservice — failures never affect core operations

### 📊 Reports & Analytics
- Real-time dashboard: total products, warehouses, low-stock count, today's revenue
- Monthly revenue trends, top-5 products by volume
- Full system log viewer for Platform Admins (filterable by level, date, path)

### 🔐 Security
- JWT Bearer authentication (HS256), zero clock skew
- Role-based access control at both controller and service layers
- BCrypt password hashing, soft deletes, no entity exposure in API responses
- Global exception middleware — no stack traces in production

---

## 🏛️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│              Angular 20 (Standalone Components)             │
│         Material UI · JWT in localStorage · jsPDF           │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST (Bearer Token)
┌────────────────────────▼────────────────────────────────────┐
│                       API LAYER                             │
│              ASP.NET Core Web API (.NET 8/9)                │
│         Versioned REST (/api/v1/) · Swagger/OpenAPI         │
├─────────────────────────────────────────────────────────────┤
│                    SERVICE LAYER                            │
│        Business Logic · CurrentUserService · Guards         │
├─────────────────────────────────────────────────────────────┤
│                   REPOSITORY LAYER                          │
│         Entity Framework Core · Generic Base Repo           │
├─────────────────────────────────────────────────────────────┤
│                    DATABASE LAYER                           │
│          PostgreSQL (via Npgsql) · EF Core Migrations       │
│          Serilog → applicationlogs table                    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP (Internal)
┌──────────────────────────▼──────────────────────────────────┐
│                    AI MICROSERVICE                          │
│             FastAPI (Python) · /predict endpoint            │
│             Demand Forecasting · Confidence Scores          │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Tenant Isolation

```
Platform Administrator
        │
        ├── Organization A  (Tenant 1)
        │       ├── Warehouses
        │       ├── Products / Inventory
        │       └── Sales / Users
        │
        ├── Organization B  (Tenant 2)
        │       ├── Warehouses
        │       ├── Products / Inventory
        │       └── Sales / Users
        │
        └── Organization N  (Tenant N)
                └── ...
```

Every database query is automatically scoped to the `OrganizationId` extracted from the authenticated user's JWT. Cross-tenant access is explicitly blocked via `SecurityHelper.ValidateSameOrg()`.

### Backend Layer Responsibilities

| Layer | Responsibility |
|-------|---------------|
| Controller | Route handling, JWT claim extraction, response shaping |
| Service | Business logic, tenant scoping, transaction management |
| Repository | DB abstraction via EF Core, generic CRUD base |
| Entity | DB models extending BaseEntity (Id, CreatedAt, IsDeleted…) |
| DTO | Request/Response contracts — entities never leave the API |

### Frontend Structure

```
src/
├── app/                    # Root config & routes
├── core/
│   ├── models/             # TypeScript interfaces (mirror backend DTOs)
│   ├── services/           # One service per backend controller
│   ├── interceptors/       # Auth interceptor (attaches Bearer token)
│   └── guards/             # authGuard, roleGuard
├── features/
│   ├── auth/               # Login page
│   ├── platform/           # Platform Admin pages
│   └── org/                # Organization Admin pages
└── shared/
    ├── layout/             # Shell, Sidebar, Topbar
    └── components/         # DataTable, StatCard, PageHeader, ConfirmDialog
```

---

## 🗂️ Project Structure

```
inventory-system/
├── ai-service-python/                     # FastAPI demand forecasting microservice
│   ├── main.py
│   └── requirements.txt
├── backend-dotnet/                        # ASP.NET Core Web API
│   ├── Controllers/
│   ├── Services/
│   ├── Repositories/
│   ├── Entities/
│   ├── DTOs/
│   ├── Migrations/
│   └── appsettings.json
├── frontend-angular/                      # Angular 20 SPA
│   ├── src/
│   └── angular.json
├── insert_data_to_postgre_script.py       # Main seed script (complete dummy data)
├── insert_sales.py                        # Optional: AI forecasting test data
├── insert_multi_tenancy.py               # Optional: Multi-org user test data
└── README.md
```

---

## ⚙️ Prerequisites

| Tool | Version |
|------|---------|
| [.NET SDK](https://dotnet.microsoft.com/download) | 8 or 9 |
| [Node.js](https://nodejs.org/) | 18+ |
| [Angular CLI](https://angular.dev/tools/cli) | 20 |
| [Python](https://www.python.org/) | 3.9+ |
| [PostgreSQL](https://www.postgresql.org/) | 14+ |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd inventory-system
```

---

### 2. AI Service (FastAPI)

```bash
cd ai-service-python
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

✅ Runs at: `http://127.0.0.1:8000`  
📖 Auto docs at: `http://127.0.0.1:8000/docs`

---

### 3. Backend (.NET Web API)

```bash
cd backend-dotnet
```

Apply database migrations:

```bash
dotnet ef database update
```

> ⚠️ Make sure your PostgreSQL connection string is configured in `appsettings.json` before running migrations. See [Environment Variables](#-environment-variables--configuration).

Start the API:

```bash
dotnet run
```

✅ API base: `https://localhost:<port>/api/v1/`  
📖 Swagger UI: `https://localhost:<port>/swagger`

---

### 4. Database Seeding

#### Understanding the Seed Scripts

There are 3 seed scripts. Here is what each does and when to run it:

| Script | Purpose | Required? | Depends On |
|--------|---------|-----------|------------|
| `insert_data_to_postgre_script.py` | **Main seed** — inserts 100 orgs, 20 users/warehouses/products each, inventory, sales, stock adjustments, predictions, tax config | **Yes — run first** | None, standalone |
| `insert_sales.py` | Inserts 10 products with 30-day realistic sales trends. Use this to test AI demand forecasting. | Optional | DB schema only |
| `insert_multi_tenancy.py` | Creates 200 users each belonging to 2–3 orgs. Tests the org-switching feature. | Optional | Main script must run first |

#### Step-by-Step: Running the Main Seed Script

**Step 1 — Confirm prerequisites**

Before running, make sure:
- Python 3.9+ is installed
- PostgreSQL is running on port 5432
- The database `InventoryDb` exists and migrations have been applied (`dotnet ef database update` from Step 3)

**Step 2 — Create a virtual environment**

```bash
python -m venv venv
```

**Step 3 — Activate it**

On Windows:
```bash
venv\Scripts\activate
```

On Mac/Linux:
```bash
source venv/bin/activate
```

**Step 4 — Install the required libraries**

The main seed script only needs two packages:

```bash
pip install psycopg2-binary bcrypt
```

> Use `psycopg2-binary` not `psycopg2` — the binary version has no C compiler dependency and works out of the box.

**Step 5 — Update your credentials in the script**

Open `insert_data_to_postgre_script.py` and update the connection block:

```python
conn = psycopg2.connect(
    dbname="InventoryDb",
    user="postgres",
    password="YOUR_PASSWORD_HERE",   # 👈 change this
    host="localhost",
    port="5432"
)
```

**Step 6 — Run the script**

```bash
python insert_data_to_postgre_script.py
```

On success you will see:

```
✅ PERFECT DATA INSERTED (ALL REQUIRED FIELDS COVERED)
```

#### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `psycopg2.OperationalError` | Wrong password or DB doesn't exist | Check credentials and confirm PostgreSQL is running |
| `UndefinedTable` | Schema not applied | Run `dotnet ef database update` first |
| `UniqueViolation` on SKU | Script was run twice on same DB | Clear the tables or use a fresh DB |

#### Running the Optional Scripts

Only run these after the main seed script has completed successfully.

**`insert_sales.py`** — for AI forecasting test data (standalone, no extra dependencies):

```bash
python insert_sales.py
```

**`insert_multi_tenancy.py`** — for multi-org user testing (requires main script data to exist):

```bash
python insert_multi_tenancy.py
```

---

### 5. Frontend (Angular)

```bash
cd frontend-angular
npm install
ng serve
```

✅ Runs at: `http://localhost:4200`

---

## 📋 Run Order

Services must be started in this order:

```
1. PostgreSQL                              → must be running before migrations
2. dotnet ef database update               → apply schema migrations
3. python insert_data_to_postgre_script.py → seed core dummy data
4. python insert_sales.py                  → (optional) AI forecasting test data
5. python insert_multi_tenancy.py          → (optional) multi-org user data
6. AI Service                              → FastAPI on :8000
7. Backend API                             → .NET on assigned port
8. Frontend                                → Angular on :4200
```

---

## 🔧 Environment Variables & Configuration

All configuration lives in `backend-dotnet/appsettings.json`. Never commit secrets — use environment variables or [.NET user secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) in development.

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=InventoryDb;Username=postgres;Password=YOUR_PASSWORD"
  },
  "Jwt": {
    "Key": "YOUR_SECRET_KEY_MIN_32_CHARS",
    "Issuer": "InventorySystem",
    "Audience": "InventorySystemUsers",
    "ExpiryMinutes": 60
  },
  "BootstrapAdmin": {
    "Email": "admin@inventory.com",
    "Password": "Admin@123"
  },
  "AIService": {
    "BaseUrl": "http://localhost:8000"
  }
}
```

| Key | Description |
|-----|-------------|
| `ConnectionStrings:DefaultConnection` | PostgreSQL connection string |
| `Jwt:Key` | HS256 signing key (min 32 characters) |
| `Jwt:ExpiryMinutes` | Token lifetime in minutes |
| `BootstrapAdmin:Email` | Platform Admin email (auto-seeded on first run) |
| `BootstrapAdmin:Password` | Platform Admin password |
| `AIService:BaseUrl` | Base URL of the FastAPI microservice |

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1/`. Every response follows this envelope:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": { },
  "errors": null
}
```

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Login and receive JWT |
| `POST` | `/auth/switch-organization` | Switch active org context |
| `POST` | `/auth/platform/create-organization` | Platform Admin: create org |
| `POST` | `/auth/platform/create-org-admin` | Platform Admin: create org admin |
| `POST` | `/auth/org/create-user` | Org Admin: create user |

### Organizations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/organizations/getall` | All orgs (Platform Admin) |
| `GET` | `/organizations/my` | Current user's org |
| `PATCH` | `/organizations/update` | Update org details |
| `DELETE` | `/organizations/deactivate/{id}` | Deactivate org |
| `PATCH` | `/organizations/reactivate/{id}` | Reactivate org |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/products/create` | Create product |
| `GET` | `/products/getall` | List all products |
| `GET` | `/products/getbyid/{id}` | Get single product |
| `PATCH` | `/products/update/{id}` | Update product |
| `DELETE` | `/products/delete/{id}` | Deactivate product |

### Warehouses
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/warehouses/create` | Create warehouse |
| `GET` | `/warehouses/getall` | List all warehouses |
| `PATCH` | `/warehouses/update/{id}` | Update warehouse |
| `DELETE` | `/warehouses/deactivate/{id}` | Deactivate warehouse |
| `PATCH` | `/warehouses/reactivate/{id}` | Reactivate warehouse |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/inventory/initialize` | Initialize product stock in warehouse |
| `GET` | `/inventory/warehouse/{warehouseId}` | Stock by warehouse |
| `GET` | `/inventory/low-stock/{warehouseId}` | Low stock items |
| `PATCH` | `/inventory/update-stock` | Manual stock adjustment |

### Sales
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/sales` | Create sale (deducts stock atomically) |
| `GET` | `/sales/{id}` | Get sale by ID |
| `GET` | `/sales/warehouse/{warehouseId}` | Sales by warehouse |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/reports/dashboard` | Org-level summary stats |
| `GET` | `/reports/sales/today` | Today's sales |
| `GET` | `/reports/revenue/monthly` | Monthly revenue breakdown |
| `GET` | `/reports/top-products` | Top 5 products by volume |

### AI Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/predictions/{productId}?warehouseId=` | Get demand forecast |

### Logs *(Platform Admin only)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/logs` | View system logs with filters |

---

## 👥 User Roles & Permissions

| Role | Scope | Key Capabilities |
|------|-------|-----------------|
| **Platform Admin** | Global | Manage all orgs & users, view system logs, onboard tenants |
| **Org Admin** | Organization | Manage products, warehouses, inventory, sales, users, reports |

> Platform Admin accounts cannot be deactivated by any other user.  
> Org Admins cannot create another Admin-level user within their org.

### Role-Based Routes

```
Platform Admin          Org Admin
────────────────        ─────────────────────
/platform/dashboard     /org/dashboard
/platform/orgs          /org/products
/platform/users         /org/warehouses
/platform/logs          /org/inventory
/platform/profile       /org/sales
                        /org/users
                        /org/reports
                        /org/predictions
                        /org/profile
```

---

## 🔑 Default Credentials

### Platform Admin
> Auto-seeded on first run via `BootstrapAdmin` config.

| Field | Value |
|-------|-------|
| Email | `admin@inventory.com` |
| Password | `Admin@123` |
| Role | Platform Administrator |

### Dummy Seed Users
> All users inserted by the seed scripts use this default password.

| Field | Value |
|-------|-------|
| Password | `12345678` |
| Email format (main script) | `user{i}_{org_id[:4]}@test.com` — e.g. `user0_a1b2@test.com` |
| Email format (multi-tenancy script) | `multiuser{i}@test.com` — e.g. `multiuser0@test.com` |

> ⚠️ These are for local development only. Never use weak passwords in any non-local environment.

---

## 🖼️ Screenshots

> *Coming soon*

---

## 🤝 Contributing

Contributions are welcome! Here's how to get involved:

1. **Fork** the repository
2. **Create** a feature branch — `git checkout -b feat/your-feature`
3. **Commit** your changes — `git commit -m 'feat: add some feature'`
4. **Push** to your branch — `git push origin feat/your-feature`
5. **Open a Pull Request** — describe what you changed and why

### Guidelines

- Follow existing code style and naming conventions
- Backend: keep business logic in the Service layer, not controllers
- Frontend: use standalone Angular components, avoid NgModules
- Write descriptive commit messages ([Conventional Commits](https://www.conventionalcommits.org/) preferred)
- Test your changes locally against all three services before submitting

### Reporting Issues

Found a bug or have a feature request? [Open an issue](../../issues) with:
- A clear title and description
- Steps to reproduce (for bugs)
- Expected vs actual behavior

---

## 🔗 URLs at a Glance

| Service | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Backend API | https://localhost:*\<port\>* |
| Swagger UI | https://localhost:*\<port\>*/swagger |
| AI Service | http://127.0.0.1:8000 |
| AI Docs | http://127.0.0.1:8000/docs |

---

<div align="center">
Made with ❤️ — PRs welcome
</div>