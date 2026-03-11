# 🏥 MediCore — Hospital Management System (MERN Stack)

A full-stack Hospital Management System built with **MongoDB, Express.js, React, and Node.js**.

---

## 📁 Project Structure

```
hospital-management/
├── backend/
│   ├── server.js          # Express server + DB connection + seed data
│   ├── .env               # Environment variables
│   ├── package.json
│   ├── models/
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   └── Bill.js
│   └── routes/
│       ├── patients.js
│       ├── doctors.js
│       ├── appointments.js
│       └── bills.js
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
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

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)

### 1. Start the Backend

```bash
cd backend
npm install
# Edit .env if needed (default: mongodb://localhost:27017/hospital_management)
npm run dev
```

The backend starts on **http://localhost:5000**. Demo data is seeded automatically on first run.

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:3000**.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | Get all patients |
| POST | `/api/patients` | Create patient |
| PUT | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |
| POST | `/api/patients/:id/records` | Add medical record |
| GET | `/api/doctors` | Get all doctors |
| POST | `/api/doctors` | Create doctor |
| PUT | `/api/doctors/:id` | Update doctor |
| DELETE | `/api/doctors/:id` | Delete doctor |
| GET | `/api/appointments` | Get all appointments |
| POST | `/api/appointments` | Create appointment |
| PUT | `/api/appointments/:id` | Update appointment |
| DELETE | `/api/appointments/:id` | Delete appointment |
| GET | `/api/bills` | Get all bills |
| POST | `/api/bills` | Create bill |
| PUT | `/api/bills/:id` | Update bill |
| DELETE | `/api/bills/:id` | Delete bill |

---

## 📄 Pages

| Page | Features |
|------|----------|
| **Dashboard** | Stats overview, recent appointments, doctor availability |
| **Patients** | Health status, medical records timeline, doctor assignment, CRUD |
| **Doctors** | Staff cards, availability status, specialization, ratings |
| **Appointments** | Schedule management, status tracking, one-click complete |
| **Billing** | Invoices with line items, payment status, invoice detail view |

---

## ☁️ MongoDB Atlas (Cloud)

Replace the `.env` value:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hospital_management
```
