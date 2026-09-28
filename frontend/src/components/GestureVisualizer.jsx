import { useEffect, useRef, useState } from "react";
import { PrototypeBadge } from "./PrototypeBadge.jsx";

/**
 * Consumes only { steps: [{ word, icon }], prototype: true } from
 * POST /api/mufti/visualize. Kept deliberately decoupled from how those
 * steps are produced, so a future real sign-language generation system can
 * replace the backend logic without this component changing.
 */
export function GestureVisualizer({ result }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);
  const steps = result?.steps || [];

  useEffect(() => {
    setCurrent(0);
    setPlaying(false);
    clearInterval(timerRef.current);
  }, [result]);

  useEffect(() => {
    if (!playing) return undefined;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => {
        if (prev >= steps.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1400);
    return () => clearInterval(timerRef.current);
  }, [playing, steps.length]);

  const step = steps[current];

  return (
    <div className="movement-panel">
      <div className="movement-header">
        <div>
          <span>3</span>
          <h2>الحركات المرئية</h2>
        </div>
        <small>{steps.length ? `${current + 1} من ${steps.length}` : "جاهز للتحويل"}</small>
      </div>

      {result?.prototype && <PrototypeBadge>تمثيل بصري تجريبي — وليس ترجمة احترافية للغة الإشارة</PrototypeBadge>}

      <div className="movement-stage">
        <span className="gesture-icon" aria-hidden="true">{step?.icon || "☝️"}</span>
        <strong>{step ? `حركة ${current + 1}` : "ستظهر الحركة هنا"}</strong>
        <p>{step?.word || "اكتب الإجابة ثم اضغط زر التحويل"}</p>
      </div>

      <div className="movement-controls">
        <button type="button" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
          <i className="fas fa-arrow-right" /> <span>السابق</span>
        </button>
        <button
          type="button"
          disabled={steps.length < 2}
          onClick={() => {
            if (playing) setPlaying(false);
            else {
              if (current >= steps.length - 1) setCurrent(0);
              setPlaying(true);
            }
          }}
        >
          <i className={`fas fa-${playing ? "pause" : "play"}`} /> <span>{playing ? "إيقاف" : "تشغيل"}</span>
        </button>
        <button
          type="button"
          disabled={current >= steps.length - 1}
          onClick={() => setCurrent((c) => c + 1)}
        >
          <span>التالي</span> <i className="fas fa-arrow-left" />
        </button>
        <button type="button" disabled={!steps.length} onClick={() => { setCurrent(0); setPlaying(false); }}>
          <i className="fas fa-rotate-right" /> <span>إعادة</span>
        </button>
      </div>

      <div className="movement-dots">
        {steps.map((_, index) => (
          <button
            key={index}
            type="button"
            className={index === current ? "active" : ""}
            aria-label={`الحركة ${index + 1}`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
}
