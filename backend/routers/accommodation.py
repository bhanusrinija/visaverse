from fastapi import APIRouter, HTTPException
from models.accommodation import AccommodationRequest, AccommodationResponse
from services.accommodation_service import accommodation_service

router = APIRouter(
    prefix="/api/accommodation",
    tags=["Accommodation"]
)

@router.post("/find", response_model=AccommodationResponse)
@router.post("/travelers", response_model=AccommodationResponse)
@router.post("/students", response_model=AccommodationResponse)
async def find_accommodation(request: AccommodationRequest):
    """Find accommodation recommendations for travelers or students"""
    try:
        return await accommodation_service.find_accommodation(
            destination_country=request.destination_country,
            city=request.city,
            user_type=request.user_type,
            budget_min=request.budget_min,
            budget_max=request.budget_max,
            duration_days=request.duration_days,
            preferences=request.preferences
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
