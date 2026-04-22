// ═══════════════════════════════════════════════════════════════
// API client for the CircumSurvey Worker (D1-backed)
//
// Endpoints consumed:
//   GET /api/count                           — total + pathway counts
//   GET /api/sections                        — section list with counts
//   GET /api/questions                       — all questions
//   GET /api/questions?tier=1,2              — tier-filtered
//   GET /api/questions?section=X             — section-filtered
//   GET /api/questions?pathway=intact        — pathway-filtered
//   GET /api/questions?counts=1              — join response counts
//   GET /api/aggregate?q=<id>&by=pathway     — distribution by slice
//   GET /api/aggregate?q=<id>&by=pathway&filter=religion.primary_tradition=christian
//   GET /api/response-distribution?q=<id>&pathway=intact
//
// Caching strategy:
//   - Per-URL in-memory cache for the lifetime of the tab (session cache)
//   - Worker already edge-caches with 60s TTL, so client cache is mostly
//     for navigation snappiness (back/forward)
//   - "Master" fetches (questions list, sections) use a longer TTL since
//     they rarely change within a session
// ═══════════════════════════════════════════════════════════════

import { API_BASE } from '../styles/tokens.js';

// In-memory cache: Map<url, { promise, fetchedAt }>
const cache = new Map();

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch with caching. Returns a Promise that resolves to parsed JSON.
 * Cache is in-memory only (no localStorage — avoids stale data bugs).
 */
function cachedFetch(url, ttlMs = DEFAULT_TTL_MS) {
  const now = Date.now();
  const entry = cache.get(url);
  if (entry && now - entry.fetchedAt < ttlMs) {
    return entry.promise;
  }
  const promise = fetch(url)
    .then(r => {
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      return r.json();
    })
    .catch(err => {
      // Don't cache failures
      cache.delete(url);
      throw err;
    });
  cache.set(url, { promise, fetchedAt: now });
  return promise;
}

/** Build a URL with querystring from a params object, skipping null/undefined/empty */
function withParams(endpoint, params = {}) {
  const u = new URL(`${API_BASE}${endpoint}`);
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined || v === '') continue;
    if (Array.isArray(v)) {
      if (v.length === 0) continue;
      u.searchParams.set(k, v.join(','));
    } else {
      u.searchParams.set(k, String(v));
    }
  }
  return u.toString();
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

export function fetchCount() {
  return cachedFetch(withParams('/count'), 60 * 1000); // 60s — live-ish
}

export function fetchSections(params = {}) {
  return cachedFetch(withParams('/sections', params));
}

export function fetchQuestions(params = {}) {
  return cachedFetch(withParams('/questions', params));
}

export function fetchAggregate({ q, by = 'pathway', filter = null }) {
  if (!q) throw new Error('fetchAggregate: q is required');
  return cachedFetch(withParams('/aggregate', { q, by, filter }));
}

export function fetchResponseDistribution({ q, pathway = null }) {
  if (!q) throw new Error('fetchResponseDistribution: q is required');
  return cachedFetch(withParams('/response-distribution', { q, pathway }));
}

export function fetchGeo({ level = 'country', by = null, when = 'born' }) {
  return cachedFetch(withParams('/geo', { level, by, when }));
}

/** Clear the cache (for debugging / refresh-on-demand) */
export function clearCache() {
  cache.clear();
}

/** Exposed for debug: cache entries count */
export function cacheStats() {
  return { size: cache.size, keys: [...cache.keys()] };
}
