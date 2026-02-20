from sqlalchemy import Column, String, Integer, Float
from database.db import Base

class Category(Base):
    __tablename__ = "category"
    category_id = Column(Integer, primary_key=True, index=True)
    category = Column(String)
    bmi_start = Column(Float)
    bmi_end = Column(Float)

    