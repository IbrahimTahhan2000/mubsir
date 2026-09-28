import { getOrCreateSession, resetPilgrim } from "../services/sessionStore.js";
import { inferFrame } from "../services/aiClient.js";
import {
  processPilgrimDetection,
  getPilgrimStatus,
} from "../services/recognitionService.js";

export async function submitPilgrimFrame(req, res, next) {
  try {
    const frameBuffer = req.body;
    if (!Buffer.isBuffer(frameBuffer) || frameBuffer.length === 0) {
      return res.status(400).json({ error: "A non-empty image/jpeg body is required." });
    }

    const session = getOrCreateSession(req.sessionId);
    const inference = await inferFrame(frameBuffer);
    processPilgrimDetection(session.pilgrim, inference.label, inference.confidence);

    res.json(getPilgrimStatus(session.pilgrim));
  } catch (err) {
    next(err);
  }
}

export function getPilgrimStatusHandler(req, res) {
  const session = getOrCreateSession(req.sessionId);
  res.json(getPilgrimStatus(session.pilgrim));
}

export function resetPilgrimHandler(req, res) {
  const state = resetPilgrim(req.sessionId);
  res.json({ message: "Pilgrim recognition reset", ...getPilgrimStatus(state) });
}
