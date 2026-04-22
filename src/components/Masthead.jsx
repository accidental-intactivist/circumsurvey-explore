import { C, TYPE, RAINBOW_GRAD, FINDINGS_URL } from '../styles/tokens.js';
import { navigateTo } from '../lib/urlState.js';

// ═══════════════════════════════════════════════════════════════
// Masthead — ★ EXPLORE ★ ribbon + publication title + meta
// Identical rhythm to findings, ribbon word swapped.
// ═══════════════════════════════════════════════════════════════

export function Masthead({ meta }) {
  const total = meta?.total ?? 501;
  const handleHome = (e) => {
    e.preventDefault();
    navigateTo({ route: 'index', questionId: null, params: {} }, { push: true });
  };

  return (
    <header style={{
      position: "relative",
      padding: "2.5rem 1.5rem 1.5rem",
      background: C.bg,
      borderBottom: `1px solid ${C.pageGhost}`,
    }}>
      {/* Rainbow top rule */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 4,
        background: RAINBOW_GRAD,
      }} />

      {/* ★ EXPLORE ★ ribbon */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        marginBottom: "1rem",
      }}>
        <span style={{ color: C.red, fontSize: "1rem" }}>★</span>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: TYPE.cardLabel,
          color: C.gold,
          textTransform: "uppercase",
          letterSpacing: "0.22em",
        }}>Explore</span>
        <span style={{ color: C.red, fontSize: "1rem" }}>★</span>
      </div>

      {/* Publication title */}
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(0.72rem, 1vw, 0.82rem)",
          color: C.gold,
          textTransform: "uppercase",
          letterSpacing: "0.3em",
          marginBottom: "0.4rem",
        }}>Interactive Data Explorer · Every Question · Every Pathway</div>

        <a
          href="#/"
          onClick={handleHome}
          style={{
            display: "inline-block",
          }}
        >
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 800,
            fontSize: "clamp(1.9rem, 3.8vw, 3rem)",
            color: C.pageTextBright,
            lineHeight: 1.05,
            letterSpacing: "-0.015em",
            margin: 0,
          }}>The Accidental Intactivist's Inquiry</h1>
        </a>

        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 400,
          fontStyle: "italic",
          fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)",
          color: C.pageMuted,
          marginTop: "0.35rem",
        }}>
          {total.toLocaleString()} Voices · Six Pathways · 355 Questions
        </div>
      </div>

      {/* Nav row — Explore / The Report / About */}
      <nav style={{
        display: "flex",
        justifyContent: "center",
        gap: "1.75rem",
        marginTop: "1.5rem",
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 600,
        fontSize: "clamp(0.75rem, 0.95vw, 0.85rem)",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}>
        <a href="#/"
          onClick={handleHome}
          style={{
            color: C.pageTextBright,
            borderBottom: `2px solid ${C.gold}`,
            paddingBottom: "0.25rem",
          }}
        >Explore</a>
        <a href={FINDINGS_URL}
          style={{
            color: C.pageMuted,
            paddingBottom: "0.25rem",
            borderBottom: "2px solid transparent",
          }}
        >The Report →</a>
        <a href="#/about"
          onClick={(e) => {
            e.preventDefault();
            navigateTo({ route: 'about', questionId: null, params: {} }, { push: true });
          }}
          style={{
            color: C.pageMuted,
            paddingBottom: "0.25rem",
            borderBottom: "2px solid transparent",
          }}
        >About</a>
      </nav>
    </header>
  );
}
