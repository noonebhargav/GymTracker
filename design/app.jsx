/* ===================================================================
   GymTracker — Root app + Settings tab + Tweaks panel
   =================================================================== */

// Tweak defaults — host rewrites this on disk via __edit_mode_set_keys
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#d8fe3d",
  "theme": "dark",
  "density": "cozy"
}/*EDITMODE-END*/;

// Accent palette options for tweaks
const ACCENT_OPTIONS = [
  '#d8fe3d', // electric lime (default)
  '#ff5868', // alarm red
  '#5ec3ff', // electric blue
  '#ff8a3d', // dynamo orange
  '#c476ff', // ultra violet
];

function App() {
  const [tab, setTab] = React.useState('workout');
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // App settings — persisted in component state (would be localStorage in real app)
  const [unit, setUnit] = React.useState('lbs');
  const [mode, setMode] = React.useState('Skip');
  const [defaultSets, setDefaultSets] = React.useState(3);
  const [defaultWeight, setDefaultWeight] = React.useState(45);
  const [defaultReps, setDefaultReps] = React.useState(10);

  // Live workout session
  const [doneIds, setDoneIds] = React.useState(new Set(['bbp']));
  const [sessionSets, setSessionSets] = React.useState({
    bbp: [
      { w: 60, r: 12, done: true },
      { w: 45, r: 10, done: true },
      { w: 45, r: 10, done: true },
    ],
  });

  const onMarkDone = (id) => setDoneIds(prev => new Set([...prev, id]));
  const onUnmark = (id) => setDoneIds(prev => {
    const n = new Set(prev); n.delete(id); return n;
  });
  const onSetsChange = (id, sets) => setSessionSets(prev => ({ ...prev, [id]: sets }));

  // Apply theme/density/accent
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', t.accent);
    // Compute soft variant — accent at low alpha
    const hex = t.accent.replace('#', '');
    const r = parseInt(hex.slice(0,2), 16), g = parseInt(hex.slice(2,4), 16), b = parseInt(hex.slice(4,6), 16);
    root.style.setProperty('--accent-soft', `rgba(${r},${g},${b},0.16)`);
    // Choose accent-ink based on luminance
    const lum = (r*299 + g*587 + b*114) / 1000;
    root.style.setProperty('--accent-ink', lum > 160 ? '#0a0b0d' : '#fff');
  }, [t.accent]);

  const themeCls = t.theme === 'light' ? 'theme-light' : '';
  const densityCls = `density-${t.density || 'cozy'}`;

  return (
    <React.Fragment>
      <div className={`gt-app ${themeCls} ${densityCls}`} style={{ position: 'relative' }}>
        {tab === 'workout' && (
          <WorkoutTab
            unit={unit}
            defaultWeight={defaultWeight}
            defaultReps={defaultReps}
            defaultSets={defaultSets}
            doneIds={doneIds}
            onMarkDone={onMarkDone}
            onUnmark={onUnmark}
            sessionSets={sessionSets}
            onSetsChange={onSetsChange}
          />
        )}
        {tab === 'routine' && <RoutineTab />}
        {tab === 'explore' && <ExploreTab />}
        {tab === 'history' && <HistoryTab unit={unit} />}
        {tab === 'settings' && (
          <SettingsTab
            unit={unit} setUnit={setUnit}
            mode={mode} setMode={setMode}
            defaultSets={defaultSets} setDefaultSets={setDefaultSets}
            defaultWeight={defaultWeight} setDefaultWeight={setDefaultWeight}
            defaultReps={defaultReps} setDefaultReps={setDefaultReps}
            theme={t.theme} setTheme={(v) => setTweak('theme', v)}
            accent={t.accent} setAccent={(v) => setTweak('accent', v)}
          />
        )}
        <BottomNav tab={tab} onTab={setTab} />
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakRadio
          label="Mode"
          value={t.theme}
          options={['light', 'dark']}
          onChange={(v) => setTweak('theme', v)}
        />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={ACCENT_OPTIONS}
          onChange={(v) => setTweak('accent', v)}
        />
        <TweakSection label="Layout" />
        <TweakRadio
          label="Density"
          value={t.density}
          options={['compact', 'cozy', 'spacious']}
          onChange={(v) => setTweak('density', v)}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

// ─── Settings tab ───────────────────────────────────────────────────
function SettingsTab({
  unit, setUnit, mode, setMode,
  defaultSets, setDefaultSets,
  defaultWeight, setDefaultWeight,
  defaultReps, setDefaultReps,
  theme, setTheme, accent, setAccent,
}) {
  return (
    <React.Fragment>
      <div className="gt-header">
        <h1>Settings</h1>
      </div>
      <div className="gt-screen">
        <div style={{ padding: '12px 20px 0' }}>
          {/* GENERAL */}
          <div className="gt-eyebrow" style={{ marginBottom: 8 }}>General</div>
          <div className="gt-card" style={{ padding: '4px 16px' }}>
            <div className="gt-srow">
              <div className="gt-srow-l">Units</div>
              <Seg value={unit} onChange={setUnit} options={[
                { value: 'lbs', label: 'Lbs' },
                { value: 'kg', label: 'Kg' },
              ]} />
            </div>
            <div className="gt-srow">
              <div className="gt-srow-l">Quick-add mode</div>
              <Seg value={mode} onChange={setMode} options={[
                { value: 'Skip', label: 'Skip' },
                { value: 'Queue', label: 'Queue' },
              ]} />
            </div>
          </div>

          {/* DEFAULTS */}
          <div className="gt-eyebrow" style={{ margin: '24px 0 8px' }}>Defaults</div>
          <div className="gt-card" style={{ padding: '4px 16px' }}>
            <div className="gt-srow">
              <div className="gt-srow-l">Sets</div>
              <Stepper value={defaultSets} onChange={setDefaultSets} min={1} max={10} />
            </div>
            <div className="gt-srow">
              <div className="gt-srow-l">Starting weight</div>
              <span className="gt-num" style={{ fontSize: 16 }}>{defaultWeight}<span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginLeft: 3 }}>{unit}</span></span>
            </div>
            <div className="gt-srow">
              <div className="gt-srow-l">Starting reps</div>
              <span className="gt-num" style={{ fontSize: 16 }}>{defaultReps}</span>
            </div>
          </div>

          {/* APPEARANCE */}
          <div className="gt-eyebrow" style={{ margin: '24px 0 8px' }}>Appearance</div>
          <div className="gt-card" style={{ padding: '4px 16px' }}>
            <div className="gt-srow">
              <div className="gt-srow-l">Theme</div>
              <Seg value={theme} onChange={setTheme} options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]} />
            </div>
            <div className="gt-srow" style={{ alignItems: 'flex-start' }}>
              <div className="gt-srow-l" style={{ paddingTop: 4 }}>Accent</div>
              <div className="gt-accent-row">
                {ACCENT_OPTIONS.map(c => (
                  <button key={c} className="gt-accent-dot"
                          data-on={c === accent ? '1' : '0'}
                          style={{ background: c, color: c }}
                          onClick={() => setAccent(c)} />
                ))}
              </div>
            </div>
          </div>

          {/* ABOUT */}
          <div className="gt-eyebrow" style={{ margin: '24px 0 8px' }}>About</div>
          <div className="gt-card" style={{ padding: '4px 16px' }}>
            <div className="gt-srow">
              <div className="gt-srow-l">Version</div>
              <span style={{ color: 'var(--text-3)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>2.4.0</span>
            </div>
            <div className="gt-srow">
              <div className="gt-srow-l">Export workout data</div>
              <span style={{ color: 'var(--text-3)' }}>{GT_I.fwd({ s: 16 })}</span>
            </div>
          </div>

          {/* DANGER */}
          <div className="gt-eyebrow" style={{ margin: '24px 0 8px', color: 'var(--danger)' }}>Danger zone</div>
          <button className="gt-btn gt-btn-danger" style={{ marginBottom: 20 }}>
            {GT_I.trash({ s: 16 })} Reset all data
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

function Stepper({ value, onChange, min = 0, max = 99, step = 1 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button className="gt-back" onClick={() => onChange(Math.max(min, value - step))} aria-label="Decrease">
        {GT_I.minus({ s: 14 })}
      </button>
      <span className="gt-num" style={{ fontSize: 16, minWidth: 16, textAlign: 'center' }}>{value}</span>
      <button className="gt-back" onClick={() => onChange(Math.min(max, value + step))} aria-label="Increase">
        {GT_I.plus({ s: 14 })}
      </button>
    </div>
  );
}

function Stage() {
  // Cap height to viewport so the device fits.
  const [h, setH] = React.useState(() => Math.min(892, window.innerHeight - 48));
  React.useEffect(() => {
    const onR = () => setH(Math.min(892, window.innerHeight - 48));
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);
  return (
    <AndroidDevice width={412} height={h} dark={true}>
      <App />
    </AndroidDevice>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Stage />);
