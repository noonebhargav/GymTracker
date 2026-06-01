// Pure date/day helpers shared across the data layer and UI (no React deps).

// Format a Date as a local-timezone YYYY-MM-DD string.
export function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Map JS Date.getDay() (Sunday = 0) to our app convention (Monday = 0).
export function mapJsDayToOur(jsDay: number): number {
  return (jsDay + 6) % 7;
}
