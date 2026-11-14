import asyncio
import logging
from typing import AsyncGenerator, Optional
from google import genai
from google.genai import types
from app.config import settings

logger = logging.getLogger(__name__)

JARVIS_SYSTEM_INSTRUCTION = (
    "You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), personal AI assistant "
    "to the user, whom you address as 'sir' or 'boss'. You speak with calm, intelligent "
    "British eloquence, dry wit, and concise helpfulness. Keep replies spoken-word friendly, "
    "direct, and concise (usually 1-3 sentences). Avoid formatting such as markdown asterisks "
    "or bullet points since your response is streamed directly into speech."
)

class JarvisLiveDuplexService:
    """
    Upgraded Gemini 3.8 Live API real-time bidirectional streaming engine.
    Eliminates separate Whisper STT and Edge-TTS pipelines by handling
    duplex PCM audio input and output directly on the model endpoint with native VAD.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GOOGLE_API_KEY
        self.client = genai.Client(
            api_key=self.api_key,
            http_options={"api_version": "v1alpha"}
        )
        self.session = None

    async def initialize_session(self):
        """Connects to Gemini 3.8 Live API WebSocket session."""
        config = types.LiveConnectConfig(
            response_modalities=[types.LiveServerContentModality.AUDIO],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name=settings.VOICE_NAME
                    )
                )
            ),
            system_instruction=types.Content(
                parts=[types.Part.from_text(text=JARVIS_SYSTEM_INSTRUCTION)]
            )
        )
        logger.info(f"Connecting to Gemini Live session: {settings.GEMINI_LIVE_MODEL}")
        self.session = await self.client.aio.live.connect(
            model=settings.GEMINI_LIVE_MODEL,
            config=config
        )
        return self.session

    async def stream_audio_input(self, pcm_chunk: bytes):
        """
        Pushes raw 16kHz mono PCM chunks from user microphone directly to Gemini Live.
        Native server-side VAD detects speech initiation and pauses automatic generation.
        """
        if not self.session:
            raise RuntimeError("Live session not initialized")
        
        await self.session.send(
            input={
                "data": pcm_chunk,
                "mime_type": f"audio/pcm;rate={settings.AUDIO_SAMPLE_RATE}"
            },
            end_of_turn=False
        )

    async def receive_audio_output(self) -> AsyncGenerator[bytes, None]:
        """
        Asynchronously yields raw audio chunks directly from Gemini response turns
        for real-time playback in the Iron Man HUD client.
        """
        if not self.session:
            raise RuntimeError("Live session not initialized")

        async for response in self.session.receive():
            server_content = response.server_content
            if server_content and server_content.model_turn:
                for part in server_content.model_turn.parts:
                    if part.inline_data and part.inline_data.data:
                        yield part.inline_data.data

    async def close(self):
        """Cleanly closes WebSocket stream."""
        if self.session:
            await self.session.close()
            self.session = None
