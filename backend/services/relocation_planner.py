from services.gemini_service import gemini_service
from models.relocation import RelocationPlan, VisaRecommendation
from typing import Dict, Any
import json

class RelocationPlannerService:
    
    async def generate_relocation_plan(
        self, 
        home_country: str, 
        destination_country: str, 
        purpose: str
    ) -> RelocationPlan:
        """Generate comprehensive relocation plan using AI"""
        
        prompt = f"""You are an expert immigration consultant. Generate a detailed relocation plan for:

Home Country: {home_country}
Destination Country: {destination_country}
Purpose: {purpose}

Provide a comprehensive response in the following JSON format:
{{
    "visa_recommendations": [
        {{
            "visa_type": "visa type name",
            "description": "brief description",
            "processing_time": "estimated time",
            "requirements": ["requirement 1", "requirement 2"]
        }}
    ],
    "document_checklist": ["document 1", "document 2", "document 3"],
    "timeline_weeks": 12,
    "timeline_description": "detailed timeline explanation",
    "common_mistakes": ["mistake 1", "mistake 2"],
    "country_specific_rules": ["rule 1", "rule 2"]
}}

Be specific to the countries and purpose mentioned. Include practical, actionable advice."""

        try:
            response = await gemini_service.generate_response(prompt, use_pro=True)
            
            # Try to parse JSON from response
            # Gemini sometimes wraps JSON in markdown code blocks
            response_text = response.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            try:
                data = json.loads(response_text)
                return RelocationPlan(**data)
            except json.JSONDecodeError:
                # Fallback: create structured response from text
                return self._create_fallback_plan(response, home_country, destination_country, purpose)
                
        except Exception as e:
            print(f"Error generating relocation plan: {e}")
            return self._create_fallback_plan(str(e), home_country, destination_country, purpose)
    
    def _create_fallback_plan(self, response_text: str, home: str, dest: str, purpose: str) -> RelocationPlan:
        """Create a fallback plan when JSON parsing fails"""
        return RelocationPlan(
            visa_recommendations=[
                VisaRecommendation(
                    visa_type=f"{purpose} Visa",
                    description=f"Standard {purpose.lower()} visa for {dest}",
                    processing_time="4-12 weeks",
                    requirements=["Valid passport", "Proof of purpose", "Financial documents", "Health insurance"]
                )
            ],
            document_checklist=[
                "Valid passport (6+ months validity)",
                "Visa application form",
                "Passport-sized photographs",
                "Proof of accommodation",
                "Financial statements",
                "Travel insurance",
                f"{purpose}-specific documents"
            ],
            timeline_weeks=12,
            timeline_description=f"Typical relocation from {home} to {dest} takes 8-16 weeks including visa processing and preparation.",
            common_mistakes=[
                "Applying too close to travel date",
                "Incomplete documentation",
                "Not checking visa validity period",
                "Ignoring country-specific requirements"
            ],
            country_specific_rules=[
                f"Check {dest}'s immigration website for latest requirements",
                "Some countries require biometric data",
                "Translation of documents may be required",
                "Check if visa interview is mandatory"
            ]
        )

relocation_planner_service = RelocationPlannerService()
