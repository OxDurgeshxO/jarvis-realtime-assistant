import asyncio
import os
import sys

# Test harness verifying syntax and structure of JarvisLiveDuplexService
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from live_ai_service import JarvisLiveDuplexService, JARVIS_SYSTEM_INSTRUCTION
    from config import settings
    
    service = JarvisLiveDuplexService(api_key="TEST_KEY")
    assert service.client is not None
    assert settings.GEMINI_LIVE_MODEL == "models/gemini-3.8-flash"
    assert settings.AUDIO_SAMPLE_RATE == 16000
    print("✓ Live AI Service structure and settings validated successfully.")
except Exception as e:
    print(f"Error validating Live AI Service: {e}")
    sys.exit(1)
