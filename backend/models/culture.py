from pydantic import BaseModel
from typing import List, Dict

class CultureRequest(BaseModel):
    country: str
    category: str = "all"  # all, greetings, workplace, dress, public, tipping, religious

class CultureCategory(BaseModel):
    category: str
    tips: List[str]

class CultureGuide(BaseModel):
    country: str
    categories: List[CultureCategory]
    general_advice: str
