from pydantic import BaseModel
from typing import List, Optional

class AccommodationRequest(BaseModel):
    destination_country: str
    city: str = None
    user_type: str  # "traveler" or "student"
    budget_min: float
    budget_max: float
    duration_days: int = None
    preferences: List[str] = []  # ["vegetarian", "quiet", "near_university", etc.]

class AccommodationOption(BaseModel):
    name: str
    type: str  # "hotel", "hostel", "residence", "apartment"
    area: str
    price_range: str
    cost_per_night: str  # "$50-70"
    star_rating: Optional[str] = None  # "3-star", "4-star", etc.
    amenities: List[str]  # ["wifi", "breakfast", "gym", "pool"]
    nearby_attractions: List[str]  # ["museum", "shopping mall", "beach"]
    distance_from_center: Optional[str] = None  # "2 km from city center"
    public_transport_access: Optional[str] = None  # "5 min walk to metro"
    check_in_time: Optional[str] = None  # "3 PM"
    check_out_time: Optional[str] = None  # "11 AM"
    pros: List[str]
    cons: List[str]
    warnings: List[str]
    cultural_compatibility_score: int  # 0-100
    compatibility_reasons: List[str]
    best_for: Optional[str] = None  # "families", "solo travelers", "business", "budget travelers"

class AccommodationResponse(BaseModel):
    recommendations: List[AccommodationOption]
    general_tips: List[str]
    scam_warnings: List[str]
    area_safety_info: str
