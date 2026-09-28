"""
Loads the existing ASL.pt model exactly once at process start and exposes a
single stateless inference function.

This module intentionally holds no per-request or per-session state. The
only "global" here is the model weights themselves (a singleton, loaded
once), which is standard practice for any inference service and is not
recognition state (confidence tracking, cooldowns, sequence progress all
live in the Node.js backend instead).

IMPORTANT: this module must never modify recognition/static/... ASL.pt.
It only reads the local copy at ai-service/models/ASL.pt.
"""

import os
import numpy as np
import cv2
from ultralytics import YOLO

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "ASL.pt")

_model = None


def load_model():
    """Load ASL.pt once. Safe to call multiple times (idempotent)."""
    global _model
    if _model is None:
        _model = YOLO(MODEL_PATH)
    return _model


def is_model_loaded() -> bool:
    return _model is not None


def decode_image(raw_bytes: bytes):
    """Decode raw JPEG/PNG bytes into a BGR numpy array, or None if invalid."""
    if not raw_bytes:
        return None
    arr = np.frombuffer(raw_bytes, dtype=np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    return frame


def infer(raw_bytes: bytes) -> dict:
    """
    Run a single stateless detection pass over one frame.

    Uses the same underlying YOLOv8n detection + NMS pipeline the original
    Django app relied on. The original app called `model.track(...)`
    (detection + a ByteTrack/BoT-SORT tracker on top) but only ever consumed
    the top-1 label/confidence downstream — the tracker's IDs were never
    used. This service calls `model.predict(...)` instead: identical
    detection output, without the tracker's extra internal state, which
    keeps this service properly stateless as required.

    Returns a dict:
      {
        "label": str | None,
        "confidence": float,
        "detections": [ { "label": str, "confidence": float, "box": [x1,y1,x2,y2] }, ... ]
      }
    """
    model = load_model()
    frame = decode_image(raw_bytes)
    if frame is None:
        raise ValueError("Could not decode image frame")

    results = model.predict(frame, verbose=False)
    result = results[0]

    detections = []
    if result.boxes is not None and len(result.boxes) > 0:
        rows = result.boxes.data.tolist()
        for row in rows:
            x1, y1, x2, y2, conf, cls_id = row[:6]
            detections.append(
                {
                    "label": model.names[int(cls_id)],
                    "confidence": round(float(conf), 4),
                    "box": [round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)],
                }
            )

    top = max(detections, key=lambda d: d["confidence"]) if detections else None

    return {
        "label": top["label"] if top else None,
        "confidence": top["confidence"] if top else 0.0,
        "detections": detections,
    }
