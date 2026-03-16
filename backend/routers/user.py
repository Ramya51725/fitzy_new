from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from dependencies import get_db
from models.model import User
from models.category import Category
from models.exercise_progress import ExerciseProgress
from schemas.schema import UserCreate, UserUpdate, UserLogin
from utils.bmi_utils import calculate_bmi

router = APIRouter(
    prefix="/users",
    tags=["User"]
)

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hashing(password: str):
    return pwd_context.hash(password)


def verification(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


@router.get("/get")
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):

    email = user.email.strip().lower()

    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verification(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "message": "Login successful",
        "user_id": db_user.user_id,
        "name": db_user.name,
        "email": db_user.email,
        "category_id": db_user.category_id
    }


@router.post("/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    bmi = calculate_bmi(user.weight, user.height)

    category = db.query(Category).filter(
        Category.bmi_start <= bmi,
        Category.bmi_end >= bmi
    ).first()

    new_user = User(
        name=user.name,
        age=user.age,
        weight=user.weight,
        height=user.height,
        email=user.email,
        password=hashing(user.password),
        gender=user.gender,
        bmi=bmi,
        category_id=category.category_id if category else None
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    progress = ExerciseProgress(
        user_id=new_user.user_id,
        level="Beginner",
        category_id=new_user.category_id,
        current_month=1,
        current_week=1,
        current_day=1,
        completed_days=0,
        completed_months=0,
        completed_exercises=0,
        is_month_completed=False,
        is_level_completed=False
    )

    db.add(progress)
    db.commit()

    return {
        "user_id": new_user.user_id,
        "name": new_user.name,
        "email": new_user.email,
        "category_id": new_user.category_id
    }



@router.delete("/delete/{id}")
def delete_user(id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.user_id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}
