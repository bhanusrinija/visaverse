from pydantic import BaseModel
from typing import List

class FirstHoursRequest(BaseModel):
    destination_country: str
    city: str = None
    arrival_time: str = "daytime"  # "daytime", "evening", "night"

class TimeSlotTasks(BaseModel):
    time_slot: str  # "Hour 1-3", "Day 1", "Day 2"
    tasks: List[str]
    priority_level: str  # "critical", "important", "recommended"
    location_specific_notes: str

class FirstHoursResponse(BaseModel):
    hour_1_3: TimeSlotTasks
    day_1: TimeSlotTasks
    day_2: TimeSlotTasks
    emergency_contacts: List[str]
    important_locations: List[str]
