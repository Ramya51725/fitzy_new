from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.db import Base

class ExerciseLog(Base):
    __tablename__ = "exercise_log"

    log_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("userdetail.user_id", ondelete="CASCADE"), nullable=False)
    exercise_id = Column(Integer, nullable=True) # ID might be null if exercise deleted
    title = Column(String(100), nullable=False)
    level = Column(String(50), nullable=False)
    day = Column(Integer, nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
