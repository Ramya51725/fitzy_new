import os, sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
sys.path.append(os.getcwd())
from database.db import DATABASE_URL
from models.exemodel import Exercise
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()
missing = ["Burpees", "Cursty", "High", "In out", "Abdominal", "Rhomboid", "Reclained", "Dumbbell", "Learning", "Mount", "Curts"]
for name in missing:
    exercises = session.query(Exercise).filter(Exercise.title.ilike(f"%{name[:4]}%")).all()
    for ex in exercises:
        print(f"TITLE:{ex.title}")
        print(f"URL:{ex.exercise_video}")
session.close()
