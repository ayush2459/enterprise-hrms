# 🚀 HRHub – Enterprise Human Resource Management System (HRMS)

<p align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![License](https://img.shields.io/badge/License-MIT-green)

</p>

> **HRHub** is a modern, enterprise-grade Human Resource Management System (HRMS) built using **Next.js**, **FastAPI**, **PostgreSQL**, **Redis**, and **Docker**.  
> It provides secure employee management, enterprise authentication, role-based access control, HR workflows, and a scalable architecture suitable for organizations of all sizes.

---

# 📖 Overview

HRHub is designed following enterprise software architecture and industry best practices.

The project focuses on:

- Secure Authentication & Authorization
- Employee Information Management
- HR Administration
- Enterprise Dashboard
- Modular Architecture
- High Performance APIs
- Production Deployment Support

This repository currently contains the **Sprint 1 Foundation**, establishing the core platform that future HR modules will build upon.

---

# ✨ Key Features

## 🔐 Enterprise Authentication

- Login using Official Email or Employee ID
- JWT Authentication
- Refresh Token Authentication
- Password Hashing (bcrypt)
- Account Lockout Protection
- Multi-Factor Authentication (TOTP)
- Secure Session Management

---

## 👥 Employee Management

- Complete Employee Master Profile
- Create Employee
- View Employee
- Update Employee
- Delete Employee
- Employee Directory
- Search & Filtering
- Department Assignment
- Reporting Manager Mapping

---

## 🛡 Role Based Access Control (RBAC)

Multiple access levels are supported.

- System Administrator
- HR Administrator
- HR Executive
- Department Manager
- Employee

Every request is validated server-side to prevent privilege escalation.

---

## 📊 Dashboard

Modern enterprise dashboard including:

- Responsive Sidebar
- Navigation Layout
- Dashboard Widgets
- Employee Statistics
- Quick Actions
- User Profile
- Recent Activity

---

## 📋 Audit & Security

Enterprise security features include:

- Login Audit Logs
- Sensitive Data Access Logs
- Failed Login Tracking
- Account Locking
- Secure Password Storage
- JWT Token Rotation
- Permission Validation

---

## 🏗 Enterprise Architecture

- Modular Backend
- RESTful APIs
- Async Database Operations
- Layered Service Architecture
- Repository Pattern
- Environment Configuration
- Dockerized Deployment

---

# 🏛 Technology Stack

| Layer | Technology |
|---------|------------|
| Frontend | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend | FastAPI |
| ORM | SQLAlchemy 2.0 (Async) |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Authentication | JWT + Refresh Tokens |
| Password Hashing | bcrypt |
| MFA | TOTP |
| Reverse Proxy | nginx |
| Containerization | Docker Compose |
| Database Migration | Alembic |

---

# 📂 Project Structure

```
enterprise-hrms/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── public/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── utils/
│   │
│   ├── alembic/
│   ├── scripts/
│   └── requirements.txt
│
├── database/
│
├── docker/
│
├── docs/
│
├── scripts/
│
├── docker-compose.yml
│
└── README.md
```

---

# 🚀 Quick Start

## Prerequisites

- Docker
- Docker Compose

Clone the repository

```bash
git clone https://github.com/yourusername/enterprise-hrms.git

cd enterprise-hrms
```

Run the setup script

```bash
./scripts/setup.sh
```

The setup script automatically:

- Creates environment files
- Builds Docker containers
- Starts PostgreSQL
- Starts Redis
- Runs Alembic migrations
- Starts Backend
- Starts Frontend
- Starts Nginx

---

# 👨‍💻 Create First System Administrator

```bash
docker compose exec backend python scripts/create_admin.py \
--email admin@yourcompany.com \
--password "ChangeMe123!"
```

---

# 🌐 Application URLs

| Service | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |
| Nginx Gateway | http://localhost |

---

# ⚙ Local Development

## Backend

```bash
cd backend

python -m venv .venv

source .venv/bin/activate

pip install -r requirements.txt

cp .env.example .env

alembic upgrade head

uvicorn app.main:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🔒 Environment Variables

Before deploying to production, configure:

```
SECRET_KEY

POSTGRES_PASSWORD

DATABASE_URL

REDIS_URL

JWT_SECRET

JWT_REFRESH_SECRET

SMTP_CONFIGURATION

CORS_ALLOWED_ORIGINS

MFA_CONFIGURATION
```

> **Never deploy using the example environment variables.**

---

# ✅ Sprint 1 Deliverables

### Authentication

- JWT Authentication
- Refresh Tokens
- MFA
- Password Encryption
- Login Lockout
- Audit Logging

### RBAC

- Role Management
- Permission Validation
- Protected APIs

### Employee Module

- Employee CRUD
- Employee Directory
- Profile Management
- Department Mapping

### Dashboard

- Navigation Shell
- Sidebar
- Dashboard Layout
- Employee Overview

---

# 🗺 Product Roadmap

## Sprint 2

- Document Management
- Background Verification
- Document Upload
- Digital Verification

---

## Sprint 3

- Employee Insurance
- Claims
- Benefits
- Health Plans

---

## Sprint 4

- HR Policies
- Leave Policies
- Organization Handbook
- Company Notices

---

## Sprint 5

- Reports
- Analytics
- Employee Insights
- Dashboard Charts

---

## Sprint 6

- Field-Level Encryption
- DPDP Compliance
- Security Hardening
- Performance Optimization
- Load Testing
- Production Readiness

---

# 🔐 Security Features

- JWT Authentication
- Refresh Token Rotation
- Password Hashing
- Role Based Authorization
- Multi-Factor Authentication
- Login Attempt Tracking
- Audit Logging
- Secure Cookies
- SQL Injection Protection
- XSS Protection
- CSRF Ready Architecture

---

# 📈 Future Enhancements

- Payroll Management
- Attendance System
- Leave Management
- Recruitment Portal
- Performance Reviews
- Employee Self-Service Portal
- Asset Management
- Training Management
- Notification Service
- Email Automation
- Mobile Application
- AI HR Assistant

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository

2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit changes

```bash
git commit -m "Add new feature"
```

4. Push

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# 📜 License

This project is licensed under the MIT License.

See the **LICENSE** file for more information.

---

# 👨‍💻 Author

**Ayush Gupta**

Enterprise HR Portal (HRHub)

Built using **Next.js**, **FastAPI**, **PostgreSQL**, **Redis**, and **Docker** following enterprise software architecture and modern security standards.

---

<p align="center">

⭐ If you found this project helpful, consider giving it a star!

</p>
---

# 🏢 HRHub Modules & Features

HRHub is a complete Enterprise Human Resource Management System that manages the entire employee lifecycle—from recruitment to exit—through secure, scalable, and modular architecture.

```
HR PORTAL
│
├── 🔐 Authentication
│   ├── Login
│   ├── JWT Authentication
│   ├── Role-Based Access Control (Admin, HR, Manager, Employee)
│   ├── Forgot Password
│   ├── OTP Verification
│   └── Session Management
│
├── 📊 Dashboard
│   ├── Total Employees
│   ├── New Joinees
│   ├── Attendance Summary
│   ├── Leave Requests
│   ├── Upcoming Birthdays
│   ├── Payroll Status
│   ├── Notifications
│   └── Quick Actions
│
├── 👥 Employee Management
│   ├── Personal Details
│   ├── Employment Details
│   ├── Emergency Contacts
│   ├── Recruitment Details
│   ├── Background Verification
│   ├── Documents
│   ├── Skills & Certifications
│   └── Exit Information
│
├── ⏰ Attendance
│   ├── Daily Attendance
│   ├── Check-In / Check-Out
│   ├── Shift Management
│   ├── Overtime
│   └── Attendance Reports
│
├── 🌴 Leave Management
│   ├── Apply Leave
│   ├── Leave Balance
│   ├── Approval Workflow
│   ├── Holiday Calendar
│   └── Leave History
│
├── 💰 Payroll
│   ├── Salary Structure
│   ├── Payslips
│   ├── Tax Details
│   ├── Bonuses
│   └── Deductions
│
├── 🏥 Insurance & Benefits
│   ├── Health Insurance
│   ├── Provident Fund (PF)
│   ├── Employee State Insurance (ESI)
│   ├── Gratuity
│   └── Other Benefits
│
├── 🏢 Team Structure
│   ├── Departments
│   ├── Designations
│   ├── Reporting Manager
│   └── Organization Chart
│
├── 📚 HR Policies
│   ├── Company Policies
│   ├── Employee Handbook
│   ├── Compliance Documents
│   └── Downloads
│
├── 📅 Employee Timeline
│   ├── Promotions
│   ├── Transfers
│   ├── Salary Revisions
│   ├── Awards
│   └── Activity Log
│
├── 📈 Reports & Analytics
│   ├── Employee Analytics
│   ├── Attrition Rate
│   ├── Hiring Reports
│   ├── Attendance Analytics
│   ├── Payroll Reports
│   └── Custom Reports
│
├── 🔔 Notifications
│   ├── Email Alerts
│   ├── System Notifications
│   ├── Announcements
│   └── Reminder System
│
└── ⚙️ Settings
    ├── User Management
    ├── Roles & Permissions
    ├── Security Settings
    ├── Audit Logs
    └── Backup & Restore
```

---

# ✨ Enterprise Highlights

- 🔐 Enterprise-grade Authentication with JWT & OTP
- 👥 Role-Based Access Control (RBAC)
- 🛡 Secure Session Management
- 📂 Complete Employee Lifecycle Management
- 📄 Document & Background Verification
- ⏰ Attendance & Shift Tracking
- 🌴 Leave Management with Approval Workflow
- 💰 Payroll & Tax Management
- 🏥 Insurance & Employee Benefits
- 📈 Advanced Reports & Analytics
- 📚 HR Policies & Compliance Management
- 🔔 Email & System Notifications
- 📊 Interactive Dashboard
- 📝 Comprehensive Audit Logs
- 🐳 Dockerized Deployment with Nginx Reverse Proxy
- ⚡ FastAPI Async Backend with PostgreSQL & Redis
- 🎨 Modern Responsive UI built using Next.js 15 & Tailwind CSS

---
