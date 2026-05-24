/* ===================================================================
   GymTracker — Realistic seed data + shared icon set
   =================================================================== */

// ─── Icons ──────────────────────────────────────────────────────────
const I = {
  arrow: (p={}) => (
    <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 6l-6 6 6 6"/>
    </svg>
  ),
  back: (p={}) => I.arrow(p),
  fwd: (p={}) => (
    <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6"/>
    </svg>
  ),
  search: (p={}) => (
    <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
    </svg>
  ),
  check: (p={}) => (
    <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7"/>
    </svg>
  ),
  plus: (p={}) => (
    <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  minus: (p={}) => (
    <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14"/></svg>
  ),
  x: (p={}) => (
    <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
  ),
  trash: (p={}) => (
    <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13"/>
    </svg>
  ),
  workout: (p={}) => (
    <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h2M19 12h2M7 6v12M17 6v12M11 9v6M13 9v6"/>
    </svg>
  ),
  routine: (p={}) => (
    <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2"/>
      <path d="M16 3v4M8 3v4M3 11h18"/>
    </svg>
  ),
  explore: (p={}) => (
    <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
    </svg>
  ),
  history: (p={}) => (
    <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
    </svg>
  ),
  settings: (p={}) => (
    <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3 1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8 1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>
    </svg>
  ),
  trend: (p={}) => (
    <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>
    </svg>
  ),
  trophy: (p={}) => (
    <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h12v4a6 6 0 11-12 0V4z"/>
      <path d="M6 6H3v2a3 3 0 003 3M18 6h3v2a3 3 0 01-3 3M9 18h6M10 14v4M14 14v4M8 22h8"/>
    </svg>
  ),
  flame: (p={}) => (
    <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2s4 4 4 9a4 4 0 11-8 0c0-2 1-3 1-3s-3 1-3 6a6 6 0 1012 0c0-7-6-12-6-12z"/>
    </svg>
  ),
  link: (p={}) => (
    <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4h6v6M10 14L20 4M20 14v6h-6M4 10V4h6"/>
    </svg>
  ),
  caretDown: (p={}) => (
    <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6"/></svg>
  ),
  info: (p={}) => (
    <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>
    </svg>
  ),
};

// ─── Exercise illustration placeholder ──────────────────────────────
// Stylized icon representing the equipment, since we don't have the
// existing anatomical sketches in-project.
function ExIllust({ kind, size = 52, tone = 'default' }) {
  const stroke = tone === 'invert' ? '#0a0b0d' : 'currentColor';
  const muscle = '#ff5868';
  const W = size, H = size, vb = 64;
  const svgs = {
    barbell: (
      <svg viewBox="0 0 64 64" width={W} height={H} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 32h52" />
        <rect x="10" y="22" width="6" height="20" rx="1"/>
        <rect x="48" y="22" width="6" height="20" rx="1"/>
        <rect x="18" y="26" width="3" height="12" rx="1"/>
        <rect x="43" y="26" width="3" height="12" rx="1"/>
        <circle cx="32" cy="32" r="3" fill={muscle} stroke="none" opacity="0.85"/>
      </svg>
    ),
    dumbbell: (
      <svg viewBox="0 0 64 64" width={W} height={H} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 32h20"/>
        <rect x="10" y="22" width="6" height="20" rx="1"/>
        <rect x="16" y="26" width="4" height="12" rx="1"/>
        <rect x="44" y="26" width="4" height="12" rx="1"/>
        <rect x="48" y="22" width="6" height="20" rx="1"/>
        <circle cx="32" cy="32" r="2.5" fill={muscle} stroke="none" opacity="0.85"/>
      </svg>
    ),
    cable: (
      <svg viewBox="0 0 64 64" width={W} height={H} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 6v10"/>
        <circle cx="32" cy="20" r="4"/>
        <path d="M32 24c-3 8-12 14-12 22M32 24c3 8 12 14 12 22"/>
        <rect x="14" y="46" width="14" height="6" rx="1.5" fill={muscle} stroke="none" opacity="0.85"/>
        <rect x="36" y="46" width="14" height="6" rx="1.5" fill={muscle} stroke="none" opacity="0.85"/>
      </svg>
    ),
    body: (
      <svg viewBox="0 0 64 64" width={W} height={H} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="32" cy="14" r="6"/>
        <path d="M22 26h20l-4 16h-12z" fill={muscle} fillOpacity="0.7" stroke={stroke}/>
        <path d="M26 42l-4 14M38 42l4 14M20 26l-8 12M44 26l8 12"/>
      </svg>
    ),
    machine: (
      <svg viewBox="0 0 64 64" width={W} height={H} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="10" y="14" width="44" height="36" rx="3"/>
        <path d="M22 28h20M22 36h20"/>
        <circle cx="32" cy="22" r="3" fill={muscle} stroke="none" opacity="0.85"/>
      </svg>
    ),
    band: (
      <svg viewBox="0 0 64 64" width={W} height={H} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 20q22 -8 44 0M10 32q22 -8 44 0M10 44q22 -8 44 0" stroke={muscle} opacity="0.8"/>
      </svg>
    ),
    cardio: (
      <svg viewBox="0 0 64 64" width={W} height={H} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 38h10l4-12 6 24 6-18 4 6h18" stroke={muscle}/>
      </svg>
    ),
    kettle: (
      <svg viewBox="0 0 64 64" width={W} height={H} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 16q8 -6 16 0M22 18h20l4 30q-14 6 -28 0z" fill={muscle} fillOpacity="0.7" stroke={stroke}/>
      </svg>
    ),
  };
  return svgs[kind] || svgs.body;
}

// ─── Body parts taxonomy ────────────────────────────────────────────
const BODY_PARTS = [
  { id: 'chest',    name: 'Chest',    count: 163, tint: '#ff5868' },
  { id: 'back',     name: 'Back',     count: 203, tint: '#5ec3ff' },
  { id: 'shoulders',name: 'Shoulders',count: 143, tint: '#ffb84d' },
  { id: 'biceps',   name: 'Biceps',   count: 151, tint: '#c476ff' },
  { id: 'triceps',  name: 'Triceps',  count: 141, tint: '#ff8556' },
  { id: 'legs',     name: 'Legs',     count: 286, tint: '#6ce39a' },
  { id: 'core',     name: 'Core/Abs', count: 169, tint: '#ffd454' },
  { id: 'cardio',   name: 'Cardio',   count:  29, tint: '#ff70a8' },
];

const EQUIPMENT = [
  { id: 'body',   name: 'Body Weight',    count: 325, kind: 'body' },
  { id: 'dumb',   name: 'Dumbbell',       count: 294, kind: 'dumbbell' },
  { id: 'cable',  name: 'Cable',          count: 157, kind: 'cable' },
  { id: 'bar',    name: 'Barbell',        count: 154, kind: 'barbell' },
  { id: 'mach',   name: 'Leverage Machine',count: 81, kind: 'machine' },
  { id: 'band',   name: 'Band',           count:  54, kind: 'band' },
  { id: 'smith',  name: 'Smith Machine',  count:  42, kind: 'machine' },
  { id: 'kettle', name: 'Kettlebell',     count:  68, kind: 'kettle' },
];

// ─── Exercises ──────────────────────────────────────────────────────
const EXERCISES = [
  // Chest
  { id: 'bbp', name: 'Barbell Bench Press', body: 'chest', equip: 'Barbell', kind: 'barbell', target: 'Pectorals', secondary: ['Triceps', 'Shoulders'] },
  { id: 'idp', name: 'Incline Dumbbell Press', body: 'chest', equip: 'Dumbbell', kind: 'dumbbell', target: 'Upper Pectorals', secondary: ['Triceps', 'Shoulders'] },
  { id: 'cfly', name: 'Cable Chest Fly', body: 'chest', equip: 'Cable', kind: 'cable', target: 'Pectorals', secondary: ['Shoulders'] },
  { id: 'pup', name: 'Push-Up', body: 'chest', equip: 'Body Weight', kind: 'body', target: 'Pectorals', secondary: ['Triceps', 'Core'] },
  { id: 'apu', name: 'Archer Push Up', body: 'chest', equip: 'Body Weight', kind: 'body', target: 'Pectorals', secondary: ['Triceps', 'Shoulders', 'Core'] },
  { id: 'dip', name: 'Chest Dip', body: 'chest', equip: 'Body Weight', kind: 'body', target: 'Lower Pectorals', secondary: ['Triceps'] },
  { id: 'dbf', name: 'Dumbbell Fly', body: 'chest', equip: 'Dumbbell', kind: 'dumbbell', target: 'Pectorals', secondary: ['Shoulders'] },
  // Back
  { id: 'pullup', name: 'Pull-Up', body: 'back', equip: 'Body Weight', kind: 'body', target: 'Lats', secondary: ['Biceps', 'Forearms'] },
  { id: 'bbdl', name: 'Barbell Deadlift', body: 'back', equip: 'Barbell', kind: 'barbell', target: 'Erector Spinae', secondary: ['Glutes', 'Hamstrings', 'Lats'] },
  { id: 'bor', name: 'Bent-Over Row', body: 'back', equip: 'Barbell', kind: 'barbell', target: 'Lats', secondary: ['Rhomboids', 'Biceps'] },
  { id: 'lpd', name: 'Lat Pulldown', body: 'back', equip: 'Cable', kind: 'cable', target: 'Lats', secondary: ['Biceps'] },
  { id: 'scr', name: 'Seated Cable Row', body: 'back', equip: 'Cable', kind: 'cable', target: 'Rhomboids', secondary: ['Lats', 'Biceps'] },
  // Shoulders
  { id: 'ohp', name: 'Overhead Press', body: 'shoulders', equip: 'Barbell', kind: 'barbell', target: 'Deltoids', secondary: ['Triceps', 'Upper Chest'] },
  { id: 'lat', name: 'Lateral Raise', body: 'shoulders', equip: 'Dumbbell', kind: 'dumbbell', target: 'Lateral Delts', secondary: [] },
  { id: 'fp', name: 'Face Pull', body: 'shoulders', equip: 'Cable', kind: 'cable', target: 'Rear Delts', secondary: ['Rhomboids'] },
  // Biceps
  { id: 'bbc', name: 'Barbell Curl', body: 'biceps', equip: 'Barbell', kind: 'barbell', target: 'Biceps', secondary: ['Forearms'] },
  { id: 'dbc', name: 'Dumbbell Curl', body: 'biceps', equip: 'Dumbbell', kind: 'dumbbell', target: 'Biceps', secondary: ['Forearms'] },
  { id: 'ham', name: 'Hammer Curl', body: 'biceps', equip: 'Dumbbell', kind: 'dumbbell', target: 'Brachialis', secondary: ['Forearms'] },
  // Triceps
  { id: 'tpd', name: 'Tricep Pushdown', body: 'triceps', equip: 'Cable', kind: 'cable', target: 'Triceps', secondary: [] },
  { id: 'sku', name: 'Skull Crusher', body: 'triceps', equip: 'Barbell', kind: 'barbell', target: 'Triceps', secondary: [] },
  // Legs
  { id: 'sqt', name: 'Back Squat', body: 'legs', equip: 'Barbell', kind: 'barbell', target: 'Quads', secondary: ['Glutes', 'Hamstrings', 'Core'] },
  { id: 'rdl', name: 'Romanian Deadlift', body: 'legs', equip: 'Barbell', kind: 'barbell', target: 'Hamstrings', secondary: ['Glutes', 'Erector Spinae'] },
  { id: 'lpr', name: 'Leg Press', body: 'legs', equip: 'Leverage Machine', kind: 'machine', target: 'Quads', secondary: ['Glutes'] },
  { id: 'lec', name: 'Leg Curl', body: 'legs', equip: 'Leverage Machine', kind: 'machine', target: 'Hamstrings', secondary: [] },
  // Core
  { id: 'plk', name: 'Plank', body: 'core', equip: 'Body Weight', kind: 'body', target: 'Core', secondary: ['Shoulders'] },
  { id: 'hlr', name: 'Hanging Leg Raise', body: 'core', equip: 'Body Weight', kind: 'body', target: 'Lower Abs', secondary: ['Hip Flexors'] },
  // Cardio
  { id: 'run', name: 'Treadmill Run', body: 'cardio', equip: 'Cardio', kind: 'cardio', target: 'Cardio', secondary: [] },
  { id: 'row', name: 'Rowing Machine', body: 'cardio', equip: 'Cardio', kind: 'cardio', target: 'Cardio', secondary: ['Back', 'Legs'] },
];

const INSTRUCTIONS = {
  bbp: [
    'Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.',
    'Grasp the barbell with an overhand grip slightly wider than shoulder-width apart.',
    'Lift the barbell off the rack and hold it directly above your chest with arms fully extended.',
    'Lower the barbell slowly towards your chest, keeping your elbows tucked at ~75°.',
    'Pause for a moment when the barbell touches your chest.',
    'Push the barbell back up to the starting position by extending your arms.',
    'Repeat for the desired number of repetitions.',
  ],
  apu: [
    'Start in a push-up position with your hands slightly wider than shoulder-width apart.',
    'Extend one arm straight out to the side, parallel to the ground.',
    'Lower your body by bending your elbows, keeping your back straight and core engaged.',
    'Push back up to the starting position.',
    'Repeat on the other side, extending the opposite arm.',
    'Continue alternating sides for the desired repetitions.',
  ],
};
const stepsFor = (id) => INSTRUCTIONS[id] || INSTRUCTIONS.bbp;

// ─── Sample workout / set state ─────────────────────────────────────
//   Last completed: Sun May 24 — Chest day, Barbell Bench Press
//   3 sets done. Today is the same date in app context.
const TODAY = new Date(2026, 4, 24); // May 24 2026 (Sun)

const SAMPLE_HISTORY = [
  // [date, body, sets[{exId, weight, reps}]]
  { date: '2026-05-24', body: ['chest'], items: [
    { id: 'bbp', sets: [{w:60,r:12},{w:45,r:10},{w:45,r:10}] },
  ]},
  { date: '2026-05-22', body: ['back'], items: [
    { id: 'bbdl', sets: [{w:185,r:5},{w:205,r:5},{w:225,r:3}] },
    { id: 'lpd', sets: [{w:110,r:10},{w:110,r:10},{w:120,r:8}] },
    { id: 'scr', sets: [{w:90,r:12},{w:100,r:10},{w:100,r:10}] },
  ]},
  { date: '2026-05-20', body: ['legs'], items: [
    { id: 'sqt', sets: [{w:135,r:8},{w:155,r:8},{w:175,r:6},{w:175,r:5}] },
    { id: 'rdl', sets: [{w:135,r:10},{w:155,r:8},{w:155,r:8}] },
    { id: 'lpr', sets: [{w:225,r:12},{w:270,r:10},{w:315,r:8}] },
  ]},
  { date: '2026-05-19', body: ['chest','shoulders'], items: [
    { id: 'bbp', sets: [{w:65,r:8,pr:true},{w:50,r:9},{w:45,r:12},{w:45,r:10}] },
    { id: 'idp', sets: [{w:40,r:10},{w:40,r:10},{w:35,r:12}] },
    { id: 'lat', sets: [{w:15,r:15},{w:15,r:15},{w:12,r:15}] },
  ]},
  { date: '2026-05-17', body: ['back','biceps'], items: [
    { id: 'pullup', sets: [{w:0,r:8},{w:0,r:7},{w:0,r:6}] },
    { id: 'bor', sets: [{w:115,r:10},{w:115,r:10},{w:135,r:8}] },
    { id: 'dbc', sets: [{w:25,r:12},{w:25,r:10},{w:25,r:10}] },
  ]},
  { date: '2026-05-15', body: ['legs'], items: [
    { id: 'sqt', sets: [{w:135,r:8},{w:155,r:8},{w:165,r:6}] },
    { id: 'lec', sets: [{w:80,r:12},{w:90,r:10},{w:90,r:10}] },
  ]},
  { date: '2026-05-13', body: ['chest'], items: [
    { id: 'bbp', sets: [{w:60,r:10},{w:60,r:8},{w:45,r:10}] },
    { id: 'cfly', sets: [{w:30,r:12},{w:30,r:12},{w:35,r:10}] },
  ]},
  { date: '2026-05-12', body: ['shoulders'], items: [
    { id: 'ohp', sets: [{w:75,r:8},{w:85,r:6},{w:85,r:5}] },
    { id: 'lat', sets: [{w:12,r:15},{w:15,r:12},{w:15,r:12}] },
  ]},
  { date: '2026-05-10', body: ['back'], items: [
    { id: 'bbdl', sets: [{w:185,r:5},{w:205,r:3},{w:205,r:3}] },
  ]},
  { date: '2026-05-08', body: ['biceps','triceps'], items: [
    { id: 'bbc', sets: [{w:60,r:10},{w:65,r:8},{w:65,r:8}] },
    { id: 'tpd', sets: [{w:50,r:12},{w:60,r:10},{w:60,r:10}] },
  ]},
];

// ─── Pre-built routines ─────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'ppl', tag: 'POPULAR',
    name: 'Push · Pull · Legs', tagline: '6-day split for hypertrophy',
    days: 6, exercises: 21, level: 'Intermediate',
    desc: 'Classic split that hits each muscle group twice a week. Push days, pull days, leg days — rinse and repeat.',
    blocks: [
      { day: 'Push A', focus: ['chest','shoulders','triceps'] },
      { day: 'Pull A', focus: ['back','biceps'] },
      { day: 'Legs A', focus: ['legs','core'] },
      { day: 'Push B', focus: ['chest','shoulders','triceps'] },
      { day: 'Pull B', focus: ['back','biceps'] },
      { day: 'Legs B', focus: ['legs','core'] },
    ],
  },
  {
    id: 'ul4', tag: 'BALANCED',
    name: 'Upper / Lower', tagline: '4-day strength + size',
    days: 4, exercises: 16, level: 'Beginner+',
    desc: 'Four sessions a week, alternating upper and lower. Excellent for building a foundation.',
    blocks: [
      { day: 'Upper A', focus: ['chest','back','shoulders'] },
      { day: 'Lower A', focus: ['legs','core'] },
      { day: 'Upper B', focus: ['back','chest','biceps','triceps'] },
      { day: 'Lower B', focus: ['legs','core'] },
    ],
  },
  {
    id: 'fb3', tag: 'TIME-SAVER',
    name: 'Full Body × 3', tagline: '3-day, hits everything',
    days: 3, exercises: 12, level: 'Beginner',
    desc: 'Three full-body sessions a week. Great for busy schedules — get in, hit every part, get out.',
    blocks: [
      { day: 'Workout A', focus: ['legs','chest','back'] },
      { day: 'Workout B', focus: ['back','shoulders','core'] },
      { day: 'Workout C', focus: ['legs','chest','biceps'] },
    ],
  },
  {
    id: 'br5', tag: 'STRENGTH',
    name: '5×5 Strength', tagline: 'Heavy compounds, 3 days',
    days: 3, exercises: 5, level: 'Beginner',
    desc: 'Five sets of five reps on the big lifts. Linear progression that builds raw strength fast.',
    blocks: [
      { day: 'Workout A', focus: ['legs','chest'] },
      { day: 'Workout B', focus: ['legs','back','shoulders'] },
    ],
  },
  {
    id: 'arn6', tag: 'CLASSIC',
    name: 'Arnold Split', tagline: '6-day bodybuilder split',
    days: 6, exercises: 24, level: 'Advanced',
    desc: 'Chest/back, shoulders/arms, legs — twice a week. High volume, classic golden-era bodybuilding.',
    blocks: [
      { day: 'Chest & Back', focus: ['chest','back'] },
      { day: 'Shoulders & Arms', focus: ['shoulders','biceps','triceps'] },
      { day: 'Legs', focus: ['legs','core'] },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────
function fmtDate(iso, opts = {}) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: opts.weekday, month: 'short', day: 'numeric', year: opts.year });
}
function dayOfMonth(iso) { return new Date(iso + 'T00:00:00').getDate(); }
function exerciseById(id) { return EXERCISES.find(e => e.id === id); }

// Aggregate volume per body part (last 7 days)
function recoveryHeat() {
  const m = {};
  BODY_PARTS.forEach(b => m[b.id] = 0);
  const cutoff = new Date('2026-05-17');
  SAMPLE_HISTORY.forEach(h => {
    if (new Date(h.date + 'T00:00:00') < cutoff) return;
    h.items.forEach(item => {
      const ex = exerciseById(item.id);
      if (!ex) return;
      const vol = item.sets.reduce((a, s) => a + (s.w || 1) * s.r, 0);
      m[ex.body] = (m[ex.body] || 0) + vol;
    });
  });
  const max = Math.max(...Object.values(m), 1);
  return BODY_PARTS.map(b => ({ ...b, vol: m[b.id] || 0, heat: (m[b.id] || 0) / max }));
}

// Weekly volume series — last 12 weeks
function weeklyVolume() {
  const weeks = [];
  // Roll back 12 weeks ending the week of May 24
  const end = new Date('2026-05-24');
  for (let w = 11; w >= 0; w--) {
    const start = new Date(end); start.setDate(end.getDate() - w * 7 - 6);
    const stop = new Date(end);  stop.setDate(end.getDate() - w * 7);
    let v = 0;
    SAMPLE_HISTORY.forEach(h => {
      const d = new Date(h.date + 'T00:00:00');
      if (d >= start && d <= stop) {
        h.items.forEach(it => it.sets.forEach(s => v += (s.w || 0) * s.r));
      }
    });
    weeks.push({ start, stop, v });
  }
  return weeks;
}

Object.assign(window, {
  GT_I: I, ExIllust,
  BODY_PARTS, EQUIPMENT, EXERCISES, INSTRUCTIONS, stepsFor,
  SAMPLE_HISTORY, TEMPLATES, TODAY,
  fmtDate, dayOfMonth, exerciseById, recoveryHeat, weeklyVolume,
});
