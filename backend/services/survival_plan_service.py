from services.gemini_service import gemini_service
from models.survival_plan import SurvivalPlanResponse, WeekPlan
import json

class SurvivalPlanService:
    
    async def generate_survival_plan(
        self, 
        home_country: str, 
        destination_country: str, 
        purpose: str
    ) -> SurvivalPlanResponse:
        """Generate 30-day survival plan using AI"""
        
        prompt = f"""You are an expert relocation consultant. Create a detailed 30-day survival plan for someone moving from {home_country} to {destination_country} for {purpose}.

Provide a comprehensive response in the following JSON format:
{{
    "week_1": {{
        "week_number": 1,
        "title": "Registration, SIM & Banking",
        "tasks": ["task 1", "task 2", "task 3"],
        "priority": "critical"
    }},
    "week_2": {{
        "week_number": 2,
        "title": "Workplace/University Adaptation",
        "tasks": ["task 1", "task 2", "task 3"],
        "priority": "important"
    }},
    "week_3": {{
        "week_number": 3,
        "title": "Cultural Integration",
        "tasks": ["task 1", "task 2", "task 3"],
        "priority": "important"
    }},
    "week_4": {{
        "week_number": 4,
        "title": "Financial Stabilization",
        "tasks": ["task 1", "task 2", "task 3"],
        "priority": "recommended"
    }},
    "overview": "Brief overview of the 30-day plan",
    "emergency_contacts": ["Emergency number 1", "Emergency number 2"]
}}

Be specific to {destination_country}. Include practical, actionable tasks for each week."""

        try:
            response = await gemini_service.generate_response(prompt)
            response_text = response.strip()
            
            # Parse JSON from response
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            data = json.loads(response_text)
            return SurvivalPlanResponse(**data)
            
        except Exception as e:
            print(f"Error generating survival plan: {e}")
            return self._create_fallback_plan(destination_country, purpose)
    
    def _create_fallback_plan(self, destination: str, purpose: str) -> SurvivalPlanResponse:
        """Create a fallback plan when AI fails"""
        return SurvivalPlanResponse(
            week_1=WeekPlan(
                week_number=1,
                title="Registration, SIM & Banking",
                tasks=[
                    "Get local SIM card",
                    "Register address with authorities",
                    "Open bank account",
                    "Get transport card",
                    "Register with embassy"
                ],
                priority="critical"
            ),
            week_2=WeekPlan(
                week_number=2,
                title="Workplace/University Adaptation",
                tasks=[
                    "Complete workplace orientation",
                    "Set up work/study accounts",
                    "Meet colleagues/classmates",
                    "Learn local commute routes",
                    "Understand workplace culture"
                ],
                priority="important"
            ),
            week_3=WeekPlan(
                week_number=3,
                title="Cultural Integration",
                tasks=[
                    "Join local community groups",
                    "Explore neighborhood",
                    "Try local cuisine",
                    "Learn basic local phrases",
                    "Attend cultural events"
                ],
                priority="important"
            ),
            week_4=WeekPlan(
                week_number=4,
                title="Financial Stabilization",
                tasks=[
                    "Set up bill payments",
                    "Understand tax obligations",
                    "Create monthly budget",
                    "Find affordable grocery stores",
                    "Review insurance coverage"
                ],
                priority="recommended"
            ),
            overview=f"Your first 30 days in {destination} will focus on essential registration, adaptation, cultural integration, and financial setup.",
            emergency_contacts=[
                f"Local emergency: 112 (EU) or check {destination} emergency number",
                "Your country's embassy contact"
            ]
        )

survival_plan_service = SurvivalPlanService()
