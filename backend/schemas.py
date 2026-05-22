from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List


class FeedbackCreate(BaseModel):
    participant_name: str = Field(..., min_length=1, max_length=100)
    program_name: str = Field(..., min_length=1, max_length=200)
    rating: int = Field(..., ge=1, le=5)
    comments: Optional[str] = Field(None, max_length=2000)

    @validator("participant_name", "program_name")
    def strip_whitespace(cls, v):
        return v.strip()


class FeedbackUpdate(BaseModel):
    participant_name: Optional[str] = Field(None, min_length=1, max_length=100)
    program_name: Optional[str] = Field(None, min_length=1, max_length=200)
    rating: Optional[int] = Field(None, ge=1, le=5)
    comments: Optional[str] = Field(None, max_length=2000)

    @validator("participant_name", "program_name", pre=True)
    def strip_whitespace(cls, v):
        if v is not None:
            return v.strip()
        return v


class FeedbackResponse(BaseModel):
    feedback_id: int
    participant_name: str
    program_name: str
    rating: int
    comments: Optional[str]
    submitted_at: datetime

    class Config:
        from_attributes = True


class FeedbackListResponse(BaseModel):
    total: int
    feedbacks: list[FeedbackResponse]
    average_rating: Optional[float]


# ── ETL Schemas ───────────────────────────────────────────────────────────────

class ETLRunResponse(BaseModel):
    run_id: int
    filename: str
    file_type: str
    status: str
    triggered_at: datetime
    completed_at: Optional[datetime]
    total_rows: Optional[int]
    valid_rows: Optional[int]
    duplicate_rows: Optional[int]
    invalid_rows: Optional[int]
    loaded_rows: Optional[int]
    error_message: Optional[str]

    class Config:
        from_attributes = True


class ETLRunSummary(BaseModel):
    run_id: int
    filename: str
    status: str
    triggered_at: datetime
    completed_at: Optional[datetime]
    total_rows: Optional[int]
    loaded_rows: Optional[int]
    duplicate_rows: Optional[int]
    invalid_rows: Optional[int]

    class Config:
        from_attributes = True


# ── Analytics Schemas ─────────────────────────────────────────────────────────

class AnalyticsSummary(BaseModel):
    total_records: int
    avg_rating: Optional[float]
    total_programs: int
    latest_run_id: Optional[int]
    latest_run_at: Optional[datetime]


class RatingDistributionItem(BaseModel):
    rating: int
    count: int
    percentage: float
    label: str


class TrendItem(BaseModel):
    month_year: str
    count: int
    avg_rating: float


class ProgramAnalyticsResponse(BaseModel):
    id: int
    run_id: int
    program_name: str
    total_responses: int
    avg_rating: float
    five_star_count: int
    four_star_count: int
    three_star_count: int
    two_star_count: int
    one_star_count: int

    class Config:
        from_attributes = True
