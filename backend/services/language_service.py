from services.gemini_service import gemini_service
from models.language import TranslationResponse, LanguageLearningResponse, LanguagePhraseCategory
import json

class LanguageService:
    
    async def translate_text(
        self, 
        text: str, 
        source_language: str, 
        target_language: str
    ) -> TranslationResponse:
        """Translate text using Gemini AI"""
        
        translated = await gemini_service.translate_text(text, source_language, target_language)
        
        return TranslationResponse(
            original_text=text,
            translated_text=translated,
            source_language=source_language,
            target_language=target_language
        )
    
    async def get_basic_phrases(self, country: str, language: str) -> LanguageLearningResponse:
        """Get essential daily-use phrases for a language"""
        
        prompt = f"""Generate essential daily-use phrases for someone learning {language} for travel to {country}.

Organize phrases into these categories:
1. Greetings
2. Shopping
3. Transport
4. Emergency
5. Food

For each category, provide 5-7 essential phrases with English and {language} translations.

Format as JSON:
{{
    "language": "{language}",
    "country": "{country}",
    "categories": [
        {{
            "category": "Greetings",
            "phrases": [
                {{"english": "Hello", "local": "translation", "pronunciation": "phonetic"}},
                {{"english": "Thank you", "local": "translation", "pronunciation": "phonetic"}}
            ]
        }}
    ]
}}

Include phonetic pronunciation to help learners."""

        try:
            response = await gemini_service.generate_response(prompt)
            
            # Parse JSON
            response_text = response.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            try:
                data = json.loads(response_text)
                return LanguageLearningResponse(**data)
            except json.JSONDecodeError:
                return self._create_fallback_phrases(language, country)
                
        except Exception as e:
            print(f"Error generating language phrases: {e}")
            return self._create_fallback_phrases(language, country)
    
    def _create_fallback_phrases(self, language: str, country: str) -> LanguageLearningResponse:
        """Create fallback phrase list"""
        return LanguageLearningResponse(
            language=language,
            country=country,
            categories=[
                LanguagePhraseCategory(
                    category="Greetings",
                    phrases=[
                        {"english": "Hello", "local": "...", "pronunciation": "..."},
                        {"english": "Thank you", "local": "...", "pronunciation": "..."},
                        {"english": "Please", "local": "...", "pronunciation": "..."}
                    ]
                ),
                LanguagePhraseCategory(
                    category="Emergency",
                    phrases=[
                        {"english": "Help", "local": "...", "pronunciation": "..."},
                        {"english": "Emergency", "local": "...", "pronunciation": "..."}
                    ]
                )
            ]
        )

language_service = LanguageService()
