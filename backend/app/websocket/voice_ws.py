import logging
import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.config import settings
from app.services.ai_service import ai_service
from app.services.audio_service import audio_service
from app.services.live_ai_service import JarvisLiveDuplexService

logger = logging.getLogger(__name__)
router = APIRouter()

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
                msg_type = data.get("type")
                
                if msg_type == "end_of_audio":
                    if not audio_buffer:
                        await websocket.send_json({"type": "error", "content": "No audio received"})
                        await websocket.send_json({"type": "status", "content": "listening"})
                        continue
                        
                    logger.info(f"Processing audio chunk ({len(audio_buffer)} bytes)")
                    await websocket.send_json({"type": "status", "content": "thinking"})
                    
                    try:
                        # 1. STT via cached singleton audio_service
                        transcript = audio_service.transcribe_audio(bytes(audio_buffer))
                        if not transcript:
                            transcript = "[Could not recognize speech, sir. Please try speaking again.]"
                        
                        logger.info(f"Transcript: {transcript}")
                        await websocket.send_json({"type": "transcript", "content": transcript})
                        
                        # 2. Gemini Response via ai_service
                        response_text = await ai_service.get_chat_response(transcript)
                        logger.info(f"JARVIS response: {response_text}")
                        
                        # 3. TTS synthesis via Edge-TTS
                        await websocket.send_json({"type": "status", "content": "speaking"})
                        audio_response = await audio_service.synthesize_speech(response_text)
                        
                        # Stream audio back to client
                        if audio_response:
                            await websocket.send_bytes(audio_response)
                        
                        # Reset buffer and resume listening
                        audio_buffer = bytearray()
                        await websocket.send_json({"type": "status", "content": "listening"})
                        
                    except Exception as e:
                        logger.error(f"Error in voice pipeline: {e}")
                        await websocket.send_json({"type": "error", "content": str(e)})
                        await websocket.send_json({"type": "status", "content": "listening"})
                        audio_buffer = bytearray()

                elif msg_type == "clear":
                    audio_buffer = bytearray()
                    await websocket.send_json({"type": "status", "content": "listening"})

    except WebSocketDisconnect:
        logger.info("Voice WebSocket connection closed")
    except Exception as e:
        logger.error(f"Voice WebSocket error: {e}")
        try:
            await websocket.close()
        except Exception:
            pass


@router.websocket("/live-duplex")
async def live_duplex_websocket_endpoint(websocket: WebSocket):
    """
    Real-time bidirectional duplex audio streaming using Gemini 3.8 Live API.
    Streams 16kHz PCM audio directly to Gemini with server-side VAD and receives
    streaming audio back with sub-300ms turnaround.
    """
    await websocket.accept()
    logger.info("Jarvis Gemini 3.8 Live Duplex WebSocket established")
    
    duplex = JarvisLiveDuplexService()
    try:
        await duplex.initialize_session()
        await websocket.send_json({"type": "status", "content": "connected", "model": settings.GEMINI_LIVE_MODEL})

        async def receive_from_client():
            while True:
                msg = await websocket.receive()
                if "bytes" in msg and msg["bytes"]:
                    await duplex.stream_audio_input(msg["bytes"])
                elif "text" in msg:
                    data = json.loads(msg["text"])
                    if data.get("type") == "ping":
                        await websocket.send_json({"type": "pong"})

        async def send_to_client():
            async for audio_chunk in duplex.receive_audio_output():
                await websocket.send_bytes(audio_chunk)

        await asyncio.gather(receive_from_client(), send_to_client())

    except WebSocketDisconnect:
        logger.info("Jarvis Live Duplex WebSocket disconnected")
    except Exception as e:
        logger.error(f"Live Duplex WebSocket error: {e}")
        try:
            await websocket.send_json({"type": "error", "content": str(e)})
        except Exception:
            pass
    finally:
        await duplex.close()
