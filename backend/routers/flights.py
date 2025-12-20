from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from services.gemini_service import gemini_service

router = APIRouter(prefix="/api/flights", tags=["Flight Deals"])

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
        return {"data": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/coupons")
async def get_flight_coupons(request: FlightCouponsRequest):
    """Get active coupon codes and discounts for flight bookings"""

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

    try:
        response = await gemini_service.generate_response(prompt)
        return {"data": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        return {"data": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
