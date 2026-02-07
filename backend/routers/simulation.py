from fastapi import APIRouter, HTTPException
from services.simulation_service import simulation_service
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/simulation", tags=["simulation"])

class SimulationStartRequest(BaseModel):
    destination_country: str
    scenario_type: str

class ActionRequest(BaseModel):
    destination_country: str
    scenario_desc: str
    char_msg: str
    user_action: str

@router.post("/start")
async def start_simulation(request: SimulationStartRequest):
    try:
        return await simulation_service.start_simulation(
            request.destination_country, 
            request.scenario_type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/action")
async def evaluate_action(request: ActionRequest):
    try:
        return await simulation_service.evaluate_action(
            request.destination_country,
            request.scenario_desc,
            request.char_msg,
            request.user_action
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
