import { SURAHS } from "../config/surahs.js";
import { getOrCreateSession, resetSurah } from "../services/sessionStore.js";
import { inferFrame } from "../services/aiClient.js";
import {
  processSurahDetection,
  getCurrentSurahStatus,
} from "../services/recognitionService.js";

export function getSurahDefinition(req, res) {
  const { surahId } = req.params;
  const definition = SURAHS[surahId];
  res.json({
    id: definition.id,
    title: definition.title,
    sequences: definition.sequences.map((s) => ({
      order: s.order,
      phrase: s.phrase,
      sequence: s.sequence,
    })),
  });
}

export async function submitSurahFrame(req, res, next) {
  try {
    const { surahId } = req.params;
    const frameBuffer = req.body;
    if (!Buffer.isBuffer(frameBuffer) || frameBuffer.length === 0) {
      return res.status(400).json({ error: "A non-empty image/jpeg body is required." });
    }

    const session = getOrCreateSession(req.sessionId);
    const inference = await inferFrame(frameBuffer);
    processSurahDetection(session.surahs[surahId], inference.label, inference.confidence);

    res.json(getCurrentSurahStatus(session.surahs[surahId]));
  } catch (err) {
    next(err);
  }
}

export function getSurahStatus(req, res) {
  const { surahId } = req.params;
  const session = getOrCreateSession(req.sessionId);
  res.json(getCurrentSurahStatus(session.surahs[surahId]));
}

export function resetSurahHandler(req, res) {
  const { surahId } = req.params;
  const state = resetSurah(req.sessionId, surahId);
  res.json({ message: `${surahId} sequences reset`, ...getCurrentSurahStatus(state) });
}
