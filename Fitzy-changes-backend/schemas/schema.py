from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    age: int
    weight: float
    height: float
    email: str
    password: str
    gender: str

class UserUpdate(BaseModel):
    name: str
    age: int
    weight: float
    height: float
    email: str
    password: str
    gender: str
    bmi :float

class UserLogin(BaseModel):
    email: str
    password: str
    
