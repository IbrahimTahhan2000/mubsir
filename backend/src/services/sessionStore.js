import { env } from "../config/env.js";
import { SURAHS } from "../config/surahs.js";

/**
 * Per-session recognition state.
 *
 * This is the direct fix for the original Django app's most serious defect:
 * pilgrim/surah recognition state was held in process-global variables
 * (module-level dicts), shared and corrupted across every concurrent user.
 * Here, every session gets its own isolated state, keyed by a session id
 * the browser generates and sends on every request.
 *
 * Stored in-memory for this initial, single-instance deployment. Deliberately
 * kept behind this small module (get/touch/reset/delete) so it can be
 * swapped for a Redis-backed store later without changing any controller
 * or service that calls it.
 */

const sessions = new Map();

function freshPilgrimState() {
  return {
    lastRawLabel: "",
    lastConfidence: 0,
    stableLabel: "",
    stableCount: 0,
    lastTriggerAt: 0,
    selectedSign: "",
    selectedQuestion: "",
  };
}

function freshSurahState(surahId) {
  const definition = SURAHS[surahId];
  return {
    currentOrder: 0,
    stableCount: 0,
    lastLabel: "",
    lastConfidence: 0,
    sequences: definition.sequences.map((seq) => ({
      order: seq.order,
      phrase: seq.phrase,
      sequence: seq.sequence,
      index: 0,
      completed: false,
    })),
  };
}

function freshSession(sessionId) {
  return {
    sessionId,
    createdAt: Date.now(),
    lastActivityAt: Date.now(),
    pilgrim: freshPilgrimState(),
    surahs: {
      "al-fatiha": freshSurahState("al-fatiha"),
      "al-kawthar": freshSurahState("al-kawthar"),
    },
  };
}

export function getOrCreateSession(sessionId) {
  let session = sessions.get(sessionId);
  if (!session) {
    session = freshSession(sessionId);
    sessions.set(sessionId, session);
  }
  session.lastActivityAt = Date.now();
  return session;
}

export function resetPilgrim(sessionId) {
  const session = getOrCreateSession(sessionId);
  session.pilgrim = freshPilgrimState();
  return session.pilgrim;
}

export function resetSurah(sessionId, surahId) {
  const session = getOrCreateSession(sessionId);
  session.surahs[surahId] = freshSurahState(surahId);
  return session.surahs[surahId];
}

export function sessionCount() {
  return sessions.size;
}

export function deleteSession(sessionId) {
  sessions.delete(sessionId);
}

export function clearAllSessions() {
  // Test-only utility.
  sessions.clear();
}

function evictExpiredSessions() {
  const ttlMs = env.sessionTtlMinutes * 60 * 1000;
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivityAt > ttlMs) {
      sessions.delete(sessionId);
    }
  }
}

let cleanupTimer = null;

export function startSessionCleanup(intervalMs = 5 * 60 * 1000) {
  if (cleanupTimer) return cleanupTimer;
  cleanupTimer = setInterval(evictExpiredSessions, intervalMs);
  cleanupTimer.unref?.();
  return cleanupTimer;
}

export function stopSessionCleanup() {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}
