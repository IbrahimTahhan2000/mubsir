import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { startSessionCleanup } from "./services/sessionStore.js";

const app = createApp();

startSessionCleanup();

app.listen(env.port, () => {
  logger.info(
    { port: env.port, aiServiceUrl: env.aiServiceUrl, nodeEnv: env.nodeEnv },
    `MUBSIR backend listening on port ${env.port}`
  );
});
