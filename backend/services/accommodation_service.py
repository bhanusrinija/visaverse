from services.gemini_service import gemini_service
from models.accommodation import AccommodationResponse, AccommodationOption
from typing import List
import json

class AccommodationService:
    
    async def find_accommodation(
        self,
        destination_country: str,
        city: str,
        user_type: str,
        budget_min: float,
        budget_max: float,
        duration_days: int,
        preferences: List[str]
    ) -> AccommodationResponse:
        """Find accommodation recommendations using AI"""
        
        user_context = "student" if user_type == "student" else "traveler"
        pref_text = ", ".join(preferences) if preferences else "no specific preferences"
        
        prompt = f"""You are an accommodation expert with knowledge of REAL hotels and accommodations.
Recommend ACTUAL, REAL hotels and stays that exist in {city or destination_country} for a {user_context}.

Budget: ${budget_min}-${budget_max} per night
Duration: {duration_days} days
Preferences: {pref_text}

IMPORTANT: Provide REAL hotel names, REAL prices, and REAL locations that actually exist in {city or destination_country}.
Include well-known hotel chains (Hilton, Marriott, Hyatt, etc.) and popular local hotels.

Provide response in JSON format:
{{
    "recommendations": [
        {{
            "name": "Accommodation name",
            "type": "hotel/hostel/residence/apartment",
            "area": "Area name with details",
            "price_range": "$60-80/night",
            "cost_per_night": "$65 average",
            "star_rating": "3-star" or "4-star" or null,
            "amenities": ["wifi", "breakfast included", "gym", "pool", "parking"],
            "nearby_attractions": ["museum 500m", "shopping mall 1km", "beach 2km"],
            "distance_from_center": "2 km from city center",
            "public_transport_access": "5 min walk to metro station",
            "check_in_time": "3 PM",
            "check_out_time": "11 AM",
            "pros": ["advantage 1", "advantage 2", "advantage 3"],
            "cons": ["disadvantage 1"],
            "warnings": ["warning if any"],
            "cultural_compatibility_score": 85,
            "compatibility_reasons": ["reason 1", "reason 2"],
            "best_for": "families/solo travelers/business/budget travelers/students"
        }}
    ],
    "general_tips": ["tip 1", "tip 2"],
    "scam_warnings": ["scam 1", "scam 2"],
    "area_safety_info": "Detailed safety information about different areas"
}}

For students, prioritize: near university, student communities, kitchen access, budget-friendly.
For travelers, prioritize: safety, English-speaking staff, tourist-friendly areas.
Include cultural compatibility based on preferences like vegetarian food, quiet areas, etc."""

        try:
            response = await gemini_service.generate_response(prompt)
            response_text = response.strip()
            
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            data = json.loads(response_text)
            return AccommodationResponse(**data)
            
        except Exception as e:
            print(f"Error finding accommodation: {e}")
            return self._create_fallback_accommodation(city or destination_country, user_type)
    
    def _create_fallback_accommodation(self, location: str, user_type: str) -> AccommodationResponse:
        """Create fallback accommodation recommendations"""
        if user_type == "student":
            return AccommodationResponse(
                recommendations=[
                    AccommodationOption(
                        name="Student Residence A",
                        type="residence",
                        area="Near University",
                        price_range="Budget-friendly",
                        pros=["Student community", "Kitchen access", "Study areas"],
                        cons=["Shared facilities"],
                        warnings=[],
                        cultural_compatibility_score=80,
                        compatibility_reasons=["Student-focused", "International community"]
                    )
                ],
                general_tips=[
                    "Look for student residences near campus",
                    "Check for kitchen facilities if you cook",
                    "Join student housing groups online"
                ],
                scam_warnings=["Never pay without seeing the place", "Verify landlord identity"],
                area_safety_info=f"Research safe neighborhoods in {location}"
            )
        else:
            return AccommodationResponse(
                recommendations=[
                    AccommodationOption(
                        name="Central Hotel",
                        type="hotel",
                        area="City Center",
                        price_range="Mid-range",
                        pros=["Safe area", "English-speaking staff", "Good transport"],
                        cons=["Tourist prices"],
                        warnings=[],
                        cultural_compatibility_score=75,
                        compatibility_reasons=["Tourist-friendly", "Central location"]
                    )
                ],
                general_tips=[
                    "Book accommodations with good reviews",
                    "Stay in well-lit, central areas",
                    "Check proximity to public transport"
                ],
                scam_warnings=["Avoid too-good-to-be-true deals", "Use reputable booking platforms"],
                area_safety_info=f"Central areas in {location} are generally safe for tourists"
            )

accommodation_service = AccommodationService()
