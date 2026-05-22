from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from models import Feedback
from schemas import FeedbackCreate, FeedbackUpdate
from typing import Optional


def get_all_feedback(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Feedback).order_by(Feedback.submitted_at.desc()).offset(skip).limit(limit).all()


def get_feedback_by_id(db: Session, feedback_id: int):
    return db.query(Feedback).filter(Feedback.feedback_id == feedback_id).first()


def create_feedback(db: Session, feedback: FeedbackCreate):
    db_feedback = Feedback(**feedback.model_dump())
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback


def update_feedback(db: Session, feedback_id: int, feedback: FeedbackUpdate):
    db_feedback = get_feedback_by_id(db, feedback_id)
    if not db_feedback:
        return None
    update_data = feedback.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_feedback, field, value)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback


def delete_feedback(db: Session, feedback_id: int):
    db_feedback = get_feedback_by_id(db, feedback_id)
    if not db_feedback:
        return False
    db.delete(db_feedback)
    db.commit()
    return True


def search_feedback(
    db: Session,
    keyword: Optional[str] = None,
    rating: Optional[int] = None,
    program_name: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
):
    query = db.query(Feedback)
    if keyword:
        keyword_filter = f"%{keyword}%"
        query = query.filter(
            or_(
                Feedback.participant_name.ilike(keyword_filter),
                Feedback.program_name.ilike(keyword_filter),
                Feedback.comments.ilike(keyword_filter),
            )
        )
    if rating is not None:
        query = query.filter(Feedback.rating == rating)
    if program_name:
        query = query.filter(Feedback.program_name.ilike(f"%{program_name}%"))
    return query.order_by(Feedback.submitted_at.desc()).offset(skip).limit(limit).all()


def get_stats(db: Session):
    total = db.query(func.count(Feedback.feedback_id)).scalar()
    avg = db.query(func.avg(Feedback.rating)).scalar()
    return {
        "total": total or 0,
        "average_rating": round(avg, 2) if avg else None,
    }
