/* ===================================================================
   GymTracker — Routine tab
   My Plan (day-by-day assignments) + Templates (pre-built routines).
   =================================================================== */

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAYS_LONG = { Mon:'Monday', Tue:'Tuesday', Wed:'Wednesday', Thu:'Thursday', Fri:'Friday', Sat:'Saturday', Sun:'Sunday' };

// Default plan
const INITIAL_PLAN = {
  Mon: ['chest','triceps'],
  Tue: ['back','biceps'],
  Wed: [],
  Thu: ['shoulders','core'],
  Fri: ['legs'],
  Sat: ['back','chest'],
  Sun: [],
};

function RoutineTab() {
  const [view, setView] = React.useState({ kind: 'plan' });
  const [plan, setPlan] = React.useState(INITIAL_PLAN);
  const [selDay, setSelDay] = React.useState('Mon');

  if (view.kind === 'template') {
    return <TemplateDetail tpl={view.tpl} onBack={() => setView({ kind: 'plan' })} onApply={(blocks) => {
      // Apply template — simple round-robin into days
      const next = { Mon:[], Tue:[], Wed:[], Thu:[], Fri:[], Sat:[], Sun:[] };
      blocks.forEach((b, i) => { next[DAYS[i % 7]] = b.focus; });
      setPlan(next);
      setView({ kind: 'plan' });
    }} />;
  }

  const focus = plan[selDay] || [];

  return (
    <React.Fragment>
      <div className="gt-header">
        <h1>Routine</h1>
        <button className="gt-back" aria-label="Add">{GT_I.plus({ s: 18 })}</button>
      </div>
      <div className="gt-screen">
        {/* Day-of-week scroller */}
        <div className="gt-dow-row" style={{ paddingTop: 12 }}>
          {DAYS.map(d => {
            const has = (plan[d] || []).length > 0;
            const isToday = d === 'Sun'; // app date is Sun May 24
            return (
              <button key={d} className="gt-dow"
                      data-on={d === selDay ? '1' : '0'}
                      data-rest={!has ? '1' : '0'}
                      onClick={() => setSelDay(d)}
                      style={isToday && d !== selDay ? { outline: '1.5px solid var(--accent)', outlineOffset: -1 } : {}}>
                <span className="d">{d}</span>
                <span className="n">{has ? (plan[d].length) : '—'}</span>
                {d === selDay && <span className="marker" />}
              </button>
            );
          })}
        </div>

        {/* Day detail */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 className="gt-display" style={{ margin: 0, fontSize: 24 }}>{DAYS_LONG[selDay]}</h2>
            <span className="gt-eyebrow">
              {focus.length === 0 ? 'Rest day' : `${focus.length} ${focus.length === 1 ? 'group' : 'groups'}`}
            </span>
          </div>

          {focus.length === 0 ? (
            <EmptyState
              icon={GT_I.routine({ s: 24 })}
              title="Rest day"
              sub="Recovery is when you grow. Tap a muscle group below to plan a workout instead."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {focus.map(id => {
                const bp = BODY_PARTS.find(b => b.id === id);
                const exes = EXERCISES.filter(e => e.body === id).slice(0, 3);
                return (
                  <div key={id} className="gt-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: bp.tint }} />
                      <span className="gt-display" style={{ fontSize: 16 }}>{bp.name}</span>
                      <span style={{ flex: 1 }} />
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{exes.length} suggested</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {exes.map(e => (
                        <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                          <span style={{
                            width: 22, height: 22, borderRadius: 6,
                            background: 'var(--surface-2)',
                            display: 'grid', placeItems: 'center',
                          }}>
                            <ExIllust kind={e.kind} size={20} />
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{e.name}</span>
                          <span style={{ flex: 1 }} />
                          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{e.equip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {BODY_PARTS.slice(0, 7).map(b => {
              const on = focus.includes(b.id);
              return (
                <button key={b.id} className="gt-chip" data-on={on ? '1' : '0'} onClick={() => {
                  const cur = plan[selDay] || [];
                  setPlan({ ...plan, [selDay]: on ? cur.filter(x => x !== b.id) : [...cur, b.id] });
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: b.tint, marginRight: 2 }} />
                  {b.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates */}
        <div className="gt-section-head">
          <h2>Pre-built routines</h2>
          <span className="gt-eyebrow">{TEMPLATES.length}</span>
        </div>
        <div style={{ padding: '0 20px 16px' }}>
          {TEMPLATES.map(tpl => (
            <button key={tpl.id} className="gt-routine-card" style={{ textAlign: 'left', cursor: 'pointer', width: '100%', display: 'block' }}
                    onClick={() => setView({ kind: 'template', tpl })}>
              <div style={{ position: 'absolute', top: 18, right: 18 }}>
                {GT_I.fwd({ s: 18 })}
              </div>
              <div className="accent-tag">{tpl.tag}</div>
              <h3>{tpl.name}</h3>
              <p>{tpl.tagline}</p>
              <div className="stats">
                <div><strong>{tpl.days}</strong>days / wk</div>
                <div><strong>{tpl.exercises}</strong>exercises</div>
                <div><strong>{tpl.level.split(/[\s+]/)[0]}</strong>{tpl.level.replace(/^\S+\s?/, '').toLowerCase() || 'level'}</div>
              </div>
              <DotChart blocks={tpl.blocks} />
            </button>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

// Compact block visual for a template
function DotChart({ blocks }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
      {blocks.map((b, i) => (
        <div key={i} style={{
          flex: 1,
          height: 36,
          borderRadius: 8,
          background: 'var(--surface-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          padding: '0 4px',
          overflow: 'hidden',
        }}>
          {b.focus.slice(0, 3).map(f => {
            const bp = BODY_PARTS.find(p => p.id === f);
            return bp ? (
              <span key={f} style={{
                width: 8, height: 8, borderRadius: 999,
                background: bp.tint, flexShrink: 0,
              }} />
            ) : null;
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Template detail ────────────────────────────────────────────────
function TemplateDetail({ tpl, onBack, onApply }) {
  return (
    <React.Fragment>
      <ScreenHeader title="Template" onBack={onBack} />
      <div className="gt-screen">
        <div style={{ padding: '20px 20px 0' }}>
          <div className="accent-tag" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--accent)',
          }}>
            {tpl.tag}
          </div>
          <h2 className="gt-display" style={{ fontSize: 32, margin: '4px 0 6px' }}>{tpl.name}</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>{tpl.desc}</p>
        </div>

        <div className="gt-stats" style={{ marginTop: 20 }}>
          <StatTile label="Days / wk" value={tpl.days} />
          <StatTile label="Exercises" value={tpl.exercises} />
          <StatTile label="Level" value={tpl.level} />
        </div>

        <div className="gt-section-head">
          <h2>Sessions</h2>
        </div>
        <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tpl.blocks.map((b, i) => (
            <div key={i} className="gt-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'var(--surface-2)',
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--font-display)',
                fontWeight: 700, fontSize: 14,
                color: 'var(--text-2)',
              }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="gt-display" style={{ fontSize: 15 }}>{b.day}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {b.focus.map(f => {
                    const bp = BODY_PARTS.find(p => p.id === f);
                    return bp ? (
                      <span key={f} style={{
                        fontSize: 11, fontWeight: 600,
                        padding: '2px 8px', borderRadius: 999,
                        background: 'var(--surface-2)', color: 'var(--text-2)',
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: bp.tint }} />
                        {bp.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="gt-cta-bar">
          <button className="gt-btn gt-btn-primary" onClick={() => onApply(tpl.blocks)}>
            Use this plan
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { RoutineTab });
