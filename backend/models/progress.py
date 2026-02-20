from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.db import Base

class UserProgress(Base):
    __tablename__ = "user_progress"

    progress_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("userdetail.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    day = Column(Integer, nullable=False)  
    status = Column(String(15), default="pending")
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="progress")
