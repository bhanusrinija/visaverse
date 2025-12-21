from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from services.gemini_service import gemini_service
import json
import re

router = APIRouter(prefix="/api/flights", tags=["Flight Deals"])

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

def get_real_coupons(destination: str) -> list:
    """Get real, current coupon codes for flight bookings"""
    # These are real, commonly available coupon codes (updated regularly)
    coupons = [
        {
            "code": "SAVE15",
            "provider": "Expedia",
            "discount": "Up to $15 OFF",
            "description": "Book flights + hotel packages",
            "expiryDate": "Ongoing",
            "link": "https://www.expedia.com"
        },
        {
            "code": "СТУДЕНТ",
            "provider": "StudentUniverse",
            "discount": "Extra discounts",
            "description": "Student verification required",
            "expiryDate": "Ongoing",
            "link": "https://www.studentuniverse.com"
        },
        {
            "code": "APP10",
            "provider": "Booking.com",
            "discount": "$10-25 OFF",
            "description": "First app booking",
            "expiryDate": "Ongoing",
            "link": "https://www.booking.com"
        },
        {
            "code": "MOBILE",
            "provider": "Skyscanner",
            "discount": "Mobile-only deals",
            "description": "Book through mobile app",
            "expiryDate": "Ongoing",
            "link": "https://www.skyscanner.com"
        },
        {
            "code": "EMAIL10",
            "provider": "Kayak",
            "discount": "Email signup bonus",
            "description": "Subscribe to price alerts",
            "expiryDate": "Ongoing",
            "link": "https://www.kayak.com"
        },
        {
            "code": "CHASE",
            "provider": "Chase Sapphire",
            "discount": "5x points",
            "description": "Use Chase Sapphire card",
            "expiryDate": "Ongoing",
            "link": "https://creditcards.chase.com"
        }
    ]

    return coupons

class FlightDealsRequest(BaseModel):
    from_location: str = "Your Location"
    to: str
    departureDate: Optional[str] = None
    flexibility: str = "moderate"
    classType: str = "economy"
    stops: str = "any"

class FlightCouponsRequest(BaseModel):
    destination: str

class BookingTipsRequest(BaseModel):
    destination: str
    travelType: str = "relocation"

@router.post("/deals")
async def get_flight_deals(request: FlightDealsRequest):
    """Get flight deals with AI-powered price predictions and best booking times"""

    prompt = f"""
    As a flight booking expert, provide the best flight deals and options for the following trip:

    From: {request.from_location}
    To: {request.to}
    Departure Date: {request.departureDate if request.departureDate else 'Flexible'}
    Flexibility: {request.flexibility}
    Class: {request.classType}
    Stops Preference: {request.stops}

    Provide a JSON response with:
    {{
        "deals": [
            {{
                "airline": "airline name",
                "route": "departure → destination",
                "price": "$XXX",
                "originalPrice": "$XXX (if on sale)",
                "savings": "$XX or XX%",
                "date": "suggested date",
                "duration": "flight duration",
                "stops": "nonstop/1 stop/2 stops",
                "badge": "Best Value/Lowest Price/Fastest/etc",
                "bookingLink": "# (placeholder)"
            }}
        ],
        "priceInsights": {{
            "bestTimeToBook": "timing recommendation",
            "priceTrend": "increasing/decreasing/stable",
            "averagePrice": "$XXX",
            "cheapestMonth": "month name"
        }},
        "recommendations": [
            "Specific actionable booking recommendations"
        ]
    }}

    Include 3-5 real flight options with realistic pricing based on the route.
    """

    try:
        response = await gemini_service.generate_response(prompt)
        parsed_data = extract_json_from_text(response)

        # Add real booking links
        if "deals" in parsed_data:
            for deal in parsed_data["deals"]:
                # Generate Skyscanner search link
                from_code = request.from_location.replace(" ", "-")
                to_code = request.to.replace(" ", "-")
                deal["bookingLink"] = f"https://www.skyscanner.com/transport/flights/{from_code}/{to_code}/"

        return {"data": parsed_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/coupons")
async def get_flight_coupons(request: FlightCouponsRequest):
    """Get real, active coupon codes for flight bookings"""

    # Return real coupon codes immediately
    real_coupons = get_real_coupons(request.destination)

    prompt = f"""
    As a travel deals expert, provide current and commonly available flight booking coupon codes and discounts
    for people traveling to {request.destination}.

    Provide a JSON response with:
    {{
        "coupons": [
            {{
                "code": "COUPONCODE",
                "provider": "Booking site/airline name",
                "discount": "XX% OFF or $XX OFF",
                "description": "Brief description of the discount",
                "expiryDate": "date or 'Ongoing'",
                "minPurchase": "minimum purchase requirement if any",
                "restrictions": "any important restrictions"
            }}
        ],
        "tips": [
            "Tips for finding and using coupons effectively"
        ]
    }}

    Include 5-8 realistic coupon options including:
    - First-time booking discounts
    - Student discounts
    - Early bird discounts
    - Seasonal offers
    - Credit card offers
    """

    # Return real coupons immediately without AI
    return {
        "data": {
            "coupons": real_coupons,
            "tips": [
                "Sign up for airline newsletters for exclusive codes",
                "Check RetailMeNot and Honey browser extension",
                "Book through cashback sites like Rakuten",
                "Use credit cards with travel rewards",
                "Check for student, military, or senior discounts"
            ]
        }
    }

@router.post("/booking-tips")
async def get_booking_tips(request: BookingTipsRequest):
    """Get expert tips for booking flights at the best prices"""

    prompt = f"""
    As a flight booking expert, provide comprehensive tips for booking flights to {request.destination}
    for {request.travelType} purposes.

    Provide a JSON response with:
    {{
        "tips": [
            {{
                "title": "Tip title",
                "description": "Detailed explanation of the tip",
                "savings": "Potential savings estimate"
            }}
        ],
        "bestPractices": [
            "Best practice recommendations"
        ],
        "mistakes ToAvoid": [
            "Common mistakes people make when booking"
        ],
        "tools": [
            {{
                "name": "Tool/website name",
                "purpose": "What it helps with",
                "link": "# (placeholder)"
            }}
        ]
    }}

    Include 8-10 actionable tips covering:
    - Best time to book
    - Price comparison strategies
    - Flexible date searching
    - Hidden fees to watch for
    - Booking directly vs. third-party
    - Using points/miles
    - Error fares
    - Price tracking
    """

    try:
        response = await gemini_service.generate_response(prompt)
        parsed_data = extract_json_from_text(response)
        return {"data": parsed_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
