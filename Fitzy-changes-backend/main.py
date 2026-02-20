from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from database.db import Base, engine
from models.category import Category
from models.exemodel import Exercise
from models.dietmodel import DietVeg
from models.model import User
from models.nonveg_model import DietNonVeg
from models.exercise_log import ExerciseLog
from models.exercise_progress import ExerciseProgress
from routers import user, diet, nonveg_diet, exercise, category, exercise_log
from routers import progress
from routers import exercise_progress

app = FastAPI()

# Allow all for CORS in production/vercel
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,     
    allow_credentials=True,
    allow_methods=["*"],      
    allow_headers=["*"],
)

# 🔥 CREATE AN API ROUTER TO HANDLE /api PREFIX
api_router = APIRouter(prefix="/api")

api_router.include_router(exercise_progress.router)
api_router.include_router(exercise_log.router)
api_router.include_router(progress.router)
api_router.include_router(user.router)
api_router.include_router(diet.router)
api_router.include_router(nonveg_diet.router)
api_router.include_router(exercise.router)
api_router.include_router(category.router)

# Include the api_router into the main app
app.include_router(api_router)

# Base route for testing
@app.get("/")
def get_home():
    return {"msg": "Welcome to Fitzy API on Vercel!"}

@app.get("/api")
def get_api_home():
    return {"msg": "Fitzy API is live! 🔥"}

# Table creation (Note: In serverless, this might run often, but it's safe if tables exist)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database creation error: {e}")