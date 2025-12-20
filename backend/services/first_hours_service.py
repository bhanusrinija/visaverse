from services.gemini_service import gemini_service
from models.first_hours import FirstHoursResponse, TimeSlotTasks
import json

class FirstHoursService:
    
    async def generate_checklist(
        self,
        destination_country: str,
        city: str = None,
        arrival_time: str = "daytime"
    ) -> FirstHoursResponse:
        """Generate first 48 hours checklist"""
        
        location = f"{city}, {destination_country}" if city else destination_country
        
        prompt = f"""You are a relocation expert. Create a detailed first 48 hours checklist for someone arriving in {location} during {arrival_time}.

Provide response in JSON format:
{{
    "hour_1_3": {{
        "time_slot": "Hour 1-3 After Landing",
        "tasks": ["task 1", "task 2"],
        "priority_level": "critical",
        "location_specific_notes": "Specific notes for {location}"
    }},
    "day_1": {{
        "time_slot": "Day 1",
        "tasks": ["task 1", "task 2"],
        "priority_level": "critical",
        "location_specific_notes": "Notes"
    }},
    "day_2": {{
        "time_slot": "Day 2",
        "tasks": ["task 1", "task 2"],
        "priority_level": "important",
        "location_specific_notes": "Notes"
    }},
    "emergency_contacts": ["Emergency service 1", "Emergency service 2"],
    "important_locations": ["Location 1", "Location 2"]
}}

Hour 1-3 should include: SIM card, emergency cash, transport to accommodation
Day 1: Address registration, accommodation check-in, basic orientation
Day 2: Bank account, transport card, grocery shopping

Be specific to {destination_country}'s requirements and {arrival_time} considerations."""

        try:
            response = await gemini_service.generate_response(prompt)
            response_text = response.strip()
            
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            data = json.loads(response_text)
            return FirstHoursResponse(**data)
            
        except Exception as e:
            print(f"Error generating first hours checklist: {e}")
            return self._create_fallback_checklist(destination_country)
    
    def _create_fallback_checklist(self, country: str) -> FirstHoursResponse:
        """Create fallback checklist"""
        return FirstHoursResponse(
            hour_1_3=TimeSlotTasks(
                time_slot="Hour 1-3 After Landing",
                tasks=[
                    "Buy local SIM card at airport",
                    "Exchange emergency cash",
                    "Get transport to accommodation",
                    "Notify family of safe arrival"
                ],
                priority_level="critical",
                location_specific_notes=f"Airport in {country} usually has SIM card kiosks and currency exchange"
            ),
            day_1=TimeSlotTasks(
                time_slot="Day 1",
                tasks=[
                    "Check into accommodation",
                    "Register address (if required)",
                    "Buy basic groceries",
                    "Locate nearest pharmacy and ATM",
                    "Rest and adjust to timezone"
                ],
                priority_level="critical",
                location_specific_notes="Many countries require address registration within 24-48 hours"
            ),
            day_2=TimeSlotTasks(
                time_slot="Day 2",
                tasks=[
                    "Open bank account",
                    "Get public transport card",
                    "Explore neighborhood",
                    "Find grocery stores",
                    "Set up utilities if needed"
                ],
                priority_level="important",
                location_specific_notes="Bring passport and proof of address for bank account"
            ),
            emergency_contacts=[
                f"Local emergency number (check {country} specific)",
                "Your embassy contact",
                "Accommodation emergency contact"
            ],
            important_locations=[
                "Nearest hospital/clinic",
                "Police station",
                "Your embassy",
                "Main transport hub",
                "Grocery stores and pharmacies"
            ]
        )

first_hours_service = FirstHoursService()
