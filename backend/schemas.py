from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional


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
