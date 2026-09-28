import { test } from "node:test";
import assert from "node:assert/strict";

import {
  processPilgrimDetection,
  processSurahDetection,
  getPilgrimStatus,
  getCurrentSurahStatus,
} from "../src/services/recognitionService.js";
import { getOrCreateSession, clearAllSessions } from "../src/services/sessionStore.js";

test("pilgrim: below-confidence detections never trigger a question", () => {
  const pilgrim = getOrCreateSession("11111111-1111-1111-1111-111111111111").pilgrim;
  for (let i = 0; i < 10; i++) {
    processPilgrimDetection(pilgrim, "aleff", 0.5);
  }
  assert.equal(getPilgrimStatus(pilgrim).hasQuestion, false);
});

test("pilgrim: requires 4 stable frames at >=0.80 confidence before triggering", () => {
  const pilgrim = getOrCreateSession("22222222-2222-2222-2222-222222222222").pilgrim;
  processPilgrimDetection(pilgrim, "aleff", 0.9);
  processPilgrimDetection(pilgrim, "aleff", 0.9);
  processPilgrimDetection(pilgrim, "aleff", 0.9);
  assert.equal(getPilgrimStatus(pilgrim).hasQuestion, false, "should not trigger before 4th frame");
  processPilgrimDetection(pilgrim, "aleff", 0.9);
  const status = getPilgrimStatus(pilgrim);
  assert.equal(status.hasQuestion, true);
  assert.equal(status.selectedQuestion, "هل يجوز جمع صلاة الظهر والعصر في عرفة؟");
});

test("pilgrim: unknown labels never trigger and reset the stable streak", () => {
  const pilgrim = getOrCreateSession("33333333-3333-3333-3333-333333333333").pilgrim;
  processPilgrimDetection(pilgrim, "aleff", 0.9);
  processPilgrimDetection(pilgrim, "zay", 0.95); // not a trigger label
  processPilgrimDetection(pilgrim, "aleff", 0.9);
  processPilgrimDetection(pilgrim, "aleff", 0.9);
  assert.equal(
    getPilgrimStatus(pilgrim).hasQuestion,
    false,
    "streak should have reset on the non-trigger label"
  );
});

test("pilgrim: cooldown blocks an immediate second trigger", () => {
  const pilgrim = getOrCreateSession("44444444-4444-4444-4444-444444444444").pilgrim;
  for (let i = 0; i < 4; i++) processPilgrimDetection(pilgrim, "laam", 0.9);
  assert.equal(getPilgrimStatus(pilgrim).selectedQuestion.includes("التحلل"), true);

  // Immediately try to trigger "la" — cooldown (1.25s) has not elapsed.
  for (let i = 0; i < 4; i++) processPilgrimDetection(pilgrim, "la", 0.9);
  assert.equal(
    getPilgrimStatus(pilgrim).selectedQuestion.includes("التحلل"),
    true,
    "cooldown should have blocked the second trigger from overwriting the first"
  );
});

test("surah: exact ordered sequence must be matched to advance", () => {
  const session = getOrCreateSession("55555555-5555-5555-5555-555555555555");
  const state = session.surahs["al-kawthar"];
  const first = state.sequences[0];
  assert.equal(first.sequence[0], "aleff");

  // Wrong label does not advance.
  processSurahDetection(state, "waw", 0.9);
  assert.equal(getCurrentSurahStatus(state).currentIndex, 0);

  // Correct label, but needs SURAH_STABLE_FRAMES (2) consecutive hits.
  processSurahDetection(state, "aleff", 0.9);
  assert.equal(getCurrentSurahStatus(state).currentIndex, 0, "should not advance on 1st frame");
  processSurahDetection(state, "aleff", 0.9);
  assert.equal(getCurrentSurahStatus(state).currentIndex, 1, "should advance on 2nd stable frame");
});

test("surah: verse completes and advances currentOrder after the full sequence", () => {
  const session = getOrCreateSession("66666666-6666-6666-6666-666666666666");
  const state = session.surahs["al-kawthar"];
  const verse = state.sequences[0];

  for (const label of verse.sequence) {
    processSurahDetection(state, label, 0.9);
    processSurahDetection(state, label, 0.9); // 2 stable frames each
  }

  const status = getCurrentSurahStatus(state);
  assert.equal(status.completedPhrases.length, 1);
  assert.equal(status.completedPhrases[0], "إِنَّآ أَعۡطَيۡنَٰكَ ٱلۡكَوۡثَرَ");
});

test("session isolation: two sessions never share pilgrim state", () => {
  const sessionA = getOrCreateSession("77777777-7777-7777-7777-777777777777");
  const sessionB = getOrCreateSession("88888888-8888-8888-8888-888888888888");

  for (let i = 0; i < 4; i++) processPilgrimDetection(sessionA.pilgrim, "aleff", 0.9);

  assert.equal(getPilgrimStatus(sessionA.pilgrim).hasQuestion, true);
  assert.equal(
    getPilgrimStatus(sessionB.pilgrim).hasQuestion,
    false,
    "session B must be unaffected by session A's recognition"
  );
});

test("session isolation: two sessions never share surah progress", () => {
  const sessionA = getOrCreateSession("99999999-9999-9999-9999-999999999999");
  const sessionB = getOrCreateSession("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");

  const stateA = sessionA.surahs["al-fatiha"];
  processSurahDetection(stateA, "al", 0.9);
  processSurahDetection(stateA, "al", 0.9);

  const statusA = getCurrentSurahStatus(stateA);
  const statusB = getCurrentSurahStatus(sessionB.surahs["al-fatiha"]);

  assert.equal(statusA.currentIndex, 1);
  assert.equal(statusB.currentIndex, 0, "session B's Al-Fatiha progress must be untouched");
});

test("cleanup: clearAllSessions wipes state (test utility sanity check)", () => {
  getOrCreateSession("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
  clearAllSessions();
  const fresh = getOrCreateSession("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
  assert.equal(getPilgrimStatus(fresh.pilgrim).hasQuestion, false);
});
