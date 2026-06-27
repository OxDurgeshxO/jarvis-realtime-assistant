import logging
import io
from fastapi import APIRouter, HTTPException, Response
from app.models.schemas import VoiceSpeakRequest
import edge_tts
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/voice/speak")
async def voice_speak_endpoint(request: VoiceSpeakRequest):
    try:
        communicate = edge_tts.Communicate(request.text, settings.EDGE_TTS_VOICE)
        audio_bytes = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_bytes += chunk["data"]
        return Response(content=audio_bytes, media_type="audio/mp3")
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail=str(e))