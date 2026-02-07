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
            self.flash_model = genai.GenerativeModel(settings.gemini_flash_model)
            self.pro_model = genai.GenerativeModel(settings.gemini_pro_model)
            self._initialized = True
            print(f"[OK] Gemini AI initialized with Flash: {settings.gemini_flash_model} and Pro: {settings.gemini_pro_model}")
        except Exception as e:
            print(f"[WARNING] Gemini initialization warning: {e}")
            self.flash_model = None
            self.pro_model = None
    
    async def generate_response(self, prompt: str, context: Optional[str] = None, use_pro: bool = False) -> str:
        """Generate AI response using Gemini"""
        model = self.pro_model if use_pro else self.flash_model
        try:
            if not model:
                return "AI service is currently unavailable."
            
            full_prompt = f"{context}\n\n{prompt}" if context else prompt
            # Use generate_content_async for non-blocking execution
            response = await model.generate_content_async(full_prompt)
            return response.text
        except Exception as e:
            print(f"Error generating response: {e}")
            return f"Error: {str(e)}"
    
    async def generate_multimodal_response(self, prompt: str, file_data: bytes, mime_type: str = "application/pdf", use_pro: bool = False) -> str:
        """Generate AI response using Gemini with multimodal input (Image/PDF)"""
        # Multimodal can also use Flash for speed unless explicitly Pro
        model = self.pro_model if use_pro else self.flash_model
        try:
            if not model:
                return "AI service is currently unavailable."
            
            content = [
                prompt,
                {
                    "mime_type": mime_type,
                    "data": file_data
                }
            ]
            
            # Use generate_content_async for non-blocking execution
            response = await model.generate_content_async(content)
            return response.text
        except Exception as e:
            print(f"Error generating multimodal response: {e}")
            return f"Error: {str(e)}"
    
    async def translate_text(self, text: str, source_lang: str, target_lang: str) -> str:
        """Translate text using Gemini (Always using Flash for speed)"""
        try:
            if not self.flash_model:
                return "Translation service unavailable"
            
            prompt = f"""Translate the following text from {source_lang} to {target_lang}.
Only provide the translation, nothing else.

Text: {text}

Translation:"""
            
            # Use generate_content_async for non-blocking execution
            response = await self.flash_model.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error translating text: {e}")
            return f"Translation error: {str(e)}"
    
    async def analyze_document(self, document_text: str, document_type: str = "visa", use_pro: bool = False) -> Dict[str, Any]:
        """Analyze document (Now defaulting to Flash for speed)"""
        model = self.pro_model if use_pro else self.flash_model
        try:
            if not model:
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
            
            # Use generate_content_async for non-blocking execution
            response = await model.generate_content_async(prompt)
            return {
                "analysis": response.text,
                "document_type": document_type
            }
        except Exception as e:
            print(f"Error analyzing document: {e}")
            return {"error": str(e)}

# Singleton instance
gemini_service = GeminiService()
