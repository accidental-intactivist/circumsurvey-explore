// ═══════════════════════════════════════════════════════════════
// Formatting utilities — shared across components
//
// All percentages/counts go through these so we never forget the
// sample size. This is principle #5: sample sizes always visible.
// ═══════════════════════════════════════════════════════════════

/** "n=123" — always lowercase n */
export function nLabel(n) {
  if (n === null || n === undefined) return '';
  return `n=${n.toLocaleString()}`;
}

/** "14.3%" with consistent rounding */
export function pct(numerator, denominator, places = 1) {
  if (!denominator || denominator === 0) return '—';
  return (100 * numerator / denominator).toFixed(places) + '%';
}

/** Percentage from a fraction (0-1) */
export function pctFromRatio(ratio, places = 1) {
  if (ratio === null || ratio === undefined) return '—';
  return (100 * ratio).toFixed(places) + '%';
}

/** Sample-size warning tier */
export function sampleSizeWarning(n) {
  if (n === null || n === undefined) return null;
  if (n < 10)  return { level: 'critical', label: 'very small sample' };
  if (n < 30)  return { level: 'warning',  label: 'small sample' };
  if (n < 50)  return { level: 'notice',   label: 'modest sample' };
  return null;
}

/** Truncate long prompts for index rows with ellipsis */
export function truncatePrompt(s, maxLen = 120) {
  if (!s) return '';
  if (s.length <= maxLen) return s;
  // Try to break on word boundary
  const cut = s.lastIndexOf(' ', maxLen);
  const end = cut > maxLen * 0.7 ? cut : maxLen;
  return s.slice(0, end) + '…';
}

/** Pretty section name → short variant for tight spaces */
export function shortSection(section) {
  if (!section) return '';
  const shortMap = {
    'Sexual Experience':       'Sex',
    'Culture & Attitudes':     'Culture',
    'Circumcised Pathway':     'Circumcised',
    'Intact Pathway':          'Intact',
    'Restoring Pathway':       'Restoring',
    'Observer Pathway':        'Observer',
    'Trans Pathway':           'Trans',
    'Intersex Pathway':        'Intersex',
    'Pathway Routing':         'Routing',
    'Pride & Regret':          'Pride/Regret',
  };
  return shortMap[section] || section;
}

/** Human-readable question type */
export function typeLabel(type) {
  const map = {
    'scale_1_5':     '1–5 scale',
    'single_select': 'single choice',
    'multi_select':  'multi-select',
    'open_text':     'open text',
  };
  return map[type] || type || 'unknown';
}

/** Tier label */
export function tierLabel(tier) {
  if (tier === 1) return 'Featured';
  if (tier === 2) return 'Browseable';
  if (tier === 3) return 'Indexed';
  return `Tier ${tier}`;
}
