from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ExerciseLogCreate(BaseModel):
    user_id: int
    exercise_id: Optional[int] = None
    title: str
    level: str
    day: int

class ExerciseLogResponse(BaseModel):
    log_id: int
    user_id: int
    exercise_id: Optional[int] = None
    title: str
    level: str
    day: int
    completed_at: datetime

    class Config:
        from_attributes = True
