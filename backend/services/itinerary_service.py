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
Create a detailed {duration_days}-day itinerary with ACTUAL, REAL places to visit (e.g., if in Hyderabad, suggest 'Charminar' instead of 'historic site').

Budget: ${total_budget}
Travel Style: {travel_style}
Interests: {interests_text}

CRITICAL: Every day MUST be UNIQUE. DO NOT repeat locations, restaurants, or activities across different days.
Day 2 must be completely different from Day 1, Day 3 different from Day 2, etc.
Include a diverse mix: historic sites, modern cafes, local markets, parks, and hidden gems.
Include REAL place names and their SPECIFIC LOCATIONS/ADDRESSES that can be searched on a map.
Make each day's activities DISTINCT and SPECIFIC to {city}. 

Provide response in JSON format:
{{
    "daily_plans": [
        {{
            "day_number": 1,
            "activities": [
                {{
                    "time": "9 AM",
                    "task": "Visit the [SPECIFIC LANDMARK NAME]",
                    "location": "[FULL SEARCHABLE LOCATION NAME OR ADDRESS]",
                    "rating": 4.8,
                    "description": "Short (1 sentence) reason why this place is a must-visit."
                }},
                {{
                    "time": "12 PM",
                    "task": "Lunch at [SPECIFIC RESTAURANT/CAFÉ NAME]",
                    "location": "[SPECIFIC ADDRESS or NEIGHBORHOOD]",
                    "rating": 4.5,
                    "description": "Short tip on what to try (e.g., 'Famous for its Irani chai and Osmania biscuits')."
                }}
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

Each activity MUST have a 'rating' (float between 1.0 and 5.0) and a 'description'.
Ensure total_estimated_cost matches budget_breakdown sum and is close to ${total_budget}."""

        try:
            response = await gemini_service.generate_response(prompt, use_pro=False)
            response_text = response.strip()
            
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            data = json.loads(response_text)
            
            # Post-processing to ensure uniqueness
            seen_locations = set()
            if "daily_plans" in data:
                for day in data["daily_plans"]:
                    if "activities" in day:
                        # Keep only activities with unique locations
                        unique_activities = []
                        for act in day["activities"]:
                            loc = act.get("location", "").lower().strip()
                            if loc and loc not in seen_locations:
                                seen_locations.add(loc)
                                unique_activities.append(act)
                            elif not loc: # Keep if no location specified
                                unique_activities.append(act)
                        day["activities"] = unique_activities

            return ItineraryResponse(**data)
            
        except Exception as e:
            print(f"Error generating itinerary: {e}")
            return self._create_fallback_itinerary(city, duration_days, total_budget)
    
    def _create_fallback_itinerary(self, city: str, days: int, budget: float) -> ItineraryResponse:
        """Create fallback itinerary with specific naming for common cities"""
        daily_budget = budget / days
        from models.itinerary import Activity

        # Specialized fallback for Hyderabad if requested
        if "hyderabad" in city.lower():
            day_activities = [
                [
                    Activity(time="9 AM", task="Visit Charminar", location="Charminar, Hyderabad", rating=4.7, description="The iconic 16th-century mosque and monument of Hyderabad."),
                    Activity(time="12 PM", task="Lunch at Paradise Biryani", location="Paradise Food Court, Secunderabad", rating=4.5, description="Taste the world-famous Hyderabadi Dum Biryani."),
                    Activity(time="3 PM", task="Explore Salar Jung Museum", location="Salar Jung Road, Hyderabad", rating=4.6, description="One of the largest art museums in India with incredible collections."),
                    Activity(time="7 PM", task="Tea at Café Niloufer", location="Lakdikapul, Hyderabad", rating=4.8, description="Famous for its creamy Irani chai and crispy Osmania biscuits.")
                ],
                [
                    Activity(time="10 AM", task="Explore Golconda Fort", location="Golkonda, Hyderabad", rating=4.7, description="Majestic medieval citadel and fortress complex."),
                    Activity(time="1 PM", task="Lunch at Chutneys", location="Banjara Hills, Hyderabad", rating=4.4, description="Famous for its authentic South Indian thalis and world-class chutneys."),
                    Activity(time="4 PM", task="Visit Qutb Shahi Tombs", location="Ibrahim Bagh, Hyderabad", rating=4.5, description="Beautiful tomb complex of the founding kings of Hyderabad."),
                    Activity(time="7 PM", task="Dinner at Jewel of Nizams", location="Masab Tank, Hyderabad", rating=4.6, description="Fine dining experience with traditional Hyderabadi flavors.")
                ],
                [
                    Activity(time="9 AM", task="Birla Mandir Visit", location="Hill Fort Rd, Hyderabad", rating=4.8, description="Stunning white marble temple on a hill overlooking Hussain Sagar lake."),
                    Activity(time="11 AM", task="Walk around Hussain Sagar & Lumbini Park", location="Necklace Road, Hyderabad", rating=4.4, description="Enjoy the giant Buddha statue and scenic lake views."),
                    Activity(time="1 PM", task="Lunch at Ohri's Tansen", location="Necklace Road, Hyderabad", rating=4.5, description="Thematic restaurant with exquisite Mughlai and North Indian cuisine."),
                    Activity(time="4 PM", task="Shopping at Laad Bazaar", location="Near Charminar, Hyderabad", rating=4.6, description="Historic market famous for bangles and traditional crafts.")
                ]
            ]
        else:
            # General fallback
            day_activities = [
                [
                    Activity(time="9 AM", task="Visit Main Landmark", location=f"{city} Historic Center", rating=4.5, description="The most famous historic site in the city."),
                    Activity(time="12 PM", task="Local Lunch", location=f"{city} Central Market", rating=4.3, description="Great spot to try authentic local street food."),
                    Activity(time="3 PM", task="National Museum", location=f"{city} Cultural Quarter", rating=4.4, description="Learn about the rich history and heritage of the region."),
                    Activity(time="7 PM", task="Evening Dinner", location=f"{city} Waterfront", rating=4.6, description="Enjoy a meal with a beautiful view of the city skyline.")
                ],
                [
                    Activity(time="10 AM", task="Morning Park Walk", location=f"{city} Botanical Garden", rating=4.5, description="Peaceful escape into nature within the city."),
                    Activity(time="1 PM", task="Modern District Lunch", location=f"{city} Tech Hub", rating=4.4, description="Trendy spots and international cuisine."),
                    Activity(time="4 PM", task="Art Gallery Visit", location=f"{city} Arts District", rating=4.5, description="Supporting local and contemporary artists."),
                    Activity(time="7 PM", task="Rooftop Drinks", location=f"{city} Skyline Bar", rating=4.7, description="Panoramic views to end the day perfectly.")
                ]
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
