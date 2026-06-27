import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.openai_service import OpenAIService

@pytest.fixture
def openai_service():
    # We patch the settings and the client initialization
    with patch("app.services.openai_service.settings") as mock_settings:
        mock_settings.OPENAI_API_KEY = "test_key"
        mock_settings.OPENAI_MODEL = "gpt-4o"
        mock_settings.OPENAI_TTS_MODEL = "tts-1"
        mock_settings.OPENAI_TTS_VOICE = "nova"
        mock_settings.OPENAI_STT_MODEL = "whisper-1"
        with patch("app.services.openai_service.AsyncOpenAI"):
            service = OpenAIService()
            return service

@pytest.mark.asyncio
async def test_get_chat_response_success(openai_service):
    # Mock response structure for OpenAI v1.x
    mock_response = MagicMock()
    mock_choice = MagicMock()
    mock_choice.message.content = "Hello, I am J.A.R.V.I.S."
    mock_response.choices = [mock_choice]
    
    openai_service.client.chat.completions.create = AsyncMock(return_value=mock_response)
    
    response = await openai_service.get_chat_response("Hi")
    
    assert response == "Hello, I am J.A.R.V.I.S."
    openai_service.client.chat.completions.create.assert_called_once()
    args, kwargs = openai_service.client.chat.completions.create.call_args
    assert kwargs["messages"][-1]["content"] == "Hi"

@pytest.mark.asyncio
async def test_stream_chat_response_success(openai_service):
    # Mocking a stream
    mock_chunk1 = MagicMock()
    mock_chunk1.choices = [MagicMock()]
    mock_chunk1.choices[0].delta.content = "Hello"
    
    mock_chunk2 = MagicMock()
    mock_chunk2.choices = [MagicMock()]
    mock_chunk2.choices[0].delta.content = " world"
    
    async def mock_stream():
        yield mock_chunk1
        yield mock_chunk2
        
    openai_service.client.chat.completions.create = AsyncMock(return_value=mock_stream())
    
    collected_response = []
    async for chunk in openai_service.stream_chat_response("Hi"):
        collected_response.append(chunk)
        
    assert "".join(collected_response) == "Hello world"
    openai_service.client.chat.completions.create.assert_called_once()

@pytest.mark.asyncio
async def test_speech_to_text_success(openai_service):
    mock_transcript = MagicMock()
    mock_transcript.text = "Hello from audio"
    openai_service.client.audio.transcriptions.create = AsyncMock(return_value=mock_transcript)
    
    result = await openai_service.speech_to_text(b"fake audio data")
    
    assert result == "Hello from audio"
    openai_service.client.audio.transcriptions.create.assert_called_once()

@pytest.mark.asyncio
async def test_text_to_speech_success(openai_service):
    mock_response = AsyncMock()
    mock_response.read = AsyncMock(return_value=b"audio data")
    openai_service.client.audio.speech.create = AsyncMock(return_value=mock_response)
    
    result = await openai_service.text_to_speech("Hello")
    
    assert result == b"audio data"
    openai_service.client.audio.speech.create.assert_called_once()
