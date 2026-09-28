import { Link } from "react-router-dom";

export function RecognitionStatusPanel({ status, onReset }) {
  const hasQuestion = Boolean(status?.hasQuestion);

  return (
    <section className={`recognition-result${hasQuestion ? " has-result" : ""}`} aria-live="polite">
      <div className="panel-title">
        <span><i className="fas fa-wand-magic-sparkles" /> نتيجة العرض</span>
        <small>{hasQuestion ? "اكتمل التعرّف" : "التعرّف نشط"}</small>
      </div>

      {!hasQuestion ? (
        <div className="recognition-waiting">
          <span className="waiting-pulse" aria-hidden="true"><i className="fas fa-hands" /></span>
          <strong>بانتظار التعرّف على الإشارة...</strong>
          <p>أدِّ الحركة أمام الكاميرا وسيظهر السؤال هنا بعد نجاح التعرّف.</p>
        </div>
      ) : (
        <div>
          <div className="matched-question">
            <small>السؤال</small>
            <blockquote>{status.selectedQuestion}</blockquote>
          </div>
          <div className="question-actions">
            <button type="button" className="btn btn-secondary" onClick={onReset}>
              <i className="fas fa-rotate-right" /> إعادة المحاولة
            </button>
            <Link
              className="btn btn-gold"
              to={`/mufti?question=${encodeURIComponent(status.selectedQuestion)}`}
            >
              <i className="fas fa-paper-plane" /> نقل السؤال إلى مسار المفتي
            </Link>
          </div>
        </div>
      )}

      <div className="dev-readout">
        آخر إشارة: {status?.lastRawLabel || "—"} · الثقة:{" "}
        {status?.lastConfidence != null ? `${Math.round(status.lastConfidence * 100)}%` : "—"}
      </div>
    </section>
  );
}
