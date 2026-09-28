# Migration Notes — What Moved From Django, and Why

This rebuild replaces the Django/Python prototype's architecture while
preserving its model and behavior. The original project remains at
`C:\HEDIA\project0505\project\asl_project`, untouched, as the reference
implementation.

## Preserved exactly (ported, not reinvented)

- **`ASL.pt`** — copied byte-for-byte (`docs/model-checksum.txt`), same
  YOLOv8n Arabic Sign Language alphabet detector, no retraining, no
  architecture change.
- **Pilgrim trigger mapping** (`backend/src/config/pilgrimQuestions.js`) —
  the exact `aleff` / `laam` / `la` → question mapping from
  `asl_project/recognition/views_pilgrim.py`.
- **Recognition tuning constants** — `MIN_CONFIDENCE = 0.80`,
  `STABLE_FRAMES = 4`, `TRIGGER_COOLDOWN = 1.25s` for the pilgrim path,
  unchanged from the original.
- **Al-Fatiha's six verse sequences and Al-Kawthar's three verse
  sequences** (`backend/src/config/surahs.js`) — exact letter-label order
  and exact Arabic phrase text, ported from
  `views_al_fatiha.py`/`views_al_kawthar.py`.
- **The Mufti keyword-to-emoji concept map**
  (`backend/src/config/muftiConceptMap.js`) — ported from the inline JS in
  `mufti.html`, moved server-side so it's data instead of hardcoded markup,
  and explicitly flagged as a prototype (`prototype: true` in the API
  response) — it was never a real sign-language generation system in the
  original app either.

## Deliberately changed, and why

- **Webcam capture moved from server (`cv2.VideoCapture(0)`) to the
  browser (`getUserMedia`).** The original only worked for whoever sat at
  the server. This is the single biggest functional upgrade in this
  rebuild.
- **Recognition state moved from process-global Python variables to a
  per-session store in Node.js.** The original app's state was shared by
  every concurrent request — two browser tabs would corrupt each other's
  progress. Every session now gets independent state.
- **`model.track()` replaced with `model.predict()`** in the AI service.
  Same detector, same NMS, same weights — just without the tracker's ID
  association, which the original code computed but never used. This keeps
  the AI service properly stateless. See `docs/architecture.md` for detail.
- **Al-Fatiha/Al-Kawthar gained a small stability debounce**
  (`SURAH_STABLE_FRAMES = 2` in `backend/src/config/surahs.js`). The
  original had none — a single frame above 0.80 confidence instantly
  advanced the sequence index, making it prone to flicker. This does not
  change the sequences, the completion criteria, or the model — only how
  many consistent frames are required before a letter counts.
- **The two near-duplicate Al-Fatiha/Al-Kawthar Django templates were
  unified into one parameterized `SurahPage` component** driven by
  `GET /api/surah/:surahId/definition`, instead of duplicating markup and
  JS per surah.

## Explicitly not done (and why)

- **No ONNX export in this initial rebuild.** `ASL.pt` runs directly via
  Ultralytics in the Python AI service — the lowest-risk path, since it
  reuses the exact, already-correct inference pipeline. ONNX export
  (`ASL.onnx`, a separate file, weights unchanged) remains a documented,
  optional future optimization once a parity test proves identical output.
- **No retraining, no new dataset.** Nothing in this rebuild required or
  used the original training data.
- **No lighter/alternative model.** MediaPipe, MobileNet, EfficientNet, and
  YOLO11 were all considered during the earlier audit and explicitly
  rejected for this rebuild per the project's own constraints — `ASL.pt` is
  the only recognition model in this system.
- **No database.** Neither the original app nor this rebuild has any
  functionality that requires persistent storage; recognition state is
  session-scoped and ephemeral by design.
