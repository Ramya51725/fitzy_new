from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.nonveg_model import DietNonVeg
from schemas.nonveg_schema import NonDietCreate, NonDietUpdate
from dependencies import get_db

router = APIRouter(
    prefix="/nonveg",
    tags=["Nonveg"]
)


@router.get("/nonvegdiet")
def get_all(db: Session = Depends(get_db)):
    return db.query(DietNonVeg).all()

@router.get("/diet/by-category-day")
def get_nonveg_diet_by_category_day(
    category_id: int,
    day: int,
    db: Session = Depends(get_db)
):
    return db.query(DietNonVeg).filter(
        DietNonVeg.category_id == category_id,
        DietNonVeg.day == day
    ).all()

@router.get("/nonveg/{diet_id}")
def get_diet_by_id(diet_id: int, db: Session = Depends(get_db)):
    diet = db.query(DietNonVeg).get(diet_id)
    if not diet:
        raise HTTPException(status_code=404, detail="Diet not found")
    return diet


@router.post("/nonveg")
def create_diet(diet: NonDietCreate, db: Session = Depends(get_db)):
    new_diet = DietNonVeg(
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
def update_diet(id: int, diet: NonDietUpdate, db: Session = Depends(get_db)):
    diet_update = db.query(DietNonVeg).filter(DietNonVeg.diet_id == id).first()
    if not diet_update:
        raise HTTPException(status_code=404, detail="Diet not found")

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
    del_diet = db.query(DietNonVeg).filter(DietNonVeg.diet_id == id).first()
    if not del_diet:
        raise HTTPException(status_code=404, detail="Diet not found")
    db.delete(del_diet)
    db.commit()
    return {"msg": "Diet deleted successfully"}

