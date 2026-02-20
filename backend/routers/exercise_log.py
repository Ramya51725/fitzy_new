from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db
from models.exercise_log import ExerciseLog
from schemas.exercise_log import ExerciseLogCreate, ExerciseLogResponse
from typing import List

router = APIRouter(
    prefix="/exercise-log",
    tags=["Exercise Log"]
)

@router.post("/log", response_model=ExerciseLogResponse)
def log_exercise(log: ExerciseLogCreate, db: Session = Depends(get_db)):
    print(f"DEBUG: Logging Exercise - User: {log.user_id}, Title: {log.title}")
    new_log = ExerciseLog(
        user_id=log.user_id,
        exercise_id=log.exercise_id,
        title=log.title,
        level=log.level,
        day=log.day
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    print("DEBUG: Exercise logged successfully ✅")
    return new_log

@router.get("/user/{user_id}", response_model=List[ExerciseLogResponse])
def get_user_logs(user_id: int, db: Session = Depends(get_db)):
    return db.query(ExerciseLog).filter(ExerciseLog.user_id == user_id).order_by(ExerciseLog.completed_at.desc()).all()
