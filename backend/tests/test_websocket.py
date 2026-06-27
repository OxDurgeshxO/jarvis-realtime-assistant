import pytest
import json
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from app.main import app

def test_chat_websocket_success():
    client = TestClient(app)
    
    # Mock stream_chat_response to yield tokens
    async def mock_stream(content, history):
        yield "Hello"
        yield " sir"
    
    with patch("app.websocket.chat_ws.openai_service") as mock_openai:
        mock_openai.stream_chat_response = mock_stream
        
        with client.websocket_connect("/ws/chat") as websocket:
            websocket.send_json({"type": "message", "content": "Hi"})
            
            response = websocket.receive_json()
            assert response == {"type": "token", "content": "Hello"}
            
            response = websocket.receive_json()
            assert response == {"type": "token", "content": " sir"}
            
            response = websocket.receive_json()
            assert response == {"type": "done"}

def test_chat_websocket_invalid_type():
    client = TestClient(app)
    with client.websocket_connect("/ws/chat") as websocket:
        websocket.send_json({"type": "ping"})
        response = websocket.receive_json()
        assert response["type"] == "error"
        assert response["content"] == "Invalid message type"

def test_chat_websocket_error():
    client = TestClient(app)
    
    with patch("app.websocket.chat_ws.openai_service") as mock_openai:
        # Mocking an async generator that raises an exception
        async def mock_stream_error(content, history):
            raise Exception("OpenAI Error")
            if False: yield # To make it a generator
            
        mock_openai.stream_chat_response = mock_stream_error
        
        with client.websocket_connect("/ws/chat") as websocket:
            websocket.send_json({"type": "message", "content": "Hi"})
            response = websocket.receive_json()
            assert response["type"] == "error"
            assert response["content"] == "OpenAI Error"

def test_voice_websocket_success():
    client = TestClient(app)
    
    with patch("app.websocket.voice_ws.openai_service") as mock_openai:
        mock_openai.speech_to_text = AsyncMock(return_value="Hello Jarvis")
        mock_openai.get_chat_response = AsyncMock(return_value="Hello sir")
        mock_openai.text_to_speech = AsyncMock(return_value=b"audio response")
        
        with client.websocket_connect("/ws/voice") as websocket:
            # Initial status
            response = websocket.receive_json()
            assert response == {"type": "status", "content": "listening"}
            
            # Send audio
            websocket.send_bytes(b"audio data")
            
            # Trigger processing
            websocket.send_json({"type": "end_of_audio"})
            
            # 1. Status: thinking
            response = websocket.receive_json()
            assert response == {"type": "status", "content": "thinking"}
            
            # 2. Transcript
            response = websocket.receive_json()
            assert response == {"type": "transcript", "content": "Hello Jarvis"}
            
            # 3. Status: speaking
            response = websocket.receive_json()
            assert response == {"type": "status", "content": "speaking"}
            
            # 4. Audio bytes
            response_bytes = websocket.receive_bytes()
            assert response_bytes == b"audio response"
            
            # 5. Back to listening
            response = websocket.receive_json()
            assert response == {"type": "status", "content": "listening"}
