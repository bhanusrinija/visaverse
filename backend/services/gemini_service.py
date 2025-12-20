import google.generativeai as genai
from config import settings
from typing import Optional, Dict, Any

class GeminiService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GeminiService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        try:
            genai.configure(api_key=settings.gemini_api_key)
            # Using gemini-2.5-flash - confirmed available in free tier
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            self._initialized = True
            print("[OK] Gemini AI initialized successfully with gemini-2.5-flash")
        except Exception as e:
            print(f"[WARNING] Gemini initialization warning: {e}")
            self.model = None
    
    async def generate_response(self, prompt: str, context: Optional[str] = None) -> str:
        """Generate AI response using Gemini"""
        try:
            if not self.model:
                return "AI service is currently unavailable. Please configure GEMINI_API_KEY."
            
            full_prompt = f"{context}\n\n{prompt}" if context else prompt
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            print(f"Error generating response: {e}")
            return f"Error: {str(e)}"
    
    async def translate_text(self, text: str, source_lang: str, target_lang: str) -> str:
        """Translate text using Gemini"""
        try:
            if not self.model:
                return "Translation service unavailable"
            
            prompt = f"""Translate the following text from {source_lang} to {target_lang}.
Only provide the translation, nothing else.

Text: {text}

Translation:"""
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error translating text: {e}")
            return f"Translation error: {str(e)}"
    
    async def analyze_document(self, document_text: str, document_type: str = "visa") -> Dict[str, Any]:
        """Analyze document and provide simplified explanation"""
        try:
            if not self.model:
                return {"error": "Document analysis unavailable"}
            
            prompt = f"""You are analyzing a {document_type} document. Please provide:

1. A brief summary (2-3 sentences)
2. Key points (bullet points)
3. Important dates or deadlines
4. Missing information or action items
5. Simplified explanation for someone unfamiliar with legal documents

Document text:
{document_text}

Provide the response in JSON format with keys: summary, key_points, dates, missing_info, explanation"""
            
            response = self.model.generate_content(prompt)
            # Parse response - for now return as text, can enhance JSON parsing
            return {
                "analysis": response.text,
                "document_type": document_type
            }
        except Exception as e:
            print(f"Error analyzing document: {e}")
            return {"error": str(e)}

# Singleton instance
gemini_service = GeminiService()
