import sys
import os

# 🔥 ENSURE BACKEND DIRECTORY IS IN PATH FOR VERCEL
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, APIRouter, Depends
from sqlalchemy.orm import Session
from dependencies import get_db
from fastapi.middleware.cors import CORSMiddleware
from database.db import Base, engine
from models.category import Category
from models.exemodel import Exercise
from models.dietmodel import DietVeg
from models.model import User
from models.nonveg_model import DietNonVeg
# from models.exercise_log import ExerciseLog
from models.exercise_progress import ExerciseProgress
from routers import user, diet, nonveg_diet, exercise, category
from routers import progress
from routers import exercise_progress

app = FastAPI()

# Allow all for CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,     
    allow_credentials=True,
    allow_methods=["*"],      
    allow_headers=["*"],
)

# Health check route
@app.get("/health")
def health_check():
    return {"status": "ok", "version": "v1.2"}

# Root route removed to avoid index.html conflict

# API prefix router (no prefix — routes served at root level)
api_router = APIRouter()

api_router.include_router(exercise_progress.router)
api_router.include_router(progress.router)
api_router.include_router(exercise_log.router)
api_router.include_router(user.router)
api_router.include_router(diet.router)
api_router.include_router(nonveg_diet.router)
api_router.include_router(exercise.router)
api_router.include_router(category.router)

app.include_router(api_router)

# 🔥 Tables & Migrations on Startup
@app.on_event("startup")
def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
        
        # 🔥 MANUAL MIGRATIONS (Ensure new columns exist)
        from sqlalchemy import text
        with engine.connect() as conn:
            # 1. Update user_progress
            try:
                conn.execute(text("ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();"))
                conn.commit()
            except Exception as e:
                print(f"Migration 1 error: {e}")

            # 2. Update exercise_progress
            try:
                conn.execute(text("ALTER TABLE exercise_progress ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();"))
                conn.execute(text("ALTER TABLE exercise_progress ADD COLUMN IF NOT EXISTS last_completed_date TIMESTAMPTZ;"))
                conn.commit()
            except Exception as e:
                print(f"Migration 2 error: {e}")
            
        print("Database synced successfully ✅")
    except Exception as e:
        print(f"Database sync error during startup: {e}")