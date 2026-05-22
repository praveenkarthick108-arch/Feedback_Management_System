import io
import csv
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from database import get_db
from models import AnalyticsFeedback, ProgramAnalytics, ETLRun
import schemas

router = APIRouter(prefix="/analytics", tags=["Analytics"])

RATING_LABELS = {1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent"}


@router.get("/summary", response_model=schemas.AnalyticsSummary)
def get_summary(db: Session = Depends(get_db)):
    total = db.query(func.count(AnalyticsFeedback.id)).scalar() or 0
    avg = db.query(func.avg(AnalyticsFeedback.rating)).scalar()
    prog_count = db.query(func.count(distinct(AnalyticsFeedback.program_name))).scalar() or 0
    latest_run = (
        db.query(ETLRun)
        .filter(ETLRun.status == "success")
        .order_by(ETLRun.completed_at.desc())
        .first()
    )
    return schemas.AnalyticsSummary(
        total_records=total,
        avg_rating=round(float(avg), 2) if avg else None,
        total_programs=prog_count,
        latest_run_id=latest_run.run_id if latest_run else None,
        latest_run_at=latest_run.completed_at if latest_run else None,
    )


@router.get("/rating-distribution", response_model=List[schemas.RatingDistributionItem])
def get_rating_distribution(db: Session = Depends(get_db)):
    total = db.query(func.count(AnalyticsFeedback.id)).scalar() or 0
    rows = (
        db.query(AnalyticsFeedback.rating, func.count(AnalyticsFeedback.id))
        .group_by(AnalyticsFeedback.rating)
        .all()
    )
    count_map = {r: c for r, c in rows}
    result = []
    for rating in range(1, 6):
        count = count_map.get(rating, 0)
        result.append(
            schemas.RatingDistributionItem(
                rating=rating,
                count=count,
                percentage=round(count / total * 100, 1) if total > 0 else 0.0,
                label=RATING_LABELS[rating],
            )
        )
    return result


@router.get("/top-programs", response_model=List[schemas.ProgramAnalyticsResponse])
def get_top_programs(limit: int = Query(default=8, ge=1, le=50), db: Session = Depends(get_db)):
    latest_run = (
        db.query(ETLRun)
        .filter(ETLRun.status == "success")
        .order_by(ETLRun.completed_at.desc())
        .first()
    )
    if latest_run is None:
        return []
    programs = (
        db.query(ProgramAnalytics)
        .filter(ProgramAnalytics.run_id == latest_run.run_id)
        .order_by(ProgramAnalytics.avg_rating.desc())
        .limit(limit)
        .all()
    )
    return programs


@router.get("/trends", response_model=List[schemas.TrendItem])
def get_trends(db: Session = Depends(get_db)):
    rows = (
        db.query(
            AnalyticsFeedback.month_year,
            func.count(AnalyticsFeedback.id),
            func.avg(AnalyticsFeedback.rating),
        )
        .group_by(AnalyticsFeedback.month_year)
        .order_by(AnalyticsFeedback.month_year)
        .all()
    )
    return [
        schemas.TrendItem(
            month_year=r[0],
            count=r[1],
            avg_rating=round(float(r[2]), 2),
        )
        for r in rows
    ]


@router.get("/program-breakdown", response_model=List[schemas.ProgramAnalyticsResponse])
def get_program_breakdown(
    sort_by: str = Query(default="total_responses", pattern="^(total_responses|avg_rating|program_name)$"),
    db: Session = Depends(get_db),
):
    latest_run = (
        db.query(ETLRun)
        .filter(ETLRun.status == "success")
        .order_by(ETLRun.completed_at.desc())
        .first()
    )
    if latest_run is None:
        return []

    order_col = {
        "total_responses": ProgramAnalytics.total_responses.desc(),
        "avg_rating": ProgramAnalytics.avg_rating.desc(),
        "program_name": ProgramAnalytics.program_name.asc(),
    }[sort_by]

    programs = (
        db.query(ProgramAnalytics)
        .filter(ProgramAnalytics.run_id == latest_run.run_id)
        .order_by(order_col)
        .all()
    )
    return programs


@router.get("/download")
def download_analytics(db: Session = Depends(get_db)):
    latest_run = (
        db.query(ETLRun)
        .filter(ETLRun.status == "success")
        .order_by(ETLRun.completed_at.desc())
        .first()
    )

    rows = []
    if latest_run:
        rows = (
            db.query(ProgramAnalytics)
            .filter(ProgramAnalytics.run_id == latest_run.run_id)
            .order_by(ProgramAnalytics.total_responses.desc())
            .all()
        )

    today = datetime.now(timezone.utc).strftime("%Y%m%d")
    filename = f"analytics_export_{today}.csv"

    def generate():
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Program Name", "Total Responses", "Avg Rating",
            "5 Star", "4 Star", "3 Star", "2 Star", "1 Star"
        ])
        for r in rows:
            writer.writerow([
                r.program_name, r.total_responses, r.avg_rating,
                r.five_star_count, r.four_star_count, r.three_star_count,
                r.two_star_count, r.one_star_count,
            ])
        yield output.getvalue()

    return StreamingResponse(
        generate(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
