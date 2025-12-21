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
        
        prompt = f"""You are a travel planning expert with REAL knowledge of {city}, {destination_country}.
Create a detailed {duration_days}-day itinerary with ACTUAL, REAL places to visit.

Budget: ${total_budget}
Travel Style: {travel_style}
Interests: {interests_text}

CRITICAL: Each day MUST be UNIQUE with DIFFERENT real attractions, restaurants, and activities.
Include REAL place names: museums, landmarks, restaurants, markets, parks, etc.
Make each day's activities DISTINCT and SPECIFIC to {city}.

Provide response in JSON format:
{{
    "daily_plans": [
        {{
            "day_number": 1,
            "activities": [
                "9 AM: Visit [REAL LANDMARK NAME]",
                "12 PM: Lunch at [REAL RESTAURANT NAME]",
                "2 PM: Explore [REAL ATTRACTION NAME]",
                "6 PM: Dinner at [REAL LOCAL AREA/RESTAURANT]"
            ],
            "estimated_cost": 150.0,
            "tips": ["Specific tip for day 1 activities", "Best time to visit tip"]
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

        # Different activities for each day
        day_activities = [
            ["9 AM: Visit main landmarks and historic center", "12 PM: Lunch at local market", "2 PM: Museum tour", "6 PM: Dinner at traditional restaurant"],
            ["9 AM: Morning walking tour of old town", "11 AM: Coffee at local café", "1 PM: Shopping at main street", "5 PM: Sunset at scenic viewpoint"],
            ["10 AM: Day trip to nearby attraction", "12 PM: Picnic lunch", "3 PM: Nature walk or park visit", "7 PM: Try street food"],
            ["9 AM: Visit religious/cultural sites", "11 AM: Local craft market", "2 PM: Cooking class or food tour", "6 PM: Rooftop dining"],
            ["8 AM: Early morning market visit", "10 AM: Architecture tour", "1 PM: Lunch cruise or harbor tour", "5 PM: Live music venue"],
            ["10 AM: Art galleries and exhibitions", "1 PM: Trendy neighborhood lunch", "3 PM: Beach or waterfront", "7 PM: Farewell dinner"],
            ["9 AM: Last-minute shopping", "11 AM: Brunch at popular spot", "2 PM: Relax at park/spa", "5 PM: Airport transfer"]
        ]

        daily_tips = [
            ["Book tickets online to skip queues", "Start early to avoid crowds"],
            ["Wear comfortable shoes for walking", "Bring camera for photos"],
            ["Pack light snacks and water", "Check weather forecast"],
            ["Dress modestly for religious sites", "Bargain at markets politely"],
            ["Reserve evening venues in advance", "Try local public transport"],
            ["Confirm tour timings beforehand", "Keep emergency contacts handy"],
            ["Check-out time usually 11 AM", "Arrange transport 3 hours before flight"]
        ]

        daily_plans = []
        for i in range(1, days + 1):
            activity_idx = min(i-1, len(day_activities)-1)
            daily_plans.append(DayPlan(
                day_number=i,
                activities=day_activities[activity_idx],
                estimated_cost=daily_budget,
                tips=daily_tips[activity_idx]
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
