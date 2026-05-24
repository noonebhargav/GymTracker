/* ===================================================================
   GymTracker — Workout tab
   Browse exercises → tap into set editor (with ruler wheel picker).
   =================================================================== */

const FILTER_CHIPS = ['Recent', 'Chest', 'Back', 'Shoulders', 'Legs', 'Biceps', 'Triceps', 'Core/Abs', 'All'];

function WorkoutTab({ unit, defaultWeight, defaultReps, defaultSets, doneIds, onMarkDone, onUnmark, sessionSets, onSetsChange }) {
  // Local nav: 'list' or detail by exId
  const [view, setView] = React.useState({ kind: 'list' });
  const [filter, setFilter] = React.useState('Recent');
  const [query, setQuery] = React.useState('');

  if (view.kind === 'editor') {
    return (
      <SetEditor
        ex={exerciseById(view.id)}
        unit={unit}
        defaultWeight={defaultWeight}
        defaultReps={defaultReps}
        defaultSets={defaultSets}
        sets={sessionSets[view.id]}
        onSetsChange={(s) => onSetsChange(view.id, s)}
        done={doneIds.has(view.id)}
        onMarkDone={() => onMarkDone(view.id)}
        onUnmark={() => onUnmark(view.id)}
        onBack={() => setView({ kind: 'list' })}
      />
    );
  }

  // Filter exercises
  const recent = ['bbp', 'idp', 'bbdl', 'sqt', 'lpd', 'ohp'];
  let list;
  if (filter === 'Recent') {
    list = recent.map(id => exerciseById(id)).filter(Boolean);
  } else if (filter === 'All') {
    list = EXERCISES;
  } else {
    const bp = BODY_PARTS.find(b => b.name === filter)?.id;
    list = EXERCISES.filter(e => e.body === bp);
  }
  if (query) {
    const q = query.toLowerCase();
    list = list.filter(e => e.name.toLowerCase().includes(q));
  }

  return (
    <React.Fragment>
      <div className="gt-header">
        <h1>Workout</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-3)' }}>
          {GT_I.flame({ s: 14 })}
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>5</span>
          <span style={{ letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>day streak</span>
        </div>
      </div>
      <div className="gt-screen">
        <div style={{ padding: '12px 0 0' }}>
          <SearchBar value={query} onChange={setQuery} />
        </div>
        <div className="gt-chip-row">
          {FILTER_CHIPS.map(c => (
            <Chip key={c} on={c === filter} onClick={() => setFilter(c)}>{c}</Chip>
          ))}
        </div>

        {doneIds.size > 0 && (
          <div style={{ padding: '0 20px 12px' }}>
            <div className="gt-card" style={{ background: 'var(--surface-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                <span className="gt-eyebrow" style={{ whiteSpace: 'nowrap' }}>Today's session</span>
                <span className="gt-num" style={{ fontSize: 13 }}>{doneIds.size} done</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[...doneIds].map(id => {
                  const e = exerciseById(id);
                  if (!e) return null;
                  return (
                    <span key={id} className="gt-pill gt-pill-done" style={{ height: 22, fontSize: 11 }}>
                      {GT_I.check({ s: 12 })}{e.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {list.length === 0 ? (
          <EmptyState
            icon={GT_I.workout({ s: 24 })}
            title={filter === 'Recent' ? 'No recent exercises' : `No exercises in ${filter}`}
            sub={filter === 'Recent' ? 'Exercises you log will appear here for quick access.' : 'Try another filter or search.'}
          />
        ) : (
          <div>
            {list.map(e => (
              <ExerciseRow
                key={e.id}
                ex={e}
                onClick={() => setView({ kind: 'editor', id: e.id })}
                badge={doneIds.has(e.id) ? (
                  <span className="gt-pill gt-pill-done">
                    {GT_I.check({ s: 12 })} Done
                  </span>
                ) : null}
              />
            ))}
            <div style={{ height: 12 }} />
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

// ─── Set Editor ─────────────────────────────────────────────────────
function SetEditor({ ex, unit, defaultWeight, defaultReps, defaultSets, sets, onSetsChange, done, onMarkDone, onUnmark, onBack }) {
  // Wheel sheet: { setIdx, field: 'weight' | 'reps' } | null
  const [picker, setPicker] = React.useState(null);

  // Initialize sets if missing
  React.useEffect(() => {
    if (!sets) {
      const init = Array.from({ length: defaultSets }, () => ({
        w: defaultWeight, r: defaultReps, done: false,
      }));
      onSetsChange(init);
    }
  }, []);
  const safeSets = sets || [];

  const updateSet = (idx, patch) => {
    const next = safeSets.map((s, i) => i === idx ? { ...s, ...patch } : s);
    onSetsChange(next);
  };
  const removeSet = (idx) => onSetsChange(safeSets.filter((_, i) => i !== idx));
  const addSet = () => {
    const last = safeSets[safeSets.length - 1] || { w: defaultWeight, r: defaultReps };
    onSetsChange([...safeSets, { w: last.w, r: last.r, done: false }]);
  };

  // Stats
  const totalVol = safeSets.reduce((a, s) => a + (s.w || 0) * (s.r || 0), 0);
  const totalReps = safeSets.reduce((a, s) => a + (s.r || 0), 0);

  // Compute prior best for PR detection
  const priorBest = React.useMemo(() => {
    let best = 0;
    SAMPLE_HISTORY.forEach(h => {
      h.items.forEach(it => {
        if (it.id === ex.id) {
          it.sets.forEach(s => { if (s.w > best) best = s.w; });
        }
      });
    });
    return best;
  }, [ex.id]);

  const lastPerf = React.useMemo(() => {
    for (const h of SAMPLE_HISTORY) {
      const item = h.items.find(it => it.id === ex.id);
      if (item) return { date: h.date, sets: item.sets };
    }
    return null;
  }, [ex.id]);

  const activeSet = picker ? safeSets[picker.setIdx] : null;
  const activeField = picker?.field;

  return (
    <React.Fragment>
      <div className="gt-header">
        <button className="gt-back" onClick={onBack} aria-label="Back">{GT_I.back({ s: 18 })}</button>
        <h1 style={{ fontSize: 20 }}>{ex.name}</h1>
        <button className="gt-back" aria-label="Info">{GT_I.info({ s: 16 })}</button>
      </div>
      <div className="gt-screen" style={{ position: 'relative' }}>
        {/* Exercise summary */}
        <div style={{ padding: '14px 20px 8px' }}>
          <div className="gt-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="gt-ex-thumb" style={{ width: 56, height: 56 }}>
              <ExIllust kind={ex.kind} size={46} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                {ex.equip} · {ex.target}
              </div>
            </div>
            <button className="gt-back" aria-label="View details">{GT_I.link({ s: 14 })}</button>
          </div>
        </div>

        {/* Stat row */}
        <div className="gt-stats">
          <StatTile label="Sets" value={safeSets.length} />
          <StatTile label="Reps" value={totalReps} />
          <StatTile label="Volume" value={totalVol.toLocaleString()} unit={unit} />
        </div>

        {/* PR / Last */}
        <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {priorBest > 0 && (
            <span className="gt-pill gt-pill-pr">
              {GT_I.trophy({ s: 12 })} PR {priorBest} {unit}
            </span>
          )}
          {lastPerf && (
            <span className="gt-pill gt-pill-ghost">
              Last: {lastPerf.sets.map(s => `${s.w}×${s.r}`).join(' · ')}
            </span>
          )}
        </div>

        {/* Sets */}
        <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {safeSets.map((s, i) => (
            <SetRow
              key={i}
              idx={i}
              set={s}
              unit={unit}
              isPR={s.done && s.w >= priorBest && s.w > 0}
              activeField={picker?.setIdx === i ? picker.field : null}
              onTapField={(field) => setPicker({ setIdx: i, field })}
              onToggleDone={() => updateSet(i, { done: !s.done })}
              onRemove={() => removeSet(i)}
            />
          ))}

          <button className="gt-btn gt-btn-dashed" onClick={addSet}>
            {GT_I.plus({ s: 16 })} Add set
          </button>
        </div>

        {/* CTA */}
        <div className="gt-cta-bar">
          {done ? (
            <button className="gt-btn gt-btn-ghost" onClick={onUnmark}>
              {GT_I.check({ s: 18 })} Done · undo
            </button>
          ) : (
            <button className="gt-btn gt-btn-primary" onClick={onMarkDone}>
              {GT_I.check({ s: 18 })} Mark as done
            </button>
          )}
        </div>

        {/* Wheel sheet */}
        {picker && (
          <React.Fragment>
            <SheetBackdrop onDismiss={() => setPicker(null)} />
            {activeField === 'weight' ? (
              <RulerWheel
                key={`w-${picker.setIdx}`}
                title={`SET ${picker.setIdx + 1} · WEIGHT`}
                value={activeSet?.w ?? 0}
                onChange={(v) => updateSet(picker.setIdx, { w: v })}
                min={0} max={500} step={unit === 'kg' ? 2.5 : 5}
                unit={unit}
                quick={unit === 'kg' ? [-5, -2.5, 2.5, 5, 10] : [-10, -5, 5, 10, 25]}
                onDone={() => setPicker(null)}
              />
            ) : (
              <RulerWheel
                key={`r-${picker.setIdx}`}
                title={`SET ${picker.setIdx + 1} · REPS`}
                value={activeSet?.r ?? 0}
                onChange={(v) => updateSet(picker.setIdx, { r: v })}
                min={0} max={50} step={1}
                unit="reps"
                quick={[-2, -1, 1, 2, 5]}
                onDone={() => setPicker(null)}
              />
            )}
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
}

// ─── Set row ────────────────────────────────────────────────────────
function SetRow({ idx, set, unit, isPR, activeField, onTapField, onToggleDone, onRemove }) {
  return (
    <div className="gt-set" data-done={set.done ? '1' : '0'}>
      <div className="gt-set-num">
        {set.done ? GT_I.check({ s: 14 }) : (idx + 1)}
      </div>
      <div className="gt-set-fields">
        <button className="gt-set-field" data-active={activeField === 'weight' ? '1' : '0'} onClick={() => onTapField('weight')}>
          <div className="gt-set-field-lbl">Weight</div>
          <div className="gt-set-field-val">{set.w}<span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginLeft: 3 }}>{unit}</span></div>
        </button>
        <button className="gt-set-field" data-active={activeField === 'reps' ? '1' : '0'} onClick={() => onTapField('reps')}>
          <div className="gt-set-field-lbl">Reps</div>
          <div className="gt-set-field-val">{set.r}</div>
        </button>
      </div>
      {isPR && (
        <span className="gt-pill gt-pill-pr" style={{ height: 22, fontSize: 10, padding: '0 8px' }}>
          {GT_I.trophy({ s: 10 })} PR
        </span>
      )}
      <button className="gt-set-check" onClick={onToggleDone} aria-label="Toggle done">
        {GT_I.check({ s: 16 })}
      </button>
      <button className="gt-set-remove" onClick={onRemove} aria-label="Remove set">
        {GT_I.x({ s: 14 })}
      </button>
    </div>
  );
}

Object.assign(window, { WorkoutTab });
