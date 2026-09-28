import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./components/AppShell.jsx";
import { SessionProvider } from "./context/SessionContext.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { PilgrimPage } from "./pages/PilgrimPage.jsx";
import { MuftiPage } from "./pages/MuftiPage.jsx";
import { SurahPage } from "./pages/SurahPage.jsx";

function NotFoundPage() {
  return (
    <section className="container">
      <div className="page-heading">
        <h1>الصفحة غير موجودة</h1>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pilgrim" element={<PilgrimPage />} />
            <Route path="/mufti" element={<MuftiPage />} />
            <Route path="/surah/:surahId" element={<SurahPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </SessionProvider>
  );
}
