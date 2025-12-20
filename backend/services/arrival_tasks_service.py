from services.gemini_service import gemini_service
from models.arrival_tasks import ArrivalTasksResponse, TaskItem
import json

class ArrivalTasksService:
    
    async def get_arrival_tasks(
        self,
        destination_country: str,
        purpose: str
    ) -> ArrivalTasksResponse:
        """Get categorized post-arrival tasks"""
        
        prompt = f"""You are a relocation expert. List important tasks after arriving in {destination_country} for {purpose}.

Categorize into: Mandatory, Survival, Safety

Provide response in JSON format:
{{
    "mandatory_tasks": [
        {{
            "task": "Task name",
            "why_it_matters": "Explanation",
            "deadline": "Within X days/weeks",
            "where_to_do": "Location/office"
        }}
    ],
    "survival_tasks": [
        {{
            "task": "Task name",
            "why_it_matters": "Explanation",
            "deadline": "ASAP",
            "where_to_do": "Location"
        }}
    ],
    "safety_tasks": [
        {{
            "task": "Task name",
            "why_it_matters": "Explanation",
            "deadline": null,
            "where_to_do": "Various"
        }}
    ],
    "country_specific_notes": "Important notes specific to {destination_country}"
}}

Mandatory: Address registration, police registration, work/university reporting
Survival: SIM card, transport card, grocery access, bank account
Safety: Emergency numbers, safe areas, scam awareness, local laws

Be specific to {destination_country} and {purpose}."""

        try:
            response = await gemini_service.generate_response(prompt)
            response_text = response.strip()
            
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            data = json.loads(response_text)
            return ArrivalTasksResponse(**data)
            
        except Exception as e:
            print(f"Error getting arrival tasks: {e}")
            return self._create_fallback_tasks(destination_country, purpose)
    
    def _create_fallback_tasks(self, country: str, purpose: str) -> ArrivalTasksResponse:
        """Create fallback tasks"""
        return ArrivalTasksResponse(
            mandatory_tasks=[
                TaskItem(
                    task="Register address with local authorities",
                    why_it_matters="Legal requirement in most countries, needed for official documents",
                    deadline="Within 7-14 days of arrival",
                    where_to_do="Local registration office (Rathaus/Town Hall)"
                ),
                TaskItem(
                    task="Register with police (if required)",
                    why_it_matters="Mandatory in some countries for visa compliance",
                    deadline="Within 1-2 weeks",
                    where_to_do="Local police station"
                ),
                TaskItem(
                    task="Report to workplace/university",
                    why_it_matters="Complete onboarding and get necessary access",
                    deadline="First day as scheduled",
                    where_to_do="HR office or student services"
                )
            ],
            survival_tasks=[
                TaskItem(
                    task="Get local SIM card",
                    why_it_matters="Essential for communication and navigation",
                    deadline="Day 1",
                    where_to_do="Airport or mobile shops"
                ),
                TaskItem(
                    task="Get public transport card",
                    why_it_matters="Save money and travel easily",
                    deadline="Within first week",
                    where_to_do="Transport stations or online"
                ),
                TaskItem(
                    task="Open bank account",
                    why_it_matters="Receive salary, pay bills, avoid foreign transaction fees",
                    deadline="Within 2 weeks",
                    where_to_do="Local banks"
                ),
                TaskItem(
                    task="Find grocery stores and pharmacies",
                    why_it_matters="Daily necessities and health needs",
                    deadline="Day 2-3",
                    where_to_do="Explore neighborhood"
                )
            ],
            safety_tasks=[
                TaskItem(
                    task="Save emergency numbers",
                    why_it_matters="Quick access in emergencies",
                    deadline=None,
                    where_to_do="Phone contacts"
                ),
                TaskItem(
                    task="Learn about safe and unsafe areas",
                    why_it_matters="Personal safety and avoiding crime",
                    deadline=None,
                    where_to_do="Ask locals, research online"
                ),
                TaskItem(
                    task="Understand common scams",
                    why_it_matters="Protect yourself from fraud",
                    deadline=None,
                    where_to_do="Research online, embassy warnings"
                ),
                TaskItem(
                    task="Know basic local laws",
                    why_it_matters="Avoid legal issues",
                    deadline=None,
                    where_to_do="Government websites"
                )
            ],
            country_specific_notes=f"Check {country}'s official immigration website for specific requirements. Requirements vary by visa type and nationality."
        )

arrival_tasks_service = ArrivalTasksService()
