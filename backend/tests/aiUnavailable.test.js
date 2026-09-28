// Verifies graceful handling when the Python AI service is unreachable —
// no crash, no leaked stack trace, a clean 503.
process.env.AI_SERVICE_URL = "http://127.0.0.1:1"; // deliberately unreachable
process.env.ALLOWED_ORIGINS = "http://localhost:5173";

const { test, after } = await import("node:test");
const assert = (await import("node:assert/strict")).default;
const { createApp } = await import("../src/app.js");

const app = createApp();
const server = app.listen(0);
await new Promise((resolve) => server.once("listening", resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;

after(() => server.close());

test("pilgrim frame submission returns 503 (not a crash) when AI service is down", async () => {
  const res = await fetch(`${baseUrl}/api/pilgrim/frames`, {
    method: "POST",
    headers: {
      "Content-Type": "image/jpeg",
      "X-Session-Id": "13131313-1313-1313-1313-131313131313",
    },
    body: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
  });
  assert.equal(res.status, 503);
  const body = await res.json();
  assert.ok(body.error);
  assert.equal(body.stack, undefined);
});

test("health endpoint still responds when AI service is unreachable", async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.aiService.reachable, false);
});
