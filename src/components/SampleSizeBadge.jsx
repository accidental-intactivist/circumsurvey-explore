import { C } from '../styles/tokens.js';
import { nLabel, sampleSizeWarning } from '../lib/formatting.js';

// ═══════════════════════════════════════════════════════════════
// SampleSizeBadge — always-visible n=X pill with warning states.
//
// Principle #5 of the build spec: sample sizes always visible.
// Principle #5 corollary: warn users when a slice is too small
// to draw conclusions from.
// ═══════════════════════════════════════════════════════════════

const WARNING_STYLES = {
  critical: {
    background: "rgba(217,79,79,0.15)",
    border: `1px solid rgba(217,79,79,0.4)`,
    color: "#f09060",
  },
  warning: {
    background: "rgba(232,164,74,0.15)",
    border: `1px solid rgba(232,164,74,0.4)`,
    color: "#f0b070",
  },
  notice: {
    background: "rgba(232,200,104,0.12)",
    border: `1px solid rgba(232,200,104,0.3)`,
    color: "#d4c080",
  },
};

export function SampleSizeBadge({ n, dark = true, showWarning = true }) {
  const warning = showWarning ? sampleSizeWarning(n) : null;
  const darkStyle = {
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${C.pageGhost}`,
    color: C.pageMuted,
  };
  const lightStyle = {
    background: C.paperFill,
    border: `1px solid ${C.paperRule}`,
    color: C.paperSubtle,
  };

  const style = warning
    ? WARNING_STYLES[warning.level]
    : (dark ? darkStyle : lightStyle);

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.4rem",
      padding: "0.25rem 0.6rem",
      borderRadius: 999,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "0.75rem",
      fontWeight: 600,
      letterSpacing: "0.04em",
      ...style,
    }}>
      <span>{nLabel(n)}</span>
      {warning && (
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "0.7rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          opacity: 0.85,
        }}>· {warning.label}</span>
      )}
    </span>
  );
}
