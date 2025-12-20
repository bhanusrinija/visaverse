from fastapi import APIRouter, HTTPException
from models.packing import PackingRequest, PackingList
from services.packing_service import packing_service

router = APIRouter(prefix="/api/packing", tags=["Packing Essentials"])

@router.post("/list", response_model=PackingList)
async def get_packing_list(request: PackingRequest):
    """
    Generate smart packing list based on origin and destination countries.
    Includes country-specific items, climate considerations, and cultural necessities.
    Items are categorized and prioritized (essential/recommended/optional).
    """
    try:
        packing_list = await packing_service.generate_packing_list(
            home_country=request.home_country,
            destination_country=request.destination_country,
            duration_days=request.duration_days,
            purpose=request.purpose
        )
        return packing_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
