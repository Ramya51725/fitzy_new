from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import json
import cloudinary
import cloudinary.uploader

from models.exemodel import Exercise
from schemas.exeschema import ExerciseResponse, ExerciseUpdate, Focusupdate
from dependencies import get_db

import cloudinary_config  

router = APIRouter(
    prefix="/exercise",
    tags=["Exercise"]
)

@router.get("/")
def get_all(db: Session = Depends(get_db)):
    return db.query(Exercise).all()


@router.get("/by-category-level")
def get_exercise_by_category_and_level(
    category_id: int,
    level: str,
    db: Session = Depends(get_db)
):
    normalized_level = level.strip().lower()
    
    return db.query(Exercise).filter(
        Exercise.category_id == category_id,
        (Exercise.level.ilike(level)) | 
        (Exercise.level.ilike(normalized_level)) | 
        (Exercise.level.ilike(normalized_level.replace(" ", "")))
    ).all()


@router.post("/create", response_model=ExerciseResponse)
async def create_exercise(
    level: str = Form(...),
    title: str = Form(...),
    instruction: str = Form(...),
    breathing_tip: str = Form(None),
    focus_area: str = Form(None),
    category_id: int = Form(...),

    exercise_image: UploadFile = File(...),
    exercise_video: UploadFile = File(...),

    db: Session = Depends(get_db)
):
    try:
        image_upload = cloudinary.uploader.upload(
            exercise_image.file,
            folder="fitzy/exercises/images"
        )

        video_upload = cloudinary.uploader.upload(
            exercise_video.file,
            resource_type="video",
            folder="fitzy/exercises/videos"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Cloudinary upload failed: {str(e)}"
        )

    image_url = image_upload.get("secure_url")
    video_url = video_upload.get("secure_url")

    focus_list = []
    if focus_area:
        try:
            focus_list = json.loads(focus_area)
        except:
            focus_list = [f.strip() for f in focus_area.split(",")]

    new_exercise = Exercise(
        level=level,
        title=title,
        instruction=instruction,
        breathing_tip=breathing_tip,
        exercise_image=image_url,
        exercise_video=video_url,
        focus_area=focus_list,
        category_id=category_id
    )

    db.add(new_exercise)
    db.commit()
    db.refresh(new_exercise)

    return new_exercise

@router.put("/update/{id}")
def update_exercise(
    id: int,
    exercise: ExerciseUpdate,
    db: Session = Depends(get_db)
):
    ex = db.query(Exercise).filter(
        Exercise.exercise_id == id
    ).first()

    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")

    ex.level = exercise.level
    ex.title = exercise.title
    ex.instruction = exercise.instruction
    ex.breathing_tip = exercise.breathing_tip
    ex.exercise_image = exercise.exercise_image
    ex.exercise_video = exercise.exercise_video
    ex.focus_area = exercise.focus_area
    ex.category_id = exercise.category_id

    db.commit()
    db.refresh(ex)
    return ex





@router.delete("/delete/{id}")
def delete_exercise(id: int, db: Session = Depends(get_db)):
    exercise = db.query(Exercise).filter(
        Exercise.exercise_id == id
    ).first()

    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    db.delete(exercise)
    db.commit()
    return {"msg": "Exercise deleted successfully"}


@router.patch("/focus/{exercise_id}")
def update_focus(
    exercise_id: int,
    update_focus: Focusupdate,
    db: Session = Depends(get_db)
):
    exercise = db.query(Exercise).filter(
        Exercise.exercise_id == exercise_id
    ).first()

    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    exercise.focus_area = update_focus.focus_area
    db.commit()
    db.refresh(exercise)
    return exercise


@router.get("/{id}")
def get_exercise_by_id(id: int, db: Session = Depends(get_db)):
    exercise = db.query(Exercise).filter(
        Exercise.exercise_id == id
    ).first()

    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    return exercise




