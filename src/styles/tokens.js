// ═══════════════════════════════════════════════════════════════
// Design tokens — identical to findings.circumsurvey.online
// Extracted from src/App.jsx TYPE / C / PATH_COLORS / RAINBOW_GRAD
// When findings updates these, copy the new values here verbatim.
// ═══════════════════════════════════════════════════════════════

export const TYPE = {
  mastheadHero:  "clamp(3rem, 8vw, 6rem)",
  heroDisplay:   "clamp(2.6rem, 6.5vw, 4.8rem)",
  sectionTitle:  "clamp(1.7rem, 3.2vw, 2.4rem)",
  cardQuestion:  "clamp(1.2rem, 2vw, 1.55rem)",
  cardLabel:     "clamp(0.72rem, 1vw, 0.85rem)",
  body:          "clamp(0.95rem, 1.1vw, 1.05rem)",
  bodySmall:     "clamp(0.82rem, 1vw, 0.9rem)",
  dataValue:     "clamp(1.05rem, 1.2vw, 1.2rem)",
  dataLabel:     "clamp(0.88rem, 1.05vw, 0.98rem)",
  bigStat:       "clamp(2.6rem, 4.5vw, 3.8rem)",
  pullQuote:     "clamp(1.3rem, 2.5vw, 1.9rem)",
  nav:           "clamp(0.7rem, 0.85vw, 0.8rem)",
  mono:          "clamp(0.62rem, 0.75vw, 0.72rem)",
};

// Paper-grain SVG (same as findings)
const GRAIN_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.17 0 0 0 0 0.15 0 0 0 0 0.13 0 0 0 0 0.085 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>`;

export const C = {
  bg:        "#0a0a0c",
  bgSoft:    "#131316",
  bgDeep:    "#050506",
  pageText:  "#eee",
  pageTextBright: "#fff",
  pageMuted: "#999",
  pageDim:   "#666",
  pageGhost: "#2a2a30",

  paper:         "#faf6f0",
  paperWarm:     "#f4ede0",
  paperEdge:     "#f0ece4",
  paperInk:      "#2a2622",
  paperInkDeep:  "#1a1815",
  paperSubtle:   "#3a3530",
  paperDim:      "#5a5450",
  paperGhost:    "#8a8680",
  paperRule:     "#e8e2d8",
  paperRuleDash: "#d4cfc4",
  paperFill:     "#f0ece4",
  paperBarBg:    "#eae4da",
  dotLeader:     "#c4bdb0",

  gold:       "#d4a030",
  goldBright: "#e8b840",
  goldDeep:   "#a87e18",

  red:          "#d94f4f",
  redBright:    "#e85d50",
  redDeep:      "#a03030",
  orange:       "#e8a44a",
  orangeBright: "#f09860",
  yellow:       "#e8c868",
  yellowBright: "#f0c840",
  green:        "#68b878",
  greenDeep:    "#4a8a58",
  blue:         "#5b93c7",
  blueBright:   "#5888c0",
  blueDeep:     "#3a6f9a",
  lightBlue:    "#8bb8d9",
  neutral:      "#a0a0a0",
};

export const PAPER_BG = `url("${GRAIN_SVG}"), linear-gradient(180deg, ${C.paper} 0%, ${C.paperWarm} 100%)`;

// Pathway palette
export const PATH_COLORS = {
  intact:      "#5b93c7",
  circumcised: "#d94f4f",
  restoring:   "#e8c868",
  observer:    "#a0a0a0",
  trans:       "#e85d50",
  intersex:    "#b0a888",
  all:         "#d4a030",
};

export const PATH_LABELS = {
  intact:      "Intact",
  circumcised: "Circumcised",
  restoring:   "Restoring",
  observer:    "Observer",
  trans:       "Trans",
  intersex:    "Intersex",
  all:         "All Respondents",
};

export const PATH_EMOJI = {
  intact:      "🟢",
  circumcised: "🔵",
  restoring:   "🟣",
  observer:    "🟠",
  trans:       "🔴",
  intersex:    "⚪",
};

export const PATH_ORDER = ["intact", "circumcised", "restoring", "observer", "trans", "intersex"];

export const RAINBOW_GRAD = "linear-gradient(90deg, #d94f4f, #e8a44a, #e8c868, #68b878, #5b93c7)";

export const pathColor = (p) => PATH_COLORS[p] || C.neutral;

// Findings site cross-link base
export const FINDINGS_URL = "https://findings.circumsurvey.online";

// API base — same origin (findings) since the Worker is routed to
// findings.circumsurvey.online/api/*. Explore fetches cross-origin,
// relying on the Worker's permissive CORS headers.
export const API_BASE = "https://circumsurvey-api.c4charkey.workers.dev/api";
