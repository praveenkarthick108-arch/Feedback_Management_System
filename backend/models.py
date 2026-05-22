from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    feedback_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    participant_name = Column(String(100), nullable=False)
    program_name = Column(String(200), nullable=False)
    rating = Column(Integer, nullable=False)
    comments = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
