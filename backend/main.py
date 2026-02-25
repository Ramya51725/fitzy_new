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
from models.exercise_progress import ExerciseProgress
from routers import user, diet, nonveg_diet, exercise, category
from routers import progress
from routers import exercise_progress

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,     
    allow_credentials=True,
    allow_methods=["*"],      
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "v1.2"}


api_router = APIRouter()

api_router.include_router(exercise_progress.router)
api_router.include_router(progress.router)
api_router.include_router(user.router)
api_router.include_router(diet.router)
api_router.include_router(nonveg_diet.router)
api_router.include_router(exercise.router)
api_router.include_router(category.router)

app.include_router(api_router)

