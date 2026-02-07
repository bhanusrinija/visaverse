from pydantic import BaseModel
from typing import List

class ItineraryRequest(BaseModel):
    destination_country: str
    city: str
    duration_days: int
    total_budget: float
    travel_style: str  # "relaxed", "moderate", "packed"
    interests: List[str]  # ["culture", "food", "nature", "history", etc.]

class Activity(BaseModel):
    time: str
    task: str
    location: str
    rating: float  # Scale of 1.0 - 5.0
    description: str = "" # Brief recommendation/why to visit

class DayPlan(BaseModel):
    day_number: int
    activities: List[Activity]
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
