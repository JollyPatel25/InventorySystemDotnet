# 🏢 Smart Inventory Management System

## 🚀 Full Setup Guide

This project is a full-stack Inventory Management System with:

- 🧠 AI Service (FastAPI - Python)  
- ⚙️ Backend (.NET Web API)  
- 🌐 Frontend (Angular)  

---

## 📁 Project Structure

```
inventory-system
│
├── ai-service-python
├── backend-dotnet
├── frontend-angular
└── README.md
```

---

## ⚙️ Prerequisites

- Python (3.9+)
- Node.js & Angular CLI
- .NET SDK
- PostgreSQL
- Visual Studio (recommended)

---

## 🚀 Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd inventory-system
```

---

## 🧠 2️⃣ AI Service Setup (FastAPI)

```bash
cd ai-service-python
pip install -r requirements.txt
```

### ▶️ Run AI Service

```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Runs on: http://127.0.0.1:8000

---

## ⚙️ 3️⃣ Backend Setup (.NET)

```bash
cd backend-dotnet
```

- Open `.sln` file in Visual Studio

### 🗄️ Apply Database Migration

```bash
dotnet ef database update
```

---

## 🐘 4️⃣ PostgreSQL Data Setup

```bash
python insert_data_to_postgre_script.py
```

### ⚠️ Update Database Credentials

Edit:

```
insert_data_to_postgre_script.py
```

```python
conn = psycopg2.connect(
    dbname="InventoryDb",
    user="postgres",
    password="YOUR_PASSWORD_HERE",
    host="localhost",
    port="5432"
)
```

---

## ✅ Run Order

1. Backend migration  
2. Insert script  
3. AI service  
4. Backend  
5. Frontend  

---

## 🌐 Frontend Setup

```bash
cd frontend-angular
npm install
ng serve
```

---

## 👤 Default Login

Email: admin@inventory.com  
Password: Admin@123  

---

## 🧾 User Roles

| Role ID | Role Name   |
|--------|------------|
| 1      | Org Admin  |
| 2      | Org Manager|

---

## 🔗 URLs

- Frontend: http://localhost:4200  
- Backend: https://localhost:xxxx  
- AI: http://127.0.0.1:8000  

---

## 🚀 Ready!

Happy Coding 🎯
