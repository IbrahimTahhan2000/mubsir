"""
Minimal test suite for the AI service.

Covers: model file integrity, model loading, health endpoint, and the
/infer endpoint's basic contract (decode failure vs. success shape).
No original training dataset is required for any of these tests.
"""

import hashlib
import os
import sys

import numpy as np
import cv2
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app  # noqa: E402
from app.inference import MODEL_PATH  # noqa: E402

EXPECTED_SHA256 = "0ad2d4ee9fdc47e521d66a1e21b7228114adf525f4a7373d7ea58c64f7f9c6ed"


@pytest.fixture(scope="module")
def client():
    # Using TestClient as a context manager triggers the app's lifespan
    # (startup/shutdown) events, so the model is loaded before requests run.
    with TestClient(app) as test_client:
        yield test_client


def test_model_file_exists():
    assert os.path.exists(MODEL_PATH), "ASL.pt must exist in ai-service/models/"


def test_model_checksum_matches_original():
    sha256 = hashlib.sha256()
    with open(MODEL_PATH, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    assert sha256.hexdigest() == EXPECTED_SHA256, (
        "ASL.pt has been modified relative to the original Django project's model"
    )


def test_health_endpoint_reports_model_loaded(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["model_loaded"] is True


def test_infer_rejects_empty_payload(client):
    response = client.post("/infer", content=b"")
    assert response.status_code == 400


def test_infer_rejects_undecodable_payload(client):
    response = client.post("/infer", content=b"not-an-image")
    assert response.status_code == 400


def test_infer_accepts_a_real_blank_frame(client):
    # A synthetic blank frame should decode and run through the model
    # cleanly (no crash), even though it won't match any sign class.
    blank = np.zeros((480, 640, 3), dtype=np.uint8)
    ok, buffer = cv2.imencode(".jpg", blank)
    assert ok
    response = client.post(
        "/infer",
        content=buffer.tobytes(),
        headers={"Content-Type": "image/jpeg"},
    )
    assert response.status_code == 200
    body = response.json()
    assert "label" in body
    assert "confidence" in body
    assert "detections" in body
    assert isinstance(body["detections"], list)
