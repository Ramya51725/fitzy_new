from pydantic import BaseModel
from typing import List, Optional

class ExerciseResponse(BaseModel):
    exercise_id: int
    level: str
    title: str
    instruction: str
    breathing_tip: Optional[str]
    exercise_image: str
    exercise_video: str
    focus_area: Optional[List[str]]
    category_id: int

    class Config:
        from_attributes = True
class ExerciseUpdate(BaseModel):
    level: str
    title: str 
    instruction : str
    breathing_tip : str 
    exercise_image:str
    exercise_video:str
    focus_area : List[str]
    category_id : int  
class Focusupdate(BaseModel):
     focus_area:List[str]