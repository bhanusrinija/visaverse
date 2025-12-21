from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from services.gemini_service import gemini_service
import json
import re

router = APIRouter(prefix="/api/calendar", tags=["Smart Calendar"])

def extract_json_from_text(text: str) -> dict:
    """Extract JSON from AI response text"""
    try:
        # Try direct JSON parse first
        return json.loads(text)
    except:
        # Extract JSON from markdown code blocks
        json_match = re.search(r'```(?:json)?\s*(\{.*\})\s*```', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except:
                pass

        # Extract JSON from text
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except:
                pass

    # Return fallback structure
    return {"error": "Could not parse JSON", "raw_text": text}

class TimelineRequest(BaseModel):
    destination: str
    departureDate: Optional[str] = None
    visaType: Optional[str] = None
    relocationType: Optional[str] = "general"

class CalendarEventsRequest(BaseModel):
    destination: str
    startDate: str
    endDate: str
    includeHolidays: bool = True
    includeWeather: bool = True

@router.post("/timeline")
async def get_relocation_timeline(request: TimelineRequest):
    """Generate a comprehensive relocation timeline with all important tasks and dates"""

    # Calculate timeline if departure date is provided
    timeline_info = ""
    if request.departureDate:
        try:
            departure = datetime.fromisoformat(request.departureDate)
            today = datetime.now()
            days_until = (departure - today).days

            timeline_info = f"""
            Departure Date: {request.departureDate}
            Days Until Departure: {days_until}
            Today's Date: {today.strftime('%Y-%m-%d')}
            """
        except:
            timeline_info = "Departure date format invalid, using flexible timeline"

    prompt = f"""
    As a relocation planning expert, create a comprehensive timeline for someone relocating to {request.destination}.

    {timeline_info}
    Visa Type: {request.visaType or 'Not specified'}
    Relocation Type: {request.relocationType}

    Provide a JSON response with:
    {{
        "tasks": [
            {{
                "id": unique_id,
                "title": "task title",
                "description": "detailed description",
                "date": "YYYY-MM-DD",
                "priority": "high/medium/low",
                "category": "visa/housing/finance/health/logistics/etc",
                "estimatedDuration": "time needed to complete",
                "dependencies": ["task IDs this depends on"],
                "completed": false,
                "type": "system"
            }}
        ],
        "milestones": [
            {{
                "name": "milestone name",
                "date": "YYYY-MM-DD",
                "importance": "critical/important/nice-to-have"
            }}
        ],
        "phases": [
            {{
                "name": "phase name (e.g., Planning, Preparation, Final Week)",
                "startDate": "YYYY-MM-DD",
                "endDate": "YYYY-MM-DD",
                "focus": "what to focus on during this phase"
            }}
        ],
        "tips": [
            "Timeline management tips"
        ]
    }}

    Create a realistic timeline with 15-20 tasks covering:
    - Visa application process
    - Flight booking
    - Accommodation arrangements
    - Financial preparations (bank, insurance)
    - Health requirements (vaccinations, health insurance)
    - Document preparation
    - Packing and shipping
    - Saying goodbye
    - Final preparations
    - Departure day tasks

    Space tasks appropriately based on the departure date and visa processing times for {request.destination}.
    """

    try:
        response = await gemini_service.generate_response(prompt)
        parsed_data = extract_json_from_text(response)
        return {"data": parsed_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-events")
async def generate_calendar_events(request: CalendarEventsRequest):
    """Generate calendar events including holidays, weather patterns, and important dates"""

    prompt = f"""
    As a travel and cultural expert, provide important calendar information for {request.destination}
    between {request.startDate} and {request.endDate}.

    Provide a JSON response with:
    {{
        "holidays": [
            {{
                "name": "holiday name",
                "date": "YYYY-MM-DD",
                "type": "public/religious/cultural",
                "description": "brief description",
                "impact": "how it affects daily life/businesses"
            }}
        ],
        "weather": {{
            "season": "season name",
            "averageTemp": "temperature range",
            "rainfall": "rainfall info",
            "recommendations": ["what to prepare for weather-wise"]
        }},
        "culturalEvents": [
            {{
                "name": "event name",
                "date": "YYYY-MM-DD",
                "description": "brief description",
                "recommendedForNewcomers": true/false
            }}
        ],
        "importantDates": [
            {{
                "name": "important date (tax deadlines, registration periods, etc)",
                "date": "YYYY-MM-DD",
                "category": "administrative/legal/social",
                "priority": "high/medium/low"
            }}
        ]
    }}

    Include all major holidays, cultural festivals, and important administrative dates for the destination.
    """

    try:
        response = await gemini_service.generate_response(prompt)
        parsed_data = extract_json_from_text(response)
        return {"data": parsed_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reminders")
async def set_task_reminders(task_id: str, reminder_date: str, reminder_type: str = "email"):
    """Set reminders for specific tasks (placeholder for future implementation)"""

    return {
        "status": "success",
        "message": f"Reminder set for task {task_id} on {reminder_date} via {reminder_type}",
        "note": "Email/SMS integration coming soon"
    }
