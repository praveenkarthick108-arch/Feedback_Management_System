from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Boolean
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


class ETLRun(Base):
    __tablename__ = "etl_runs"

    run_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(10), nullable=False)
    triggered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(20), nullable=False, default="running")
    total_rows = Column(Integer, nullable=True)
    valid_rows = Column(Integer, nullable=True)
    duplicate_rows = Column(Integer, nullable=True)
    invalid_rows = Column(Integer, nullable=True)
    loaded_rows = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)


class AnalyticsFeedback(Base):
    __tablename__ = "analytics_feedback"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    run_id = Column(Integer, ForeignKey("etl_runs.run_id"), nullable=False)
    participant_name = Column(String(100), nullable=False)
    program_name = Column(String(200), nullable=False)
    rating = Column(Integer, nullable=False)
    comments = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=False)
    month_year = Column(String(7), nullable=False)


class ProgramAnalytics(Base):
    __tablename__ = "program_analytics"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    run_id = Column(Integer, ForeignKey("etl_runs.run_id"), nullable=False)
    program_name = Column(String(200), nullable=False)
    total_responses = Column(Integer, nullable=False, default=0)
    avg_rating = Column(Float, nullable=False, default=0.0)
    five_star_count = Column(Integer, nullable=False, default=0)
    four_star_count = Column(Integer, nullable=False, default=0)
    three_star_count = Column(Integer, nullable=False, default=0)
    two_star_count = Column(Integer, nullable=False, default=0)
    one_star_count = Column(Integer, nullable=False, default=0)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
