from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
import crud
import schemas

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.get("", response_model=schemas.FeedbackListResponse)
def get_all_feedback(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    feedbacks = crud.get_all_feedback(db, skip=skip, limit=limit)
    stats = crud.get_stats(db)
    return {
        "total": stats["total"],
        "feedbacks": feedbacks,
        "average_rating": stats["average_rating"],
    }


@router.get("/search", response_model=list[schemas.FeedbackResponse])
def search_feedback(
    keyword: Optional[str] = Query(None),
    rating: Optional[int] = Query(None, ge=1, le=5),
    program_name: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    return crud.search_feedback(db, keyword=keyword, rating=rating, program_name=program_name, skip=skip, limit=limit)


@router.get("/{feedback_id}", response_model=schemas.FeedbackResponse)
def get_feedback(feedback_id: int, db: Session = Depends(get_db)):
    feedback = crud.get_feedback_by_id(db, feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return feedback


@router.post("", response_model=schemas.FeedbackResponse, status_code=201)
def create_feedback(feedback: schemas.FeedbackCreate, db: Session = Depends(get_db)):
    return crud.create_feedback(db, feedback)


@router.put("/{feedback_id}", response_model=schemas.FeedbackResponse)
def update_feedback(feedback_id: int, feedback: schemas.FeedbackUpdate, db: Session = Depends(get_db)):
    updated = crud.update_feedback(db, feedback_id, feedback)
    if not updated:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return updated


@router.delete("/{feedback_id}", status_code=204)
def delete_feedback(feedback_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_feedback(db, feedback_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Feedback not found")
