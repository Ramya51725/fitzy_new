from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.db import Base


class ExerciseProgress(Base):
    __tablename__ = "exercise_progress"

    progress_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("userdetail.user_id", ondelete="CASCADE"),
        nullable=False
    )

    level = Column(String(20), nullable=False)
    category_id = Column(Integer, nullable=False)

    current_month = Column(Integer, default=1)
    current_week = Column(Integer, default=1)
    current_day = Column(Integer, default=1)

    completed_days = Column(Integer, default=0)
    completed_exercises = Column(Integer, default=0)
    completed_months = Column(Integer, default=0)

    is_month_completed = Column(Boolean, default=False)
    is_level_completed = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="exercise_progress")
