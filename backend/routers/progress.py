from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date
from dependencies import get_db
from models.progress import UserProgress
from schemas.progress import ProgressCreate

router = APIRouter(
    prefix="/progress",
    tags=["User Progress"]
)


@router.post("/complete")
def mark_completed(progress: ProgressCreate, db: Session = Depends(get_db)):
    # 🔥 Check if user already completed a diet today
    today = date.today()
    last_completed = db.query(UserProgress).filter(
        UserProgress.user_id == progress.user_id,
        UserProgress.status == "completed"
    ).order_by(UserProgress.updated_at.desc()).first()

    if last_completed and last_completed.updated_at.date() == today:
        if last_completed.day != progress.day: # Allow re-saving same day, but not mark NEW day
             raise HTTPException(
                status_code=403, 
                detail="You can only complete one diet plan per day. Please come back tomorrow!"
            )

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
