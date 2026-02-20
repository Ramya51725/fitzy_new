from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database.db import Base

class User(Base):
    __tablename__ = "userdetail"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    age = Column(Integer)
    weight = Column(Float)
    height = Column(Float)
    bmi = Column(Float)

    email = Column(String, unique=True, index=True)
    password = Column(String)
    gender = Column(String)

    category_id = Column(Integer, ForeignKey("category.category_id"))
    category = relationship("Category")


    progress = relationship(
        "UserProgress",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    exercise_progress = relationship(
        "ExerciseProgress",
        back_populates="user",
        cascade="all, delete-orphan"
    )


