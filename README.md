# MediCore — Hospital Management System

> A full-stack hospital management platform built with the MERN stack, demonstrating end-to-end product engineering: RESTful API design, relational data modeling in MongoDB, and a responsive React UI with real-time CRUD operations.

![Stack](https://img.shields.io/badge/Stack-MERN-20b2aa?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248?style=flat-square&logo=mongodb)

---

## What This Project Demonstrates

This project was built to showcase practical full-stack engineering skills across the entire development lifecycle — from database schema design to polished UI.

**Key engineering decisions:**
- **Relational data modeling in MongoDB** — Patients, Doctors, Appointments, and Bills are cross-referenced via Mongoose `ObjectId` refs with `.populate()` to avoid N+1 query patterns
- **Virtual fields** — Bill totals are computed as Mongoose virtuals (not stored), keeping the data layer clean
- **Proxy-based API routing** — Vite's dev proxy forwards `/api` requests to the Express backend, mirroring a production reverse-proxy setup
- **Auto-seed on first run** — The server detects an empty database and seeds realistic demo data, making the project instantly runnable for reviewers
- **Component architecture** — Each page is self-contained with local state, API calls, and UI logic co-located for readability

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios, Lucide React |
| Build Tool | Vite 5 |
| Backend | Node.js, Express 4 |
| Database | MongoDB with Mongoose ODM |
| Dev Tooling | Nodemon, dotenv |

---

## Features

### 📊 Dashboard
- Live stats aggregated from all four data models
- Recent appointments table with status badges
- Doctor availability overview

### 👤 Patients
- Full CRUD — create, view, edit, and delete patient records
- Inline patient detail panel with medical history timeline
- Add timestamped clinical records per patient
- Filter by health status: Stable, Critical, Recovering, Discharged

### 🩺 Doctors
- Card-based staff directory with status indicators (Available / Busy / Off Duty)
- Star rating display, department, schedule, and contact info
- Full CRUD with inline edit modal

### 📅 Appointments
- Schedule appointments with patient–doctor associations
- Status lifecycle: Scheduled → Completed / Cancelled / No-Show
- One-click "Mark Complete" action
- Filter by status; search by patient or doctor name

### 💳 Billing
- Line-item invoices with dynamic quantity × unit price calculation
- Payment method tracking (Cash, Card, Insurance, Online)
- Clickable invoice detail view with a print-ready layout
- Revenue and outstanding balance summary stats

---

## Project Structure

```
hospital-management/
├── backend/
│   ├── server.js           # Express app, DB connection, seed logic
│   ├── models/
│   │   ├── Patient.js      # Embedded records sub-schema
│   │   ├── Doctor.js
│   │   ├── Appointment.js  # Refs Patient + Doctor
│   │   └── Bill.js         # Line items sub-schema + virtual total
│   └── routes/
│       ├── patients.js     # Includes nested POST /:id/records
│       ├── doctors.js
│       ├── appointments.js
│       └── bills.js
└── frontend/
    ├── vite.config.js      # API proxy config
    └── src/
        ├── App.jsx
        ├── index.css       # Design system (CSS custom properties)
        ├── components/
        │   └── Sidebar.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── Patients.jsx
            ├── Doctors.jsx
            ├── Appointments.jsx
            └── Billing.jsx
```

---

## Getting Started

**Prerequisites:** Node.js v18+, MongoDB (local or Atlas)

```bash
# 1. Start the backend
cd backend
npm install
# Optional: edit .env to set MONGODB_URI (defaults to localhost)
npm run dev        # Starts on http://localhost:5000
                   # Demo data is auto-seeded on first run

# 2. Start the frontend
cd frontend
npm install
npm run dev        # Starts on http://localhost:3000
```

**Using MongoDB Atlas?** Update your `.env`:
```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hospital_management
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/patients` | List all / create patient |
| GET/PUT/DELETE | `/api/patients/:id` | Read, update, delete patient |
| POST | `/api/patients/:id/records` | Append a medical record |
| GET/POST | `/api/doctors` | List all / create doctor |
| GET/PUT/DELETE | `/api/doctors/:id` | Read, update, delete doctor |
| GET/POST | `/api/appointments` | List all / create appointment |
| GET/PUT/DELETE | `/api/appointments/:id` | Read, update, delete appointment |
| GET/POST | `/api/bills` | List all / create bill |
| GET/PUT/DELETE | `/api/bills/:id` | Read, update, delete bill |

---

## Design Highlights

The UI is built entirely with hand-crafted CSS using a token-based design system (CSS custom properties for color, spacing, shadow, and radius). No UI framework was used — all components, modals, tables, badges, and form elements are purpose-built.

- Smooth modal animations with `backdrop-filter: blur`
- Responsive grid layouts using CSS `auto-fill` columns
- Custom scrollbar styling and micro-interaction transitions
- Print-ready invoice layout via `window.print()`
