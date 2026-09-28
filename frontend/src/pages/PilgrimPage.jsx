import { useCallback, useEffect, useRef, useState } from "react";
import { CameraFeed } from "../components/CameraFeed.jsx";
import { RecognitionStatusPanel } from "../components/RecognitionStatusPanel.jsx";
import { PrototypeBadge } from "../components/PrototypeBadge.jsx";
import { useSessionId } from "../context/SessionContext.jsx";
import { submitPilgrimFrame, resetPilgrim, getPilgrimStatus } from "../api/pilgrim.js";

export function PilgrimPage() {
  const sessionId = useSessionId();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const inFlightRef = useRef(false);

  const handleFrame = useCallback(
    async (blob) => {
      if (inFlightRef.current) return; // drop frames while a request is pending
      inFlightRef.current = true;
      try {
        const result = await submitPilgrimFrame(sessionId, blob);
        setStatus(result);
        setError("");
      } catch (err) {
        setError(
          err?.response?.status === 503
            ? "خدمة التعرّف غير متاحة حالياً."
            : "تعذّر إرسال الإطار إلى خدمة التعرّف."
        );
      } finally {
        inFlightRef.current = false;
      }
    },
    [sessionId]
  );

  const handleReset = useCallback(async () => {
    const result = await resetPilgrim(sessionId);
    setStatus(result);
  }, [sessionId]);

  useEffect(() => {
    // Fetch current status once on mount, in case this session already has
    // a recognized question from before navigating here.
    getPilgrimStatus(sessionId).then(setStatus).catch(() => {});
  }, [sessionId]);

  return (
    <section className="pilgrim-workspace container">
      <div className="page-heading">
        <span>الحاج من ذوي الإعاقة السمعية</span>
        <h1>مسار السائل</h1>
        <p>تحويل إشارات الحاج عبر الكاميرا إلى سؤال مفهوم للمفتي.</p>
      </div>
      <PrototypeBadge>عرض موجّه — يتعرّف حالياً على إشارات: أ، ل، لا</PrototypeBadge>

      <div className="recognition-layout">
        <section className="camera-card">
          <div className="panel-title">
            <span><i className="fas fa-camera" /> الكاميرا المباشرة</span>
          </div>
          <CameraFeed onFrame={handleFrame} />
          {error && <p className="camera-permission-note error">{error}</p>}
        </section>

        <RecognitionStatusPanel status={status} onReset={handleReset} />
      </div>
    </section>
  );
}
