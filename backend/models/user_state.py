from sqlalchemy import Column, Integer, String, ForeignKey
from database.db import Base

class UserActiveState(Base):
    __tablename__ = "user_active_state"

    user_id = Column(Integer, ForeignKey("userdetail.user_id", ondelete="CASCADE"), primary_key=True)
    active_category_id = Column(Integer, nullable=True)
    active_level = Column(String(50), nullable=True)
    selected_day = Column(Integer, default=1)
