import { useState, useEffect, useMemo } from 'react';
import { C, TYPE, PATH_COLORS, PATH_LABELS, PATH_EMOJI, PATH_ORDER, FINDINGS_URL } from '../styles/tokens.js';
import { useUrlState, navigateTo } from '../lib/urlState.js';
import { fetchQuestions, fetchResponseDistribution, fetchAggregate } from '../lib/api.js';
import { nLabel, pct, shortSection, typeLabel, tierLabel, sampleSizeWarning } from '../lib/formatting.js';
import { SampleSizeBadge } from '../components/SampleSizeBadge.jsx';

// ═══════════════════════════════════════════════════════════════
// QuestionPage — single question detail
//
// Shows prompt, sample size, distribution chart. Pathway toggle
// lets users slice the data live. Cross-tab view (v8.1 enhancement
// point) is wired but rendered minimal for v8.0.
//
// All view state is URL-addressable:
//   #/q/family_politics                    — all respondents
//   #/q/family_politics?pathway=intact     — intact only
//   #/q/family_politics?view=compare       — side-by-side pathway
//   #/q/family_politics?view=crosstab&cross=religion.primary_tradition
// ═══════════════════════════════════════════════════════════════

export function QuestionPage() {
  const { state, updateParams, toggleInParam } = useUrlState();
  const { questionId, params } = state;
  const view = params.view || 'distribution';

  const [question, setQuestion] = useState(null);
  const [distribution, setDistribution] = useState(null);
  const [aggregate, setAggregate] = useState(null);
  const [err, setErr] = useState(null);

  // Fetch question metadata
  useEffect(() => {
    if (!questionId) return;
    setQuestion(null); setErr(null);
    fetchQuestions({ counts: 1 })
      .then(data => {
        const q = (data.questions || []).find(x => x.id === questionId);
        if (!q) {
          setErr(`Question not found: ${questionId}`);
        } else {
          setQuestion(q);
        }
      })
      .catch(e => setErr(e.message || String(e)));
  }, [questionId]);

  // Fetch distribution (filtered by pathway if set)
  useEffect(() => {
    if (!questionId) return;
    setDistribution(null);

    // If exactly one pathway selected, filter server-side
    // If zero or multiple, fetch all then derive
    const pathwayFilter = params.pathway?.length === 1 ? params.pathway[0] : null;

    fetchResponseDistribution({ q: questionId, pathway: pathwayFilter })
      .then(setDistribution)
      .catch(e => setErr(e.message || String(e)));
  }, [questionId, params.pathway]);

  // Fetch pathway-split aggregate for comparison views (always available, used on toggle)
  useEffect(() => {
    if (!questionId) return;
    fetchAggregate({ q: questionId, by: 'pathway' })
      .then(setAggregate)
      .catch(() => {/* non-fatal */});
  }, [questionId]);

  if (err) {
    return (
      <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: C.pageMuted }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: TYPE.sectionTitle,
          color: C.redBright,
          marginBottom: "0.5rem",
        }}>Question not found</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem" }}>{err}</div>
        <div style={{ marginTop: "1rem" }}>
          <BackToIndex />
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: C.pageMuted }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "0.9rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: C.gold,
        }}>Loading question…</div>
      </div>
    );
  }

  const pathwayColor = PATH_COLORS[question.pathway] || C.gold;

  return (
    <main style={{
      padding: "1.5rem 1.5rem 6rem",
      maxWidth: 960,
      margin: "0 auto",
      color: C.pageText,
    }}>
      <BackToIndex />

      {/* Header — section + tier + prompt */}
      <div style={{ marginTop: "1.5rem", marginBottom: "2rem" }}>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          alignItems: "center",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "0.78rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          marginBottom: "0.6rem",
        }}>
          <span style={{ color: pathwayColor }}>
            {PATH_EMOJI[question.pathway] || '●'} {shortSection(question.section)}
          </span>
          <span style={{ color: C.pageDim }}>·</span>
          <span style={{ color: C.pageMuted }}>{typeLabel(question.type)}</span>
          <span style={{ color: C.pageDim }}>·</span>
          <span style={{ color: question.tier === 1 ? C.gold : C.pageMuted }}>
            {question.tier === 1 && '★ '}{tierLabel(question.tier)}
          </span>
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: "clamp(1.5rem, 2.6vw, 2rem)",
          lineHeight: 1.25,
          color: C.pageTextBright,
          margin: 0,
          letterSpacing: "-0.005em",
        }}>{question.prompt}</h2>

        {question.subtitle && (
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "1.05rem",
            lineHeight: 1.45,
            color: C.pageMuted,
            marginTop: "0.6rem",
          }}>{question.subtitle}</p>
        )}

        {/* Metadata strip */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
          marginTop: "1rem",
        }}>
          <SampleSizeBadge n={distribution?.n ?? question.n_responses} dark />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.7rem",
            color: C.pageDim,
            letterSpacing: "-0.01em",
          }}>{question.id}</span>
          {question.tier === 1 && (
            <a href={`${FINDINGS_URL}#${question.id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.3rem 0.7rem",
                borderRadius: 999,
                border: `1px solid ${C.gold}80`,
                background: `${C.gold}15`,
                color: C.goldBright,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>★ Featured in The Report →</a>
          )}
        </div>
      </div>

      {/* Pathway filter toggle */}
      <PathwayToggle
        selected={params.pathway || []}
        onToggle={p => toggleInParam('pathway', p)}
        questionPathway={question.pathway}
      />

      {/* View toggle */}
      <ViewToggle
        view={view}
        onChange={v => updateParams({ view: v === 'distribution' ? null : v })}
      />

      {/* The main chart */}
      <div style={{ marginTop: "1.5rem" }}>
        {view === 'distribution' && (
          <DistributionView
            distribution={distribution}
            question={question}
            pathway={params.pathway?.length === 1 ? params.pathway[0] : null}
          />
        )}
        {view === 'compare' && (
          <CompareView
            aggregate={aggregate}
            question={question}
            selectedPathways={params.pathway || []}
          />
        )}
        {view === 'crosstab' && (
          <CrossTabView
            question={question}
            cross={params.cross}
            onChangeCross={c => updateParams({ cross: c })}
          />
        )}
      </div>

      {/* Shareable URL hint */}
      <div style={{
        marginTop: "3rem",
        padding: "1rem 1.25rem",
        background: C.bgSoft,
        border: `1px dashed ${C.pageGhost}`,
        borderRadius: 6,
        fontFamily: "'Barlow', sans-serif",
        fontSize: "0.85rem",
        color: C.pageMuted,
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "0.7rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: C.gold,
          marginBottom: "0.4rem",
        }}>Citeable URL</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", wordBreak: "break-all", color: C.pageText }}>
          {typeof window !== 'undefined' ? window.location.href : ''}
        </div>
        <div style={{ marginTop: "0.4rem", fontSize: "0.8rem", fontStyle: "italic" }}>
          Copy this URL to share this exact view with anyone. Filter state is preserved.
        </div>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════
// PathwayToggle — multi-select chips
// ═══════════════════════════════════════════════════════════════
function PathwayToggle({ selected, onToggle, questionPathway }) {
  // If the question is pathway-scoped (e.g. "Intact Pathway" questions),
  // only that pathway + 'all' are meaningful. But we still allow
  // selecting other pathways — the distribution will just be empty.
  return (
    <div style={{
      marginTop: "1rem",
      padding: "0.85rem 1rem",
      background: C.bgSoft,
      border: `1px solid ${C.pageGhost}`,
      borderRadius: 6,
    }}>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: C.gold,
        marginBottom: "0.5rem",
      }}>Filter by pathway</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
        <button
          onClick={() => selected.forEach(p => onToggle(p))}
          style={{
            padding: "0.3rem 0.7rem",
            borderRadius: 999,
            fontSize: "0.8rem",
            fontFamily: "'Barlow', sans-serif",
            fontWeight: selected.length === 0 ? 600 : 500,
            background: selected.length === 0 ? `${C.gold}28` : "transparent",
            border: `1px solid ${selected.length === 0 ? C.gold : C.pageGhost}`,
            color: selected.length === 0 ? C.pageTextBright : C.pageMuted,
          }}
        >All Respondents</button>
        {PATH_ORDER.map(p => {
          const active = selected.includes(p);
          return (
            <button key={p}
              onClick={() => onToggle(p)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.3rem 0.7rem",
                borderRadius: 999,
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.8rem",
                fontWeight: active ? 600 : 500,
                background: active ? `${PATH_COLORS[p]}28` : "transparent",
                border: `1px solid ${active ? PATH_COLORS[p] : C.pageGhost}`,
                color: active ? C.pageTextBright : C.pageMuted,
              }}
            >
              <span>{PATH_EMOJI[p]}</span>
              <span>{PATH_LABELS[p]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ViewToggle — Distribution / Compare / CrossTab
// ═══════════════════════════════════════════════════════════════
function ViewToggle({ view, onChange }) {
  const views = [
    { id: 'distribution', label: 'Distribution' },
    { id: 'compare',      label: 'Compare Pathways' },
    { id: 'crosstab',     label: 'Cross-tab' },
  ];
  return (
    <div style={{
      marginTop: "1rem",
      display: "flex",
      borderBottom: `1px solid ${C.pageGhost}`,
    }}>
      {views.map(v => {
        const active = view === v.id;
        return (
          <button key={v.id}
            onClick={() => onChange(v.id)}
            style={{
              padding: "0.7rem 1.25rem",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.82rem",
              fontWeight: active ? 700 : 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: active ? C.pageTextBright : C.pageMuted,
              borderBottom: `2px solid ${active ? C.gold : 'transparent'}`,
              marginBottom: "-1px",
              transition: "color 0.15s, border-color 0.15s",
            }}
          >{v.label}</button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DistributionView — simple horizontal bars
// ═══════════════════════════════════════════════════════════════
function DistributionView({ distribution, question, pathway }) {
  if (!distribution) {
    return <LoadingCard label="Computing distribution…" />;
  }
  if (distribution.distribution.length === 0) {
    return (
      <EmptyCard>
        No responses match this slice. Try a different pathway filter.
      </EmptyCard>
    );
  }

  const rows = distribution.distribution;
  const maxPct = Math.max(...rows.map(r => r.pct));
  const barColor = pathway ? PATH_COLORS[pathway] : C.gold;

  return (
    <div style={{
      padding: "1.5rem",
      background: C.bgSoft,
      border: `1px solid ${C.pageGhost}`,
      borderRadius: 8,
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: "1.25rem",
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "0.75rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.gold,
        }}>
          Distribution
          {pathway && <> · {PATH_EMOJI[pathway]} {PATH_LABELS[pathway]}</>}
        </div>
        <SampleSizeBadge n={distribution.n} dark />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {rows.map((row, i) => (
          <DistributionBar key={i} row={row} maxPct={maxPct} color={barColor} />
        ))}
      </div>
    </div>
  );
}

function DistributionBar({ row, maxPct, color }) {
  const widthPct = maxPct > 0 ? (row.pct / maxPct) * 100 : 0;
  return (
    <div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "'Barlow', sans-serif",
        fontSize: "0.88rem",
        marginBottom: "0.2rem",
      }}>
        <span style={{ color: C.pageText, flex: 1, paddingRight: "1rem" }}>{row.label}</span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.82rem",
          color: C.pageTextBright,
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}>{row.pct.toFixed(1)}% <span style={{ color: C.pageDim, fontWeight: 400 }}>(n={row.n})</span></span>
      </div>
      <div style={{
        position: "relative",
        height: 8,
        background: "rgba(255,255,255,0.04)",
        borderRadius: 4,
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${widthPct}%`,
          background: color,
          borderRadius: 4,
          transition: "width 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)",
        }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CompareView — side-by-side pathway comparison
// ═══════════════════════════════════════════════════════════════
function CompareView({ aggregate, question, selectedPathways }) {
  if (!aggregate) return <LoadingCard label="Loading pathway comparison…" />;
  const allBuckets = aggregate.results || {};

  const shown = selectedPathways.length > 0
    ? selectedPathways.filter(p => allBuckets[p])
    : PATH_ORDER.filter(p => allBuckets[p]);

  if (shown.length === 0) {
    return <EmptyCard>No pathway data available for this question.</EmptyCard>;
  }

  return (
    <div style={{
      padding: "1.5rem",
      background: C.bgSoft,
      border: `1px solid ${C.pageGhost}`,
      borderRadius: 8,
    }}>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "0.75rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: C.gold,
        marginBottom: "1.25rem",
      }}>Comparison across pathways</div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1rem",
      }}>
        {shown.map(p => {
          const bucket = allBuckets[p];
          const dist = bucket.distribution || [];
          const max = Math.max(0, ...dist.map(d => d.n));
          return (
            <div key={p} style={{
              padding: "1rem",
              border: `1px solid ${PATH_COLORS[p]}40`,
              borderRadius: 6,
              background: `${PATH_COLORS[p]}08`,
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
              }}>
                <div style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 600,
                  color: PATH_COLORS[p],
                }}>{PATH_EMOJI[p]} {PATH_LABELS[p]}</div>
                <SampleSizeBadge n={bucket.n} dark />
              </div>
              {bucket.avg !== null && bucket.avg !== undefined && (
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: C.pageTextBright,
                  marginBottom: "0.5rem",
                }}>avg {bucket.avg.toFixed(2)}</div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {dist.slice(0, 5).map((d, i) => (
                  <div key={i} style={{ fontSize: "0.8rem" }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: C.pageText,
                      marginBottom: "0.12rem",
                    }}>
                      <span style={{ flex: 1, paddingRight: "0.5rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
                      <span style={{ color: C.pageDim, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem" }}>{d.n}</span>
                    </div>
                    <div style={{
                      height: 4,
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${max > 0 ? (d.n / max) * 100 : 0}%`,
                        background: PATH_COLORS[p],
                        borderRadius: 2,
                      }} />
                    </div>
                  </div>
                ))}
                {dist.length > 5 && (
                  <div style={{
                    fontSize: "0.75rem",
                    color: C.pageDim,
                    marginTop: "0.25rem",
                    fontStyle: "italic",
                  }}>+ {dist.length - 5} more…</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CrossTabView — placeholder for v8.1 full implementation
// ═══════════════════════════════════════════════════════════════
function CrossTabView({ question, cross, onChangeCross }) {
  const options = [
    { value: null, label: 'Choose a dimension…' },
    { value: 'religion.primary_tradition', label: 'Religion' },
    { value: 'demographics.generation',    label: 'Generation' },
    { value: 'demographics.politics',      label: 'Political upbringing' },
    { value: 'demographics.country_born',  label: 'Country of birth' },
    { value: 'demographics.age_bracket',   label: 'Age bracket' },
  ];

  return (
    <div style={{
      padding: "2rem 1.5rem",
      background: C.bgSoft,
      border: `1px solid ${C.pageGhost}`,
      borderRadius: 8,
    }}>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "0.75rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: C.gold,
        marginBottom: "0.75rem",
      }}>Cross-tabulate by demographic</div>

      <select
        value={cross || ''}
        onChange={e => onChangeCross(e.target.value || null)}
        style={{
          padding: "0.6rem 0.9rem",
          background: C.bgDeep,
          border: `1px solid ${C.pageGhost}`,
          borderRadius: 6,
          color: C.pageTextBright,
          fontSize: "0.95rem",
          fontFamily: "'Barlow', sans-serif",
          marginBottom: "1.25rem",
          minWidth: 260,
        }}
      >
        {options.map(o => (
          <option key={o.value || 'none'} value={o.value || ''}>{o.label}</option>
        ))}
      </select>

      {cross && <CrossTabBody questionId={question.id} cross={cross} />}
      {!cross && (
        <div style={{
          padding: "2rem",
          textAlign: "center",
          color: C.pageMuted,
          fontStyle: "italic",
        }}>
          Pick a demographic dimension above to see how responses vary.
          <div style={{ fontSize: "0.8rem", marginTop: "0.5rem", color: C.pageDim }}>
            (v8.0 preview — full cross-tab matrix view arrives in v8.1)
          </div>
        </div>
      )}
    </div>
  );
}

function CrossTabBody({ questionId, cross }) {
  // Translate "religion.primary_tradition" → by parameter the Worker understands
  const byMap = {
    'religion.primary_tradition': 'religion',
    'demographics.generation': 'generation',
    'demographics.politics': 'politics',
    'demographics.country_born': 'country_born',
    'demographics.age_bracket': 'age_bracket',
  };
  const byKey = byMap[cross];

  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    setResult(null); setErr(null);
    if (!byKey) return;
    // The Worker's /aggregate supports a limited set of by= values.
    // For ones it doesn't (politics, age_bracket, country_born), we
    // need /aggregate with filter parameters — but the cleaner v8.0
    // path is: use by=religion (already supported) and fall back.
    const supported = new Set(['pathway', 'generation', 'religion', 'country_born']);
    if (!supported.has(byKey)) {
      setErr(`Cross-tab by "${byKey}" is not yet supported by the API (v8.0 limitation).`);
      return;
    }

    fetchAggregate({ q: questionId, by: byKey })
      .then(setResult)
      .catch(e => setErr(e.message || String(e)));
  }, [questionId, byKey]);

  if (err) {
    return (
      <div style={{ padding: "1rem", color: C.orangeBright, fontSize: "0.88rem" }}>
        {err}
      </div>
    );
  }
  if (!result) return <LoadingCard label="Cross-tabbing…" />;

  const buckets = result.results || {};
  const bucketKeys = Object.keys(buckets).filter(k => k && k !== 'unknown' && k !== 'null');

  if (bucketKeys.length === 0) {
    return <EmptyCard>No cross-tab data for this dimension.</EmptyCard>;
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "0.85rem",
    }}>
      {bucketKeys.map(bk => {
        const b = buckets[bk];
        const dist = b.distribution || [];
        const max = Math.max(0, ...dist.map(d => d.n));
        return (
          <div key={bk} style={{
            padding: "0.9rem",
            border: `1px solid ${C.pageGhost}`,
            borderRadius: 6,
            background: C.bgDeep,
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
              borderBottom: `1px solid ${C.pageGhost}`,
              paddingBottom: "0.4rem",
            }}>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 600,
                fontSize: "0.85rem",
                color: C.pageTextBright,
              }}>{bk}</div>
              <SampleSizeBadge n={b.n} dark />
            </div>
            {dist.slice(0, 4).map((d, i) => (
              <div key={i} style={{ fontSize: "0.78rem", marginBottom: "0.3rem" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: C.pageText,
                  marginBottom: "0.12rem",
                }}>
                  <span style={{ flex: 1, paddingRight: "0.5rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
                  <span style={{ color: C.pageDim, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem" }}>{d.n}</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                  <div style={{
                    height: "100%",
                    width: `${max > 0 ? (d.n / max) * 100 : 0}%`,
                    background: C.gold,
                    borderRadius: 2,
                  }} />
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// UI helpers
// ═══════════════════════════════════════════════════════════════
function BackToIndex() {
  return (
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
        transition: "color 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.color = C.goldBright}
      onMouseLeave={e => e.currentTarget.style.color = C.pageMuted}
    >← Back to Index</button>
  );
}

function LoadingCard({ label = "Loading…" }) {
  return (
    <div style={{
      padding: "3rem 1.5rem",
      textAlign: "center",
      color: C.pageMuted,
      background: C.bgSoft,
      border: `1px solid ${C.pageGhost}`,
      borderRadius: 8,
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: "0.85rem",
      letterSpacing: "0.18em",
      textTransform: "uppercase",
    }}>{label}</div>
  );
}

function EmptyCard({ children }) {
  return (
    <div style={{
      padding: "2.5rem 1.5rem",
      textAlign: "center",
      color: C.pageMuted,
      background: C.bgSoft,
      border: `1px solid ${C.pageGhost}`,
      borderRadius: 8,
      fontStyle: "italic",
      fontSize: "0.95rem",
    }}>{children}</div>
  );
}
