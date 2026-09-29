# MUBSIR — مبصر

### IBRAHIM TAHHAN

**FULL STACK DEVELOPER | REACT.JS | NODE.JS**

> An AI-powered communication platform designed to help deaf and hard-of-hearing pilgrims communicate religious questions through Arabic Sign Language.

---

## Overview

**MUBSIR (مبصر)** is an AI-powered communication bridge between deaf and hard-of-hearing pilgrims and trusted religious guidance.

The platform allows a pilgrim to interact with the system using **Arabic Sign Language**, recognize selected signs through a computer-vision model, map recognized signs to predefined Hajj-related questions, and present the resulting interaction through a dedicated pilgrim and Mufti experience.

MUBSIR was rebuilt from an earlier **Django/Python prototype** into a modular architecture based on:

**React → Node.js → Python/FastAPI → ASL.pt**

The original Arabic Sign Language recognition model was preserved without retraining or modification.

---

## Demo

Watch the MUBSIR demo video:

[▶ Watch Demo Video on Google Drive](https://drive.google.com/file/d/1Pm2QY-JI4Dj12paBy11sb-UwjTvtgBbw/view?usp=drive_link)

---

## My Role

### IBRAHIM TAHHAN — Solo Developer

I designed and implemented the architectural rebuild of MUBSIR as a full-stack application.

My work focused on transforming the original single-application Django prototype into a separated, service-oriented web architecture while preserving the existing AI model and recognition behavior.

### Key Contributions

* Rebuilt the frontend using **React.js + Vite**.
* Built the backend API using **Node.js + Express**.
* Integrated a dedicated **Python + FastAPI AI service** for model inference.
* Integrated the existing `ASL.pt` YOLOv8n Arabic Sign Language model without retraining.
* Moved webcam capture from server-side OpenCV to the user's browser using `getUserMedia()`.
* Designed per-session recognition state in the Node.js backend.
* Implemented recognition confidence, stability, cooldown, and sequence logic.
* Ported the original pilgrim sign-to-question mappings.
* Ported the Al-Fatiha and Al-Kawthar recognition sequences.
* Unified duplicated Surah interfaces into a reusable React component.
* Added API validation, CORS configuration, rate limiting, error handling, and structured logging.
* Added automated tests for the AI service and backend.
* Validated the complete request flow through the real AI model.

---

## The Problem

Traditional server-side computer-vision prototypes can be difficult to use as real web applications.

The original MUBSIR prototype relied on server-side camera capture and process-level recognition state. This created architectural limitations:

* The camera was connected to the machine running the server.
* Recognition state could be shared between concurrent users.
* The AI model and application logic were tightly coupled.
* Similar frontend pages contained duplicated logic.
* Scaling the application would require significant architectural changes.

---

## The Solution

MUBSIR separates the system into three independently responsible layers:

```text
┌──────────────────────┐
│      React.js        │
│   Browser + Camera   │
└──────────┬───────────┘
           │ HTTP
           ▼
┌──────────────────────┐
│     Node.js API      │
│ Express + Sessions   │
└──────────┬───────────┘
           │ Internal API
           ▼
┌──────────────────────┐
│   Python AI Service  │
│ FastAPI + Ultralytics│
│       ASL.pt         │
└──────────────────────┘
```

### Responsibilities

**React.js**

* User interface
* Arabic RTL experience
* Browser camera access
* Recognition feedback
* Pilgrim and Mufti experiences
* Surah interfaces

**Node.js / Express**

* REST API
* Request validation
* Session management
* Recognition state
* Stability and cooldown logic
* Business logic
* Security middleware
* Communication with the AI service

**Python / FastAPI**

* Loads `ASL.pt`
* Receives image frames
* Runs YOLO inference
* Returns recognition results
* Remains stateless

---

## Key Architectural Improvements

### 1. Browser-Based Camera

The original prototype captured the camera using:

```text
cv2.VideoCapture(0)
```

The rebuilt application uses the browser's:

```text
navigator.mediaDevices.getUserMedia()
```

This moves camera ownership to the user rather than the server.

As a result, the application is no longer tied to a camera physically connected to the server.

---

### 2. Per-Session Recognition State

The original application stored recognition state in process-global Python variables.

The rebuilt backend maintains state independently for each browser session.

Conceptually:

```text
Session A
 ├── Pilgrim recognition state
 └── Surah progress

Session B
 ├── Pilgrim recognition state
 └── Surah progress
```

This prevents one user's recognition progress from interfering with another user's session.

---

### 3. Stateless AI Service

The Python AI service does not maintain application or user session state.

Its responsibility is intentionally simple:

```text
Image Frame
     ↓
ASL.pt
     ↓
Label + Confidence + Detections
```

Recognition state and application decisions remain in the Node.js layer.

This separation allows the AI service to be independently optimized, scaled, or replaced later.

---

### 4. `predict()` Instead of `track()`

The original prototype used:

```python
model.track(...)
```

The rebuilt AI service uses:

```python
model.predict(...)
```

The original application did not use the tracker IDs, so tracking state was unnecessary for the required recognition flow.

Using prediction keeps the AI service stateless while continuing to use the same model weights.

---

### 5. Reusable Surah Architecture

The original Al-Fatiha and Al-Kawthar pages contained duplicated template logic.

The rebuilt frontend uses a shared:

```text
SurahPage
```

component driven by the backend's Surah definition endpoint.

This reduces duplication and makes the architecture easier to extend.

---

## AI Model

### ASL.pt

| Property     | Details                       |
| ------------ | ----------------------------- |
| Model        | `ASL.pt`                      |
| Architecture | YOLOv8n                       |
| Framework    | Ultralytics                   |
| Task         | Object Detection              |
| Recognition  | Arabic Sign Language alphabet |
| Inference    | Python / FastAPI              |
| Retrained    | No                            |
| Re-exported  | No                            |
| Modified     | No                            |

The model was copied from the original Django application **byte-for-byte**.

Its SHA-256 checksum is documented in:

```text
docs/model-checksum.txt
```

The rebuild therefore changes the surrounding application architecture without changing the original recognition model.

---

## Core Features

### Pilgrim Experience

* Browser-based camera capture
* Arabic Sign Language recognition
* Confidence-based recognition
* Stable-frame detection
* Trigger cooldown
* Sign-to-question mapping
* Session-specific recognition progress

### Surah Experiences

* Al-Fatiha recognition sequence
* Al-Kawthar recognition sequence
* Multi-step letter recognition
* Recognition stability handling
* Progress tracking

### Mufti Experience

* Dedicated Mufti interface
* Question interaction
* Prototype answer visualization
* Structured API response

> The current Mufti visualization is explicitly a prototype keyword-to-concept system. It is not a complete Arabic Sign Language generation system.

---

## Testing & Validation

The project includes automated tests across the main services.

### AI Service

Tests cover:

* Model integrity
* Model loading
* Health endpoint
* Inference contract

### Backend

Tests cover:

* Recognition logic
* Session isolation
* API integration
* Validation
* Error handling
* AI service availability

### Frontend

The production build is validated using:

```bash
npm run build
```

The complete application flow was also validated through the real AI model using live API requests.

---

## Project Structure

```text
mubsir/
│
├── ai-service/
│   ├── app/
│   │   ├── inference.py
│   │   └── main.py
│   ├── models/
│   │   └── ASL.pt
│   ├── tests/
│   └── requirements.txt
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── tests/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       └── styles/
│
├── docs/
│   ├── architecture.md
│   ├── migration-notes.md
│   └── model-checksum.txt
│
└── README.md
```

---

## Limitations

MUBSIR is currently a prototype and has deliberately defined boundaries.

* The pilgrim flow currently recognizes three trigger signs mapped to three predefined Hajj questions.
* It does not provide open-domain Arabic question understanding.
* The Mufti answer visualization is a prototype concept-mapping system rather than full sign-language generation.
* Recognition state is currently stored in memory in the Node.js process.
* Browser-based automated UI testing has not been included in the current implementation.

These limitations are documented intentionally rather than hidden, making the current scope and future engineering requirements explicit.

---

## Future Improvements

Potential next-stage improvements include:

* Redis-backed session storage for horizontal scaling.
* ONNX optimization for the AI inference layer after output-parity validation.
* WebSocket or Server-Sent Events for more efficient recognition updates.
* A production-grade Arabic Sign Language generation system.
* Expanded sign vocabulary and question understanding.
* Automated browser/UI testing.
* Production deployment and observability infrastructure.

---

## Running Locally

MUBSIR consists of three services that run independently.

### Requirements

* Node.js 18+
* Python 3.11+
* Webcam-equipped browser
* Windows, macOS, or Linux

### 1. Start the AI Service

```bash
cd ai-service

python -m venv venv

# Windows
venv\Scripts\pip install -r requirements.txt
venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 2. Start the Backend

```bash
cd backend

npm install
npm start
```

The backend runs on:

```text
http://localhost:4000
```

### 3. Start the Frontend

```bash
cd frontend

npm install
npm run dev
```

The frontend normally runs on:

```text
http://localhost:5173
```

Grant camera permission when opening the Pilgrim, Al-Fatiha, or Al-Kawthar experiences.

---

## Environment Configuration

Environment templates are provided for each service:

```text
ai-service/
backend/.env.example
frontend/.env.example
```

Actual `.env` files are excluded from version control through `.gitignore`.

---

## Documentation

Additional technical documentation:

* `docs/architecture.md` — system architecture and design decisions.
* `docs/migration-notes.md` — what was preserved, changed, and intentionally excluded during the Django-to-modern-stack rebuild.
* `docs/model-checksum.txt` — SHA-256 integrity information for `ASL.pt`.

---

## Project Status

**Prototype — Full-Stack Architectural Rebuild**

MUBSIR demonstrates the integration of:

**Computer Vision + AI Inference + REST APIs + Session Management + React + Node.js + Python**

The project focuses on building a maintainable application architecture around an existing AI model while keeping the recognition layer independently deployable.

---

### IBRAHIM TAHHAN

**FULL STACK DEVELOPER | REACT.JS | NODE.JS**


