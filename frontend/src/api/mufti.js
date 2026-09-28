import { apiClient } from "./client.js";

export async function visualizeAnswer(answerText) {
  const { data } = await apiClient.post("/api/mufti/visualize", { answerText });
  return data;
}
