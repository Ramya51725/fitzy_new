from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db
from models.exercise_progress import ExerciseProgress
from schemas.exercise_progress import (
    ProgressCreate,
    ProgressUpdate,
    ProgressResponse
)

router = APIRouter(
    prefix="/progress",
    tags=["Exercise Progress"]
)


# =========================================
# 🔥 COMPLETE DAY
# =========================================
@router.post("/complete-day", response_model=ProgressResponse)
def complete_day(progress: ProgressCreate, db: Session = Depends(get_db)):

    existing = db.query(ExerciseProgress).filter(
        ExerciseProgress.user_id == progress.user_id,
        ExerciseProgress.level == progress.level,
        ExerciseProgress.category_id == progress.category_id   # ✅ FIXED
    ).first()

    if existing:

        existing.completed_days += 1
        existing.current_day += 1

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

        # Reset exercises when a day is marked complete
        existing.completed_exercises = 0

        db.commit()
        db.refresh(existing)
        return existing

    # If no progress → create new
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


# =========================================
# 🔥 GET PROGRESS
# =========================================
@router.get("/{user_id}/{level}/{category_id}", response_model=ProgressResponse)
def get_progress(user_id: int, level: str, category_id: int, db: Session = Depends(get_db)):

    progress = db.query(ExerciseProgress).filter(
        ExerciseProgress.user_id == user_id,
        ExerciseProgress.level == level,
        ExerciseProgress.category_id == category_id   # ✅ FIXED
    ).first()

    if not progress:
        raise HTTPException(status_code=404, detail="Progress not found")

    return progress


# =========================================
# 🔥 UPDATE PROGRESS
# =========================================
@router.put("/update/{user_id}/{level}/{category_id}", response_model=ProgressResponse)
def update_progress(
    user_id: int, 
    level: str, 
    category_id: int, 
    update_data: ProgressUpdate, 
    db: Session = Depends(get_db)
):

    progress = db.query(ExerciseProgress).filter(
        ExerciseProgress.user_id == user_id,
        ExerciseProgress.level == level,
        ExerciseProgress.category_id == category_id
    ).first()

    if not progress:
        raise HTTPException(status_code=404, detail="Progress not found")

    print(f"DEBUG: Updating Progress for User {user_id}, Level {level}")
    print(f"DEBUG: Incoming Data: {update_data.dict()}")

    # Sync fields if provided in request body
    if update_data.current_month is not None:
        progress.current_month = update_data.current_month
    if update_data.current_week is not None:
        progress.current_week = update_data.current_week
    if update_data.current_day is not None:
        progress.current_day = update_data.current_day
    if update_data.completed_days is not None:
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





# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from dependencies import get_db
# from models.exercise_progress import ExerciseProgress
# from schemas.exercise_progress import (
#     ProgressCreate,
#     ProgressUpdate,
#     ProgressResponse
# )

# router = APIRouter(
#     prefix="/progress",
#     tags=["Exercise Progress"]
# )


# @router.post("/complete-day", response_model=ProgressResponse)
# def complete_day(progress: ProgressCreate, db: Session = Depends(get_db)):

#     existing = db.query(ExerciseProgress).filter(
#         ExerciseProgress.user_id == progress.user_id,
#         ExerciseProgress.level == progress.level
#     ).first()

#     # 🔥 If progress exists → update
#     if existing:

#         existing.completed_days += 1
#         existing.current_day += 1

#         # 🔁 If 7 days completed → new week
#         if existing.current_day > 7:
#             existing.current_day = 1
#             existing.current_week += 1

#         # 🔁 If 4 weeks completed → new month
#         if existing.current_week > 4:
#             existing.current_week = 1
#             existing.current_month += 1
#             existing.is_month_completed = True

#         # 🔁 If 8 months completed → level completed
#         if existing.current_month > 8:
#             existing.is_level_completed = True

#         db.commit()
#         db.refresh(existing)
#         return existing

#     # 🔥 If no progress → create new
#     new_progress = ExerciseProgress(
#         user_id=progress.user_id,
#         level=progress.level,
#         category_id=progress.category_id,
#         completed_days=1,
#         current_day=2
#     )

#     db.add(new_progress)
#     db.commit()
#     db.refresh(new_progress)

#     return new_progress



# # 🔥 CREATE PROGRESS
# # @router.post("/create", response_model=ProgressResponse)
# # def create_progress(progress: ProgressCreate, db: Session = Depends(get_db)):

# #     existing = db.query(ExerciseProgress).filter(
# #         ExerciseProgress.user_id == progress.user_id,
# #         ExerciseProgress.level == progress.level
# #     ).first()

# #     if existing:
# #         raise HTTPException(status_code=400, detail="Progress already exists")

# #     new_progress = ExerciseProgress(**progress.dict())

# #     db.add(new_progress)
# #     db.commit()
# #     db.refresh(new_progress)

# #     return new_progress


# # 🔥 GET PROGRESS
# @router.get("/{user_id}/{level}", response_model=ProgressResponse)
# def get_progress(user_id: int, level: str, db: Session = Depends(get_db)):

#     progress = db.query(ExerciseProgress).filter(
#         ExerciseProgress.user_id == user_id,
#         ExerciseProgress.level == level
#     ).first()

#     if not progress:
#         raise HTTPException(status_code=404, detail="Progress not found")

#     return progress


# # 🔥 UPDATE PROGRESS (Partial Update)
# @router.put("/progress/update/{user_id}/{level}")
# def update_progress(user_id: int, level: str, db: Session = Depends(get_db)):

#     progress = db.query(ExerciseProgress).filter(
#         ExerciseProgress.user_id == user_id,
#         ExerciseProgress.level == level
#     ).first()

#     if not progress:
#         raise HTTPException(status_code=404, detail="Progress not found")

#     # 🔥 Move to next day
#     progress.current_day += 1
#     progress.completed_days += 1

#     # ✅ If week completed
#     if progress.current_day > 7:
#         progress.current_day = 1
#         progress.current_week += 1

#     # ✅ If month completed (4 weeks per month)
#     if progress.current_week > 4:
#         progress.current_week = 1
#         progress.current_month += 1
#         progress.is_month_completed = True

#     # ✅ If 8 months completed → level completed
#     if progress.current_month > 8:
#         progress.is_level_completed = True

#     db.commit()
#     db.refresh(progress)

#     return progress

