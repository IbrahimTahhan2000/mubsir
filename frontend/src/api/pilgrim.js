import { apiClient, withSession } from "./client.js";

export async function submitPilgrimFrame(sessionId, jpegBlob) {
  const { data } = await apiClient.post(
    "/api/pilgrim/frames",
    jpegBlob,
    withSession(sessionId, { headers: { "Content-Type": "image/jpeg" } })
  );
  return data;
}

export async function getPilgrimStatus(sessionId) {
  const { data } = await apiClient.get("/api/pilgrim/status", withSession(sessionId));
  return data;
}

export async function resetPilgrim(sessionId) {
  const { data } = await apiClient.post("/api/pilgrim/reset", null, withSession(sessionId));
  return data;
}
