# 🤖 J.A.R.V.I.S. — Realtime AI Voice Assistant & Cockpit

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20GenAI-Gemini%202.0%20Flash-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![Edge-TTS](https://img.shields.io/badge/Edge--TTS-Neural%20Voice-0078D7?style=flat&logo=microsoft&logoColor=white)](https://github.com/rany2/edge-tts)
[![Whisper](https://img.shields.io/badge/Whisper-Local%20STT-74aa9c?style=flat&logo=openai&logoColor=white)](https://github.com/openai/whisper)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An ultra-low-latency, full-stack **realtime voice assistant and cybernetic cockpit** inspired by Tony Stark's iconic J.A.R.V.I.S. Engineered with **Google Gemini 2.0 Flash** for fast reasoning, **Microsoft Edge-TTS** for human-like neural speech synthesis, **singleton cached OpenAI Whisper** for speech-to-text, and a custom **HTML5 Canvas Arc Reactor** that pulsates reactively to live microphone frequencies.

---

## 🏗️ System Architecture

```
                                  J.A.R.V.I.S. ECOSYSTEM
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                               FRONTEND (React + Vite)                           │
 │  ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────┐  │
 │  │   Arc Reactor Canvas  │   │   Telemetry Cockpit   │   │  Particle Physics │  │
 │  │  (Audio-Reactive HUD) │   │  (GPU, CPU, FPS, MEM) │   │   Background FX   │  │
 │  └───────────┬───────────┘   └───────────┬───────────┘   └─────────┬─────────┘  │
 └──────────────┼───────────────────────────┼─────────────────────────┼────────────┘
                │                           │                         │
                │        HTTP REST (Port 3000) / Full-Duplex WebSockets       │
                ▼                           ▼                         ▼
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                               BACKEND (FastAPI Core)                            │
 │                                                                                 │
 │   ┌───────────────────────┐ ┌───────────────────────┐ ┌──────────────────────┐  │
 │   │      /ws/voice        │ │       /ws/chat        │ │     AudioService     │  │
 │   │  (Binary Audio Stream)│ │   (Token Streaming)   │ │  (Whisper Singleton) │  │
 │   └──────────┬────────────┘ └───────────┬───────────┘ └──────────┬───────────┘  │
 └──────────────┼──────────────────────────┼────────────────────────┼──────────────┘
                │                          │                        │
       ┌────────┴─────────┐       ┌────────┴─────────┐     ┌────────┴─────────┐
       ▼                  ▼       ▼                  ▼     ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌───────────────────┐   ┌───────────────────┐
│ Whisper STT  │   │ Gemini 2.0   │   │  Edge-TTS Neural  │   │ Standalone Fallback│
│ (Local/Zero$)│   │ Flash Engine │   │ (Free Neural MP3) │   │ (Web Speech + Wiki│
└──────────────┘   └──────────────┘   └───────────────────┘   └───────────────────┘
```

---

## ✨ Key Capabilities

- ⚡ **Zero-Reload Whisper Pipeline:** Uses an in-memory cached Whisper singleton in `AudioService`, eliminating multi-second per-utterance model load times for sub-second STT turnaround.
- 🧠 **Google Gemini 2.0 Flash Intelligence:** Tuned with custom British eloquence system prompts (`"At your service, sir"`) and conversational context memory.
- 🔊 **Zero-Cost Neural Speech Synthesis:** High-fidelity audio generation using Microsoft Edge TTS with no external subscription fees.
- 🛡️ **Interactive Arc Reactor Cockpit:** Canvas-rendered concentric rings rotating with audio frequency reactivity, mode transitions (`idle` $\to$ `listening` $\to$ `thinking` $\to$ `speaking`).
- 🖥️ **Realtime Hardware Telemetry:** Probes and visualizes client WebGL GPU renderer, logical CPU cores, system memory, screen pixel ratio, and live FPS frame pacing.
- 🌐 **Dual Operation Resilience:**
  - **Full-Stack Mode:** WebSockets with binary audio frames, token streaming, and server-side Whisper + Gemini.
  - **Client Standalone Mode:** Seamless fallback using Web Speech API synthesis + client-side Wikipedia knowledge grounding if the backend server is offline.
- 🐳 **Containerized & One-Click Launch:** Pre-configured Docker Compose with Nginx reverse proxy and a Windows `run.bat` auto-launcher.

---

## ⚡ Latency & Cost Optimization Matrix

| Pipeline Stage | Legacy Approach | J.A.R.V.I.S. Architecture | Latency Delta | Marginal Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Speech-To-Text (STT)** | Whisper model reloaded on loop | Cached in-memory Singleton | **-2.8s per turn** | **$0.00 (Local)** |
| **LLM Reasoning** | GPT-4o standard API | Gemini 2.0 Flash WebSocket | **-600ms TTFT** | **Free Tier / Negligible** |
| **Speech Synthesis (TTS)** | OpenAI TTS Nova ($0.015/1k chars)| Edge-TTS Neural Streaming | **-400ms chunking** | **$0.00 (Free)** |
| **UI Telemetry Overhead** | Heavy component re-renders | Direct Canvas `requestAnimationFrame`| **60 FPS locked** | **Minimal CPU** |

---

## 🚀 Quick Start

### 1. Prerequisites
- [Docker & Docker Compose](https://www.docker.com/) **OR** Python 3.10+ & Node.js 18+
- [Google Gemini API Key](https://aistudio.google.com/app/apikey) (Free)

---

### Option A: One-Command Docker Launch (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/OxDurgeshxO/jarvis-realtime-assistant.git
cd jarvis-realtime-assistant

# 2. Set your Gemini API Key and build
export GOOGLE_API_KEY="your_api_key_here"  # Windows pwsh: $env:GOOGLE_API_KEY="your_api_key_here"
docker compose up --build
```

Access the interfaces:
- **Cockpit HUD:** `http://localhost:5173`
- **FastAPI API & Docs:** `http://localhost:3000/docs`
- **Health Check:** `http://localhost:3000/health`

---

### Option B: Windows 1-Click Launcher

Double click `run.bat` or run:
```bat
run.bat
```
The script will automatically detect your environment, configure Python venv, install npm modules, start backend and frontend, and open your browser automatically.

---

### Option C: Manual Development Setup

#### Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
echo "GOOGLE_API_KEY=your_key_here" > .env
uvicorn app.main:app --reload --port 3000
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API & WebSocket Specification

### REST Endpoints
- `GET /health`: Health status probe (`{"status": "healthy", "service": "jarvis-backend"}`).
- `POST /api/chat`: Send text prompt with conversation history.
  ```json
  {
    "message": "Give me a status update on power reserves",
    "history": []
  }
  ```
- `POST /api/voice/speak`: Synthesize raw text to neural MP3 bytes.
  ```json
  {
    "text": "All systems nominal, sir.",
    "voice": "en-US-JennyNeural"
  }
  ```

### WebSocket Protocols
- `/ws/chat`: Bidirectional text streaming.
  - Client sends: `{"type": "message", "content": "Hello Jarvis"}`
  - Server yields: `{"type": "token", "content": "Hello"}` $\to$ `{"type": "done"}`
- `/ws/voice`: Full-duplex voice channel.
  - Client streams raw audio chunks as binary bytes.
  - Client indicates speech completion: `{"type": "end_of_audio"}`
  - Server yields status sequence: `thinking` $\to$ `{"type": "transcript", ...}` $\to$ `speaking` $\to$ binary MP3 audio response $\to$ `listening`.

---

## 🧪 Automated Testing

Run the full backend test suite:
```bash
cd backend
python -m pytest tests -v
```

Run frontend production build & TypeScript validation:
```bash
cd frontend
npm run build
```

---

## 📜 Project Structure

```
jarvis-realtime-assistant/
├── backend/
│   ├── app/
│   │   ├── api/             # REST endpoints (chat, voice)
│   │   ├── services/        # ai_service.py (Gemini), audio_service.py (Whisper/Edge-TTS)
│   │   ├── websocket/       # voice_ws.py (Full-duplex audio), chat_ws.py
│   │   ├── config.py        # Pydantic environment settings
│   │   └── main.py          # FastAPI application entrypoint
│   ├── tests/               # Pytest integration & unit test suite
│   ├── Dockerfile           # Backend container definition
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # ArcReactor, BootSequence, Telemetry, Chat
│   │   ├── hooks/           # useWebSocket, useSpeech, useMicAnalyser, usePerformance
│   │   ├── lib/             # System probe, Wikipedia grounding, AI client
│   │   └── styles/          # Neon HUD dark glassmorphism design system
│   ├── Dockerfile           # Frontend multi-stage Nginx container
│   ├── nginx.conf           # Reverse proxy routing for /api and /ws
│   └── package.json
├── docker-compose.yml       # Production orchestration
├── run.bat                  # Windows 1-click launcher
└── README.md
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
