from database.db import Base
from sqlalchemy import Column, String, Integer, JSON, ForeignKey

class Exercise(Base):
    __tablename__ = "exercise"

    exercise_id = Column(Integer, primary_key=True, index=True)
    level = Column(String, nullable=False)
    title = Column(String, nullable=False)
    exercise_image = Column(String, nullable=False)  
    exercise_video = Column(String, nullable=False)  
    instruction = Column(String, nullable=False)
    breathing_tip = Column(String)
    focus_area = Column(JSON)                        
    category_id = Column(Integer, ForeignKey("category.category_id"), nullable=False)
