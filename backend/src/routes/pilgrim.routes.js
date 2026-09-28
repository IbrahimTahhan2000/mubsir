import { Router } from "express";
import express from "express";
import { requireSessionId } from "../middleware/sessionId.js";
import { frameRateLimiter } from "../middleware/rateLimit.js";
import {
  submitPilgrimFrame,
  getPilgrimStatusHandler,
  resetPilgrimHandler,
} from "../controllers/pilgrim.controller.js";

const router = Router();
const rawImage = express.raw({ type: "image/jpeg", limit: "2mb" });

router.post("/frames", requireSessionId, frameRateLimiter, rawImage, submitPilgrimFrame);
router.get("/status", requireSessionId, getPilgrimStatusHandler);
router.post("/reset", requireSessionId, resetPilgrimHandler);

export default router;
