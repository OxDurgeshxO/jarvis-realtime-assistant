from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "J.A.R.V.I.S."
    API_V1_STR: str = "/api/v1"
    
    # CORS Origins
    CORS_ORIGINS: List[str] = ["*"]
    
    # OpenAI Settings
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_TTS_MODEL: str = "tts-1"
    OPENAI_TTS_VOICE: str = "nova"
    OPENAI_STT_MODEL: str = "whisper-1"
    
    # WebSocket Settings
    WS_MAX_CONNECTIONS: int = 100
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
