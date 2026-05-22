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

---

## Phase 2 — ETL Pipeline & Analytics

> Built on top of Phase 1. Adds a complete ETL pipeline, analytics tables, and two new frontend screens.

### What's New in Phase 2

| Feature | Description |
|---------|-------------|
| **ETL Import** | Upload CSV or XLSX datasets; data is extracted, cleaned, and loaded into analytics tables |
| **Data Cleaning** | Removes duplicates, fixes invalid ratings (out-of-range, text), strips whitespace, normalizes case, parses mixed date formats |
| **Analytics Tables** | Three new DB tables: `etl_runs`, `analytics_feedback`, `program_analytics` |
| **Analytics Dashboard** | Rating distribution chart, top programs bar chart, monthly trends area chart, full program breakdown table |
| **Downloadable Reports** | CSV export of program analytics from the dashboard |
| **ETL Run History** | Table showing every ETL run with status, row counts, and timestamps |
| **Sample Dataset** | `datasets/feedback_sample_dirty.csv` — 120 rows with intentional dirty data for demo |

---

### ETL Workflow

```
datasets/feedback_sample_dirty.csv
             │
             ▼
     ┌───────────────┐
     │   EXTRACT     │  Read CSV/XLSX with pandas
     │               │  Validate required columns
     └──────┬────────┘
            │
            ▼
     ┌───────────────┐
     │  TRANSFORM    │  Strip whitespace & normalize case
     │               │  Drop rows with empty name/program
     │               │  Fix/drop invalid ratings (1–5 only)
     │               │  Remove duplicate records
     │               │  Parse mixed date formats → UTC
     │               │  Derive month_year for trend grouping
     └──────┬────────┘
            │
            ▼
     ┌───────────────┐
     │    LOAD       │  Bulk-insert into analytics_feedback
     │               │  Compute program aggregates → program_analytics
     │               │  Record run stats in etl_runs
     └───────────────┘
```

---

### New API Endpoints (Phase 2)

#### ETL

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/etl/upload` | Upload CSV/XLSX and trigger ETL pipeline |
| GET | `/etl/runs` | List ETL run history (last 50) |
| GET | `/etl/runs/{run_id}` | Get single ETL run details |

#### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/summary` | Total records, avg rating, program count, last run |
| GET | `/analytics/rating-distribution` | Count + percentage per rating (1–5) |
| GET | `/analytics/top-programs` | Top N programs by avg rating |
| GET | `/analytics/trends` | Monthly response count + avg rating |
| GET | `/analytics/program-breakdown` | Full per-program stats table (sortable) |
| GET | `/analytics/download` | Download analytics as CSV attachment |

---

### New Pages (Phase 2)

| Route | Page | Description |
|-------|------|-------------|
| `/etl` | ETL Import | Drag-and-drop file upload, ETL trigger button, run history table |
| `/analytics` | Analytics Dashboard | Summary cards, charts, trends, program breakdown, CSV download |

---

### New Database Tables (Phase 2)

**Table: `etl_runs`**

| Column | Type | Notes |
|--------|------|-------|
| run_id | INTEGER | Primary key |
| filename | VARCHAR(255) | Uploaded file name |
| file_type | VARCHAR(10) | "csv" or "xlsx" |
| triggered_at | DATETIME | When the run started |
| completed_at | DATETIME | When it finished |
| status | VARCHAR(20) | "running" / "success" / "failed" |
| total_rows | INTEGER | Raw row count from file |
| valid_rows | INTEGER | Rows that passed validation |
| duplicate_rows | INTEGER | Rows dropped as duplicates |
| invalid_rows | INTEGER | Rows with bad/missing data |
| loaded_rows | INTEGER | Rows inserted into analytics |
| error_message | TEXT | Error detail on failure |

**Table: `analytics_feedback`**

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key |
| run_id | INTEGER | FK → etl_runs |
| participant_name | VARCHAR(100) | Cleaned name |
| program_name | VARCHAR(200) | Cleaned program |
| rating | INTEGER | Validated 1–5 |
| comments | TEXT | Optional |
| submitted_at | DATETIME | UTC-normalized |
| month_year | VARCHAR(7) | "YYYY-MM" for trend queries |

**Table: `program_analytics`**

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key |
| run_id | INTEGER | FK → etl_runs |
| program_name | VARCHAR(200) | |
| total_responses | INTEGER | |
| avg_rating | FLOAT | |
| five_star_count … one_star_count | INTEGER | Per-rating counts |

---

### Running the ETL (Phase 2)

**Via the UI (recommended):**
1. Start backend and frontend (same as Phase 1)
2. Go to `http://localhost:3000/etl`
3. Drag-and-drop `datasets/feedback_sample_dirty.csv` or click to browse
4. Click **Run ETL Pipeline**
5. View the result panel (loaded/duplicate/invalid counts)
6. Go to `http://localhost:3000/analytics` to see the charts

**Via Swagger UI:**
```
POST http://localhost:8001/etl/upload
  Content-Type: multipart/form-data
  file: <upload feedback_sample_dirty.csv>
```

---

### Updated Project Structure

```
Feedback_Management_System/
├── datasets/
│   └── feedback_sample_dirty.csv   # 120-row sample with dirty data
├── backend/
│   ├── main.py                     # FastAPI entry + routers (v2.0.0)
│   ├── database.py
│   ├── models.py                   # + ETLRun, AnalyticsFeedback, ProgramAnalytics
│   ├── schemas.py                  # + ETL and analytics Pydantic schemas
│   ├── crud.py
│   ├── services/
│   │   └── etl_service.py          # ETLPipeline class (Extract→Transform→Load)
│   ├── routers/
│   │   ├── feedback.py
│   │   ├── etl.py                  # NEW — ETL upload & run history
│   │   └── analytics.py            # NEW — analytics & download endpoints
│   └── requirements.txt            # + pandas, openpyxl, python-multipart
├── frontend/
│   ├── src/
│   │   ├── App.js                  # + /analytics and /etl routes
│   │   ├── components/
│   │   │   └── Navbar.js           # + Analytics & ETL Import nav links
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── SubmitFeedback.js
│   │   │   ├── FeedbackList.js
│   │   │   ├── FeedbackDetail.js
│   │   │   ├── AnalyticsDashboard.js  # NEW
│   │   │   └── ETLUpload.js           # NEW
│   │   └── services/
│   │       └── api.js              # + etlApi, analyticsApi
│   └── package.json                # + recharts
├── start_backend.bat
├── start_frontend.bat
└── README.md
```
