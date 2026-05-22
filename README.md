# Feedback Management System

A full-stack web application for centralized feedback collection, storage, and management.

**Stack:** React (frontend) · FastAPI (backend) · SQLite (database)

---

## Quick Start

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.9+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| pip | latest | (bundled with Python) |

---

### 1. Start the Backend

Double-click **`start_backend.bat`** or run manually:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

- API: http://localhost:8001
- Swagger Docs: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

---

### 2. Start the Frontend

Double-click **`start_frontend.bat`** or run manually:

```bash
cd frontend
npm install
npm start
```

- App: http://localhost:3000

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/feedback` | List all feedback (with total & avg rating) |
| GET | `/feedback/{id}` | Get feedback by ID |
| POST | `/feedback` | Submit new feedback |
| PUT | `/feedback/{id}` | Update existing feedback |
| DELETE | `/feedback/{id}` | Delete feedback |
| GET | `/feedback/search` | Search/filter feedback |

### Query params for `/feedback/search`

| Param | Type | Description |
|-------|------|-------------|
| `keyword` | string | Search in name, program, comments |
| `rating` | int (1-5) | Filter by exact rating |
| `program_name` | string | Filter by program/event name |

---

## Project Structure

```
Feedback_Management_System/
├── backend/
│   ├── main.py          # FastAPI app entry point + CORS
│   ├── database.py      # SQLAlchemy engine & session
│   ├── models.py        # ORM model (Feedback table)
│   ├── schemas.py       # Pydantic request/response models
│   ├── crud.py          # Database operations
│   ├── routers/
│   │   └── feedback.py  # Route handlers
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── FeedbackCard.js
│   │   │   ├── FeedbackModal.js
│   │   │   └── StarRating.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── SubmitFeedback.js
│   │   │   ├── FeedbackList.js
│   │   │   ├── FeedbackDetail.js
│   │   │   └── NotFound.js
│   │   ├── services/
│   │   │   └── api.js   # Axios API client
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── start_backend.bat
├── start_frontend.bat
└── README.md
```

---

## Database Schema

**Table: `feedback`**

| Column | Type | Notes |
|--------|------|-------|
| feedback_id | INTEGER | Primary key, auto-increment |
| participant_name | VARCHAR(100) | Required |
| program_name | VARCHAR(200) | Required |
| rating | INTEGER | 1–5, required |
| comments | TEXT | Optional |
| submitted_at | DATETIME | Auto-set on creation |

Database file: `backend/feedback.db` (auto-created on first run)

---

## Features

- **Dashboard** — total count, average rating, distribution chart, recent entries
- **Submit Feedback** — form with validation, star rating picker
- **Feedback List** — paginated grid with inline search & filters
- **Feedback Detail** — full view with edit/delete
- **Search & Filter** — keyword, rating, and program name filters
- **CRUD** — full create/read/update/delete support
- **Responsive** — works on desktop and mobile
