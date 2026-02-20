from pydantic import BaseModel
from typing import Optional


# 🔥 CREATE
class ProgressCreate(BaseModel):
    user_id: int
    level: str
    category_id: int


# 🔥 UPDATE (Partial Update Supported)
class ProgressUpdate(BaseModel):
    current_month: Optional[int] = None
    current_week: Optional[int] = None
    current_day: Optional[int] = None
    completed_days: Optional[int] = None
    completed_exercises: Optional[int] = None
    completed_months: Optional[int] = None
    is_month_completed: Optional[bool] = None
    is_level_completed: Optional[bool] = None


# 🔥 RESPONSE
class ProgressResponse(BaseModel):
    progress_id: int
    user_id: int
    level: str
    category_id: int
    current_month: int
    current_week: int
    current_day: int
    completed_days: int
    completed_exercises: int
    completed_months: int
    is_month_completed: bool
    is_level_completed: bool

    class Config:
        from_attributes = True   # ✅ Pydantic V2
