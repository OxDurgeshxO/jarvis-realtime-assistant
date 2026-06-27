import logging
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self._api_key = settings.GOOGLE_API_KEY
        if not self._api_key:
            logger.warning("GOOGLE_API_KEY is not set. AI features will be unavailable.")
        else:
            genai.configure(api_key=self._api_key)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)

    def _check_api_key(self):
        if not self._api_key:
            raise ValueError("Missing GOOGLE_API_KEY. Please set it in .env or environment variables.")

    async def get_chat_response(self, message: str, history: list = None):
        """Non-streaming chat response using Gemini Pro"""
        self._check_api_key()
        try:
            chat = self.model.start_chat(history=history or [])
            response = chat.send_message(message)
            return response.text
        except Exception as e:
            logger.error(f"Error getting Gemini response: {e}")
            raise e

    async def stream_chat_response(self, message: str, history: list = None):
        """Streaming chat response using Gemini Pro"""
        self._check_api_key()
        try:
            chat = self.model.start_chat(history=history or [])
            response = chat.send_message(message, stream=True)
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            logger.error(f"Error streaming Gemini response: {e}")
            raise e

ai_service = AIService()