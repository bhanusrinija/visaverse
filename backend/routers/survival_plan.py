from fastapi import APIRouter, HTTPException
from models.survival_plan import SurvivalPlanRequest, SurvivalPlanResponse
from services.survival_plan_service import survival_plan_service

router = APIRouter(
    prefix="/api/survival-plan",
    tags=["Survival Plan"]
)

@router.post("/generate", response_model=SurvivalPlanResponse)
async def generate_survival_plan(request: SurvivalPlanRequest):
    """Generate 30-day survival plan"""
    try:
        return await survival_plan_service.generate_survival_plan(
            home_country=request.home_country,
            destination_country=request.destination_country,
            purpose=request.purpose
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
