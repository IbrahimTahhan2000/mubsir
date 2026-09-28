import { z } from "zod";

/**
 * Wraps a zod schema as Express middleware validating req.body / req.params.
 * Malformed input is rejected with 400 before it reaches any controller.
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid request body.",
        details: result.error.flatten(),
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid request parameters.",
        details: result.error.flatten(),
      });
    }
    req.params = result.data;
    next();
  };
}

export const surahIdParamSchema = z.object({
  surahId: z.enum(["al-fatiha", "al-kawthar"]),
});

export const muftiVisualizeBodySchema = z.object({
  answerText: z.string().min(1).max(2000),
});
