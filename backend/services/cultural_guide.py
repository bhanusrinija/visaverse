from services.gemini_service import gemini_service
from models.culture import CultureGuide, CultureCategory
import json

class CulturalGuideService:
    
    async def get_cultural_guide(self, country: str, category: str = "all") -> CultureGuide:
        """Generate cultural intelligence guide for a country"""
        
        categories_list = [
            "Greetings & Social Norms",
            "Workplace Etiquette",
            "Dress Code",
            "Public Behavior",
            "Tipping Culture",
            "Religious & Social Sensitivities"
        ]
        
        if category != "all":
            categories_list = [cat for cat in categories_list if category.lower() in cat.lower()]
        
        prompt = f"""You are a cultural expert. Provide detailed cultural intelligence for {country}.

For each category, provide 3-5 specific, practical tips:

Categories:
{', '.join(categories_list)}

Format your response as JSON:
{{
    "country": "{country}",
    "categories": [
        {{
            "category": "Greetings & Social Norms",
            "tips": ["tip 1", "tip 2", "tip 3"]
        }}
    ],
    "general_advice": "Overall cultural advice for visitors"
}}

Be specific, practical, and include real examples. Focus on what newcomers need to know to avoid cultural misunderstandings."""

        try:
            response = await gemini_service.generate_response(prompt)
            
            # Parse JSON response
            response_text = response.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            try:
                data = json.loads(response_text)
                return CultureGuide(**data)
            except json.JSONDecodeError:
                return self._create_fallback_guide(country, categories_list)
                
        except Exception as e:
            print(f"Error generating cultural guide: {e}")
            return self._create_fallback_guide(country, categories_list)
    
    def _create_fallback_guide(self, country: str, categories: list) -> CultureGuide:
        """Create fallback cultural guide"""
        return CultureGuide(
            country=country,
            categories=[
                CultureCategory(
                    category="Greetings & Social Norms",
                    tips=[
                        "Research local greeting customs before arrival",
                        "Observe how locals interact and follow their lead",
                        "Be respectful and patient when learning new customs"
                    ]
                ),
                CultureCategory(
                    category="Workplace Etiquette",
                    tips=[
                        "Punctuality expectations vary by culture",
                        "Understand hierarchy and communication styles",
                        "Ask colleagues about unwritten workplace rules"
                    ]
                )
            ],
            general_advice=f"When relocating to {country}, take time to observe and learn local customs. Ask questions respectfully and be patient with yourself as you adapt."
        )

cultural_guide_service = CulturalGuideService()
