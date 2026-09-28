import pino from "pino";
import { env } from "../config/env.js";

// Plain structured JSON logging in all environments — avoids pulling in an
// extra pretty-printer dependency that isn't required for correctness.
export const logger = pino({ level: env.logLevel });
