/* ===================================================================
   GymTracker — Shared UI components
   =================================================================== */

// ─── ScreenHeader ───────────────────────────────────────────────────
function ScreenHeader({ title, onBack, right }) {
  return (
    <div className="gt-header">
      {onBack && (
        <button className="gt-back" onClick={onBack} aria-label="Back">
          {GT_I.back({ s: 18 })}
        </button>
      )}
      <h1>{title}</h1>
      {right}
    </div>
  );
}

// ─── Chip ───────────────────────────────────────────────────────────
function Chip({ on, onClick, children, tone }) {
  return (
    <button className="gt-chip" data-on={on ? '1' : '0'} data-tone={tone || ''} onClick={onClick}>
      {children}
    </button>
  );
}

// ─── Search bar ─────────────────────────────────────────────────────
function SearchBar({ value, onChange, placeholder = 'Search exercises…' }) {
  return (
    <div className="gt-search">
      {GT_I.search({ s: 18 })}
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

// ─── Exercise list row ──────────────────────────────────────────────
function ExerciseRow({ ex, onClick, badge, right }) {
  return (
    <button className="gt-ex-row gt-tap" onClick={onClick}>
      <div className="gt-ex-thumb">
        <ExIllust kind={ex.kind} size={42} />
      </div>
      <div className="gt-ex-meta">
        <h3 className="gt-ex-name">{ex.name}</h3>
        <p className="gt-ex-sub">{ex.equip} · {capitalize(ex.body)}</p>
      </div>
      {badge}
      {right ?? <span style={{ color: 'var(--text-3)' }}>{GT_I.fwd({ s: 16 })}</span>}
    </button>
  );
}
function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }

// ─── BottomNav ──────────────────────────────────────────────────────
function BottomNav({ tab, onTab }) {
  const tabs = [
    ['workout', 'Workout', GT_I.workout],
    ['routine', 'Routine', GT_I.routine],
    ['explore', 'Explore', GT_I.explore],
    ['history', 'History', GT_I.history],
    ['settings', 'Settings', GT_I.settings],
  ];
  return (
    <div className="gt-tabbar">
      {tabs.map(([id, label, icon]) => (
        <button key={id} className="gt-tab" data-on={tab === id ? '1' : '0'} onClick={() => onTab(id)}>
          {icon({ s: 22 })}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Ruler / scroll-wheel picker ────────────────────────────────────
// Horizontal ruler with tick marks. Snap-to-step on scroll, big value above.
function RulerWheel({
  value, onChange, min = 0, max = 500, step = 5, unit = 'lbs',
  title = 'WEIGHT', quick = null, onDone,
}) {
  const stripRef = React.useRef(null);
  const TICK_W = 12;
  const [internal, setInternal] = React.useState(value);
  const lastFireRef = React.useRef(value);

  // ticks: every `step` value between min..max, major every 5 steps
  const ticks = React.useMemo(() => {
    const arr = [];
    for (let v = min; v <= max; v += step) {
      arr.push({ v, major: ((v - min) / step) % 5 === 0 });
    }
    return arr;
  }, [min, max, step]);

  // center the strip on `value` on mount + when value changes externally
  React.useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const idx = Math.round((value - min) / step);
    el.scrollLeft = idx * TICK_W;
    setInternal(value);
    lastFireRef.current = value;
  }, [value, min, step]);

  const handleScroll = () => {
    const el = stripRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / TICK_W);
    const v = Math.min(max, Math.max(min, min + idx * step));
    setInternal(v);
    if (v !== lastFireRef.current) {
      lastFireRef.current = v;
      onChange?.(v);
    }
  };

  return (
    <div className="gt-wheel-sheet" onClick={(e) => e.stopPropagation()}>
      <div className="gt-wheel-head">
        <span className="gt-wheel-title">{title}</span>
        <button className="gt-chip" data-on="1" style={{ height: 32 }} onClick={onDone}>
          Done
        </button>
      </div>
      <div className="gt-wheel-value">
        <span>{internal}</span>
        <small>{unit}</small>
      </div>
      <div className="gt-wheel-strip" ref={stripRef} onScroll={handleScroll}>
        <div className="gt-wheel-track" style={{ paddingLeft: 'calc(50% - 6px)', paddingRight: 'calc(50% - 6px)' }}>
          {ticks.map((t) => (
            <div key={t.v} className="gt-wheel-tick" data-major={t.major ? '1' : '0'}>
              {t.major && <span>{t.v}</span>}
              <i />
            </div>
          ))}
        </div>
        <div className="gt-wheel-pin" />
      </div>
      {quick && (
        <div className="gt-wheel-quick">
          {quick.map((q) => (
            <button key={q} onClick={() => {
              const next = Math.min(max, Math.max(min, internal + q));
              setInternal(next);
              const el = stripRef.current;
              if (el) {
                const idx = Math.round((next - min) / step);
                el.scrollLeft = idx * TICK_W;
              }
              onChange?.(next);
            }}>
              {q > 0 ? `+${q}` : q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Modal-ish overlay backdrop for the wheel sheet ─────────────────
function SheetBackdrop({ onDismiss }) {
  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        zIndex: 9,
        animation: 'gt-fade 0.18s ease-out',
      }}
    />
  );
}

// ─── Empty state ────────────────────────────────────────────────────
function EmptyState({ icon, title, sub, cta }) {
  return (
    <div style={{
      padding: '48px 32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 12,
    }}>
      <div style={{
        width: 56, height: 56,
        borderRadius: 16,
        background: 'var(--surface-2)',
        display: 'grid', placeItems: 'center',
        color: 'var(--text-3)',
      }}>{icon}</div>
      <div className="gt-display" style={{ fontSize: 18 }}>{title}</div>
      {sub && <div style={{ color: 'var(--text-3)', fontSize: 14, lineHeight: 1.5, maxWidth: 260 }}>{sub}</div>}
      {cta}
    </div>
  );
}

// ─── Stat tile ──────────────────────────────────────────────────────
function StatTile({ label, value, unit, trend }) {
  return (
    <div className="gt-stat">
      <div className="lbl">{label}</div>
      <div className="val">
        {value}
        {unit && <small>{unit}</small>}
      </div>
      {trend != null && (
        <div style={{
          marginTop: 6, fontSize: 11, fontWeight: 600,
          color: trend >= 0 ? 'var(--success)' : 'var(--danger)',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {GT_I.trend({ s: 12 })}
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  );
}

// ─── Segmented control ──────────────────────────────────────────────
function Seg({ value, options, onChange }) {
  return (
    <div className="gt-seg">
      {options.map((o) => (
        <button key={o.value} data-on={o.value === value ? '1' : '0'} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

Object.assign(window, {
  ScreenHeader, Chip, SearchBar, ExerciseRow, BottomNav,
  RulerWheel, SheetBackdrop, EmptyState, StatTile, Seg, capitalize,
});
