import { C, PATH_COLORS, PATH_LABELS, PATH_EMOJI } from '../styles/tokens.js';
import { shortSection, tierLabel, typeLabel } from '../lib/formatting.js';

// ═══════════════════════════════════════════════════════════════
// FilterChips — renders active filters as dismissable chips.
//
// Visible whenever ANY filter is set. Each chip has an × that
// removes just that filter (URL-updating via onChange handlers
// passed from parent).
// ═══════════════════════════════════════════════════════════════

function Chip({ label, color = C.pageTextBright, accent = C.gold, onRemove, small = false }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.45rem",
      padding: small ? "0.18rem 0.55rem" : "0.28rem 0.7rem",
      background: "rgba(255,255,255,0.05)",
      border: `1px solid ${accent}60`,
      borderRadius: 999,
      fontFamily: "'Barlow', sans-serif",
      fontSize: small ? "0.76rem" : "0.82rem",
      fontWeight: 500,
      color,
      lineHeight: 1,
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
        {label}
      </span>
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label="Remove filter"
          style={{
            width: 16, height: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            color: C.pageMuted,
            fontSize: "0.7rem",
            fontWeight: 700,
            lineHeight: 1,
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(217,79,79,0.3)";
            e.currentTarget.style.color = C.pageTextBright;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = C.pageMuted;
          }}
        >×</button>
      )}
    </span>
  );
}

export function FilterChips({ params, onRemove, onClearAll, compact = false }) {
  const chips = [];

  if (params.section) {
    chips.push(
      <Chip key="section"
        label={<>Section: <strong>{shortSection(params.section)}</strong></>}
        onRemove={() => onRemove('section', null)}
        small={compact}
      />
    );
  }

  if (params.pathway?.length > 0) {
    params.pathway.forEach(p => {
      chips.push(
        <Chip key={`pathway-${p}`}
          label={<><span>{PATH_EMOJI[p] || ''}</span> {PATH_LABELS[p] || p}</>}
          accent={PATH_COLORS[p] || C.gold}
          onRemove={() => onRemove('pathway', p)}
          small={compact}
        />
      );
    });
  }

  if (params.tier?.length > 0) {
    params.tier.forEach(t => {
      chips.push(
        <Chip key={`tier-${t}`}
          label={<>Tier: <strong>{tierLabel(t)}</strong></>}
          onRemove={() => onRemove('tier', t)}
          small={compact}
        />
      );
    });
  }

  if (params.type?.length > 0) {
    params.type.forEach(t => {
      chips.push(
        <Chip key={`type-${t}`}
          label={<>Type: <strong>{typeLabel(t)}</strong></>}
          onRemove={() => onRemove('type', t)}
          small={compact}
        />
      );
    });
  }

  if (params.search) {
    chips.push(
      <Chip key="search"
        label={<>Search: <em>&ldquo;{params.search}&rdquo;</em></>}
        onRemove={() => onRemove('search', null)}
        small={compact}
      />
    );
  }

  if (chips.length === 0) return null;

  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
      alignItems: "center",
    }}>
      {chips}
      {chips.length > 1 && (
        <button
          onClick={onClearAll}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: compact ? "0.72rem" : "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: C.pageMuted,
            padding: "0.25rem 0.5rem",
            transition: "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = C.orangeBright}
          onMouseLeave={e => e.currentTarget.style.color = C.pageMuted}
        >Clear all</button>
      )}
    </div>
  );
}
