from pydantic import BaseModel
from typing import Optional

class UserStateBase(BaseModel):
    active_category_id: Optional[int] = None
    active_level: Optional[str] = None
    selected_day: Optional[int] = 1

class UserStateUpdate(UserStateBase):
    pass

class UserStateResponse(UserStateBase):
    user_id: int

    class Config:
        from_attributes = True
