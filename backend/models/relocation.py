from pydantic import BaseModel
from typing import List, Optional

class RelocationRequest(BaseModel):
    home_country: str
    destination_country: str
    purpose: str  # Work, Study, Travel, Business

class VisaRecommendation(BaseModel):
    visa_type: str
    description: str
    processing_time: str
    requirements: List[str]

class RelocationPlan(BaseModel):
    visa_recommendations: List[VisaRecommendation]
    document_checklist: List[str]
    timeline_weeks: int
    timeline_description: str
    common_mistakes: List[str]
    country_specific_rules: List[str]
