from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import ETLRun
import schemas
from services.etl_service import ETLPipeline

router = APIRouter(prefix="/etl", tags=["ETL"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload", response_model=schemas.ETLRunResponse)
async def upload_and_run_etl(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    filename = file.filename or "upload"
    lower = filename.lower()
    if not (lower.endswith(".csv") or lower.endswith(".xlsx") or lower.endswith(".xls")):
        raise HTTPException(status_code=400, detail="Only .csv and .xlsx files are supported")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10 MB")
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    pipeline = ETLPipeline(db)
    result = pipeline.run(content, filename)

    run = db.query(ETLRun).filter(ETLRun.run_id == result["run_id"]).first()
    if run is None:
        raise HTTPException(status_code=500, detail="ETL run record not found after execution")
    return run


@router.get("/runs", response_model=List[schemas.ETLRunSummary])
def list_etl_runs(limit: int = 50, db: Session = Depends(get_db)):
    runs = (
        db.query(ETLRun)
        .order_by(ETLRun.triggered_at.desc())
        .limit(limit)
        .all()
    )
    return runs


@router.get("/runs/{run_id}", response_model=schemas.ETLRunResponse)
def get_etl_run(run_id: int, db: Session = Depends(get_db)):
    run = db.query(ETLRun).filter(ETLRun.run_id == run_id).first()
    if run is None:
        raise HTTPException(status_code=404, detail=f"ETL run {run_id} not found")
    return run
