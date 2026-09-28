import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><i className="fas fa-universal-access" /> تقنية ميسّرة لخدمة ضيوف الرحمن</span>
          <h1>حلقة وصل ذكية بين <em>الحاج</em> والمفتي</h1>
          <p>يحوّل مبصر إشارات الحاج من ذوي الإعاقة السمعية إلى محتوى مفهوم، ثم يعيد إجابة المفتي في صورة حركات مرئية.</p>
        </div>
        <div className="communication-loop" aria-label="تواصل ثنائي الاتجاه">
          <div><i className="fas fa-person" /><span>الحاج</span><small>إشارات اليد</small></div>
          <span className="loop-arrow">⇄</span>
          <div className="mubsir-node"><i className="fas fa-hands" /><span>مبصر</span><small>تواصل بصري</small></div>
          <span className="loop-arrow">⇄</span>
          <div><i className="fas fa-user-tie" /><span>المفتي</span><small>إجابة مكتوبة</small></div>
        </div>
      </section>

      <section className="paths" aria-labelledby="paths-title">
        <div className="section-heading">
          <span>مساران، تجربة واحدة</span>
          <h2 id="paths-title">اختر مسار التواصل</h2>
        </div>
        <div className="path-grid">
          <article className="path-card asker-card">
            <span className="path-number">01</span>
            <div className="path-icon"><i className="fas fa-camera" /></div>
            <p className="path-label">الحاج من ذوي الإعاقة السمعية</p>
            <h3>مسار السائل</h3>
            <p>تحويل إشارات الحاج عبر الكاميرا إلى سؤال مفهوم للمفتي.</p>
            <div className="flow-chips"><span>إشارة</span><i className="fas fa-arrow-left" /><span>كلمة</span><i className="fas fa-arrow-left" /><span>سؤال</span></div>
            <Link to="/pilgrim" className="btn"><i className="fas fa-camera" /> ابدأ مسار السائل</Link>
          </article>

          <article className="path-card mufti-card">
            <span className="path-number">02</span>
            <div className="path-icon"><i className="fas fa-hands" /></div>
            <p className="path-label">الإجابة المرئية للحاج الأصم</p>
            <h3>مسار المفتي</h3>
            <p>كتابة إجابة المفتي وتحويلها فوراً إلى سلسلة من الحركات المرئية.</p>
            <div className="flow-chips"><span>سؤال</span><i className="fas fa-arrow-left" /><span>إجابة</span><i className="fas fa-arrow-left" /><span>حركات</span></div>
            <Link to="/mufti" className="btn"><i className="fas fa-arrow-left" /> ابدأ مسار المفتي</Link>
          </article>

          <article className="path-card">
            <span className="path-number">03</span>
            <div className="path-icon"><i className="fas fa-book-quran" /></div>
            <p className="path-label">تدريب على التهجئة الإشارية</p>
            <h3>سورة الفاتحة</h3>
            <p>تهجئة آيات سورة الفاتحة حرفاً بحرف أمام الكاميرا.</p>
            <Link to="/surah/al-fatiha" className="btn"><i className="fas fa-book-quran" /> ابدأ الفاتحة</Link>
          </article>

          <article className="path-card">
            <span className="path-number">04</span>
            <div className="path-icon"><i className="fas fa-book-quran" /></div>
            <p className="path-label">تدريب على التهجئة الإشارية</p>
            <h3>سورة الكوثر</h3>
            <p>تهجئة آيات سورة الكوثر حرفاً بحرف أمام الكاميرا.</p>
            <Link to="/surah/al-kawthar" className="btn"><i className="fas fa-book-quran" /> ابدأ الكوثر</Link>
          </article>
        </div>
      </section>
    </>
  );
}
