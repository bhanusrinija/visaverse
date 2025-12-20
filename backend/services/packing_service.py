from services.gemini_service import gemini_service
from models.packing import PackingList, PackingCategory
import json

class PackingService:
    
    async def generate_packing_list(
        self,
        home_country: str,
        destination_country: str,
        duration_days: int,
        purpose: str = "general"
    ) -> PackingList:
        """Generate smart packing list based on countries and purpose"""
        
        prompt = f"""Generate a smart packing list for someone relocating from {home_country} to {destination_country} for {duration_days} days.
Purpose: {purpose}

Focus on items that are:
1. Essential but may not be easily available in {destination_country}
2. Specific to {home_country} culture/needs
3. Climate-appropriate
4. Purpose-specific

Organize into categories:
- Medicines & Health
- Food Items & Spices
- Electronics & Adapters
- Clothing & Climate Gear
- Cultural & Religious Items
- Documents & Important Papers
- Miscellaneous Essentials

For each category, mark priority as: essential, recommended, or optional

Format as JSON:
{{
    "home_country": "{home_country}",
    "destination_country": "{destination_country}",
    "categories": [
        {{
            "category": "Medicines & Health",
            "items": ["item 1", "item 2"],
            "priority": "essential"
        }}
    ],
    "general_tips": ["tip 1", "tip 2"]
}}

Be specific about items from {home_country} that may not be available in {destination_country}."""

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
                return PackingList(**data)
            except json.JSONDecodeError:
                return self._create_fallback_list(home_country, destination_country)
                
        except Exception as e:
            print(f"Error generating packing list: {e}")
            return self._create_fallback_list(home_country, destination_country)
    
    def _create_fallback_list(self, home: str, dest: str) -> PackingList:
        """Create fallback packing list"""
        return PackingList(
            home_country=home,
            destination_country=dest,
            categories=[
                PackingCategory(
                    category="Medicines & Health",
                    items=[
                        "Prescription medications (3-month supply)",
                        "Common medicines (pain relief, cold/flu)",
                        "First aid kit",
                        "Medical prescriptions and records"
                    ],
                    priority="essential"
                ),
                PackingCategory(
                    category="Electronics & Adapters",
                    items=[
                        "Universal power adapter",
                        "Voltage converter (if needed)",
                        "Phone chargers and cables",
                        "Portable power bank"
                    ],
                    priority="essential"
                ),
                PackingCategory(
                    category="Documents & Important Papers",
                    items=[
                        "Passport and visa",
                        "Travel insurance documents",
                        "Copies of important documents",
                        "Emergency contact information",
                        "Bank and financial documents"
                    ],
                    priority="essential"
                ),
                PackingCategory(
                    category="Clothing & Climate Gear",
                    items=[
                        "Weather-appropriate clothing",
                        "Comfortable walking shoes",
                        "Formal attire (if needed)",
                        "Seasonal accessories"
                    ],
                    priority="recommended"
                ),
                PackingCategory(
                    category="Food Items & Spices",
                    items=[
                        f"Specialty items from {home}",
                        "Favorite spices and condiments",
                        "Comfort foods (non-perishable)"
                    ],
                    priority="optional"
                ),
                PackingCategory(
                    category="Cultural & Religious Items",
                    items=[
                        "Religious texts or items",
                        "Cultural artifacts",
                        "Traditional clothing (if applicable)"
                    ],
                    priority="optional"
                )
            ],
            general_tips=[
                f"Check {dest}'s customs regulations for restricted items",
                "Pack essentials in carry-on luggage",
                "Label all items clearly",
                "Keep important documents in waterproof folder",
                "Research what's easily available in destination before packing"
            ]
        )

packing_service = PackingService()
