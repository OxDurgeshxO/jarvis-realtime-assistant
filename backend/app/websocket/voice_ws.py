import logging
import json
import tempfile
import os
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.ai_service import ai_service
import edge_tts
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Try to import whisper, fall back gracefully
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    logger.warning("whisper not installed. STT will be simulated.")

@router.websocket("/voice")
async def voice_websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("Voice WebSocket connection established")
    
    audio_buffer = bytearray()
    
    try:
        await websocket.send_json({"type": "status", "content": "listening"})
        
        while True:
            message = await websocket.receive()
            
            if "bytes" in message:
                audio_buffer.extend(message["bytes"])
                
            elif "text" in message:
                data = json.loads(message["text"])
                
                if data.get("type") == "end_of_audio":
                    if not audio_buffer:
                        await websocket.send_json({"type": "error", "content": "No audio received"})
                        continue
                        
                    logger.info(f"Processing audio ({len(audio_buffer)} bytes)")
                    await websocket.send_json({"type": "status", "content": "thinking"})
                    
                    try:
                        # 1. STT (local Whisper)
                        transcript = "Hello Jarvis"
                        if WHISPER_AVAILABLE and len(audio_buffer) > 1000:
                            model = whisper.load_model("base")
                            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as f:
                                f.write(bytes(audio_buffer))
                                temp_path = f.name
                            result = model.transcribe(temp_path)
                            transcript = result["text"]
                            os.unlink(temp_path)
                        elif not WHISPER_AVAILABLE:
                            transcript = "[Whisper not installed - using placeholder transcript]"
                        
                        logger.info(f"Transcript: {transcript}")
                        await websocket.send_json({"type": "transcript", "content": transcript})
                        
                        # 2. Gemini Response
                        response_text = await ai_service.get_chat_response(transcript)
                        logger.info(f"Response: {response_text}")
                        
                        # 3. TTS (Edge-TTS - free)
                        await websocket.send_json({"type": "status", "content": "speaking"})
                        communicate = edge_tts.Communicate(response_text, settings.EDGE_TTS_VOICE)
                        audio_response = b""
                        async for chunk in communicate.stream():
                            if chunk["type"] == "audio":
                                audio_response += chunk["data"]
                        
                        # Send audio back
                        await websocket.send_bytes(audio_response)
                        
                        audio_buffer = bytearray()
                        await websocket.send_json({"type": "status", "content": "listening"})
                        
                    except Exception as e:
                        logger.error(f"Error in voice pipeline: {e}")
                        await websocket.send_json({"type": "error", "content": str(e)})
                        await websocket.send_json({"type": "status", "content": "listening"})
                        audio_buffer = bytearray()

                elif data.get("type") == "clear":
                    audio_buffer = bytearray()
                    await websocket.send_json({"type": "status", "content": "listening"})

    except WebSocketDisconnect:
        logger.info("Voice WebSocket connection closed")
    except Exception as e:
        logger.error(f"Voice WebSocket error: {e}")
        try:
            await websocket.close()
        except:
            pass