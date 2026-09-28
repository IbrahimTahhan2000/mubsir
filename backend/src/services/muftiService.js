import { MUFTI_CONCEPT_MAP } from "../config/muftiConceptMap.js";

/**
 * Server-side port of the client-side `conceptMap` keyword matcher from
 * asl_project/recognition/templates/recognition/mufti.html.
 *
 * This is explicitly a PROTOTYPE mechanism (see docs/migration-notes.md).
 * The response shape ({ steps, prototype: true }) is intentionally stable
 * so a future real sign-language generation system can replace this
 * function's internals without requiring any frontend changes.
 */
export function visualizeAnswer(answerText) {
  const normalized = (answerText || "").replace(/[،,.؟!؛]/g, " ");

  const steps = MUFTI_CONCEPT_MAP.map((concept) => {
    const positions = concept.keywords
      .map((keyword) => normalized.indexOf(keyword))
      .filter((position) => position >= 0);
    return {
      ...concept,
      position: positions.length ? Math.min(...positions) : -1,
    };
  })
    .filter((concept) => concept.position >= 0)
    .sort((a, b) => a.position - b.position)
    .map((concept) => ({ word: concept.label, icon: concept.icon }));

  return {
    steps,
    prototype: true,
  };
}
