from fastapi import APIRouter, HTTPException
from models.relocation import RelocationRequest, RelocationPlan
from services.relocation_planner import relocation_planner_service

router = APIRouter(prefix="/api/relocation", tags=["Relocation Planner"])

@router.post("/plan", response_model=RelocationPlan)
async def get_relocation_plan(request: RelocationRequest):
    """
    Generate comprehensive relocation plan including visa recommendations,
    document checklist, timeline, and country-specific rules.
    """
    try:
        plan = await relocation_planner_service.generate_relocation_plan(
            home_country=request.home_country,
            destination_country=request.destination_country,
            purpose=request.purpose
        )
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
