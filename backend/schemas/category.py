from pydantic import BaseModel 

class CategoryCreate(BaseModel):
    category_id:int
    category:str
    bmi_start :float
    bmi_end: float

