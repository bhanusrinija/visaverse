from fastapi import APIRouter, HTTPException
from models.voice import VoiceQuery, VoiceResponse
from services.voice_service import voice_service

router = APIRouter(prefix="/api/voice", tags=["Voice AI"])

@router.post("/query", response_model=VoiceResponse)
async def process_voice_query(request: VoiceQuery):
    """
    Process voice-based conversational query.
    Maintains context and chat history for natural conversation flow.
    Response is optimized for text-to-speech output.
    """
    try:
        # Extract relocation data from context
        relocation_data = request.context or {}
        session_id = request.user_id or "anonymous"
        
        # Call the service
        result = await voice_service.process_query(
            query=request.text,
            session_id=session_id,
            relocation_data=relocation_data
        )
        
        # Convert dict response to VoiceResponse model
        return VoiceResponse(
            response_text=result.get("response", ""),
            response_type=result.get("type", "general"),
            suggestions=result.get("suggestions", [])
        )
    except Exception as e:
        print(f"Voice query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

