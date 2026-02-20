from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db
from models.user_state import UserActiveState
from schemas.user_state import UserStateUpdate, UserStateResponse

router = APIRouter(
    prefix="/user-state",
    tags=["User State"]
)

@router.get("/{user_id}", response_model=UserStateResponse)
def get_user_state(user_id: int, db: Session = Depends(get_db)):
    state = db.query(UserActiveState).filter(UserActiveState.user_id == user_id).first()
    if not state:
        # Return default if not exists
        return {"user_id": user_id, "active_category_id": 1, "active_level": "level1", "selected_day": 1}
    return state

@router.post("/update/{user_id}", response_model=UserStateResponse)
def update_user_state(user_id: int, update_data: UserStateUpdate, db: Session = Depends(get_db)):
    state = db.query(UserActiveState).filter(UserActiveState.user_id == user_id).first()
    
    if not state:
        state = UserActiveState(user_id=user_id)
        db.add(state)
    
    if update_data.active_category_id is not None:
        state.active_category_id = update_data.active_category_id
    if update_data.active_level is not None:
        state.active_level = update_data.active_level
    if update_data.selected_day is not None:
        state.selected_day = update_data.selected_day
        
    db.commit()
    db.refresh(state)
    return state
