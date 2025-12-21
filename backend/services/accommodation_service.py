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
            response_text = response.strip() if response else ""

            # Check if response is empty (quota exceeded)
            if not response_text:
                print("Empty response from Gemini API - likely quota exceeded")
                return self._create_fallback_accommodation(city or destination_country, user_type)

            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            data = json.loads(response_text)
            return AccommodationResponse(**data)

        except json.JSONDecodeError as e:
            print(f"JSON decode error in accommodation service: {e}")
            print(f"Response text was: {response_text[:200] if 'response_text' in locals() else 'None'}")
            return self._create_fallback_accommodation(city or destination_country, user_type)
        except Exception as e:
            print(f"Error finding accommodation: {e}")
            return self._create_fallback_accommodation(city or destination_country, user_type)
    
    def _create_fallback_accommodation(self, location: str, user_type: str) -> AccommodationResponse:
        """Create fallback accommodation recommendations"""
        if user_type == "student":
            return AccommodationResponse(
                recommendations=[
                    AccommodationOption(
                        name="University Student Residence",
                        type="residence",
                        area="University District",
                        price_range="$400-600/month",
                        cost_per_night="$15-20/night",
                        star_rating=None,
                        amenities=["Shared kitchen", "Study rooms", "Laundry facilities", "WiFi", "24/7 security"],
                        nearby_attractions=["Campus 5 min walk", "Library nearby", "Student cafeteria"],
                        distance_from_center="Varies by university location",
                        public_transport_access="Bus/Metro accessible",
                        check_in_time="Flexible",
                        check_out_time="Flexible",
                        pros=["Affordable for students", "International student community", "Furnished rooms", "Utilities included"],
                        cons=["Shared facilities", "Can be noisy during exam periods"],
                        warnings=["Book early as spaces fill quickly"],
                        cultural_compatibility_score=85,
                        compatibility_reasons=["Diverse international students", "Student-focused environment"],
                        best_for="students"
                    ),
                    AccommodationOption(
                        name="Shared Student Apartment",
                        type="apartment",
                        area="Near Campus",
                        price_range="$300-500/month per room",
                        cost_per_night="$12-18/night",
                        star_rating=None,
                        amenities=["Private bedroom", "Shared kitchen", "WiFi", "Laundry"],
                        nearby_attractions=["Grocery stores", "Restaurants", "Bus stops"],
                        distance_from_center="2-5 km typically",
                        public_transport_access="Good public transport links",
                        check_in_time="By arrangement",
                        check_out_time="By arrangement",
                        pros=["More privacy than dorms", "Kitchen for cooking", "Cost-effective", "Build local connections"],
                        cons=["Need to arrange utilities", "Furniture may not be included"],
                        warnings=["Check lease terms carefully", "View apartment before signing"],
                        cultural_compatibility_score=80,
                        compatibility_reasons=["Mix with local and international students"],
                        best_for="students"
                    ),
                    AccommodationOption(
                        name="Budget Hostel (Short-term)",
                        type="hostel",
                        area="City Center",
                        price_range="$20-35/night",
                        cost_per_night="$25/night average",
                        star_rating="2-3 star",
                        amenities=["Shared dorms or private rooms", "Kitchen", "Common area", "WiFi"],
                        nearby_attractions=["City attractions", "Shopping areas", "Restaurants"],
                        distance_from_center="Central location",
                        public_transport_access="Walking distance to transit",
                        check_in_time="2-3 PM",
                        check_out_time="10-11 AM",
                        pros=["Temporary solution while apartment hunting", "Meet other travelers", "Central location"],
                        cons=["Not suitable long-term", "Less privacy", "Can be noisy"],
                        warnings=["Only for first few weeks while searching for permanent accommodation"],
                        cultural_compatibility_score=70,
                        compatibility_reasons=["International travelers environment"],
                        best_for="students"
                    )
                ],
                general_tips=[
                    "Contact university housing office first - they often have student residence options",
                    "Join Facebook groups for student housing in your city",
                    "Book temporary accommodation (hostel/Airbnb) for first 2 weeks while apartment hunting",
                    "Look for rooms with kitchen access if you want to cook (saves money)",
                    "Check distance to campus - prioritize areas with good public transport",
                    "Student residences typically cost $400-800/month depending on location",
                    "Private apartments: expect to pay 1-2 months deposit plus first month rent",
                    "Use platforms: university housing portal, Facebook student groups, local rental sites"
                ],
                scam_warnings=[
                    "NEVER pay full deposit without seeing the place in person or via verified video tour",
                    "Verify landlord identity - ask for ID and property ownership documents",
                    "Avoid deals that seem too cheap - likely scams",
                    "Don't wire money to overseas accounts for deposits",
                    "Use official university housing or reputable platforms like booking.com",
                    "Get written rental agreement before paying anything"
                ],
                area_safety_info=f"AI service temporarily unavailable. For {location}: Research university neighborhoods online, check crime statistics, read student forums, and contact your university's international student office for safe area recommendations. Generally, areas near universities are student-friendly and safe."
            )
        else:
            return AccommodationResponse(
                recommendations=[
                    AccommodationOption(
                        name="Mid-Range Hotel",
                        type="hotel",
                        area="City Center",
                        price_range="$80-150/night",
                        cost_per_night="$100/night average",
                        star_rating="3-4 star",
                        amenities=["WiFi", "Breakfast included", "24-hour reception", "Room service", "Gym"],
                        nearby_attractions=["Tourist attractions within walking distance", "Shopping areas", "Restaurants"],
                        distance_from_center="0-2 km from center",
                        public_transport_access="Walking distance to metro/bus",
                        check_in_time="2-3 PM",
                        check_out_time="11 AM-12 PM",
                        pros=["Safe central location", "English-speaking staff", "Tourist-friendly", "Good transport connections"],
                        cons=["Higher prices in tourist areas", "Can be busy"],
                        warnings=["Book in advance during peak season"],
                        cultural_compatibility_score=85,
                        compatibility_reasons=["International tourists welcome", "Multi-lingual staff"],
                        best_for="travelers"
                    ),
                    AccommodationOption(
                        name="Budget Hotel/Guesthouse",
                        type="hotel",
                        area="Residential Area (near center)",
                        price_range="$40-70/night",
                        cost_per_night="$50/night average",
                        star_rating="2-3 star",
                        amenities=["WiFi", "Basic breakfast", "Clean rooms", "Helpful staff"],
                        nearby_attractions=["Local markets", "Authentic restaurants", "Public transport"],
                        distance_from_center="2-5 km from center",
                        public_transport_access="10-15 min to metro/bus",
                        check_in_time="2 PM",
                        check_out_time="11 AM",
                        pros=["Affordable", "Local neighborhood experience", "Often family-run with personal touch", "Quieter than city center"],
                        cons=["Fewer English speakers", "Basic amenities", "Need public transport for attractions"],
                        warnings=["Check reviews for cleanliness and safety"],
                        cultural_compatibility_score=75,
                        compatibility_reasons=["Experience local culture", "Authentic neighborhood"],
                        best_for="budget travelers"
                    ),
                    AccommodationOption(
                        name="Serviced Apartment",
                        type="apartment",
                        area="Business District or Residential",
                        price_range="$60-120/night",
                        cost_per_night="$80/night average",
                        star_rating="3-4 star",
                        amenities=["Full kitchen", "Washing machine", "Living room", "WiFi", "Work desk"],
                        nearby_attractions=["Supermarkets nearby", "Restaurants", "Business areas"],
                        distance_from_center="Varies",
                        public_transport_access="Good connections",
                        check_in_time="3 PM",
                        check_out_time="11 AM",
                        pros=["More space than hotel", "Kitchen to cook (save money)", "Feels like home", "Good for longer stays"],
                        cons=["May need minimum stay (3-7 days)", "Less services than hotel"],
                        warnings=["Check cancellation policy"],
                        cultural_compatibility_score=80,
                        compatibility_reasons=["Independent living", "Flexible for dietary needs"],
                        best_for="families"
                    )
                ],
                general_tips=[
                    "Use reputable booking platforms: Booking.com, Hotels.com, Agoda, Airbnb",
                    "Read recent reviews from other travelers (especially from your country)",
                    "Check location on Google Maps - ensure it's in a safe, accessible area",
                    "Book refundable rates when possible in case plans change",
                    "Look for places with 24-hour reception for late arrivals",
                    "Central areas are more expensive but save transport time and costs",
                    "Compare prices across multiple booking sites",
                    "Contact hotel directly - sometimes better rates than booking sites"
                ],
                scam_warnings=[
                    "Only book through verified platforms with customer protection",
                    "Avoid deals that require full upfront payment to personal accounts",
                    "Check hotel exists on Google Maps and has legitimate website",
                    "Read reviews for mentions of scams or fake listings",
                    "Confirm booking with hotel directly via phone/email",
                    "Use credit card (not debit) for booking protection"
                ],
                area_safety_info=f"AI service temporarily unavailable. For {location}: Research online for safe neighborhoods, check government travel advisories, read recent traveler reviews. Generally: stay in well-reviewed central areas with good lighting and public transport. Avoid isolated areas at night. Your hotel staff can advise on safe areas to visit."
            )

accommodation_service = AccommodationService()
