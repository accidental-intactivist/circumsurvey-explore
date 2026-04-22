// ═══════════════════════════════════════════════════════════════
// URL state — the heart of Explore's shareable-link design
//
// Routes use hash-based routing so Cloudflare Pages doesn't need
// rewrite rules. URLs look like:
//
//   #/                                           → Index home
//   #/?section=Demographics                      → Index filtered
//   #/?pathway=intact&section=Religion           → Intact + Religion
//   #/?search=autonomy                           → Index text-searched
//   #/?sort=n_responses&order=desc               → Index sorted
//   #/q/family_politics                          → Question, all respondents
//   #/q/family_politics?pathway=intact           → Question, intact only
//   #/q/family_politics?pathway=intact,circumcised  → Multi-pathway
//   #/q/family_politics?view=compare             → Side-by-side comparison
//   #/q/family_politics?view=crosstab&cross=religion.primary_tradition
//   #/q/family_politics?filter=demo_generation=Millennial/Gen%20Y
//   #/about                                       → About / methodology
//
// The state object is:
//   {
//     route: 'index' | 'question' | 'about',
//     questionId: string | null,
//     params: { section, pathway[], tier[], type[], search, sort, order, view, cross, filter }
//   }
//
// All URL mutations go through pushState/replaceState so navigation
// works with browser back/forward and deep-links are shareable.
// ═══════════════════════════════════════════════════════════════

// ── Parsing ───────────────────────────────────────────────────

export function parseHash(hash = window.location.hash) {
  // Strip leading "#"
  let s = hash.replace(/^#/, '');
  // Ensure leading slash
  if (!s.startsWith('/')) s = '/' + s;

  const [pathPart, queryPart] = s.split('?');
  const pathSegments = pathPart.split('/').filter(Boolean);

  let route = 'index';
  let questionId = null;

  if (pathSegments.length === 0) {
    route = 'index';
  } else if (pathSegments[0] === 'q' && pathSegments[1]) {
    route = 'question';
    questionId = decodeURIComponent(pathSegments[1]);
  } else if (pathSegments[0] === 'about') {
    route = 'about';
  } else {
    // Unknown route — fall through to index
    route = 'index';
  }

  const params = parseQuery(queryPart || '');
  return { route, questionId, params };
}

function parseQuery(qs) {
  const out = {
    section: null,
    pathway: [],        // array — supports multi-select like intact,circumcised
    tier: [],
    type: [],
    search: '',
    sort: null,
    order: null,
    view: null,
    cross: null,
    filter: null,
  };
  if (!qs) return out;
  const sp = new URLSearchParams(qs);

  if (sp.has('section'))  out.section = sp.get('section');
  if (sp.has('search'))   out.search = sp.get('search');
  if (sp.has('sort'))     out.sort = sp.get('sort');
  if (sp.has('order'))    out.order = sp.get('order');
  if (sp.has('view'))     out.view = sp.get('view');
  if (sp.has('cross'))    out.cross = sp.get('cross');
  if (sp.has('filter'))   out.filter = sp.get('filter');
  if (sp.has('pathway'))  out.pathway = sp.get('pathway').split(',').filter(Boolean);
  if (sp.has('tier'))     out.tier = sp.get('tier').split(',').filter(Boolean).map(Number);
  if (sp.has('type'))     out.type = sp.get('type').split(',').filter(Boolean);

  return out;
}

// ── Building URLs ─────────────────────────────────────────────

export function buildHash({ route = 'index', questionId = null, params = {} }) {
  let path;
  if (route === 'question' && questionId) {
    path = `/q/${encodeURIComponent(questionId)}`;
  } else if (route === 'about') {
    path = '/about';
  } else {
    path = '/';
  }

  const qs = buildQuery(params);
  return '#' + path + (qs ? '?' + qs : '');
}

function buildQuery(params) {
  const sp = new URLSearchParams();
  if (params.section)          sp.set('section', params.section);
  if (params.search)           sp.set('search', params.search);
  if (params.sort)             sp.set('sort', params.sort);
  if (params.order)            sp.set('order', params.order);
  if (params.view)             sp.set('view', params.view);
  if (params.cross)            sp.set('cross', params.cross);
  if (params.filter)           sp.set('filter', params.filter);
  if (params.pathway?.length)  sp.set('pathway', params.pathway.join(','));
  if (params.tier?.length)     sp.set('tier', params.tier.join(','));
  if (params.type?.length)     sp.set('type', params.type.join(','));
  return sp.toString();
}

// ── Navigation ────────────────────────────────────────────────

/** Replace state in place — no history entry. Use for filter changes. */
export function replaceHash(state) {
  const hash = buildHash(state);
  window.history.replaceState(null, '', hash);
  // Dispatch a synthetic event so components listening can react
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

/** Push new state — adds history entry. Use for page transitions. */
export function pushHash(state) {
  const hash = buildHash(state);
  window.history.pushState(null, '', hash);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

/** Navigate via anchor-style <a href> (handled via onClick). */
export function navigateTo(state, { push = true } = {}) {
  if (push) pushHash(state);
  else      replaceHash(state);
}

// ── React hook ────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';

export function useUrlState() {
  const [state, setState] = useState(() => parseHash());

  useEffect(() => {
    const onChange = () => setState(parseHash());
    window.addEventListener('hashchange', onChange);
    window.addEventListener('popstate', onChange);
    return () => {
      window.removeEventListener('hashchange', onChange);
      window.removeEventListener('popstate', onChange);
    };
  }, []);

  // Helper: update params while keeping current route/questionId
  const updateParams = useCallback((patch, { push = false } = {}) => {
    const next = {
      ...state,
      params: { ...state.params, ...patch },
    };
    navigateTo(next, { push });
  }, [state]);

  // Helper: toggle an array-valued param (pathway, tier, type)
  const toggleInParam = useCallback((key, value, { push = false } = {}) => {
    const current = state.params[key] || [];
    const normalizedValue = (key === 'tier') ? Number(value) : value;
    const has = current.includes(normalizedValue);
    const next = has
      ? current.filter(x => x !== normalizedValue)
      : [...current, normalizedValue];
    updateParams({ [key]: next }, { push });
  }, [state, updateParams]);

  // Helper: clear all index filters
  const clearFilters = useCallback(() => {
    navigateTo({
      route: state.route,
      questionId: state.questionId,
      params: {
        section: null, pathway: [], tier: [], type: [],
        search: '', sort: null, order: null,
        // Preserve view/cross/filter on question pages
        view: state.params.view,
        cross: state.params.cross,
        filter: state.params.filter,
      },
    }, { push: false });
  }, [state]);

  return { state, setState, updateParams, toggleInParam, clearFilters };
}
