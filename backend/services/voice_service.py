from services.gemini_service import gemini_service
from services.firebase_service import firebase_service
from models.voice import VoiceResponse
from typing import Dict, Any, Optional

class VoiceService:
    
    async def process_query(self, query: str, session_id: str, relocation_data: dict) -> dict:
        """Process voice query with full relocation context"""
        try:
            # Extract relocation details
            home_country = relocation_data.get('homeCountry', 'Unknown')
            dest_country = relocation_data.get('destinationCountry', 'Unknown')
            purpose = relocation_data.get('purpose', 'general')
            duration_days = relocation_data.get('durationDays', 30)
            
            # Calculate duration description
            if duration_days < 7:
                duration_desc = f"{duration_days} days (short stay)"
            elif duration_days < 30:
                duration_desc = f"{duration_days} days ({duration_days // 7} weeks)"
            elif duration_days < 365:
                duration_desc = f"{duration_days} days ({duration_days // 30} months)"
            else:
                duration_desc = f"{duration_days} days ({duration_days // 365} years)"
            
            # Build comprehensive context
            context = f"""You are an expert AI relocation assistant helping someone relocate.

RELOCATION DETAILS:
- From: {home_country}
- To: {dest_country}
- Purpose: {purpose}
- Duration: {duration_desc}

YOUR ROLE:
- Provide accurate, up-to-date information about {dest_country}
- Consider the user's specific situation (purpose: {purpose}, duration: {duration_desc})
- Give practical, actionable advice
- Mention current visa policies, entry requirements, and regulations
- Be aware of cultural differences between {home_country} and {dest_country}
- Provide cost estimates in local currency when relevant
- Suggest timeline-appropriate actions based on their {duration_desc} stay

GUIDELINES:
1. For visa/immigration questions: Provide current requirements, processing times, and document checklists
2. For cultural questions: Explain customs, etiquette, and social norms specific to {dest_country}
3. For practical questions: Give specific advice on housing, transportation, healthcare, banking
4. For language questions: Offer essential phrases and communication tips
5. For cost questions: Provide realistic budget estimates for {dest_country}
6. Always consider their {purpose} purpose when giving advice
7. Tailor recommendations to their {duration_desc} stay duration

Be conversational, helpful, and specific to their situation. Keep responses under 150 words for voice readability."""

            # Get or create chat history
            history = await firebase_service.get_chat_history(session_id)
            
            # Add recent context (last 3 messages)
            if history:
                recent_history = history[-6:]  # Last 3 exchanges (6 messages)
                context += "\n\nRECENT CONVERSATION:\n"
                for msg in recent_history:
                    role = "User" if msg.get('role') == 'user' else "Assistant"
                    context += f"{role}: {msg.get('content', '')}\n"
            
            # Generate response
            full_prompt = f"{context}\n\nUser question: {query}\n\nProvide a helpful, conversational response:"
            response_text = await gemini_service.generate_response(full_prompt)
            
            # Classify query type
            response_type = self._classify_query(query)
            
            # Generate suggestions
            suggestions = self._generate_suggestions(response_type, relocation_data)
            
            # Save to chat history
            await firebase_service.save_chat_history(session_id, {
                "role": "user",
                "content": query
            })
            await firebase_service.save_chat_history(session_id, {
                "role": "assistant",
                "content": response_text
            })
            
            return {
                "response": response_text,
                "type": response_type,
                "suggestions": suggestions
            }
            
        except Exception as e:
            print(f"Error processing voice query: {e}")
            return {
                "response": "I'm having trouble processing your request. Could you please rephrase that?",
                "type": "error",
                "suggestions": ["Try asking about visa requirements", "Ask about cultural tips"]
            }
    
    def _classify_query(self, text: str) -> str:
        """Classify the type of query"""
        text_lower = text.lower()
        if any(word in text_lower for word in ['visa', 'document', 'immigration', 'permit']):
            return "relocation"
        elif any(word in text_lower for word in ['culture', 'etiquette', 'custom', 'behavior']):
            return "culture"
        elif any(word in text_lower for word in ['translate', 'language', 'phrase', 'say']):
            return "translation"
        elif any(word in text_lower for word in ['money', 'currency', 'cash', 'exchange']):
            return "currency"
        elif any(word in text_lower for word in ['pack', 'luggage', 'bring', 'carry']):
            return "packing"
        else:
            return "general"
    
    def _generate_suggestions(self, response_type: str, context: Optional[Dict] = None) -> list:
        """Generate contextual follow-up suggestions"""
        suggestions_map = {
            "relocation": [
                "What documents do I need?",
                "How long does visa processing take?",
                "What are common mistakes to avoid?"
            ],
            "culture": [
                "Tell me about workplace etiquette",
                "What should I know about greetings?",
                "Are there any cultural taboos?"
            ],
            "translation": [
                "How do I say 'thank you'?",
                "Teach me emergency phrases",
                "What are common greetings?"
            ],
            "currency": [
                "Should I use cash or card?",
                "Where can I exchange money?",
                "How much money should I bring?"
            ],
            "packing": [
                "What medicines should I bring?",
                "Do I need special adapters?",
                "What clothing is appropriate?"
            ],
            "general": [
                "Help me plan my relocation",
                "What cultural tips do you have?",
                "Translate a phrase for me"
            ]
        }
        return suggestions_map.get(response_type, suggestions_map["general"])

voice_service = VoiceService()
