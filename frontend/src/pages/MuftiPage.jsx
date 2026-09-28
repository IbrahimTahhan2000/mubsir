import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GestureVisualizer } from "../components/GestureVisualizer.jsx";
import { visualizeAnswer } from "../api/mufti.js";

// Ported verbatim from the original Django template's inline JS
// (recognition/templates/recognition/mufti.html) — convenience canned
// answers for the same 3 demo questions the pilgrim path can trigger.
const ANSWER_EXAMPLES = {
  "هل يجوز جمع صلاة الظهر والعصر في عرفة؟":
    "نعم، يجوز للحاج جمع صلاتي الظهر والعصر في عرفة جمع تقديم وقت الظهر، اقتداءً بهدي النبي ﷺ.",
  "ما هو الفرق بين التحلل الأكبر والتحلل الأصغر؟":
    "التحلل الأصغر يبيح للحاج معظم محظورات الإحرام بعد رمي جمرة العقبة والحلق أو التقصير، أما التحلل الأكبر فيكون بعد استكمال الأعمال التي يكتمل بها التحلل، فتزول بقية محظورات الإحرام.",
  "ما هي أركان العمرة؟": "أركان العمرة هي الإحرام والطواف والسعي بين الصفا والمروة.",
};

const DEFAULT_QUESTION = "هل يجوز جمع صلاة الظهر والعصر في عرفة؟";

export function MuftiPage() {
  const [searchParams] = useSearchParams();
  const initialQuestion = searchParams.get("question") || DEFAULT_QUESTION;

  const [question, setQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState(ANSWER_EXAMPLES[initialQuestion] || "");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuestion(initialQuestion);
    setAnswer(ANSWER_EXAMPLES[initialQuestion] || "");
  }, [initialQuestion]);

  async function handleConvert() {
    const trimmed = answer.trim();
    if (!trimmed) {
      setError("يرجى كتابة إجابة المفتي أولاً.");
      return;
    }
    setLoading(true);
    try {
      const data = await visualizeAnswer(trimmed);
      if (!data.steps.length) {
        setError(
          "لم نجد مفاهيم بصرية مدعومة في هذه الإجابة. استخدم كلمات مثل: نعم، يجوز، الحاج، جمع، الصلاة، الظهر، العصر، عرفة."
        );
        setResult(null);
      } else {
        setError("");
        setResult(data);
      }
    } catch {
      setError("تعذّر تحويل الإجابة حالياً.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mufti-workspace container">
      <div className="page-heading">
        <span>العودة من المفتي إلى الحاج</span>
        <h1>مسار المفتي</h1>
        <p>اقرأ سؤال الحاج، اكتب الإجابة، ثم حوّلها إلى حركات مرئية.</p>
      </div>

      <div className="workspace-grid">
        <div className="answer-panel">
          <div className="field-group">
            <label htmlFor="pilgrim-question"><span>1</span> السؤال الوارد من الحاج</label>
            <textarea
              id="pilgrim-question"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <div className="field-group">
            <label htmlFor="mufti-answer"><span>2</span> إجابة المفتي</label>
            <textarea
              id="mufti-answer"
              rows={5}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="اكتب إجابة المفتي"
            />
            <small className="camera-permission-note">
              <i className="fas fa-circle-info" /> تمثيل بصري تجريبي للإجابة، وليس ترجمة احترافية للغة الإشارة.
            </small>
            {error && (
              <p className="form-error" role="alert">{error}</p>
            )}
          </div>
          <button type="button" className="btn convert-btn" onClick={handleConvert} disabled={loading}>
            <i className="fas fa-hands" /> {loading ? "جارٍ التحويل…" : "تحويل الإجابة إلى حركات"}
          </button>
        </div>

        <GestureVisualizer result={result} />
      </div>
    </section>
  );
}
