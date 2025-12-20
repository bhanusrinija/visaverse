from pydantic import BaseModel
from typing import List, Dict, Optional

class TranslationRequest(BaseModel):
    text: str
    source_language: str
    target_language: str

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str

class LanguagePhraseCategory(BaseModel):
    category: str
    phrases: List[Dict[str, str]]  # [{"english": "Hello", "local": "Hola"}]

class LanguageLearningResponse(BaseModel):
    language: str
    country: str
    categories: List[LanguagePhraseCategory]
