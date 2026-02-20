from database.db import Base
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship

class DietVeg(Base):
    __tablename__ = "diet_veg_detail"

    diet_id = Column(Integer, primary_key=True)
    day = Column(Integer)
    breakfast = Column(String)
    lunch = Column(String)
    dinner = Column(String)
    category_id = Column(Integer, ForeignKey("category.category_id")) 
    category = relationship("Category")   


    

    