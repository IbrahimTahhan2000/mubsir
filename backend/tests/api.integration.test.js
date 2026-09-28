// Must run before any app/env import: points the backend at a local stub
// AI service instead of the real Python service, so these tests exercise
// the full Express stack (validation, session enforcement, error handling)
// without depending on the AI service being up.
import http from "node:http";

const stubAiServer = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", model_loaded: true }));
    return;
  }
  if (req.url === "/infer" && req.method === "POST") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ label: "aleff", confidence: 0.95, detections: [] }));
    return;
  }
  res.writeHead(404);
  res.end();
});

await new Promise((resolve) => stubAiServer.listen(0, "127.0.0.1", resolve));
const stubPort = stubAiServer.address().port;
process.env.AI_SERVICE_URL = `http://127.0.0.1:${stubPort}`;
process.env.ALLOWED_ORIGINS = "http://localhost:5173";

const { test, after } = await import("node:test");
const assert = (await import("node:assert/strict")).default;
const { createApp } = await import("../src/app.js");

const app = createApp();
const server = app.listen(0);
await new Promise((resolve) => server.once("listening", resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;

after(() => {
  server.close();
  stubAiServer.close();
});

const SESSION_A = "12121212-1212-1212-1212-121212121212";

test("GET /api/health responds ok and reports AI service reachability", async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "ok");
  assert.equal(body.aiService.reachable, true);
});

test("frame endpoints reject requests without a valid session id", async () => {
  const res = await fetch(`${baseUrl}/api/pilgrim/status`);
  assert.equal(res.status, 400);
});

test("GET /api/surah/al-fatiha/definition returns all 6 verses, no session required", async () => {
  const res = await fetch(`${baseUrl}/api/surah/al-fatiha/definition`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.sequences.length, 6);
  assert.equal(body.sequences[0].phrase, "ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَٰلَمِينَ");
});

test("GET /api/surah/al-kawthar/definition returns all 3 verses", async () => {
  const res = await fetch(`${baseUrl}/api/surah/al-kawthar/definition`);
  const body = await res.json();
  assert.equal(body.sequences.length, 3);
});

test("invalid surahId is rejected with 400", async () => {
  const res = await fetch(`${baseUrl}/api/surah/not-a-real-surah/definition`);
  assert.equal(res.status, 400);
});

test("POST /api/pilgrim/frames with a valid session reaches the (stubbed) AI service", async () => {
  const res = await fetch(`${baseUrl}/api/pilgrim/frames`, {
    method: "POST",
    headers: { "Content-Type": "image/jpeg", "X-Session-Id": SESSION_A },
    body: Buffer.from([0xff, 0xd8, 0xff, 0xd9]), // minimal fake JPEG bytes
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.lastRawLabel, "aleff");
});

test("POST /api/mufti/visualize returns ordered steps and prototype:true", async () => {
  const res = await fetch(`${baseUrl}/api/mufti/visualize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      answerText: "نعم، يجوز للحاج جمع صلاتي الظهر والعصر في عرفة.",
    }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.prototype, true);
  assert.ok(body.steps.length > 0);
  assert.equal(body.steps[0].word, "نعم");
});

test("POST /api/mufti/visualize rejects empty answerText", async () => {
  const res = await fetch(`${baseUrl}/api/mufti/visualize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answerText: "" }),
  });
  assert.equal(res.status, 400);
});

test("oversized frame payload is rejected with 413", async () => {
  const bigBuffer = Buffer.alloc(3 * 1024 * 1024, 1); // 3MB > 2MB limit
  const res = await fetch(`${baseUrl}/api/pilgrim/frames`, {
    method: "POST",
    headers: { "Content-Type": "image/jpeg", "X-Session-Id": SESSION_A },
    body: bigBuffer,
  });
  assert.equal(res.status, 413);
});

test("unknown route returns 404 with a clean JSON error, no stack trace", async () => {
  const res = await fetch(`${baseUrl}/api/does-not-exist`);
  assert.equal(res.status, 404);
  const body = await res.json();
  assert.ok(body.error);
  assert.equal(body.stack, undefined);
});
