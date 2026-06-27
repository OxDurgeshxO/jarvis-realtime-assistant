import pytest
from unittest.mock import patch, AsyncMock

@pytest.mark.asyncio
async def test_chat_endpoint(async_client):
    with patch("app.api.chat.openai_service") as mock_openai:
        mock_openai.get_chat_response = AsyncMock(return_value="Mocked response")
        
        response = await async_client.post("/api/chat", json={"message": "Hello"})
        
        assert response.status_code == 200
        assert response.json() == {"response": "Mocked response"}

@pytest.mark.asyncio
async def test_voice_speak_endpoint(async_client):
    with patch("app.api.voice.openai_service") as mock_openai:
        mock_openai.text_to_speech = AsyncMock(return_value=b"audio content")
        
        response = await async_client.post("/api/voice/speak", json={"text": "Hello"})
        assert response.status_code == 200
        assert response.content == b"audio content"
