from pydantic import BaseModel

class ProgressCreate(BaseModel):
    user_id: int
    day: int


class ProgressResponse(BaseModel):
    day: int
    status: str
