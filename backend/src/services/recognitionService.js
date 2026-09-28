import {
  SUPPORTED_RECOGNITION_TO_QUESTION,
  PILGRIM_MIN_CONFIDENCE,
  PILGRIM_STABLE_FRAMES,
  PILGRIM_TRIGGER_COOLDOWN_MS,
} from "../config/pilgrimQuestions.js";
import { SURAH_MIN_CONFIDENCE, SURAH_STABLE_FRAMES } from "../config/surahs.js";

/**
 * Direct port of `_process_detection` from
 * asl_project/recognition/views_pilgrim.py, operating on a per-session
 * pilgrim state object instead of a process-global dict.
 *
 * Preserved unchanged: MIN_CONFIDENCE (0.80), STABLE_FRAMES (4),
 * TRIGGER_COOLDOWN (1.25s), and the label -> question trigger mapping.
 */
export function processPilgrimDetection(pilgrimState, label, confidence) {
  const now = Date.now();

  pilgrimState.lastRawLabel = label || "";
  pilgrimState.lastConfidence = Math.round((confidence || 0) * 100) / 100;
  pilgrimState.lastSign = SUPPORTED_RECOGNITION_TO_QUESTION[label]?.sign || "";

  const isTriggerCandidate =
    label && confidence >= PILGRIM_MIN_CONFIDENCE && SUPPORTED_RECOGNITION_TO_QUESTION[label];

  if (!isTriggerCandidate) {
    pilgrimState.stableCount = 0;
    return pilgrimState;
  }

  if (label === pilgrimState.stableLabel) {
    pilgrimState.stableCount += 1;
  } else {
    pilgrimState.stableLabel = label;
    pilgrimState.stableCount = 1;
  }

  const isStable = pilgrimState.stableCount >= PILGRIM_STABLE_FRAMES;
  const isCooledDown = now - pilgrimState.lastTriggerAt >= PILGRIM_TRIGGER_COOLDOWN_MS;

  if (!isStable || !isCooledDown) {
    return pilgrimState;
  }

  const match = SUPPORTED_RECOGNITION_TO_QUESTION[label];
  pilgrimState.selectedSign = match.sign;
  pilgrimState.selectedQuestion = match.question;
  pilgrimState.lastTriggerAt = now;
  pilgrimState.stableCount = 0;

  return pilgrimState;
}

/**
 * Port of the ordered label-matching logic from
 * asl_project/recognition/views_al_fatiha.py / views_al_kawthar.py.
 *
 * The original had no debouncing at all (a single frame above 0.80
 * confidence instantly advanced the index). Per the migration plan's
 * explicit, documented allowance, a small stability requirement
 * (SURAH_STABLE_FRAMES) is added here to reduce false-trigger flicker,
 * without changing the sequences, the completion criteria, or the model.
 */
export function processSurahDetection(surahState, label, confidence) {
  surahState.lastLabel = label || "";
  surahState.lastConfidence = Math.round((confidence || 0) * 100) / 100;

  const current = surahState.sequences.find(
    (seq) => seq.order === surahState.currentOrder
  );
  if (!current || current.completed) {
    return surahState;
  }

  const expectedLabel = current.sequence[current.index];
  const matchesExpected = label === expectedLabel && confidence > SURAH_MIN_CONFIDENCE;

  if (!matchesExpected) {
    // Any non-matching or low-confidence frame resets the debounce streak.
    surahState.stableCount = 0;
    return surahState;
  }

  surahState.stableCount += 1;
  if (surahState.stableCount < SURAH_STABLE_FRAMES) {
    return surahState;
  }

  // Consumed this stable detection; require a fresh streak for the next letter.
  surahState.stableCount = 0;

  current.index += 1;
  if (current.index >= current.sequence.length) {
    current.completed = true;
    surahState.currentOrder += 1;
  }

  return surahState;
}

export function getCompletedPhrases(surahState) {
  return surahState.sequences.filter((s) => s.completed).map((s) => s.phrase);
}

export function getCurrentSurahStatus(surahState) {
  const current = surahState.sequences.find(
    (seq) => seq.order === surahState.currentOrder
  );
  if (!current) {
    return {
      phrase: "",
      sequence: [],
      currentIndex: 0,
      completed: true,
      completedPhrases: getCompletedPhrases(surahState),
      lastLabel: surahState.lastLabel,
      lastConfidence: surahState.lastConfidence,
    };
  }
  return {
    phrase: current.phrase,
    sequence: current.sequence,
    currentIndex: current.index,
    completed: current.completed,
    completedPhrases: getCompletedPhrases(surahState),
    lastLabel: surahState.lastLabel,
    lastConfidence: surahState.lastConfidence,
  };
}

export function getPilgrimStatus(pilgrimState) {
  return {
    hasQuestion: Boolean(pilgrimState.selectedQuestion),
    selectedSign: pilgrimState.selectedSign,
    selectedQuestion: pilgrimState.selectedQuestion,
    lastRawLabel: pilgrimState.lastRawLabel,
    lastConfidence: pilgrimState.lastConfidence,
  };
}
