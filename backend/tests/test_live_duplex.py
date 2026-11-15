import os
import sys
import pytest

# Ensure app and services directories are in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
app_dir = os.path.join(backend_dir, "app")
services_dir = os.path.join(app_dir, "services")

for p in [backend_dir, app_dir, services_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

def test_live_duplex_structure():
    from live_ai_service import JarvisLiveDuplexService, JARVIS_SYSTEM_INSTRUCTION
    from config import settings
    
    service = JarvisLiveDuplexService(api_key="TEST_KEY")
    assert service.client is not None
    assert settings.GEMINI_LIVE_MODEL == "models/gemini-3.8-flash"
    assert settings.AUDIO_SAMPLE_RATE == 16000
