from fastapi import APIRouter, HTTPException
from models.culture import CultureRequest, CultureGuide
from services.cultural_guide import cultural_guide_service

router = APIRouter(prefix="/api/culture", tags=["Cultural Guide"])

@router.post("/guide", response_model=CultureGuide)
async def get_culture_guide(request: CultureRequest):
    """
    Get cultural intelligence guide for a specific country.
    Includes greetings, workplace etiquette, dress code, public behavior,
    tipping culture, and religious sensitivities.
    """
    try:
        guide = await cultural_guide_service.get_cultural_guide(
            country=request.country,
            category=request.category
        )
        return guide
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
