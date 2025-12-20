from pydantic import BaseModel
from typing import List, Optional

class ArrivalTasksRequest(BaseModel):
    destination_country: str
    purpose: str  # "work", "study", "tourism"

class TaskItem(BaseModel):
    task: str
    why_it_matters: str
    deadline: Optional[str] = None
    where_to_do: Optional[str] = None

class ArrivalTasksResponse(BaseModel):
    mandatory_tasks: List[TaskItem]
    survival_tasks: List[TaskItem]
    safety_tasks: List[TaskItem]
    country_specific_notes: str
