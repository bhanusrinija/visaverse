from pydantic import BaseModel
from typing import List

class ItineraryRequest(BaseModel):
    destination_country: str
    city: str
    duration_days: int
    total_budget: float
    travel_style: str  # "relaxed", "moderate", "packed"
    interests: List[str]  # ["culture", "food", "nature", "history", etc.]

class DayPlan(BaseModel):
    day_number: int
    activities: List[str]
    estimated_cost: float
    tips: List[str]

class BudgetBreakdown(BaseModel):
    accommodation: float
    food: float
    transport: float
    attractions: float
    buffer: float

class ItineraryResponse(BaseModel):
    daily_plans: List[DayPlan]
    budget_breakdown: BudgetBreakdown
    total_estimated_cost: float
    cost_justification: str
    money_saving_tips: List[str]
