// ═══════════════════════════════════════════════════════════════
// Explore — The Accidental Intactivist's Inquiry
// explore.circumsurvey.online
//
// Sibling to findings.circumsurvey.online. Shares the design
// language, diverges in layout and interaction patterns.
//
// Findings is a curated Special Report you read.
// Explore is a research tool you drive.
// ═══════════════════════════════════════════════════════════════

import { useUrlState } from './lib/urlState.js';
import { Masthead } from './components/Masthead.jsx';
import { IndexPage } from './pages/IndexPage.jsx';
import { QuestionPage } from './pages/QuestionPage.jsx';
import { AboutPage } from './pages/AboutPage.jsx';
import { C, FINDINGS_URL } from './styles/tokens.js';

export default function App() {
  const { state } = useUrlState();

  return (
    <div style={{
      fontFamily: "'Barlow', sans-serif",
      background: C.bg,
      color: C.pageText,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
      <Masthead />

      <div style={{ flex: 1 }}>
        {state.route === 'question' && <QuestionPage />}
        {state.route === 'about'    && <AboutPage />}
        {state.route === 'index'    && <IndexPage />}
      </div>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer style={{
      padding: "2rem 1.5rem 2.5rem",
      borderTop: `1px solid ${C.pageGhost}`,
      background: C.bgDeep,
      textAlign: "center",
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: "0.78rem",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: C.pageDim,
    }}>
      <div style={{ marginBottom: "0.5rem" }}>
        The Accidental Intactivist's Inquiry · Phase 1 · Live Data
      </div>
      <div style={{ fontSize: "0.72rem", letterSpacing: "0.1em", color: C.pageGhost }}>
        <a href={FINDINGS_URL} style={{ color: C.pageMuted, textDecoration: "underline" }}>
          Read The Special Report →
        </a>
        <span style={{ margin: "0 0.75rem" }}>·</span>
        <a href="https://forms.gle/FQ8o9g7j1yU3Cw7n7" style={{ color: C.pageMuted, textDecoration: "underline" }}>
          Add your voice →
        </a>
      </div>
    </footer>
  );
}
