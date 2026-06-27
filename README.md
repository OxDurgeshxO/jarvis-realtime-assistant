# J.A.R.V.I.S. — Realtime AI Assistant

A full-stack realtime AI assistant with text chat and voice interfaces, powered by OpenAI.

## Architecture

```
┌─────────────┐     HTTP/WS     ┌─────────────┐     API      ┌────────┐
│  Frontend   │ ──────────────> │   Backend   │ ───────────> │ OpenAI │
│ (React/Vite)│ <────────────── │ (FastAPI)   │ <─────────── │        │
└─────────────┘                 └─────────────┘              └────────┘
```

- **Frontend:** React + Vite + TypeScript + Tailwind CSS (port 5173)
- **Backend:** Python FastAPI with WebSocket support (port 3000)
- **AI:** OpenAI GPT-4o (chat), TTS Nova (voice), Whisper (speech-to-text)

## Quick Start

### Prerequisites
- Docker & Docker Compose
- OpenAI API key

### Run the full stack

```bash
export OPENAI_API_KEY="sk-..."
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/health

### Development (without Docker)

**Backend:**
```bash
cd jarvis-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
echo "OPENAI_API_KEY=sk-..." > .env
uvicorn app.main:app --reload --port 3000
```

**Frontend:**
```bash
cd jarvis-frontend
npm install
npm run dev
```

## Features
- 💬 Real-time streaming chat via WebSocket
- 🎤 Voice input with speech-to-text (Whisper)
- 🔊 Voice output with OpenAI TTS (Nova — sweet feminine voice)
- 🎯 Voice selector (Alloy, Echo, Fable, Nova, Onyx, Shimmer)
- 🌙 Dark theme UI
- 🐳 Docker Compose for one-command deployment

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/chat` | POST | Send message, get response |
| `/api/voice/speak` | POST | Text-to-speech (returns audio) |
| `/ws/chat` | WS | Streaming chat with token-by-token responses |
| `/ws/voice` | WS | Voice conversation (audio in/out) |

## Project Structure

```
jarvis/
├── backend/          # FastAPI Python backend
│   ├── app/
│   │   ├── api/      # REST endpoints
│   │   ├── websocket/ # WebSocket handlers
│   │   ├── services/  # Business logic & AI integration
│   │   └── models/    # Pydantic schemas
│   └── tests/        # pytest suite
├── frontend/         # React + Vite frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── hooks/       # React hooks (WS, audio)
│   │   ├── services/    # API client
│   │   ├── types/       # TypeScript types
│   │   └── styles/      # CSS
│   └── Dockerfile
└── docker-compose.yml  # Full-stack orchestration
```