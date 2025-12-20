from fastapi import APIRouter, HTTPException
from models.rental_housing import RentalHousingRequest, RentalHousingResponse
from services.rental_housing_service import rental_housing_service

router = APIRouter(
    prefix="/api/rental-housing",
    tags=["Rental Housing"]
)

@router.post("/guide", response_model=RentalHousingResponse)
async def get_rental_guide(request: RentalHousingRequest):
    """Get rental housing guidance"""
    try:
        return await rental_housing_service.get_rental_guide(
            destination_country=request.destination_country,
            city=request.city
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
