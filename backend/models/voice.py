from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class VoiceQuery(BaseModel):
    text: str
    user_id: Optional[str] = "anonymous"
    context: Optional[Dict[str, Any]] = None  # User's relocation context

class VoiceResponse(BaseModel):
    response_text: str
    response_type: str  # general, relocation, culture, translation, etc.
    suggestions: List[str] = []  # Follow-up suggestions
