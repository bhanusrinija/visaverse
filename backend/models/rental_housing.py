from pydantic import BaseModel
from typing import List, Optional

class RentalProperty(BaseModel):
    property_name: str
    area: str
    property_type: str  # "apartment", "studio", "house", "shared"
    bedrooms: str
    monthly_rent: str
    deposit: str
    utilities_included: bool
    amenities: List[str]
    nearby_facilities: List[str]
    public_transport: str
    pros: List[str]
    cons: List[str]
    best_for: str  # "students", "families", "professionals", "budget travelers"

class RentalHousingRequest(BaseModel):
    destination_country: str
    city: str = None

class RentalHousingResponse(BaseModel):
    rental_process: str
    typical_costs: dict  # {"deposit": "2-3 months", "monthly_rent": "€800-1200"}
    required_documents: List[str]
    contract_tips: List[str]
    common_scams: List[str]
    registration_requirements: str
    legal_tips: List[str]
    rental_options: Optional[List[RentalProperty]] = []
