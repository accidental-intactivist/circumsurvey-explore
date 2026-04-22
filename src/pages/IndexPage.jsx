import { useState, useEffect, useMemo } from 'react';
import { C, TYPE, PATH_COLORS, PATH_LABELS, PATH_EMOJI, PATH_ORDER } from '../styles/tokens.js';
import { navigateTo, useUrlState } from '../lib/urlState.js';
import { fetchQuestions, fetchCount } from '../lib/api.js';
import { nLabel, truncatePrompt, shortSection, typeLabel, tierLabel, sampleSizeWarning } from '../lib/formatting.js';
import { FilterChips } from '../components/FilterChips.jsx';
import { SampleSizeBadge } from '../components/SampleSizeBadge.jsx';

// ═══════════════════════════════════════════════════════════════
// IndexPage — the Master Questions Index
//
// Home page of Explore. Shows all 355 questions in a searchable,
// filterable, sortable list. Click any row → open question detail.
//
// All filter/sort state lives in the URL via useUrlState. Changes
// to filters call updateParams which rewrites the URL in place.
//
// Initial data fetch is the full questions list (with response
// counts). After that, all filtering happens client-side for
// instant feedback — no re-fetches.
// ═══════════════════════════════════════════════════════════════

export function IndexPage() {
  const { state, updateParams, toggleInParam, clearFilters } = useUrlState();
  const { params } = state;

  const [allQuestions, setAllQuestions] = useState(null);
  const [meta, setMeta] = useState(null);
  const [err, setErr] = useState(null);

  // Fetch all questions with counts — one request, used for everything
  useEffect(() => {
    fetchQuestions({ counts: 1 })
      .then(data => setAllQuestions(data.questions || []))
      .catch(e => setErr(e.message || String(e)));
  }, []);

  useEffect(() => {
    fetchCount()
      .then(setMeta)
      .catch(() => {/* non-fatal */});
  }, []);

  // Derive facet options from the data
  const facets = useMemo(() => {
    if (!allQuestions) return { sections: [], types: [], tiers: [1, 2, 3] };
    const sections = [...new Set(allQuestions.map(q => q.section).filter(Boolean))].sort();
    const types = [...new Set(allQuestions.map(q => q.type).filter(Boolean))].sort();
    return { sections, types, tiers: [1, 2, 3] };
  }, [allQuestions]);

  // Apply filters client-side
  const filtered = useMemo(() => {
    if (!allQuestions) return [];
    let out = allQuestions;

    if (params.section) {
      out = out.filter(q => q.section === params.section);
    }
    if (params.pathway?.length) {
      out = out.filter(q => params.pathway.includes(q.pathway) || q.pathway === 'all');
    }
    if (params.tier?.length) {
      out = out.filter(q => params.tier.includes(q.tier));
    }
    if (params.type?.length) {
      out = out.filter(q => params.type.includes(q.type));
    }
    if (params.search) {
      const needle = params.search.toLowerCase();
      out = out.filter(q =>
        (q.prompt || '').toLowerCase().includes(needle) ||
        (q.id || '').toLowerCase().includes(needle) ||
        (q.section || '').toLowerCase().includes(needle)
      );
    }

    // Sort
    const sortKey = params.sort || 'tier';
    const order = params.order || 'asc';
    const mul = order === 'desc' ? -1 : 1;
    out = [...out].sort((a, b) => {
      if (sortKey === 'n_responses') return ((a.n_responses || 0) - (b.n_responses || 0)) * mul;
      if (sortKey === 'prompt')      return (a.prompt || '').localeCompare(b.prompt || '') * mul;
      if (sortKey === 'section')     return (a.section || '').localeCompare(b.section || '') * mul;
      if (sortKey === 'tier')        return ((a.tier || 99) - (b.tier || 99)) * mul || (a.col_idx - b.col_idx);
      return (a.col_idx - b.col_idx) * mul;
    });

    return out;
  }, [allQuestions, params]);

  const counts = useMemo(() => ({
    total: allQuestions?.length || 0,
    showing: filtered.length,
  }), [allQuestions, filtered]);

  // ──────────────────────────────────────────────────────────────

  if (err) {
    return (
      <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: C.pageMuted }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: TYPE.sectionTitle,
          color: C.redBright,
          marginBottom: "0.5rem",
        }}>Failed to load question index</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem" }}>{err}</div>
        <div style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
          The D1 Worker may be down. <a href="https://findings.circumsurvey.online" style={{ color: C.gold, textDecoration: "underline" }}>Return to the Report →</a>
        </div>
      </div>
    );
  }

  if (!allQuestions) {
    return (
      <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: C.pageMuted }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "0.9rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: C.gold,
        }}>Loading…</div>
      </div>
    );
  }

  return (
    <main style={{
      padding: "2rem 1.5rem 6rem",
      maxWidth: 1200,
      margin: "0 auto",
      color: C.pageText,
    }}>
      {/* Section hero */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: TYPE.cardLabel,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: C.gold,
          marginBottom: "0.5rem",
        }}>Master Questions Index</div>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 800,
          fontSize: TYPE.sectionTitle,
          color: C.pageTextBright,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          margin: 0,
        }}>Every question, every pathway, every slice.</h2>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "clamp(1rem, 1.3vw, 1.15rem)",
          color: C.pageMuted,
          marginTop: "0.6rem",
          maxWidth: "50em",
        }}>
          Filter, search, and click any question to see its distribution sliced by
          pathway, religion, generation, and more. Every view is a shareable URL.
        </p>
      </div>

      {/* Search + facet bar */}
      <SearchAndFacets
        params={params}
        facets={facets}
        updateParams={updateParams}
        toggleInParam={toggleInParam}
      />

      {/* Active filter chips */}
      <div style={{ marginTop: "1rem" }}>
        <FilterChips
          params={params}
          onRemove={(key, value) => {
            if (key === 'section' || key === 'search') updateParams({ [key]: key === 'search' ? '' : null });
            else toggleInParam(key, value);
          }}
          onClearAll={clearFilters}
        />
      </div>

      {/* Results count + sort */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "1.5rem",
        marginBottom: "0.75rem",
        paddingBottom: "0.75rem",
        borderBottom: `1px solid ${C.pageGhost}`,
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "0.85rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: C.pageMuted,
      }}>
        <div>
          Showing <strong style={{ color: C.pageTextBright }}>{counts.showing.toLocaleString()}</strong>
          {counts.showing !== counts.total && <> of {counts.total.toLocaleString()}</>} questions
        </div>
        <SortControl
          sort={params.sort || 'tier'}
          order={params.order || 'asc'}
          onChange={(sort, order) => updateParams({ sort, order })}
        />
      </div>

      {/* The actual list */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {filtered.map(q => (
          <QuestionRow key={q.id} question={q} currentParams={params} />
        ))}
        {filtered.length === 0 && (
          <div style={{
            padding: "3rem 1rem",
            textAlign: "center",
            color: C.pageMuted,
            fontStyle: "italic",
          }}>
            No questions match the current filters.
            <div style={{ marginTop: "1rem" }}>
              <button
                onClick={clearFilters}
                style={{
                  padding: "0.5rem 1rem",
                  border: `1px solid ${C.gold}`,
                  borderRadius: 4,
                  color: C.goldBright,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "0.85rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >Clear all filters</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════
// Search + Facet bar
// ═══════════════════════════════════════════════════════════════
function SearchAndFacets({ params, facets, updateParams, toggleInParam }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "1rem",
      padding: "1.25rem",
      background: C.bgSoft,
      border: `1px solid ${C.pageGhost}`,
      borderRadius: 8,
    }}>
      {/* Search input — full width */}
      <div style={{ position: "relative" }}>
        <input
          type="search"
          placeholder="Search 355 questions by prompt, slug, or section…"
          value={params.search || ''}
          onChange={e => updateParams({ search: e.target.value })}
          style={{
            width: "100%",
            padding: "0.7rem 1rem 0.7rem 2.5rem",
            background: C.bgDeep,
            border: `1px solid ${C.pageGhost}`,
            borderRadius: 6,
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.95rem",
            color: C.pageTextBright,
            outline: "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = C.gold;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${C.gold}30`;
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = C.pageGhost;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <span style={{
          position: "absolute",
          left: "0.85rem",
          top: "50%",
          transform: "translateY(-50%)",
          color: C.pageDim,
          fontSize: "1rem",
          pointerEvents: "none",
        }}>⌕</span>
      </div>

      {/* Pathway chips */}
      <div>
        <FacetLabel>Pathway</FacetLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.4rem" }}>
          {PATH_ORDER.map(p => {
            const active = params.pathway?.includes(p);
            return (
              <button key={p}
                onClick={() => toggleInParam('pathway', p)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.35rem 0.7rem",
                  borderRadius: 999,
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: active ? 600 : 500,
                  background: active ? `${PATH_COLORS[p]}28` : "transparent",
                  border: `1px solid ${active ? PATH_COLORS[p] : C.pageGhost}`,
                  color: active ? C.pageTextBright : C.pageMuted,
                  transition: "all 0.15s",
                }}
              >
                <span>{PATH_EMOJI[p]}</span>
                <span>{PATH_LABELS[p]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section dropdown + Tier chips + Type dropdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
        {/* Section */}
        <div>
          <FacetLabel>Section</FacetLabel>
          <select
            value={params.section || ''}
            onChange={e => updateParams({ section: e.target.value || null })}
            style={selectStyle()}
          >
            <option value="">All sections</option>
            {facets.sections.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Tier */}
        <div>
          <FacetLabel>Tier</FacetLabel>
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.4rem" }}>
            {[1, 2, 3].map(t => {
              const active = params.tier?.includes(t);
              return (
                <button key={t}
                  onClick={() => toggleInParam('tier', t)}
                  style={{
                    flex: 1,
                    padding: "0.5rem 0.3rem",
                    borderRadius: 6,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    background: active ? `${C.gold}22` : "transparent",
                    border: `1px solid ${active ? C.gold : C.pageGhost}`,
                    color: active ? C.goldBright : C.pageMuted,
                    textTransform: "uppercase",
                    transition: "all 0.15s",
                  }}
                >{t === 1 ? "Featured" : t === 2 ? "Browse" : "Index"}</button>
              );
            })}
          </div>
        </div>

        {/* Type */}
        <div>
          <FacetLabel>Question Type</FacetLabel>
          <select
            value={params.type?.[0] || ''}
            onChange={e => updateParams({ type: e.target.value ? [e.target.value] : [] })}
            style={selectStyle()}
          >
            <option value="">All types</option>
            {facets.types.map(t => (
              <option key={t} value={t}>{typeLabel(t)}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function FacetLabel({ children }) {
  return (
    <div style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: "0.7rem",
      fontWeight: 700,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: C.gold,
      marginBottom: "0.3rem",
    }}>{children}</div>
  );
}

function selectStyle() {
  return {
    width: "100%",
    padding: "0.55rem 0.7rem",
    marginTop: "0.4rem",
    background: C.bgDeep,
    border: `1px solid ${C.pageGhost}`,
    borderRadius: 6,
    fontFamily: "'Barlow', sans-serif",
    fontSize: "0.85rem",
    color: C.pageTextBright,
    outline: "none",
    cursor: "pointer",
  };
}

// ═══════════════════════════════════════════════════════════════
// SortControl
// ═══════════════════════════════════════════════════════════════
function SortControl({ sort, order, onChange }) {
  const options = [
    { value: 'tier', label: 'Tier' },
    { value: 'section', label: 'Section' },
    { value: 'n_responses', label: 'Response count' },
    { value: 'prompt', label: 'Prompt A–Z' },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span style={{ color: C.pageDim }}>Sort:</span>
      <select
        value={sort}
        onChange={e => onChange(e.target.value, order)}
        style={{
          padding: "0.35rem 0.5rem",
          background: C.bgDeep,
          border: `1px solid ${C.pageGhost}`,
          borderRadius: 4,
          fontFamily: "'Barlow', sans-serif",
          fontSize: "0.78rem",
          color: C.pageTextBright,
          cursor: "pointer",
          textTransform: "none",
          letterSpacing: "normal",
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <button
        onClick={() => onChange(sort, order === 'asc' ? 'desc' : 'asc')}
        style={{
          padding: "0.35rem 0.6rem",
          background: C.bgDeep,
          border: `1px solid ${C.pageGhost}`,
          borderRadius: 4,
          color: C.pageTextBright,
          fontSize: "0.8rem",
        }}
      >{order === 'asc' ? '↑' : '↓'}</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// QuestionRow — one row in the index
// ═══════════════════════════════════════════════════════════════
function QuestionRow({ question, currentParams }) {
  const {
    id, prompt, section, pathway, tier, type, n_responses, opts,
  } = question;

  const warning = sampleSizeWarning(n_responses);
  const isFeatured = tier === 1;
  const pathwayColor = PATH_COLORS[pathway] || C.gold;

  const onClick = (e) => {
    e.preventDefault();
    // Preserve the pathway filter when navigating to detail
    navigateTo({
      route: 'question',
      questionId: id,
      params: {
        pathway: currentParams.pathway || [],
      },
    }, { push: true });
  };

  return (
    <a
      href={`#/q/${encodeURIComponent(id)}`}
      onClick={onClick}
      style={{
        display: "block",
        padding: "1rem 1.25rem",
        borderBottom: `1px solid ${C.pageGhost}`,
        transition: "background 0.12s, transform 0.12s",
        position: "relative",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Pathway indicator (left edge stripe) */}
      <div style={{
        position: "absolute",
        left: 0, top: 0, bottom: 0,
        width: 3,
        background: pathwayColor,
        opacity: pathway === 'all' ? 0.3 : 0.85,
      }} />

      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
        {/* Featured star */}
        {isFeatured && (
          <span
            title="Featured in The Special Report"
            style={{ color: C.gold, fontSize: "1rem", flexShrink: 0, marginTop: "0.1rem" }}
          >★</span>
        )}

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top row — section + type + pathway label */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.6rem",
            alignItems: "center",
            marginBottom: "0.3rem",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: C.pageDim,
          }}>
            <span style={{ color: pathwayColor }}>
              {PATH_EMOJI[pathway] || '●'} {shortSection(section)}
            </span>
            <span>·</span>
            <span>{typeLabel(type)}</span>
            <span>·</span>
            <span>{tierLabel(tier)}</span>
          </div>

          {/* Prompt */}
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.05rem",
            lineHeight: 1.35,
            color: C.pageTextBright,
          }}>
            {truncatePrompt(prompt, 180)}
          </div>

          {/* Slug — mono, subtle */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.7rem",
            color: C.pageDim,
            marginTop: "0.35rem",
            letterSpacing: "-0.01em",
          }}>
            {id}
          </div>
        </div>

        {/* Right side — n badge */}
        <div style={{ flexShrink: 0 }}>
          <SampleSizeBadge n={n_responses} dark />
        </div>
      </div>
    </a>
  );
}
