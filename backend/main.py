from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings

# Import routers
from routers import (
    relocation, culture, language, voice, currency, documents, packing,
    survival_plan, accommodation, rental_housing, itinerary, first_hours,
    arrival_tasks, flights, calendar
)

app = FastAPI(
    title="Smart Global Relocation Companion API",
    description="AI-powered relocation assistant with 15 integrated modules",
    version="2.1.0"
)

# -------------------------
# CORS CONFIGURATION
# -------------------------

allowed_origins = []

# Frontend URL from environment (Vercel)
if settings.frontend_url:
    allowed_origins.append(settings.frontend_url)

# Local development
allowed_origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# ROUTERS
# -------------------------

app.include_router(relocation.router)
app.include_router(culture.router)
app.include_router(language.router)
app.include_router(voice.router)
app.include_router(currency.router)
app.include_router(documents.router)
app.include_router(packing.router)
app.include_router(survival_plan.router)
app.include_router(accommodation.router)
app.include_router(rental_housing.router)
app.include_router(itinerary.router)
app.include_router(first_hours.router)
app.include_router(arrival_tasks.router)
app.include_router(flights.router)
app.include_router(calendar.router)

# -------------------------
# HEALTH ENDPOINTS
# -------------------------

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Smart Global Relocation Companion API",
        "version": "2.1.0",
        "modules": [
            "Relocation Planner",
            "Cultural Intelligence",
            "Language & Translation",
            "Voice AI",
            "Currency Assistant",
            "Document Analysis",
            "Packing Essentials",
            "30-Day Survival Plan",
            "Accommodation Finder",
            "Rental Housing Guide",
            "Travel Itinerary",
            "First 48 Hours",
            "Arrival Tasks",
            "Flight Deals & Tips",
            "Smart Calendar"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "gemini_configured": bool(settings.gemini_api_key),
        "firebase_configured": bool(settings.firebase_project_id)
    }
