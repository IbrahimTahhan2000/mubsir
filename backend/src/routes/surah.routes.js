import { Router } from "express";
import express from "express";
import { requireSessionId } from "../middleware/sessionId.js";
import { frameRateLimiter } from "../middleware/rateLimit.js";
import { validateParams, surahIdParamSchema } from "../middleware/validate.js";
import {
  getSurahDefinition,
  submitSurahFrame,
  getSurahStatus,
  resetSurahHandler,
} from "../controllers/surah.controller.js";

const router = Router({ mergeParams: true });
const rawImage = express.raw({ type: "image/jpeg", limit: "2mb" });
const validSurahId = validateParams(surahIdParamSchema);

router.get("/:surahId/definition", validSurahId, getSurahDefinition);
router.post(
  "/:surahId/frames",
  validSurahId,
  requireSessionId,
  frameRateLimiter,
  rawImage,
  submitSurahFrame
);
router.get("/:surahId/status", validSurahId, requireSessionId, getSurahStatus);
router.post("/:surahId/reset", validSurahId, requireSessionId, resetSurahHandler);

export default router;
