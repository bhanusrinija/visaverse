from fastapi import APIRouter, HTTPException
from models.itinerary import ItineraryRequest, ItineraryResponse
from services.itinerary_service import itinerary_service

router = APIRouter(
    prefix="/api/itinerary",
    tags=["Travel Itinerary"]
)

@router.post("/generate", response_model=ItineraryResponse)
async def generate_itinerary(request: ItineraryRequest):
    """Generate travel itinerary with budget breakdown"""
    try:
        return await itinerary_service.generate_itinerary(
            destination_country=request.destination_country,
            city=request.city,
            duration_days=request.duration_days,
            total_budget=request.total_budget,
            travel_style=request.travel_style,
            interests=request.interests
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
