from fastapi import APIRouter, HTTPException
from models.language import TranslationRequest, TranslationResponse, LanguageLearningResponse
from services.language_service import language_service
from pydantic import BaseModel

router = APIRouter(prefix="/api/language", tags=["Language & Translation"])

@router.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    """
    Translate text from source language to target language.
    Supports voice-enabled translation for real-time communication.
    """
    try:
        translation = await language_service.translate_text(
            text=request.text,
            source_language=request.source_language,
            target_language=request.target_language
        )
        return translation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class LanguageRequest(BaseModel):
    country: str
    language: str

@router.post("/phrases", response_model=LanguageLearningResponse)
async def get_basic_phrases(request: LanguageRequest):
    """
    Get essential daily-use phrases for a specific language.
    Organized by categories: Greetings, Shopping, Transport, Emergency, Food.
    """
    try:
        phrases = await language_service.get_basic_phrases(
            country=request.country,
            language=request.language
        )
        return phrases
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
