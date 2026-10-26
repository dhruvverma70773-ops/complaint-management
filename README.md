# 🏛️ Complaint Management System (CMS)

> **Full-Stack MERN Application** — A municipal online complaint management system where citizens can register, track, and manage civic complaints.

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Setup & Installation](#setup--installation)
6. [API Reference](#api-reference)
7. [Demo Credentials](#demo-credentials)
8. [Running Tests](#running-tests)
9. [Deployment](#deployment)

---

## Overview

The **Complaint Management System** allows:
- **Citizens** to file, track, and view their complaints with a unique complaint ID (e.g., `CMP-0001`)
- **Admins** to view all complaints, update statuses with remarks, delete invalid complaints, and see analytics

---

## ✨ Features

### Authentication
- Register & Login with JWT (stored in localStorage)
- Role-based access: `citizen` and `admin`
- Protected routes — redirect to `/login` if not authenticated
- Token auto-refresh handling via Axios interceptors

### Citizen Features
- 📋 **Dashboard** — stats cards (total, pending, in-progress, resolved)
- ➕ **File Complaint** — form with category, priority, description, location, image URL
- 🔍 **My Complaints** — search by title/ID, filter by status/category
- 🕐 **Complaint Detail** — full details with status history timeline

### Admin Features
- 📊 **Admin Dashboard** — 6 stats cards + bar chart (by category) + donut chart (by status)
- 📋 **All Complaints** — table with search & multi-filter; update status with remark; delete
- 👥 **Users** — view all registered citizen profiles

---

## 🛠 Tech Stack

| Layer       | Technology                                |
|-------------|-------------------------------------------|
| Frontend    | React 18 (Vite), React Router v6         |
| Styling     | Bootstrap 5, react-bootstrap, Custom CSS  |
| HTTP Client | Axios (with interceptors)                 |
| Charts      | Recharts                                  |
| Notifications | react-toastify                          |
| Backend     | Node.js, Express.js                       |
| Database    | MongoDB Atlas + Mongoose                  |
| Auth        | JWT + bcryptjs                            |
| Validation  | express-validator (server), custom (client)|
| Testing     | Jest + Supertest (backend), Vitest + RTL (frontend) |

---

## 📁 Project Structure

```
complaint-management/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable components (Navbar, StatusBadge, Spinner…)
│   │   ├── context/         # AuthContext (global auth state)
│   │   ├── pages/           # Page-level components (Login, Dashboard, etc.)
│   │   ├── services/        # api.js — Axios service layer
│   │   ├── tests/           # Vitest + React Testing Library tests
│   │   ├── App.jsx          # Root component with all routes
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles & design tokens
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                  # Express backend
│   ├── config/
│   │   └── db.js            # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── complaintController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT protect + adminOnly
│   │   └── errorHandler.js  # Centralized error handling
│   ├── models/
│   │   ├── User.js          # User schema (citizen / admin)
│   │   └── Complaint.js     # Complaint schema with statusHistory
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   └── adminRoutes.js
│   ├── seeds/
│   │   └── seed.js          # Seed 1 admin + 2 citizens + 10 complaints
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── complaint.test.js
│   │   └── setup.js
│   ├── server.js            # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+ and npm
- MongoDB Atlas account (free tier is fine)

### Step 1 — Clone / Navigate to the project

```bash
cd complaint-management
```

### Step 2 — Set up the Backend

```bash
cd server

# Copy the example env file and fill in your values
copy .env.example .env
```

Edit `server/.env`:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/complaint_management?retryWrites=true&w=majority
JWT_SECRET=your_random_secret_key_here_make_it_long
PORT=5000
NODE_ENV=development
```

Install dependencies & run:
```bash
npm install
npm run dev      # starts backend on http://localhost:5000
```

### Step 3 — Seed the Database (optional but recommended)

```bash
npm run seed     # creates 1 admin + 2 citizens + 10 sample complaints
```

### Step 4 — Set up the Frontend

```bash
cd ../client
npm install
npm run dev      # starts frontend on http://localhost:5173
```

---

## 🔌 API Reference

### Auth Routes (`/api/auth`)

| Method | Endpoint           | Access  | Description               |
|--------|--------------------|---------|---------------------------|
| POST   | `/register`        | Public  | Register new citizen      |
| POST   | `/login`           | Public  | Login and get JWT         |
| GET    | `/me`              | Private | Get logged-in user info   |

### Complaint Routes (`/api/complaints`)

| Method | Endpoint           | Access          | Description                         |
|--------|--------------------|-----------------|-------------------------------------|
| POST   | `/`                | Citizen         | File a new complaint                |
| GET    | `/my`              | Citizen         | Get own complaints (with filters)   |
| GET    | `/:id`             | Citizen/Admin   | Get single complaint by ID          |
| GET    | `/`                | Admin           | Get all complaints (with filters)   |
| PUT    | `/:id/status`      | Admin           | Update complaint status + remark    |
| DELETE | `/:id`             | Admin           | Delete a complaint                  |

### Admin Routes (`/api/admin`)

| Method | Endpoint           | Access  | Description                   |
|--------|--------------------|---------|-------------------------------|
| GET    | `/stats`           | Admin   | Aggregated dashboard stats    |
| GET    | `/users`           | Admin   | List all citizen users        |

### Query Parameters (for filter endpoints)

- `status` — `Pending` | `In Progress` | `Resolved` | `Rejected`
- `category` — `Water` | `Electricity` | `Roads` | `Sanitation` | `Other`
- `priority` — `Low` | `Medium` | `High`
- `search` — partial text match on title, complaintId, location

---

## 🔑 Demo Credentials

> Run `npm run seed` first to create these accounts.

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | `admin@cms.com`        | `admin123`  |
| Citizen | `rahul@citizen.com`    | `citizen123`|
| Citizen | `priya@citizen.com`    | `citizen123`|

---

## 🧪 Running Tests

### Backend Tests (Jest + Supertest)
```bash
cd server
npm test
# Runs: tests/auth.test.js + tests/complaint.test.js
# ✅ 18+ test cases covering auth, complaints, roles, validation
```

### Frontend Tests (Vitest + React Testing Library)
```bash
cd client
npm test
# Runs: src/tests/Login.test.jsx + src/tests/StatusBadge.test.jsx
# ✅ 10 test cases covering rendering, validation, component behavior
```

---

## 🚀 Deployment

### Backend → Render (Free Tier)

1. Push the `server/` folder (or whole repo) to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Set **Root Directory** to `server`
5. **Build Command:** `npm install`
6. **Start Command:** `node server.js`
7. Add Environment Variables in Render dashboard:
   ```
   MONGO_URI=<your atlas uri>
   JWT_SECRET=<your secret>
   NODE_ENV=production
   CLIENT_URL=https://your-app.vercel.app
   ```
8. Deploy! Note the URL (e.g., `https://cms-api.onrender.com`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Set **Root Directory** to `client`
4. **Framework Preset:** Vite
5. Add Environment Variable in Vercel:
   ```
   VITE_API_URL=https://cms-api.onrender.com/api
   ```
6. Deploy! Vercel auto-detects Vite and builds it.

---

## 📊 Database Models

### User
```
name, email (unique), phone, password (hashed), role (citizen|admin), timestamps
```

### Complaint
```
complaintId (CMP-XXXX, auto-generated), title, category, description, location,
imageUrl, priority, status, statusHistory[], citizen (ref: User), timestamps
```

### Status History (embedded)
```
status, remark, updatedBy (ref: User), updatedAt
```

---

## 📝 License

MIT — Free to use for educational purposes.
