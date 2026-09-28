# MUBSIR Architecture

## High-level flow

```
Browser (React)
   │  navigator.mediaDevices.getUserMedia()  — camera lives in the browser, never on the server
   │  samples a JPEG frame ~5x/second
   ▼
Node.js backend (Express)
   │  validates the request (session id, payload size, body shape)
   │  owns ALL per-session recognition state (stability counters, cooldowns,
   │    sequence progress) — the AI service never sees this
   │  forwards the raw frame internally
   ▼
Python AI service (FastAPI)
   │  loads ASL.pt exactly once at startup
   │  runs YOLOv8n detection (model.predict) on the frame
   │  returns { label, confidence, detections } — stateless, no memory of
   │    any previous frame or session
   ▲
   └── response flows back up through Node (which applies the confidence/
       stability/cooldown/sequence logic) to React (which renders the result)
```

The browser never talks to the AI service directly — Node.js is the only
client of the AI service, and the only party ASL.pt's weights or inference
internals are ever exposed to.

## Why this split

- **Browser owns the camera.** The original Django prototype captured video
  server-side via `cv2.VideoCapture(0)`, which only works for whoever is
  physically at the server. Moving capture to `getUserMedia()` is what makes
  this a real multi-user web app instead of a single-machine demo.
- **Node owns session state.** The original app stored recognition state
  (pilgrim trigger progress, Al-Fatiha/Al-Kawthar sequence position) in
  process-global Python variables shared by every request. That corrupts
  state the moment two people use the app at once. Node's `sessionStore`
  keys every piece of state by a per-browser session id instead.
- **Python still runs the model, unchanged.** `ASL.pt` is the same YOLOv8n
  checkpoint the Django app used, copied byte-for-byte (see
  `docs/model-checksum.txt`). It is loaded once at process startup, and the
  service that runs it holds no session/recognition state of its own — it
  is a pure `frame in -> label/confidence out` function, which is what lets
  it be scaled or replaced independently of everything else.

## Why `model.predict()` instead of `model.track()`

The original Django code called `model.track(frame, persist=True)`, which
runs the same detector plus a ByteTrack/BoT-SORT tracker on top to assign
object IDs across frames. The Django views never used those IDs — only the
top-1 label and confidence were ever read. The AI service here calls
`model.predict()` instead: identical detection output, without the
tracker's extra internal state, which is what keeps this service properly
stateless as the architecture requires. This is a plumbing simplification,
not a change to the model or its outputs.

## Session state shape (Node.js, in-memory)

```
Map<sessionId, {
  pilgrim: { lastRawLabel, lastConfidence, stableLabel, stableCount,
             lastTriggerAt, selectedSign, selectedQuestion },
  surahs: {
    "al-fatiha": { currentOrder, stableCount, sequences: [...] },
    "al-kawthar": { currentOrder, stableCount, sequences: [...] }
  }
}>
```

Held in-memory for this initial, single-instance deployment, behind a small
`sessionStore` module (`get/reset/delete`) so it can be swapped for a
Redis-backed store later without touching any controller.

## What can change later without touching ASL.pt

- Swapping the in-memory session `Map` for Redis, to scale Node horizontally.
- Exporting `ASL.pt` to ONNX (`ASL.onnx`, a separate file) and switching the
  AI service's internals to `onnxruntime` — optional, deferred, and only
  after a parity test proves identical output (see `docs/migration-notes.md`).
- Replacing the Mufti prototype's keyword-matching visualizer with a real
  sign-language generation system — the `/api/mufti/visualize` contract
  (`{ steps: [{ word, icon }], prototype: true }`) is designed to stay
  stable across that change, so the frontend needs no rewrite.
