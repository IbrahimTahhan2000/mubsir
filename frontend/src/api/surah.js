import { apiClient, withSession } from "./client.js";

export async function getSurahDefinition(surahId) {
  const { data } = await apiClient.get(`/api/surah/${surahId}/definition`);
  return data;
}

export async function submitSurahFrame(sessionId, surahId, jpegBlob) {
  const { data } = await apiClient.post(
    `/api/surah/${surahId}/frames`,
    jpegBlob,
    withSession(sessionId, { headers: { "Content-Type": "image/jpeg" } })
  );
  return data;
}

export async function getSurahStatus(sessionId, surahId) {
  const { data } = await apiClient.get(`/api/surah/${surahId}/status`, withSession(sessionId));
  return data;
}

export async function resetSurah(sessionId, surahId) {
  const { data } = await apiClient.post(
    `/api/surah/${surahId}/reset`,
    null,
    withSession(sessionId)
  );
  return data;
}
