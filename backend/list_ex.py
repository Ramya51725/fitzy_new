from sqlalchemy import create_all, text
from sqlalchemy.orm import sessionmaker
from database.db import engine
from models.exemodel import Exercise

def list_exercises():
    Session = sessionmaker(bind=engine)
    session = Session()
    exercises = session.query(Exercise).all()
    print("TOTAL EXERCISES:", len(exercises))
    for ex in exercises:
        print(f"| {ex.title} | {ex.exercise_video} |")
    session.close()

if __name__ == "__main__":
    list_exercises()
