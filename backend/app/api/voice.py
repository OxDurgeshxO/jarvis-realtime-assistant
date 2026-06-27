from fastapi import APIRouter, HTTPException, Response
from app.models.schemas import VoiceSpeakRequest
from app.services.openai_service import openai_service

router = APIRouter()

@router.post("/voice/speak")
async def voice_speak_endpoint(request: VoiceSpeakRequest):
    try:
        audio_content = await openai_service.text_to_speech(request.text)
        return Response(content=audio_content, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
