from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime, date
from dependencies import get_db
from models.exercise_progress import ExerciseProgress
from schemas.exercise_progress import (
    ProgressCreate,
    ProgressUpdate,
    ProgressResponse
)

router = APIRouter(
    prefix="/exercise-progress",
    tags=["Exercise Progress"]
)

def get_level_name(month: int) -> str:
    if month <= 2:
        return "Beginner"
    elif month <= 4:
        return "Intermediate"
    elif month <= 6:
        return "Advanced"
    else:
        return "Expert"



@router.post("/complete-day", response_model=ProgressResponse)
def complete_day(progress: ProgressCreate, db: Session = Depends(get_db)):

    existing = db.query(ExerciseProgress).filter(
        ExerciseProgress.user_id == progress.user_id,
        ExerciseProgress.level == progress.level,
        ExerciseProgress.category_id == progress.category_id   
    ).first()

    if existing:
        today = date.today()
        if existing.last_completed_date and existing.last_completed_date.date() == today:
            raise HTTPException(
                status_code=403, 
                detail="You have already completed a workout for today. Please come back tomorrow!"
            )

        existing.completed_days += 1
        existing.current_day += 1
        existing.last_completed_date = datetime.now()

        if existing.current_day > 7:
            existing.current_day = 1
            existing.current_week += 1

        if existing.current_week > 4:
            existing.current_week = 1
            existing.current_month += 1
            existing.completed_months += 1
            existing.is_month_completed = True

        if existing.current_month > 8:
            existing.is_level_completed = True

        existing.completed_exercises = 0

        db.commit()
        db.refresh(existing)

        return existing

    new_progress = ExerciseProgress(
        user_id=progress.user_id,
        level=progress.level,
        category_id=progress.category_id,
        completed_days=0,
        current_day=1,
        current_week=1,
        current_month=1
    )

    db.add(new_progress)
    db.commit()
    db.refresh(new_progress)

    return new_progress



@router.get("/{user_id}/{level}", response_model=ProgressResponse)
@router.get("/{user_id}/{level}/{category_id}", response_model=ProgressResponse)
def get_progress(
    user_id: int, 
    level: str, 
    category_id: Optional[int] = None, 
    db: Session = Depends(get_db)
):
    query = db.query(ExerciseProgress).filter(
        ExerciseProgress.user_id == user_id
    )

    if level != "fitzy":
        query = query.filter(ExerciseProgress.level == level)

    if category_id is not None and category_id != 0:
        query = query.filter(ExerciseProgress.category_id == category_id)

    progress = query.first()

    if not progress:
        raise HTTPException(status_code=404, detail="Progress not found")

    return progress


@router.post("/init", response_model=ProgressResponse)
def init_progress(progress: ProgressCreate, db: Session = Depends(get_db)):

    existing = db.query(ExerciseProgress).filter(
        ExerciseProgress.user_id == progress.user_id,
        ExerciseProgress.level.ilike(progress.level),
        ExerciseProgress.category_id == progress.category_id
    ).first()

    if existing:
        return existing

    new_progress = ExerciseProgress(
        user_id=progress.user_id,
        level=progress.level,   
        category_id=progress.category_id,
        current_month=1,
        current_week=1,
        current_day=1,
        completed_days=0,
        completed_months=0,
        completed_exercises=0,
        is_month_completed=False,
        is_level_completed=False
    )

    db.add(new_progress)
    db.commit()
    db.refresh(new_progress)

    return new_progress

@router.put("/update/{user_id}/{level}", response_model=ProgressResponse)
@router.put("/update/{user_id}/{level}/{category_id}", response_model=ProgressResponse)
def update_progress(
    user_id: int, 
    level: str, 
    update_data: ProgressUpdate, 
    category_id: Optional[int] = None, 
    db: Session = Depends(get_db)
):

    query = db.query(ExerciseProgress).filter(
        ExerciseProgress.user_id == user_id
    )

    if level != "fitzy":
        query = query.filter(ExerciseProgress.level == level)

    if category_id is not None and category_id != 0:
        query = query.filter(ExerciseProgress.category_id == category_id)

    progress = query.first()

    if not progress:
        raise HTTPException(status_code=404, detail="Progress not found")

    print(f"DEBUG: Updating Progress for User {user_id}, Level {level}")
    print(f"DEBUG: Incoming Data: {update_data.dict()}")

    if update_data.current_month is not None:
        progress.current_month = update_data.current_month
        progress.level = get_level_name(progress.current_month)
    if update_data.current_week is not None:
        progress.current_week = update_data.current_week
    if update_data.current_day is not None:
        progress.current_day = update_data.current_day
    if update_data.completed_days is not None:
        if update_data.completed_days > progress.completed_days:
            progress.last_completed_date = datetime.now()
        progress.completed_days = update_data.completed_days
    if update_data.completed_exercises is not None:
        progress.completed_exercises = update_data.completed_exercises
    if update_data.completed_months is not None:
        progress.completed_months = update_data.completed_months
    if update_data.is_month_completed is not None:
        progress.is_month_completed = update_data.is_month_completed
    if update_data.is_level_completed is not None:
        progress.is_level_completed = update_data.is_level_completed

    db.commit()
    db.refresh(progress)

    return progress






