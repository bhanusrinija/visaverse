from services.gemini_service import gemini_service
from typing import List, Dict, Any, Optional
import json

class SimulationService:
    
    async def start_simulation(self, destination_country: str, scenario_type: str) -> Dict[str, Any]:
        """Start a new cultural simulation scenario"""
        
        prompt = f"""Create a cultural roleplay scenario for someone moving to {destination_country}.
Scenario Type: {scenario_type}

Provide:
1. A brief introduction setting the scene (e.g., you are at a business dinner in Tokyo).
2. The initial character you are interacting with.
3. The first thing they say or do.
4. 3 possible actions the user could take (A, B, C).

Respond in JSON format:
{{
    "title": "Scenario Title",
    "description": "Scene description",
    "character_name": "Character Name",
    "initial_message": "What they say",
    "options": [
        {{"id": "A", "text": "Option A text"}},
        {{"id": "B", "text": "Option B text"}},
        {{"id": "C", "text": "Option C text"}}
    ],
    "cultural_context": "Brief tip about why this scenario is important in {destination_country}"
}}"""

        try:
            response = await gemini_service.generate_response(prompt, use_pro=False)
            data = self._parse_json(response)
            return data
        except Exception as e:
            print(f"Error starting simulation: {e}")
            return {"error": str(e)}

    async def evaluate_action(self, destination_country: str, scenario_desc: str, char_msg: str, user_action: str) -> Dict[str, Any]:
        """Evaluate the user's action in the simulation"""
        
        prompt = f"""In a cultural simulation in {destination_country}:
Scene: {scenario_desc}
Character said: {char_msg}
User chose to: {user_action}

Evaluate this choice:
1. How culturally appropriate was it (Score 1-10)?
2. What happened next?
3. Why was it a good or bad choice based on {destination_country} customs?
4. Are there 3 new follow-up options?

Respond in JSON format:
{{
    "score": 8,
    "feedback": "Why it was good/bad",
    "reaction": "How the character reacts to what you did",
    "is_scenario_over": false,
    "next_options": [
        {{"id": "A", "text": "Next Option A"}},
        {{"id": "B", "text": "Next Option B"}},
        {{"id": "C", "text": "Next Option C"}}
    ]
}}"""

        try:
            response = await gemini_service.generate_response(prompt, use_pro=False)
            return self._parse_json(response)
        except Exception as e:
            return {"error": str(e)}

    def _parse_json(self, text: str) -> Dict[str, Any]:
        """Robustly extract and parse JSON from AI response"""
        text = text.strip()
        
        # Try direct parsing first
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # Try to find JSON block with regex
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        
        # Try finding markdown code block
        if "```json" in text:
            try:
                content = text.split("```json")[1].split("```")[0].strip()
                return json.loads(content)
            except (IndexError, json.JSONDecodeError):
                pass
        elif "```" in text:
            try:
                content = text.split("```")[1].split("```")[0].strip()
                return json.loads(content)
            except (IndexError, json.JSONDecodeError):
                pass
                
        # If all parsing fails, return a safe error object
        print(f"Error: Could not parse simulation JSON from: {text[:200]}...")
        raise ValueError("Failed to parse simulation response as JSON")

simulation_service = SimulationService()
