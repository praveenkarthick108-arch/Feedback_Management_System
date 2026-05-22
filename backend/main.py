from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import feedback, etl, analytics

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Feedback Management System API",
    description="Centralized feedback collection, storage, management, and ETL analytics",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(feedback.router)
app.include_router(etl.router)
app.include_router(analytics.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Feedback Management System API is running"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
