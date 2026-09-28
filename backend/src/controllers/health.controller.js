import { checkAiServiceHealth } from "../services/aiClient.js";
import { sessionCount } from "../services/sessionStore.js";

export async function getHealth(req, res) {
  const aiService = await checkAiServiceHealth();
  res.json({
    status: "ok",
    activeSessions: sessionCount(),
    aiService,
  });
}
