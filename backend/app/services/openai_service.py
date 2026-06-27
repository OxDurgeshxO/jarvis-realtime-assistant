import logging
import io
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        self._api_key = settings.OPENAI_API_KEY
        if not self._api_key:
            logger.warning("OPENAI_API_KEY is not set. OpenAI features will be unavailable.")
        self.client = AsyncOpenAI(api_key=self._api_key or "missing_key")

    def _check_api_key(self):
        if not self._api_key:
            raise ValueError("Missing OPENAI_API_KEY. Please provide a valid API key to use OpenAI features.")

    async def get_chat_response(self, message: str, history: list = None):
        """Non-streaming chat response"""
        self._check_api_key()
        messages = history.copy() if history else []
        messages.append({"role": "user", "content": message})
        
        try:
            response = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error getting chat response: {e}")
            raise e

    async def stream_chat_response(self, message: str, history: list = None):
        """Streaming chat response"""
        self._check_api_key()
        messages = history.copy() if history else []
        messages.append({"role": "user", "content": message})
        
        try:
            stream = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                stream=True
            )
            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            logger.error(f"Error streaming chat response: {e}")
            raise e

    async def text_to_speech(self, text: str):
        """Text to Speech using OpenAI TTS model"""
        self._check_api_key()
        try:
            response = await self.client.audio.speech.create(
                model=settings.OPENAI_TTS_MODEL,
                voice=settings.OPENAI_TTS_VOICE,
                input=text,
            )
            return await response.read()
        except Exception as e:
            logger.error(f"Error in text_to_speech: {e}")
            raise e

    async def speech_to_text(self, audio_data: bytes):
        """Speech to Text using OpenAI Whisper model"""
        self._check_api_key()
        try:
            # Whisper API expects a file-like object with a name
            audio_file = io.BytesIO(audio_data)
            audio_file.name = "audio.webm"  # OpenAI expects a supported extension
            
            transcript = await self.client.audio.transcriptions.create(
                model=settings.OPENAI_STT_MODEL,
                file=audio_file
            )
            return transcript.text
        except Exception as e:
            logger.error(f"Error in speech_to_text: {e}")
            raise e

openai_service = OpenAIService()
