# J.A.R.V.I.S. — Realtime AI Assistant Architecture

## Overview
A realtime AI assistant with both text chat and voice interfaces. Users can type messages or speak via microphone, and the AI responds with text and optionally a sweet feminine voice (OpenAI Nova TTS).

## Tech Stack
- **Backend:** Python FastAPI with WebSocket support
- **Frontend:** React + Vite + TypeScript
- **AI Provider:** OpenAI (GPT-4o for chat, TTS-1 for voice)
- **Voice Streaming:** WebSocket for low-latency bidirectional audio
- **Containerization:** Docker + Docker Compose

## Project Structure
```
jarvis/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app, CORS, lifespan
│   │   ├── config.py            # Settings/env vars
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── chat.py          # REST chat endpoint
│   │   │   └── voice.py         # Voice-related REST endpoints
│   │   ├── websocket/
│   │   │   ├── __init__.py
│   │   │   ├── chat_ws.py       # WebSocket chat with streaming
│   │   │   └── voice_ws.py      # WebSocket voice streaming (audio in/out)
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── openai_service.py # OpenAI API wrapper (chat + TTS)
│   │   │   └── audio_service.py  # Audio processing helpers
│   │   └── models/
│   │       ├── __init__.py
│   │       └── schemas.py       # Pydantic models
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_chat.py
│   │   ├── test_voice.py
│   │   └── test_websocket.py
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── VoiceButton.tsx
│   │   │   └── VoiceSettings.tsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useAudioRecorder.ts
│   │   │   └── useAudioPlayer.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── styles/
│   │       └── globals.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Data Flow

### Text Chat
1. User types message → Frontend sends via WebSocket
2. Backend receives → Calls OpenAI GPT-4o with streaming
3. Backend streams tokens back via WebSocket
4. Frontend renders tokens progressively (typewriter effect)

### Voice Chat
1. User presses mic button → Frontend captures audio via MediaRecorder API
2. Audio chunks streamed via WebSocket (voice_ws)
3. Backend sends audio to OpenAI Whisper (STT) → text
4. Text sent to GPT-4o → response text streamed
5. Response text sent to OpenAI TTS (Nova voice) → audio stream
6. Audio streamed back via WebSocket → Frontend plays via Audio API

```
[User] → Audio → [Frontend] → WS → [Backend] → Whisper STT → GPT-4o → TTS (Nova) → WS → [Frontend] → Audio → [User]
```

## API Endpoints

### REST
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/chat` | POST | Send message, get response (non-streaming fallback) |
| `/api/voice/speak` | POST | Text → TTS audio file |

### WebSocket
| Endpoint | Description |
|----------|-------------|
| `/ws/chat` | Streaming text chat (send text → receive tokens) |
| `/ws/voice` | Streaming voice conversation (send audio → receive audio) |

## WebSocket Protocol

### Chat WS (`/ws/chat`)
```json
// Client → Server
{ "type": "message", "content": "Hello Jarvis" }

// Server → Client
{ "type": "token", "content": "Hello" }
{ "type": "token", "content": " sir" }
{ "type": "done" }
{ "type": "error", "content": "Error message" }
```

### Voice WS (`/ws/voice`)
Binary frames for audio (Opus/WebM chunks)
Text frames for metadata:
```json
{ "type": "transcript", "content": "Hello Jarvis" }
{ "type": "status", "content": "listening" }
{ "type": "status", "content": "thinking" }
{ "type": "status", "content": "speaking" }
```

## Configuration (Environment Variables)
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
OPENAI_TTS_MODEL=tts-1
OPENAI_TTS_VOICE=nova
OPENAI_STT_MODEL=whisper-1
WS_MAX_CONNECTIONS=100
```

## Development Workflow
1. Backend Engineer: Implement endpoints and services
2. Frontend Engineer: Build UI components and wire to API
3. QA Engineer: Write tests and verify end-to-end flows
4. Team: Review PRs, merge, iterate

## Deployment
- Docker Compose for local dev
- Production: Deploy as two services (backend + frontend)
- Backend needs: OpenAI API key, CORS configured for frontend domain
