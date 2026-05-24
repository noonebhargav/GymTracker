/* ===================================================================
   GymTracker — History tab
   Calendar · Summary · Insights (volume chart + body heatmap).
   =================================================================== */

function HistoryTab({ unit }) {
  const [tab, setTab] = React.useState('calendar'); // calendar | summary | insights
  const [view, setView] = React.useState({ kind: 'index' });

  if (view.kind === 'day') {
    return <DayDetail date={view.date} onBack={() => setView({ kind: 'index' })} unit={unit} />;
  }

  return (
    <React.Fragment>
      <div className="gt-header">
        <h1>History</h1>
      </div>
      <div className="gt-screen">
        <div style={{ padding: '12px 20px 18px', display: 'flex', justifyContent: 'center' }}>
          <Seg
            value={tab}
            onChange={setTab}
            options={[
              { value: 'calendar', label: 'Calendar' },
              { value: 'summary', label: 'Summary' },
              { value: 'insights', label: 'Insights' },
            ]}
          />
        </div>

        {tab === 'calendar' && <CalendarView onPick={(date) => setView({ kind: 'day', date })} />}
        {tab === 'summary' && <SummaryView onPick={(date) => setView({ kind: 'day', date })} unit={unit} />}
        {tab === 'insights' && <InsightsView unit={unit} />}
      </div>
    </React.Fragment>
  );
}

// ─── Calendar ───────────────────────────────────────────────────────
function CalendarView({ onPick }) {
  // May 2026 — Sun May 24 is "today"
  const [monthIdx, setMonthIdx] = React.useState(4); // 0-indexed
  const year = 2026;
  const first = new Date(year, monthIdx, 1);
  const startDow = (first.getDay() + 6) % 7; // Mon-first
  const days = new Date(year, monthIdx + 1, 0).getDate();
  const monthName = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map of date string → workout count
  const wMap = {};
  SAMPLE_HISTORY.forEach(h => {
    const d = new Date(h.date + 'T00:00:00');
    if (d.getMonth() === monthIdx && d.getFullYear() === year) {
      wMap[d.getDate()] = (wMap[d.getDate()] || 0) + h.items.length;
    }
  });

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px 8px',
      }}>
        <button className="gt-back" onClick={() => setMonthIdx(m => Math.max(0, m - 1))} aria-label="Prev">
          {GT_I.back({ s: 16 })}
        </button>
        <div className="gt-display" style={{ fontSize: 18 }}>{monthName}</div>
        <button className="gt-back" onClick={() => setMonthIdx(m => Math.min(11, m + 1))} aria-label="Next">
          {GT_I.fwd({ s: 16 })}
        </button>
      </div>
      <div className="gt-cal">
        <div className="gt-cal-grid">
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <div key={i} className="gt-cal-h">{d}</div>
          ))}
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />;
            const count = wMap[d] || 0;
            const dotSize = count === 0 ? 0 : Math.min(20, 5 + count * 3);
            const isToday = d === 24;
            return (
              <button key={i} className="gt-cal-cell"
                      data-active={count > 0 ? '1' : '0'}
                      data-today={isToday ? '1' : '0'}
                      style={{ '--dot': `${dotSize}px`, '--dot-o': count > 0 ? 1 : 0 }}
                      onClick={() => count > 0 && onPick(`${year}-${String(monthIdx+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`)}>
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontSize: 11, color: 'var(--text-3)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          <span style={{ width: 8, height: 4, borderRadius: 2, background: 'var(--accent)' }} /> 1 exercise
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          <span style={{ width: 14, height: 4, borderRadius: 2, background: 'var(--accent)' }} /> 3+ exercises
        </span>
      </div>

      <MonthlySummary monthIdx={monthIdx} year={year} />
    </div>
  );
}

// ─── Monthly stats ──────────────────────────────────────────────────
function MonthlySummary({ monthIdx, year }) {
  const stats = React.useMemo(() => {
    let workouts = 0, sets = 0, volume = 0;
    SAMPLE_HISTORY.forEach(h => {
      const d = new Date(h.date + 'T00:00:00');
      if (d.getMonth() === monthIdx && d.getFullYear() === year) {
        workouts++;
        h.items.forEach(it => {
          sets += it.sets.length;
          it.sets.forEach(s => volume += (s.w || 0) * s.r);
        });
      }
    });
    return { workouts, sets, volume };
  }, [monthIdx, year]);
  return (
    <div style={{ padding: '24px 20px 0' }}>
      <div className="gt-eyebrow" style={{ marginBottom: 10 }}>This month</div>
      <div className="gt-stats" style={{ margin: 0 }}>
        <StatTile label="Workouts" value={stats.workouts} />
        <StatTile label="Sets" value={stats.sets} />
        <StatTile label="Volume" value={(stats.volume/1000).toFixed(1)} unit="k" />
      </div>
    </div>
  );
}

// ─── Summary view ───────────────────────────────────────────────────
function SummaryView({ onPick, unit }) {
  // Weekly cards
  const weeks = [
    { label: 'Apr 27 – May 3', start: '2026-04-27', stop: '2026-05-03' },
    { label: 'May 4 – May 10', start: '2026-05-04', stop: '2026-05-10' },
    { label: 'May 11 – May 17', start: '2026-05-11', stop: '2026-05-17' },
    { label: 'May 18 – May 24', start: '2026-05-18', stop: '2026-05-24' },
    { label: 'May 25 – May 31', start: '2026-05-25', stop: '2026-05-31' },
  ];

  return (
    <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0 8px' }}>
        <button className="gt-back" aria-label="Prev">{GT_I.back({ s: 16 })}</button>
        <div className="gt-display" style={{ fontSize: 18 }}>May 2026</div>
        <button className="gt-back" aria-label="Next">{GT_I.fwd({ s: 16 })}</button>
      </div>
      {weeks.map(w => {
        const items = SAMPLE_HISTORY.filter(h => h.date >= w.start && h.date <= w.stop);
        if (items.length === 0) {
          return (
            <div key={w.label} className="gt-card" style={{
              border: '1.5px dashed var(--border-2)',
              background: 'transparent',
            }}>
              <div className="gt-eyebrow" style={{ marginBottom: 6 }}>Week of {w.label}</div>
              <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No exercises logged</div>
            </div>
          );
        }
        let sets = 0, vol = 0, reps = 0, parts = new Set();
        items.forEach(h => {
          h.body.forEach(b => parts.add(b));
          h.items.forEach(it => {
            sets += it.sets.length;
            it.sets.forEach(s => { vol += (s.w || 0) * s.r; reps += s.r; });
          });
        });
        const avgW = sets > 0 ? Math.round(vol / Math.max(1, reps)) : 0;
        return (
          <div key={w.label} className="gt-card">
            <div className="gt-eyebrow" style={{ marginBottom: 8 }}>Week of {w.label}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {[...parts].map(p => {
                const bp = BODY_PARTS.find(b => b.id === p);
                return bp ? (
                  <span key={p} className="gt-pill gt-pill-ghost" style={{
                    height: 24, fontSize: 11, paddingLeft: 8,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: bp.tint, marginRight: 4 }} />
                    {bp.name}
                  </span>
                ) : null;
              })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              <Cell lbl="WORKOUTS" val={items.length} />
              <Cell lbl="SETS" val={sets} />
              <Cell lbl={`AVG ${unit}`} val={avgW} />
              <Cell lbl="REPS" val={reps} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
function Cell({ lbl, val }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{val}</div>
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-3)' }}>{lbl}</div>
    </div>
  );
}

// ─── Insights view ──────────────────────────────────────────────────
function InsightsView({ unit }) {
  const weeks = weeklyVolume();
  const max = Math.max(...weeks.map(w => w.v), 1);
  const heat = recoveryHeat();
  const thisWeek = weeks[weeks.length - 1].v;
  const lastWeek = weeks[weeks.length - 2].v;
  const delta = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;

  // PRs
  const PRs = [
    { ex: 'Barbell Bench Press', val: '65 lbs × 8', date: 'May 19' },
    { ex: 'Back Squat', val: '175 lbs × 5', date: 'May 20' },
    { ex: 'Barbell Deadlift', val: '225 lbs × 3', date: 'May 22' },
  ];

  return (
    <div style={{ padding: '0 20px 32px' }}>
      {/* Volume trend */}
      <div className="gt-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
          <div>
            <div className="gt-eyebrow" style={{ whiteSpace: 'nowrap' }}>Weekly volume</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.025em', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
              {thisWeek.toLocaleString()} <span style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 500 }}>{unit}</span>
            </div>
          </div>
          {delta !== 0 && (
            <span className="gt-pill gt-pill-pr" style={{ background: delta > 0 ? 'var(--accent-soft)' : 'var(--danger-soft)', color: delta > 0 ? 'var(--accent)' : 'var(--danger)', borderColor: 'transparent', whiteSpace: 'nowrap', marginTop: 2 }}>
              {GT_I.trend({ s: 12 })} {delta > 0 ? '+' : ''}{delta}%
            </span>
          )}
        </div>
        <div className="gt-chart">
          {weeks.map((w, i) => {
            const h = Math.max(4, (w.v / max) * 120);
            const isThis = i === weeks.length - 1;
            return (
              <div key={i} className="gt-chart-col">
                <div className="gt-chart-bar" style={{ height: h }} data-this={isThis ? '1' : '0'} data-on={w.v > 0 ? '1' : '0'} />
                <div className="gt-chart-x">
                  {i === 0 || i === 6 || i === 11 ? `W${i + 1}` : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Body part heatmap */}
      <div className="gt-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
          <div className="gt-eyebrow" style={{ whiteSpace: 'nowrap' }}>Load by body part</div>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-display)', fontWeight: 600, whiteSpace: 'nowrap' }}>last 7 days</span>
        </div>
        <div className="gt-heat">
          {heat.map(h => (
            <div key={h.id} className="gt-heat-cell" style={{
              '--heat-bg': h.tint,
              '--heat-o': 0.12 + h.heat * 0.65,
            }}>
              <div className="gt-heat-name">{h.name}</div>
              <div className="gt-heat-val">
                {h.vol > 0 ? `${(h.vol/1000).toFixed(1)}k` : 'rest'}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, fontSize: 11, color: 'var(--text-3)' }}>
          <span>Less</span>
          <div style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'center' }}>
            {[0.15, 0.3, 0.5, 0.7, 0.9].map((o, i) => (
              <span key={i} style={{ width: 16, height: 8, borderRadius: 2, background: 'var(--accent)', opacity: o }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Recent PRs */}
      <div className="gt-card">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
          <div className="gt-eyebrow">Recent PRs</div>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>this month</span>
        </div>
        {PRs.map((p, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 0',
            borderBottom: i < PRs.length - 1 ? '1px solid var(--border)' : 0,
          }}>
            <span style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'var(--accent-soft)', color: 'var(--accent)',
              display: 'grid', placeItems: 'center',
            }}>
              {GT_I.trophy({ s: 16 })}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.ex}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{p.date}</div>
            </div>
            <div className="gt-num" style={{ fontSize: 15 }}>{p.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Day detail ─────────────────────────────────────────────────────
function DayDetail({ date, onBack, unit }) {
  const h = SAMPLE_HISTORY.find(x => x.date === date);
  if (!h) return null;
  let sets = 0, vol = 0, reps = 0;
  h.items.forEach(it => {
    sets += it.sets.length;
    it.sets.forEach(s => { vol += (s.w || 0) * s.r; reps += s.r; });
  });
  const avg = sets > 0 ? Math.round(vol / Math.max(1, reps)) : 0;
  return (
    <React.Fragment>
      <ScreenHeader title={fmtDate(date, { weekday: 'long', year: 'numeric' })} onBack={onBack} />
      <div className="gt-screen">
        {/* Summary card */}
        <div style={{ padding: '12px 20px 20px' }}>
          <div className="gt-card">
            <div className="gt-eyebrow" style={{ marginBottom: 8 }}>Day Summary</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {h.body.map(b => {
                const bp = BODY_PARTS.find(p => p.id === b);
                return bp ? (
                  <span key={b} className="gt-pill gt-pill-ghost" style={{ height: 24, fontSize: 12, paddingLeft: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: bp.tint, marginRight: 4 }} />
                    {bp.name}
                  </span>
                ) : null;
              })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              <Cell lbl="EXERCISES" val={h.items.length} />
              <Cell lbl="SETS" val={sets} />
              <Cell lbl={`AVG ${unit}`} val={avg} />
              <Cell lbl="VOLUME" val={`${(vol/1000).toFixed(1)}k`} />
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {h.items.map((it) => {
            const ex = exerciseById(it.id);
            if (!ex) return null;
            return (
              <div key={it.id} className="gt-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div className="gt-ex-thumb" style={{ width: 40, height: 40 }}>
                    <ExIllust kind={ex.kind} size={32} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{ex.equip} · {capitalize(ex.body)}</div>
                  </div>
                  <span className="gt-eyebrow">{it.sets.length} sets</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 32px', rowGap: 4, columnGap: 8 }}>
                  {it.sets.map((s, i) => (
                    <React.Fragment key={i}>
                      <span style={{ color: 'var(--text-3)', fontSize: 13, fontFamily: 'var(--font-display)' }}>{i + 1}</span>
                      <span className="gt-num" style={{ fontSize: 15 }}>{s.w} <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{unit}</span></span>
                      <span className="gt-num" style={{ fontSize: 15 }}>{s.r} <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>reps</span></span>
                      <span style={{ textAlign: 'right' }}>
                        {s.pr && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: 'var(--accent)', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                            {GT_I.trophy({ s: 12 })}
                          </span>
                        )}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { HistoryTab });
