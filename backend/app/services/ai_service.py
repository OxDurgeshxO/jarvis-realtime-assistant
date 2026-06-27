import logging
from google import genai
from google.genai import types
from app.config import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self._api_key = settings.GOOGLE_API_KEY
        if not self._api_key:
            logger.warning("GOOGLE_API_KEY is not set. AI features will be unavailable.")
            self.client = None
        else:
            self.client = genai.Client(api_key=self._api_key)

    def _check_api_key(self):
        if not self._api_key or not self.client:
            raise ValueError("Missing GOOGLE_API_KEY. Please set it in .env or environment variables.")

    async def get_chat_response(self, message: str, history: list = None):
        """Non-streaming chat response using Gemini"""
        self._check_api_key()
        try:
            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=message
            )
            return response.text
        except Exception as e:
            logger.error(f"Error getting Gemini response: {e}")
            raise e

    async def stream_chat_response(self, message: str, history: list = None):
        """Streaming chat response using Gemini"""
        self._check_api_key()
        try:
            for chunk in self.client.models.generate_content_stream(
                model=settings.GEMINI_MODEL,
                contents=message
            ):
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            logger.error(f"Error streaming Gemini response: {e}")
            raise e

ai_service = AIService()
