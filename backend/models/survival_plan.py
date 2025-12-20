from pydantic import BaseModel
from typing import List

class SurvivalPlanRequest(BaseModel):
    home_country: str
    destination_country: str
    purpose: str
    arrival_date: str = None

class WeekPlan(BaseModel):
    week_number: int
    title: str
    tasks: List[str]
    priority: str  # "critical", "important", "recommended"

class SurvivalPlanResponse(BaseModel):
    week_1: WeekPlan
    week_2: WeekPlan
    week_3: WeekPlan
    week_4: WeekPlan
    overview: str
    emergency_contacts: List[str]
