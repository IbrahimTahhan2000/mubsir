/**
 * Ported verbatim from the original Django app:
 * asl_project/recognition/views_pilgrim.py -> SUPPORTED_RECOGNITION_TO_QUESTION
 *
 * These keys are verified classes from the bundled ASL.pt model. Do not
 * invent new mappings — this table is the product's actual, validated
 * trigger-sign-to-question behavior.
 */
export const SUPPORTED_RECOGNITION_TO_QUESTION = {
  aleff: {
    sign: "أ",
    question: "هل يجوز جمع صلاة الظهر والعصر في عرفة؟",
  },
  laam: {
    sign: "ل",
    question: "ما هو الفرق بين التحلل الأكبر والتحلل الأصغر؟",
  },
  // ASL.pt contains a dedicated "la" class, so the special trigger takes
  // priority without delaying either individual-letter demonstration.
  la: {
    sign: "لا",
    question: "ما هي أركان العمرة؟",
  },
};

// Ported verbatim from views_pilgrim.py
export const PILGRIM_MIN_CONFIDENCE = 0.8;
export const PILGRIM_STABLE_FRAMES = 4;
export const PILGRIM_TRIGGER_COOLDOWN_MS = 1250; // 1.25 seconds
