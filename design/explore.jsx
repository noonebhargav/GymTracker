/* ===================================================================
   GymTracker — Explore tab
   Body parts + equipment taxonomy → exercise list → exercise detail.
   =================================================================== */

function ExploreTab() {
  const [view, setView] = React.useState({ kind: 'home' });

  if (view.kind === 'list') {
    return <ExerciseList kind={view.cat} id={view.id} name={view.name}
                         onBack={() => setView({ kind: 'home' })}
                         onPick={(exId) => setView({ kind: 'detail', exId, from: view })} />;
  }
  if (view.kind === 'detail') {
    return <ExerciseDetail exId={view.exId}
                           onBack={() => setView(view.from || { kind: 'home' })} />;
  }

  return (
    <React.Fragment>
      <div className="gt-header">
        <h1>Explore</h1>
        <button className="gt-back" aria-label="Filter">{GT_I.search({ s: 16 })}</button>
      </div>
      <div className="gt-screen">
        <div style={{ padding: '12px 0 0' }}>
          <SearchBar />
        </div>

        <div className="gt-section-head">
          <h2>Body parts</h2>
          <span className="gt-eyebrow">{BODY_PARTS.length}</span>
        </div>
        <div style={{ padding: '0 20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {BODY_PARTS.map(bp => (
            <button key={bp.id}
                    className="gt-card gt-tap"
                    style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      padding: 16,
                      position: 'relative',
                      overflow: 'hidden',
                      borderColor: 'var(--border)',
                    }}
                    onClick={() => setView({ kind: 'list', cat: 'body', id: bp.id, name: bp.name })}>
              <span style={{
                position: 'absolute', top: 0, right: 0,
                width: 64, height: 64, borderRadius: '0 14px 0 64px',
                background: `radial-gradient(circle at top right, ${bp.tint}, transparent 70%)`,
                opacity: 0.15,
              }} />
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: bp.tint, opacity: 1,
                marginBottom: 12,
              }} />
              <div className="gt-display" style={{ fontSize: 16 }}>{bp.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2, fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                {bp.count} exercises
              </div>
            </button>
          ))}
        </div>

        <div className="gt-section-head">
          <h2>Equipment</h2>
          <span className="gt-eyebrow">{EQUIPMENT.length}</span>
        </div>
        <div style={{ padding: '0 20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {EQUIPMENT.map(eq => (
            <button key={eq.id} className="gt-card gt-tap"
                    style={{ textAlign: 'left', cursor: 'pointer', padding: 14 }}
                    onClick={() => setView({ kind: 'list', cat: 'equip', id: eq.id, name: eq.name })}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'var(--surface-2)',
                  display: 'grid', placeItems: 'center',
                  color: 'var(--text-2)',
                  flexShrink: 0,
                }}>
                  <ExIllust kind={eq.kind} size={32} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="gt-display" style={{ fontSize: 13 }}>{eq.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                    {eq.count}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

// ─── Exercise list (filtered) ───────────────────────────────────────
function ExerciseList({ kind, id, name, onBack, onPick }) {
  const list = React.useMemo(() => {
    if (kind === 'body') return EXERCISES.filter(e => e.body === id);
    if (kind === 'equip') {
      const eq = EQUIPMENT.find(e => e.id === id);
      return EXERCISES.filter(e => e.equip === eq?.name || e.kind === eq?.kind);
    }
    return EXERCISES;
  }, [kind, id]);

  return (
    <React.Fragment>
      <ScreenHeader title={`${name} (${list.length})`} onBack={onBack} />
      <div className="gt-screen">
        {list.length === 0 ? (
          <EmptyState icon={GT_I.explore({ s: 24 })} title="No exercises" sub="This category will populate soon." />
        ) : (
          <div>
            {list.map(e => (
              <ExerciseRow key={e.id} ex={e} onClick={() => onPick(e.id)} />
            ))}
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

// ─── Exercise detail ────────────────────────────────────────────────
function ExerciseDetail({ exId, onBack }) {
  const ex = exerciseById(exId);
  if (!ex) return null;
  const steps = stepsFor(exId);
  return (
    <React.Fragment>
      <ScreenHeader title={ex.name} onBack={onBack} />
      <div className="gt-screen">
        {/* Hero illustration */}
        <div style={{ padding: '8px 20px 16px' }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px 0',
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <span style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 12px, rgba(255,255,255,0.02) 12px 13px)',
              pointerEvents: 'none',
            }} />
            <ExIllust kind={ex.kind} size={140} />
          </div>
        </div>

        {/* Meta */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: 14, alignItems: 'baseline' }}>
            <div className="gt-eyebrow">Target</div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{ex.target}</div>
            <div className="gt-eyebrow">Group</div>
            <div style={{ fontSize: 15 }}>{capitalize(ex.body)}</div>
            <div className="gt-eyebrow">Equipment</div>
            <div style={{ fontSize: 15 }}>{ex.equip}</div>
            {ex.secondary.length > 0 && (
              <React.Fragment>
                <div className="gt-eyebrow" style={{ alignSelf: 'start', marginTop: 4 }}>Secondary</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ex.secondary.map(s => (
                    <span key={s} className="gt-pill gt-pill-ghost" style={{ height: 24, fontSize: 12 }}>{s}</span>
                  ))}
                </div>
              </React.Fragment>
            )}
          </div>
        </div>

        <div className="gt-divider" style={{ marginBottom: 20 }} />

        {/* Instructions */}
        <div style={{ padding: '0 20px 20px' }}>
          <div className="gt-eyebrow" style={{ marginBottom: 8 }}>How to do it</div>
          <ol className="gt-steps">
            {steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>

        <div className="gt-cta-bar">
          <button className="gt-btn gt-btn-primary">
            {GT_I.plus({ s: 18 })} Add to workout
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { ExploreTab });
