import { Router } from "express";
import { validateBody, muftiVisualizeBodySchema } from "../middleware/validate.js";
import { postMuftiVisualize } from "../controllers/mufti.controller.js";

const router = Router();

router.post("/visualize", validateBody(muftiVisualizeBodySchema), postMuftiVisualize);

export default router;
