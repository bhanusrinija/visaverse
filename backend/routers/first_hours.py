from fastapi import APIRouter, HTTPException
from models.first_hours import FirstHoursRequest, FirstHoursResponse
from services.first_hours_service import first_hours_service

router = APIRouter(
    prefix="/api/first-hours",
    tags=["First Hours"]
)

@router.post("/checklist", response_model=FirstHoursResponse)
async def get_first_hours_checklist(request: FirstHoursRequest):
    """Get first 48 hours checklist"""
    try:
        return await first_hours_service.generate_checklist(
            destination_country=request.destination_country,
            city=request.city,
            arrival_time=request.arrival_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
