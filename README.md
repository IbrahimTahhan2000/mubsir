# مبصر (MUBSIR)

A smart communication bridge between deaf/hard-of-hearing pilgrims and a
Mufti, using Arabic Sign Language recognition. This is a full architectural
rebuild of an earlier Django/Python prototype (still available, untouched,
at `../asl_project`) into **React + Node.js + a Python AI service**, while
preserving the original recognition model and behavior unchanged.

See `docs/architecture.md` for the request-flow diagram and rationale, and
`docs/migration-notes.md` for exactly what was ported from Django vs.
deliberately changed.

## Architecture at a glance

```
React (browser camera, UI)  →  Node.js (API, sessions, business logic)  →  Python/FastAPI (ASL.pt inference)
```

- **Frontend**: React + Vite, React Router, Arabic RTL, browser-based
  webcam capture via `getUserMedia()`.
- **Backend**: Node.js + Express — owns the REST API, per-session
  recognition state, validation, and security middleware. Never runs the
  AI model itself.
- **AI service**: Python + FastAPI + Ultralytics, running the existing
  `ASL.pt` (YOLOv8n, Arabic Sign Language alphabet detector), unchanged.
  Stateless — every request is an independent inference.

## Prerequisites

- Node.js 18+ (developed/tested on Node 22)
- Python 3.11+ (developed/tested on Python 3.13)
- A webcam-equipped browser (Chrome/Edge/Firefox) for the pilgrim/surah pages

## Model information

- File: `ai-service/models/ASL.pt`
- Architecture: YOLOv8n (Ultralytics), object detection
- Task: Arabic Sign Language alphabet letter recognition
- Origin: copied unmodified from the original Django project
  (`asl_project/recognition/static/recognition/models/ASL.pt`)
- Integrity: verified byte-identical via SHA-256 — see
  `docs/model-checksum.txt`
- **Not retrained, not re-exported, not replaced** by this rebuild.

## Installation & running locally

Each of the three services runs independently, in its own terminal.

### 1. AI service (Python/FastAPI)

```bash
cd ai-service
python -m venv venv
# Windows:
venv\Scripts\pip install -r requirements.txt
venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
# macOS/Linux:
venv/bin/pip install -r requirements.txt
venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Verify: `curl http://127.0.0.1:8000/health` → `{"status":"ok","model_loaded":true}`

> This environment was validated using CPU-only PyTorch (`--extra-index-url
> https://download.pytorch.org/whl/cpu` in `requirements.txt`), which is
> sufficient for real-time single-frame inference on a normal development
> machine with no GPU required.

### 2. Backend (Node.js)

```bash
cd backend
cp .env.example .env   # defaults already point at localhost:8000 / localhost:5173
npm install
npm start               # or: npm run dev (auto-restart on changes)
```

Verify: `curl http://localhost:4000/api/health` →
`{"status":"ok","activeSessions":0,"aiService":{"reachable":true,...}}`

### 3. Frontend (React)

```bash
cd frontend
cp .env.example .env   # points at http://localhost:4000 by default
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`). Grant
camera access when prompted by the browser on the Pilgrim / Al-Fatiha /
Al-Kawthar pages.

## Environment variables

**backend/.env**
| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Node server port | `4000` |
| `NODE_ENV` | `development` / `production` | `development` |
| `AI_SERVICE_URL` | Base URL of the Python AI service | `http://127.0.0.1:8000` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins (CORS) | `http://localhost:5173,http://127.0.0.1:5173` |
| `SESSION_TTL_MINUTES` | How long an inactive session's recognition state is kept | `30` |
| `LOG_LEVEL` | pino log level | `info` |

**frontend/.env**
| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the Node backend | `http://localhost:4000` |

No secrets are required for local development; `.env` files here contain
only non-sensitive local configuration. Real deployments should still keep
`.env` out of version control (already gitignored) and set values via the
hosting platform's own secret management.

## Running tests

```bash
# AI service (model checksum, health, inference contract)
cd ai-service
venv\Scripts\python -m pytest tests/ -v      # Windows
venv/bin/python -m pytest tests/ -v          # macOS/Linux

# Backend (recognition logic, session isolation, API contract, error handling)
cd backend
npm test

# Frontend (production build correctness)
cd frontend
npm run build
```

All three currently pass — see the final implementation report for the
exact counts.

## Camera permissions

The Pilgrim, Al-Fatiha, and Al-Kawthar pages request camera access via the
browser's own `navigator.mediaDevices.getUserMedia()` — the server never
accesses any camera. If permission is denied, the page shows a clear
message asking the user to enable camera access in their browser settings
and reload; no other part of the app is affected.

## Development workflow

Run all three services in parallel during development (three terminals, as
above). The frontend's Vite dev server proxies nothing automatically — it
talks to the backend directly via `VITE_API_BASE_URL`, so CORS on the
backend must include whatever origin the frontend dev server is actually
running on (already configured for the Vite default of `localhost:5173`).

## Limitations

- This is a prototype-grade rebuild of a prototype-grade original app. The
  pilgrim path recognizes exactly 3 trigger signs mapped to 3 hardcoded
  Hajj questions — it is not open-domain question understanding.
- The Mufti "answer visualization" is an explicitly labeled **prototype**:
  a keyword-to-emoji matcher, not real sign-language generation.
- Recognition state is held in-memory in the Node process; restarting the
  backend clears all active sessions (acceptable for local development and
  small deployments; see `docs/architecture.md` for the documented Redis
  upgrade path if this needs to survive restarts or scale horizontally).
- No automated browser/UI test was run in this environment (no browser
  automation tool was available in this session); the AI service, backend,
  and frontend build were all validated directly (unit tests, integration
  tests, and live `curl`-based end-to-end checks through the real model).
  Manual verification in an actual browser is straightforward via the
  steps above.

## Future improvements deliberately not implemented now

- ONNX export of `ASL.pt` for a lighter/faster inference runtime (optional,
  parity-tested, documented in `docs/migration-notes.md`).
- Redis-backed session store for horizontal backend scaling.
- WebSocket/SSE push updates in place of the current sampled-frame HTTP
  polling (functionally equivalent today, just less network-chatty).
- A real sign-language generation system behind `/api/mufti/visualize`,
  replacing the current prototype keyword matcher (the API contract is
  already designed for this swap).
