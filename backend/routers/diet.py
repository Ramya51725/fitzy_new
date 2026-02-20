from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.dietmodel import DietVeg
from schemas.dietschema import DietCreate, DietUpdate
from dependencies import get_db

router = APIRouter(
    prefix="/veg",
    tags=["veg"]
)


@router.get("/diet")
def get_all(db: Session = Depends(get_db)):
    return db.query(DietVeg).all()


@router.get("/diet/by-category-day")
def get_diet_by_category_and_day(
    category_id: int,
    day: int,
    db: Session = Depends(get_db)
):
    return db.query(DietVeg).filter(
        DietVeg.category_id == category_id,
        DietVeg.day == day
    ).all()


@router.get("/diet/{diet_id}")
def get_diet_by_id(diet_id: int, db: Session = Depends(get_db)):
    return db.query(DietVeg).get(diet_id)


@router.post("/diet")
def create_diet(diet: DietCreate, db: Session = Depends(get_db)):
    new_diet = DietVeg(
        day=diet.day,
        breakfast=diet.breakfast,
        lunch=diet.lunch,
        dinner=diet.dinner,
        category_id=diet.category_id
    )
    db.add(new_diet)
    db.commit()
    db.refresh(new_diet)
    return new_diet



@router.put("/update/{id}")
def update_diet(id: int, diet: DietUpdate, db: Session = Depends(get_db)):
    diet_update = db.query(DietVeg).filter(DietVeg.diet_id == id).first()
    if not diet_update:
        return {"msg": "Diet not found"}

    diet_update.day = diet.day
    diet_update.breakfast = diet.breakfast
    diet_update.lunch = diet.lunch
    diet_update.dinner = diet.dinner
    diet_update.category_id = diet.category_id

    db.commit()
    db.refresh(diet_update)
    return diet_update



@router.delete("/deletediet/{id}")
def delete_diet(id: int, db: Session = Depends(get_db)):
    del_diet = db.query(DietVeg).filter(DietVeg.diet_id == id).first()
    if not del_diet:
        return {"msg": "Diet not found"}

    db.delete(del_diet)
    db.commit()
    return {"msg": "Diet deleted successfully"}
