from pydantic import BaseModel
from typing import Optional, List

class DocumentAnalysisResponse(BaseModel):
    document_url: Optional[str]
    summary: str
    key_points: List[str]
    important_dates: List[str]
    missing_info: List[str]
    simplified_explanation: str
    document_type: str
