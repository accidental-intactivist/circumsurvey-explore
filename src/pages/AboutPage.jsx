import { C, TYPE, RAINBOW_GRAD, FINDINGS_URL } from '../styles/tokens.js';
import { navigateTo } from '../lib/urlState.js';

// ═══════════════════════════════════════════════════════════════
// AboutPage — methodology + navigation back
//
// Brief, honest description of what Explore is, what it isn't,
// and how the data was collected. Respects readers by being
// concise — detailed methodology lives in the Report proper.
// ═══════════════════════════════════════════════════════════════

export function AboutPage() {
  return (
    <main style={{
      padding: "2rem 1.5rem 6rem",
      maxWidth: 780,
      margin: "0 auto",
      color: C.pageText,
    }}>
      <button
        onClick={() => navigateTo({ route: 'index', questionId: null, params: {} }, { push: true })}
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "0.8rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: C.pageMuted,
          padding: "0.4rem 0",
          marginBottom: "1rem",
        }}
        onMouseEnter={e => e.currentTarget.style.color = C.goldBright}
        onMouseLeave={e => e.currentTarget.style.color = C.pageMuted}
      >← Back to Index</button>

      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: TYPE.cardLabel,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: C.gold,
        marginBottom: "0.5rem",
      }}>About Explore</div>

      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 800,
        fontSize: TYPE.sectionTitle,
        color: C.pageTextBright,
        lineHeight: 1.15,
        letterSpacing: "-0.01em",
        margin: "0 0 1.5rem",
      }}>What you are looking at</h2>

      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "1.1rem",
        lineHeight: 1.7,
        color: C.pageText,
      }}>
        <p style={{ marginTop: 0 }}>
          <strong style={{ color: C.pageTextBright }}>Explore</strong> is the interactive
          companion to <a href={FINDINGS_URL}
            style={{ color: C.goldBright, textDecoration: "underline", textUnderlineOffset: "0.15em" }}
          >The Accidental Intactivist's Inquiry</a> — a first-of-its-kind anonymous
          survey gathering the lived experience of intact, circumcised, restoring,
          and observing adults in candid, cross-comparable detail.
        </p>

        <p>
          Where <em>The Report</em> curates a narrative, <em>Explore</em> lets you
          verify, slice, and extend it yourself. Every question in the survey appears
          in the Master Index. Every slice you create has a shareable URL — copy the
          link and the person you send it to sees exactly the view you saw.
        </p>

        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: "1.35rem",
          color: C.pageTextBright,
          marginTop: "2.5rem",
          marginBottom: "0.75rem",
        }}>How the data was gathered</h3>
        <p>
          The survey is entirely anonymous — no IP addresses, no email identifiers,
          no account creation. Respondents are self-selected: the survey is open to
          anyone willing to share. This is a convenience sample, not a random sample,
          so findings describe <em>this population of respondents</em>, not the
          general public. Sample sizes are always displayed; interpret small slices
          (n &lt; 30) with appropriate caution.
        </p>

        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: "1.35rem",
          color: C.pageTextBright,
          marginTop: "2rem",
          marginBottom: "0.75rem",
        }}>How to read the charts</h3>
        <p>
          <strong style={{ color: C.pageTextBright }}>Distribution</strong> shows how
          all matching respondents answered a single question.{" "}
          <strong style={{ color: C.pageTextBright }}>Compare Pathways</strong> puts
          each pathway's distribution side-by-side so you can see where experiences
          diverge.{" "}
          <strong style={{ color: C.pageTextBright }}>Cross-tab</strong> slices the
          responses by a second dimension (religion, generation, political upbringing)
          to surface interaction effects.
        </p>

        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: "1.35rem",
          color: C.pageTextBright,
          marginTop: "2rem",
          marginBottom: "0.75rem",
        }}>A note on what this is not</h3>
        <p>
          This is not a peer-reviewed study, a medical recommendation, or an advocacy
          instrument dressed up as research. It is an honest attempt to ask adults —
          who were the subjects of a consequential decision made about their bodies
          before they could speak — how they feel about it now, and what shaped those
          feelings. The data is offered for you to inspect directly.
        </p>

        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: "1.35rem",
          color: C.pageTextBright,
          marginTop: "2rem",
          marginBottom: "0.75rem",
        }}>Want to add your voice?</h3>
        <p>
          The survey remains open. It takes 30–90 minutes depending on how much
          you want to say.
          <br />
          <a href="https://forms.gle/FQ8o9g7j1yU3Cw7n7"
            style={{ color: C.goldBright, textDecoration: "underline", textUnderlineOffset: "0.15em" }}
          >Take the survey →</a>
        </p>

        <div style={{
          marginTop: "3rem",
          padding: "1.25rem 1.5rem",
          borderLeft: `3px solid ${C.gold}`,
          background: C.bgSoft,
          fontStyle: "italic",
          fontSize: "1rem",
          color: C.pageMuted,
        }}>
          "I am not here to tell you how to feel. I am here to share what hundreds
          of people said when finally asked — and to bring these essential stories
          into the light."
          <div style={{
            marginTop: "0.6rem",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.78rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.gold,
            fontStyle: "normal",
          }}>— From the Editor's Letter</div>
        </div>
      </div>

      {/* Decorative rainbow rule */}
      <div style={{
        marginTop: "3rem",
        height: 3,
        background: RAINBOW_GRAD,
        borderRadius: 2,
        opacity: 0.6,
      }} />
    </main>
  );
}
