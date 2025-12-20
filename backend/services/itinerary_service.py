from services.gemini_service import gemini_service
from models.itinerary import ItineraryResponse, DayPlan, BudgetBreakdown
from typing import List
import json

class ItineraryService:
    
    async def generate_itinerary(
        self,
        destination_country: str,
        city: str,
        duration_days: int,
        total_budget: float,
        travel_style: str,
        interests: List[str]
    ) -> ItineraryResponse:
        """Generate travel itinerary with budget breakdown"""
        
        interests_text = ", ".join(interests) if interests else "general sightseeing"
        
        prompt = f"""You are a travel planning expert. Create a {duration_days}-day itinerary for {city}, {destination_country}.

Budget: ${total_budget}
Travel Style: {travel_style}
Interests: {interests_text}

Provide response in JSON format:
{{
    "daily_plans": [
        {{
            "day_number": 1,
            "activities": ["activity 1", "activity 2"],
            "estimated_cost": 150.0,
            "tips": ["tip 1", "tip 2"]
        }}
    ],
    "budget_breakdown": {{
        "accommodation": 500.0,
        "food": 300.0,
        "transport": 150.0,
        "attractions": 200.0,
        "buffer": 50.0
    }},
    "total_estimated_cost": 1200.0,
    "cost_justification": "Explanation of budget allocation",
    "money_saving_tips": ["tip 1", "tip 2"]
}}

For {travel_style} style:
- relaxed: fewer activities, more leisure time
- moderate: balanced mix of activities and rest
- packed: maximum activities, fast-paced

Ensure total_estimated_cost matches budget_breakdown sum and is close to ${total_budget}."""

        try:
            response = await gemini_service.generate_response(prompt)
            response_text = response.strip()
            
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            data = json.loads(response_text)
            return ItineraryResponse(**data)
            
        except Exception as e:
            print(f"Error generating itinerary: {e}")
            return self._create_fallback_itinerary(city, duration_days, total_budget)
    
    def _create_fallback_itinerary(self, city: str, days: int, budget: float) -> ItineraryResponse:
        """Create fallback itinerary"""
        daily_budget = budget / days
        
        daily_plans = []
        for i in range(1, days + 1):
            daily_plans.append(DayPlan(
                day_number=i,
                activities=[
                    f"Morning: Explore local attractions",
                    f"Afternoon: Visit cultural sites",
                    f"Evening: Try local cuisine"
                ],
                estimated_cost=daily_budget,
                tips=[f"Book tickets in advance", "Use public transport"]
            ))
        
        return ItineraryResponse(
            daily_plans=daily_plans,
            budget_breakdown=BudgetBreakdown(
                accommodation=budget * 0.4,
                food=budget * 0.25,
                transport=budget * 0.15,
                attractions=budget * 0.15,
                buffer=budget * 0.05
            ),
            total_estimated_cost=budget,
            cost_justification=f"Budget allocated based on typical costs in {city}",
            money_saving_tips=[
                "Use public transportation",
                "Eat at local restaurants",
                "Book accommodations in advance",
                "Look for free walking tours",
                "Buy city passes for attractions"
            ]
        )

itinerary_service = ItineraryService()
