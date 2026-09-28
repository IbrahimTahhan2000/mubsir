import axios from "axios";
import { env } from "../config/env.js";

const client = axios.create({
  baseURL: env.aiServiceUrl,
  timeout: 5000,
});

/**
 * Sends a raw JPEG frame buffer to the Python AI service and returns its
 * label/confidence result. Never called directly by the browser — only
 * this Node.js backend talks to the AI service.
 */
export async function inferFrame(frameBuffer) {
  try {
    const response = await client.post("/infer", frameBuffer, {
      headers: { "Content-Type": "image/jpeg" },
      maxBodyLength: 3 * 1024 * 1024,
      maxContentLength: 3 * 1024 * 1024,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const err = new Error(
        `AI service returned ${error.response.status}: ${JSON.stringify(error.response.data)}`
      );
      err.status = error.response.status >= 500 ? 502 : 400;
      throw err;
    }
    const err = new Error("AI service is unavailable");
    err.status = 503;
    throw err;
  }
}

export async function checkAiServiceHealth() {
  try {
    const response = await client.get("/health", { timeout: 2000 });
    return { reachable: true, ...response.data };
  } catch {
    return { reachable: false };
  }
}
