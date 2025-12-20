from fastapi import APIRouter, HTTPException
from models.arrival_tasks import ArrivalTasksRequest, ArrivalTasksResponse
from services.arrival_tasks_service import arrival_tasks_service

router = APIRouter(
    prefix="/api/arrival-tasks",
    tags=["Arrival Tasks"]
)

@router.post("/list", response_model=ArrivalTasksResponse)
async def get_arrival_tasks(request: ArrivalTasksRequest):
    """Get categorized post-arrival tasks"""
    try:
        return await arrival_tasks_service.get_arrival_tasks(
            destination_country=request.destination_country,
            purpose=request.purpose
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
