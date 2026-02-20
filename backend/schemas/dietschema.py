from pydantic import BaseModel

class DietCreate(BaseModel):
    day: int
    breakfast: str
    lunch: str
    dinner: str
    category_id: int

class DietUpdate(BaseModel):
    day: int
    breakfast: str
    lunch: str
    dinner: str
    category_id: int
