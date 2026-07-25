# 🤖 J.A.R.V.I.S. — Realtime AI Assistant

[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)](https://openai.com/)

A production-ready, full-stack **realtime AI assistant** with text chat and voice interfaces. Streams GPT-4o responses token-by-token via WebSocket, supports two-way voice conversation using OpenAI Whisper (STT) and TTS, and ships as a one-command Docker Compose deployment.

---

## 🏗️ Architecture

```
┌─────────────┐     HTTP/WS     ┌─────────────┐     API      ┌────────┐
│  Frontend   │ ──────────────> │   Backend   │ ───────────> │ OpenAI │
│ (React/Vite)│ <────────────── │ (FastAPI)   │ <────────── │        │
└─────────────┘                 └─────────────┘              └────────┘
```

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + TypeScript + Tailwind CSS (port 5173) |
| Backend | Python FastAPI + WebSocket (port 3000) |
| AI Models | GPT-4o (chat), TTS Nova (voice), Whisper (STT) |
| Deployment | Docker Compose (one command) |

---

## ✨ Features

- 💬 **Real-time streaming chat** — Token-by-token responses via WebSocket
- 🎤 **Voice input** — Speech-to-text powered by OpenAI Whisper
- 🔊 **Voice output** — Natural TTS with 6 voice options (Alloy, Echo, Fable, Nova, Onyx, Shimmer)
- ⚡ **Full-duplex voice** — Two-way voice conversation over WebSocket
- 🌙 **Dark theme UI** — Sleek, JARVIS-inspired dark interface
- 🐳 **Docker-first** — One-command deployment with Docker Compose
- 🧩 **Modular backend** — Clean separation of REST endpoints, WebSocket handlers, and AI services

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- OpenAI API key

### One-Command Launch

```bash
export OPENAI_API_KEY="sk-..."
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Health Check | http://localhost:3000/health |

---

## 💻 Development (without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
echo "OPENAI_API_KEY=sk-..." > .env
uvicorn app.main:app --reload --port 3000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🔌 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/chat` | POST | Send message, stream response |
| `/api/voice/speak` | POST | Text-to-speech (returns audio blob) |
| `/ws/chat` | WebSocket | Streaming chat (token-by-token) |
| `/ws/voice` | WebSocket | Full-duplex voice conversation |

---

## 📁 Project Structure

```
jarvis/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── api/              # REST endpoints
│   │   ├── websocket/        # WebSocket handlers
│   │   ├── services/         # AI integration (GPT-4o, Whisper, TTS)
│   │   └── models/           # Pydantic schemas
│   └── tests/                # pytest test suite
├── frontend/                 # React + Vite frontend
│   └── src/
│       ├── components/       # UI components
│       ├── hooks/            # React hooks (WebSocket, audio)
│       ├── services/         # API client layer
│       ├── types/            # TypeScript types
│       └── styles/           # CSS
└── docker-compose.yml        # Full-stack orchestration
```

---

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Detailed system design and data flow
- [TEST_PLAN.md](./TEST_PLAN.md) — Test strategy and coverage plan

---

## 👤 Author

**Durgesh Dutt Sinha** — [@OxDurgeshxO](https://github.com/OxDurgeshxO)

> ⚠️ **Note:** Requires a valid OpenAI API key. Usage incurs costs per OpenAI pricing.

---

## 📄 License

MIT © [Durgesh Dutt Sinha](https://github.com/OxDurgeshxO)
