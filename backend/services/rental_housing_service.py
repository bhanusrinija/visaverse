from services.gemini_service import gemini_service
from models.rental_housing import RentalHousingResponse
import json

class RentalHousingService:
    
    async def get_rental_guide(
        self,
        destination_country: str,
        city: str = None
    ) -> RentalHousingResponse:
        """Get rental housing guidance for a country"""
        
        location = f"{city}, {destination_country}" if city else destination_country
        
        prompt = f"""You are a rental housing expert. Provide comprehensive rental guidance for {location}.

Provide response in JSON format:
{{
    "rental_process": "Step-by-step explanation of the rental process",
    "typical_costs": {{
        "deposit": "2-3 months rent",
        "monthly_rent": "$800-1200",
        "utilities": "$100-150",
        "agent_fee": "1 month rent"
    }},
    "required_documents": ["document 1", "document 2"],
    "contract_tips": ["tip 1", "tip 2"],
    "common_scams": ["scam 1", "scam 2"],
    "registration_requirements": "Address registration process and timeline",
    "legal_tips": ["legal tip 1", "legal tip 2"],
    "rental_options": [
        {{
            "property_name": "Name of area/neighborhood",
            "area": "Specific area/district name",
            "property_type": "apartment/studio/house/shared",
            "bedrooms": "1-2 bedrooms",
            "monthly_rent": "$800-1000",
            "deposit": "2 months rent",
            "utilities_included": false,
            "amenities": ["wifi", "furnished", "parking"],
            "nearby_facilities": ["supermarket", "metro station", "hospital"],
            "public_transport": "Description of public transport access",
            "pros": ["advantage 1", "advantage 2"],
            "cons": ["disadvantage 1", "disadvantage 2"],
            "best_for": "students/families/professionals/budget travelers"
        }}
    ]
}}

Provide at least 4-5 different rental options in various price ranges and areas. Be specific to {destination_country}'s rental market, laws, and common practices."""

        try:
            response = await gemini_service.generate_response(prompt)
            response_text = response.strip()
            
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            data = json.loads(response_text)
            return RentalHousingResponse(**data)
            
        except Exception as e:
            print(f"Error getting rental guide: {e}")
            return self._create_fallback_guide(destination_country)
    
    def _create_fallback_guide(self, country: str) -> RentalHousingResponse:
        """Create fallback rental guide"""
        return RentalHousingResponse(
            rental_process=f"In {country}, rental process typically involves: finding property, viewing, application, contract signing, deposit payment, and move-in.",
            typical_costs={
                "deposit": "2-3 months rent (varies by country)",
                "monthly_rent": "Varies by city and area",
                "utilities": "€100-200/month average",
                "agent_fee": "May apply in some countries"
            },
            required_documents=[
                "Valid ID/Passport",
                "Proof of income",
                "Employment contract or university enrollment",
                "Previous rental references",
                "Bank statements"
            ],
            contract_tips=[
                "Read contract carefully before signing",
                "Check contract duration and notice period",
                "Document property condition at move-in",
                "Understand deposit return conditions",
                "Get everything in writing"
            ],
            common_scams=[
                "Requests for payment before viewing",
                "Landlord asking for full rent upfront",
                "Too-good-to-be-true prices",
                "Fake listings with stolen photos",
                "Pressure to sign immediately"
            ],
            registration_requirements=f"Most countries require address registration within 1-2 weeks of moving in. Check {country}'s specific requirements.",
            legal_tips=[
                "Ensure landlord is the legal owner",
                "Keep copies of all documents",
                "Know your tenant rights",
                "Understand eviction laws",
                "Check if rent control applies"
            ],
            rental_options=[
                {
                    "property_name": "City Center Apartment",
                    "area": "Downtown/Central District",
                    "property_type": "apartment",
                    "bedrooms": "1-2 bedrooms",
                    "monthly_rent": "$1000-1500",
                    "deposit": "2-3 months rent",
                    "utilities_included": False,
                    "amenities": ["wifi", "elevator", "security"],
                    "nearby_facilities": ["metro", "supermarkets", "restaurants"],
                    "public_transport": "Excellent - multiple metro/bus lines",
                    "pros": ["Central location", "Good transport links", "Many amenities nearby"],
                    "cons": ["Higher rent", "Can be noisy", "Limited parking"],
                    "best_for": "professionals"
                },
                {
                    "property_name": "Student Quarter Studio",
                    "area": "University District",
                    "property_type": "studio",
                    "bedrooms": "Studio",
                    "monthly_rent": "$600-800",
                    "deposit": "1-2 months rent",
                    "utilities_included": True,
                    "amenities": ["wifi", "furnished", "shared laundry"],
                    "nearby_facilities": ["university", "library", "cafes"],
                    "public_transport": "Good - bus and metro access",
                    "pros": ["Affordable", "Student-friendly", "Utilities included"],
                    "cons": ["Small space", "Shared facilities", "Noisy during semester"],
                    "best_for": "students"
                },
                {
                    "property_name": "Suburban Family House",
                    "area": "Residential Suburb",
                    "property_type": "house",
                    "bedrooms": "3-4 bedrooms",
                    "monthly_rent": "$1200-1800",
                    "deposit": "2 months rent",
                    "utilities_included": False,
                    "amenities": ["garden", "parking", "quiet area"],
                    "nearby_facilities": ["schools", "parks", "shopping centers"],
                    "public_transport": "Moderate - bus service available",
                    "pros": ["Spacious", "Quiet", "Family-friendly", "Garden space"],
                    "cons": ["Longer commute", "Need car", "Higher utilities"],
                    "best_for": "families"
                },
                {
                    "property_name": "Budget Shared Apartment",
                    "area": "Outer Districts",
                    "property_type": "shared",
                    "bedrooms": "1 bedroom in shared flat",
                    "monthly_rent": "$400-600",
                    "deposit": "1 month rent",
                    "utilities_included": True,
                    "amenities": ["wifi", "shared kitchen", "furnished room"],
                    "nearby_facilities": ["local shops", "bus stops"],
                    "public_transport": "Basic - bus connections",
                    "pros": ["Very affordable", "Utilities included", "Social environment"],
                    "cons": ["Shared space", "Less privacy", "Away from center"],
                    "best_for": "budget travelers"
                }
            ]
        )

rental_housing_service = RentalHousingService()
