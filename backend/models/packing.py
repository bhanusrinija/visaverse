from pydantic import BaseModel
from typing import List, Dict

class PackingRequest(BaseModel):
    home_country: str
    destination_country: str
    duration_days: int
    purpose: str = "general"

class PackingCategory(BaseModel):
    category: str
    items: List[str]
    priority: str  # essential, recommended, optional

class PackingList(BaseModel):
    home_country: str
    destination_country: str
    categories: List[PackingCategory]
    general_tips: List[str]
