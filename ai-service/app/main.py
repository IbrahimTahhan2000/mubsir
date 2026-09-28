"""
MUBSIR AI Service — FastAPI application.

Stateless by design: this service only performs model inference. It holds
no pilgrim/surah/session recognition state. All confidence-threshold,
stable-frame, cooldown, and sequence-progress logic lives in the Node.js
backend, which is the only client permitted to call this service.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from app.inference import load_model, is_model_loaded, infer


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Load the model exactly once, at process startup — never per request.
    load_model()
    yield


app = FastAPI(title="MUBSIR AI Service", version="1.0.0", lifespan=lifespan)

# This service is only ever called internally by the Node.js backend, never
# directly by the browser, but permissive CORS here is harmless defense in
# depth in case it is ever hit directly during local development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": is_model_loaded(),
    }


@app.post("/infer")
async def infer_frame(request: Request):
    raw_bytes = await request.body()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Empty frame payload")
    if len(raw_bytes) > 3 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Frame payload too large")
    try:
        result = infer(raw_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return result
