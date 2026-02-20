from pydantic import BaseModel 

class NonDietCreate(BaseModel):
    day:int
    breakfast:str
    lunch : str
    dinner: str
    category_id :int
class NonDietUpdate(BaseModel):
    day:int
    breakfast:str
    lunch : str
    dinner: str
    category_id :int
 