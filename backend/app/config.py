from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "J.A.R.V.I.S."
    
    # CORS Origins
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:8000"]
    
    # Google Gemini Settings - Upgraded to Gemini 3.8 Live API
    GOOGLE_API_KEY: str = ""
    GEMINI_LIVE_MODEL: str = "models/gemini-3.8-flash"
    
    # Audio Specs for Live Bidirectional Duplex Stream
    AUDIO_SAMPLE_RATE: int = 16000  # 16kHz PCM
    AUDIO_CHANNELS: int = 1         # Mono
    AUDIO_CHUNK_SIZE: int = 1024
    
    # Voice Personality (Puck: Eloquent British dry wit)
    VOICE_NAME: str = "Puck"
    EDGE_TTS_VOICE: str = "en-GB-RyanNeural"
    
    # WebSocket Settings
    WS_MAX_CONNECTIONS: int = 100
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
