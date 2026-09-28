import express from "express";
import cors from "cors";
import helmet from "helmet";

import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

import pilgrimRoutes from "./routes/pilgrim.routes.js";
import surahRoutes from "./routes/surah.routes.js";
import muftiRoutes from "./routes/mufti.routes.js";
import healthRoutes from "./routes/health.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.allowedOrigins,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "X-Session-Id"],
    })
  );

  // JSON body parsing for non-frame endpoints (mufti visualize, etc.).
  // Frame endpoints use express.raw() individually, scoped to their routes.
  app.use(express.json({ limit: "10kb" }));

  app.use((req, _res, next) => {
    logger.debug({ method: req.method, path: req.path }, "request");
    next();
  });

  app.use("/api/health", healthRoutes);
  app.use("/api/pilgrim", pilgrimRoutes);
  app.use("/api/surah", surahRoutes);
  app.use("/api/mufti", muftiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
