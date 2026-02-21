from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date
from dependencies import get_db
from models.progress import UserProgress
from models.exercise_progress import ExerciseProgress
from schemas.progress import ProgressCreate

router = APIRouter(
    prefix="/progress",
    tags=["User Progress"]
)


@router.post("/complete")
def mark_completed(progress: ProgressCreate, db: Session = Depends(get_db)):
    existing = db.query(UserProgress).filter(
        UserProgress.user_id == progress.user_id,
        UserProgress.day == progress.day
    ).first()

    if existing:
        existing.status = "completed"
    else:
        db.add(
            UserProgress(
                user_id=progress.user_id,
                day=progress.day,
                status="completed"
            )
        )

    db.commit()
    return {"message": "Day marked as completed"}


@router.get("/{user_id}")
def get_user_progress(user_id: int, db: Session = Depends(get_db)):
    # 🔥 AUTO-SYNC: Check workout progress and fill diet gaps
    workout = db.query(ExerciseProgress).filter(
        ExerciseProgress.user_id == user_id
    ).order_by(ExerciseProgress.completed_days.desc()).first()

    if workout and workout.completed_days > 0:
        max_diet_days = min(workout.completed_days, 30)
        for day_num in range(1, max_diet_days + 1):
            existing = db.query(UserProgress).filter(
                UserProgress.user_id == user_id,
                UserProgress.day == day_num
            ).first()
            if not existing:
                db.add(UserProgress(user_id=user_id, day=day_num, status="completed"))
            elif existing.status != "completed":
                existing.status = "completed"
        db.commit()

    progress = db.query(UserProgress).filter(
        UserProgress.user_id == user_id
    ).all()

    return [
        {
            "day": p.day,
            "status": p.status,
            "updated_at": p.updated_at
        }
        for p in progress
    ]
@router.delete("/reset/{user_id}")
def reset_progress(user_id: int, db: Session = Depends(get_db)):
    db.query(UserProgress).filter(UserProgress.user_id == user_id).delete()
    db.commit()
    return {"message": "Progress reset successfully"}
