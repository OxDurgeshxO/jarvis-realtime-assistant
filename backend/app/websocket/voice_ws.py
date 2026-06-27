import logging
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.openai_service import openai_service

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
                # Accumulate audio chunks
                audio_buffer.extend(message["bytes"])
                # logger.debug(f"Received {len(message['bytes'])} bytes of audio")
                
            elif "text" in message:
                data = json.loads(message["text"])
                
                if data.get("type") == "end_of_audio":
                    if not audio_buffer:
                        await websocket.send_json({"type": "error", "content": "No audio received"})
                        continue
                        
                    logger.info(f"Processing accumulated audio ({len(audio_buffer)} bytes)")
                    await websocket.send_json({"type": "status", "content": "thinking"})
                    
                    try:
                        # 1. STT (Whisper)
                        transcript = await openai_service.speech_to_text(bytes(audio_buffer))
                        logger.info(f"Transcript: {transcript}")
                        await websocket.send_json({"type": "transcript", "content": transcript})
                        
                        # 2. GPT Response
                        # For simplicity, we'll use a non-streaming chat call here 
                        # or we could maintain a session history.
                        # For now, let's just get a direct response.
                        response_text = await openai_service.get_chat_response(transcript)
                        logger.info(f"Response: {response_text}")
                        
                        # 3. TTS (Nova)
                        await websocket.send_json({"type": "status", "content": "speaking"})
                        audio_response = await openai_service.text_to_speech(response_text)
                        
                        # 4. Send audio back
                        # We send the whole audio as one binary message for now, 
                        # or we could chunk it if needed.
                        await websocket.send_bytes(audio_response)
                        
                        # Clear buffer for next turn
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
