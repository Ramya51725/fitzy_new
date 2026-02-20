from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from dependencies import get_db
from models.progress import UserProgress
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

    progress = db.query(UserProgress).filter(
        UserProgress.user_id == user_id
    ).all()

    return [
        {
            "day": p.day,
            "status": p.status
        }
        for p in progress
    ]
