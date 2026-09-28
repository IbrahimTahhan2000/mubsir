import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { CameraFeed } from "../components/CameraFeed.jsx";
import { SequenceProgress } from "../components/SequenceProgress.jsx";
import { useSessionId } from "../context/SessionContext.jsx";
import {
  getSurahDefinition,
  submitSurahFrame,
  getSurahStatus,
  resetSurah,
} from "../api/surah.js";

const SURAH_TITLES = {
  "al-fatiha": "سورة الفاتحة",
  "al-kawthar": "سورة الكوثر",
};

export function SurahPage() {
  const { surahId } = useParams();
  const sessionId = useSessionId();
  const [definition, setDefinition] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const inFlightRef = useRef(false);

  useEffect(() => {
    setDefinition(null);
    setStatus(null);
    getSurahDefinition(surahId).then(setDefinition).catch(() => {});
    getSurahStatus(sessionId, surahId).then(setStatus).catch(() => {});
  }, [surahId, sessionId]);

  const handleFrame = useCallback(
    async (blob) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        const result = await submitSurahFrame(sessionId, surahId, blob);
        setStatus(result);
        setError("");
      } catch {
        setError("تعذّر إرسال الإطار إلى خدمة التعرّف.");
      } finally {
        inFlightRef.current = false;
      }
    },
    [sessionId, surahId]
  );

  const handleReset = useCallback(async () => {
    const result = await resetSurah(sessionId, surahId);
    setStatus(result);
  }, [sessionId, surahId]);

  return (
    <section className="container">
      <div className="page-heading">
        <span>مسار السائل</span>
        <h1>{SURAH_TITLES[surahId] || definition?.title}</h1>
        <p>وجّه إشارات اليد نحو الكاميرا ليحوّلها مبصر إلى محتوى عربي واضح.</p>
      </div>

      <CameraFeed onFrame={handleFrame} />
      {error && <p className="camera-permission-note error">{error}</p>}

      <SequenceProgress status={status} />

      <div className="question-actions">
        <button type="button" className="btn btn-secondary" onClick={handleReset}>
          <i className="fas fa-rotate-right" /> إعادة
        </button>
      </div>
    </section>
  );
}
