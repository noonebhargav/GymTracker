import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useCSSVariable } from 'uniwind';
import { Trophy } from 'lucide-react-native';
import {
  getMonthlyAggregates,
  getBodyPartVolumes,
  getWindowPRs,
  displayWeight,
  formatVolume,
  type DayAggregateRow,
  type BodyPartVolumeRow,
  type WindowPRRow,
} from '@/lib/database';
import { GOLD_STANDARD_GROUPS, type GoldStandardGroup } from '@/lib/exercise-groups';
import { capitalizeWords } from '@/lib/utils';
import { useAccentHex } from '@/lib/accent-store';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace('#', '');
  const v = m.length === 3
    ? m.split('').map((c) => c + c).join('')
    : m;
  const n = parseInt(v, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgba({ r, g, b }: { r: number; g: number; b: number }, alpha: number): string {
  return `rgba(${r},${g},${b},${alpha})`;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function getMondayOfWeek(ds: string): string {
  const d = new Date(ds + 'T00:00:00');
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatShortDate(ds: string): string {
  const d = new Date(ds + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Mondays of every week that overlaps the given month (4–6 entries, ascending).
function buildMonthWeeks(year: number, month: number): string[] {
  const firstMonday = getMondayOfWeek(`${year}-${pad(month + 1)}-01`);
  const lastDay = `${year}-${pad(month + 1)}-${pad(new Date(year, month + 1, 0).getDate())}`;
  const weeks: string[] = [];
  let m = firstMonday;
  while (m <= lastDay) {
    weeks.push(m);
    m = addDays(m, 7);
  }
  return weeks;
}

interface InsightsTabProps {
  year: number;
  month: number;
  today: string;
  weightUnit: 'lbs' | 'kg';
}

export function InsightsTab({ year, month, today, weightUnit }: InsightsTabProps) {
  const db = useSQLiteContext();
  const accentHex = useAccentHex();
  const accentRgb = useMemo(() => hexToRgb(accentHex), [accentHex]);
  const secondaryBg = useCSSVariable('--color-secondary') as string | undefined;

  // --- Chart weeks for the selected month ---
  const weeks = useMemo(() => buildMonthWeeks(year, month), [year, month]);
  const chartStart = weeks[0];
  const chartEnd = useMemo(() => addDays(weeks[weeks.length - 1], 6), [weeks]);
  const monthStart = `${year}-${pad(month + 1)}-01`;
  const monthEnd = `${year}-${pad(month + 1)}-${pad(new Date(year, month + 1, 0).getDate())}`;

  // Which week's heatmap to show. null = default "last 7 days" from today.
  const [selectedMonday, setSelectedMonday] = useState<string | null>(null);
  useEffect(() => { setSelectedMonday(null); }, [year, month]);
  const heatmapStart = selectedMonday ?? addDays(today, -6);
  const heatmapEnd = selectedMonday ? addDays(selectedMonday, 6) : today;

  const [dailyAggs, setDailyAggs] = useState<DayAggregateRow[]>([]);
  const [bodyPartRows, setBodyPartRows] = useState<BodyPartVolumeRow[]>([]);
  const [prRows, setPrRows] = useState<WindowPRRow[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadStats = useCallback(async () => {
    const [aggs, prs] = await Promise.all([
      getMonthlyAggregates(db, chartStart, chartEnd),
      getWindowPRs(db, monthStart, monthEnd),
    ]);
    setDailyAggs(aggs);
    setPrRows(prs);
    setHasLoaded(true);
  }, [db, chartStart, chartEnd, monthStart, monthEnd]);

  const loadHeatmap = useCallback(async () => {
    const bpVolumes = await getBodyPartVolumes(db, heatmapStart, heatmapEnd);
    setBodyPartRows(bpVolumes);
    setHasLoaded(true);
  }, [db, heatmapStart, heatmapEnd]);

  // Two independent focus effects: each refetches on focus and only when its own
  // inputs change (month range for stats, selected-week range for the heatmap),
  // so a bar tap refetches the heatmap alone — never the stats.
  useFocusEffect(useCallback(() => { loadStats(); }, [loadStats]));
  useFocusEffect(useCallback(() => { loadHeatmap(); }, [loadHeatmap]));

  const weekVolumes = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of dailyAggs) {
      const mon = getMondayOfWeek(a.date_logged);
      map.set(mon, (map.get(mon) ?? 0) + a.volume);
    }
    return weeks.map((mon) => map.get(mon) ?? 0);
  }, [dailyAggs, weeks]);

  const chartMax = useMemo(() => Math.max(...weekVolumes, 1), [weekVolumes]);
  // Latest week in the month that has data drives the header number + delta.
  const lastIdx = useMemo(() => {
    for (let i = weekVolumes.length - 1; i >= 0; i--) {
      if (weekVolumes[i] > 0) return i;
    }
    return -1;
  }, [weekVolumes]);
  const lastWeekVolume = lastIdx >= 0 ? weekVolumes[lastIdx] : 0;
  const prevWeekVolume = lastIdx > 0 ? weekVolumes[lastIdx - 1] : 0;
  const delta = prevWeekVolume > 0 && lastWeekVolume > 0
    ? Math.round(((lastWeekVolume - prevWeekVolume) / prevWeekVolume) * 100)
    : null;

  // --- Heatmap data ---
  // Volume (Σ weight×reps) per Gold Standard group, set-weighted by summing across
  // every (body_part, target) row that maps into the group. Groups with sets but no
  // external load — cardio AND bodyweight work (weight 0, e.g. planks, pull-ups) —
  // have volume ~0, so they're shown by set count and kept out of the volume color
  // scale rather than misreporting as "Rest".
  const heatmapData = useMemo(() => {
    const grouped = new Map<string, { volume: number; setCount: number }>();
    for (const row of bodyPartRows) {
      const group = (GOLD_STANDARD_GROUPS as readonly string[]).includes(row.body_part)
        ? (row.body_part as GoldStandardGroup)
        : null;
      if (!group) continue;
      const existing = grouped.get(group) ?? { volume: 0, setCount: 0 };
      grouped.set(group, {
        volume: existing.volume + row.volume,
        setCount: existing.setCount + row.set_count,
      });
    }
    const cells = GOLD_STANDARD_GROUPS.map((group) => {
      const entry = grouped.get(group);
      const volume = entry?.volume ?? 0;
      const setCount = entry?.setCount ?? 0;
      return {
        group,
        volume,
        setCount,
        // Worked but with no measurable load → display by set count, not volume.
        countBased: volume === 0 && setCount > 0,
      };
    });
    // Color scale spans only groups that have real volume.
    const maxVolume = Math.max(...cells.filter((c) => c.volume > 0).map((c) => c.volume), 1);
    return cells.map((c) => ({
      ...c,
      // Count-based groups get a fixed faint tint; volume groups scale with load.
      intensity: c.countBased ? 0.35 : c.volume / maxVolume,
      active: c.volume > 0 || c.setCount > 0,
    }));
  }, [bodyPartRows]);

  const isEmpty =
    hasLoaded && dailyAggs.length === 0 && bodyPartRows.length === 0 && prRows.length === 0;

  if (isEmpty) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-base font-semibold text-foreground mb-1">No insights yet</Text>
        <Text className="text-sm text-muted-foreground text-center">
          Log a workout to start tracking your volume, body parts, and personal records.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 20 }}
    >
      {/* ── Chart ── */}
      <View className="bg-card border border-border rounded-xl p-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Weekly volume
          </Text>
          <View className="flex-row items-center gap-2">
            {lastWeekVolume > 0 && (
              <Text className="text-sm font-bold text-foreground">
                {formatVolume(lastWeekVolume, weightUnit)} {weightUnit}
              </Text>
            )}
            {delta !== null && (
              <View
                className="rounded-full px-2 py-0.5"
                style={{
                  backgroundColor: delta >= 0
                    ? rgba(accentRgb, 0.15)
                    : 'rgba(239,68,68,0.15)',
                }}
              >
                <Text
                  className="text-[10px] font-bold"
                  style={{ color: delta >= 0 ? accentHex : '#ef4444' }}
                >
                  {delta >= 0 ? '+' : ''}{delta}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bars — tap to inspect that week's body parts */}
        <View className="flex-row items-end gap-1" style={{ height: 100 }}>
          {weeks.map((mon, i) => {
            const vol = weekVolumes[i];
            const hasData = vol > 0;
            const barHeight = hasData ? Math.max(4, (vol / chartMax) * 96) : 4;
            const isSelected = selectedMonday === mon;
            const dimmed = selectedMonday !== null && !isSelected;
            return (
              <Pressable
                key={mon}
                onPress={() => setSelectedMonday((m) => (m === mon ? null : mon))}
                className="flex-1 items-center justify-end"
                style={{ height: 100 }}
                aria-label={`Week of ${formatShortDate(mon)}`}
              >
                <View
                  style={{ height: barHeight, borderRadius: 3 }}
                  className={`w-full ${
                    hasData ? (dimmed ? 'bg-primary/40' : 'bg-primary') : 'bg-secondary'
                  }`}
                />
              </Pressable>
            );
          })}
        </View>

        {/* X-axis labels — week-start day of month */}
        <View className="flex-row mt-1">
          {weeks.map((mon) => (
            <View key={mon} className="flex-1 items-center">
              <Text
                className={`text-[9px] ${
                  selectedMonday === mon ? 'text-foreground font-semibold' : 'text-muted-foreground'
                }`}
              >
                {Number(mon.slice(-2))}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Heatmap ── */}
      <View className="bg-card border border-border rounded-xl p-4">
        <View className="flex-row items-baseline justify-between mb-3">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Body parts
          </Text>
          <Text className="text-[10px] text-muted-foreground">
            {selectedMonday
              ? `${formatShortDate(heatmapStart)} – ${formatShortDate(heatmapEnd)}`
              : 'Last 7 days'}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {heatmapData.map(({ group, volume, setCount, countBased, intensity, active }) => {
            const valueText = !active
              ? null
              : countBased
                ? `${setCount} ${setCount === 1 ? 'set' : 'sets'}`
                : `${formatVolume(volume, weightUnit)} ${weightUnit}`;
            return (
              <View
                key={group}
                style={{
                  width: '22%',
                  minWidth: 72,
                  flex: 1,
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: active
                    ? rgba(accentRgb, 0.08 + intensity * 0.45)
                    : secondaryBg,
                }}
                accessibilityLabel={`${group}, ${active ? `${valueText}${countBased ? '' : ' volume'}` : 'rest'}`}
              >
                <Text className={`text-[10px] font-semibold mb-1 ${active ? 'text-foreground' : 'text-muted-foreground'}`} numberOfLines={1}>
                  {group}
                </Text>
                {active ? (
                  <Text className="text-xs font-bold text-foreground">{valueText}</Text>
                ) : (
                  <Text className="text-xs text-muted-foreground">Rest</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View className="flex-row items-center gap-2 mt-3">
          <Text className="text-[9px] text-muted-foreground">Less</Text>
          <View className="flex-1 flex-row rounded-full overflow-hidden" style={{ height: 4 }}>
            {[0.08, 0.19, 0.30, 0.42, 0.53].map((opacity, i) => (
              <View
                key={i}
                style={{ flex: 1, height: 4, backgroundColor: rgba(accentRgb, opacity) }}
              />
            ))}
          </View>
          <Text className="text-[9px] text-muted-foreground">More</Text>
        </View>
      </View>

      {/* ── PRs ── */}
      <View className="bg-card border border-border rounded-xl p-4">
        <View className="flex-row items-baseline justify-between mb-3">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Personal Records
          </Text>
          <Text className="text-[10px] text-muted-foreground">
            {formatShortDate(monthStart)} – {formatShortDate(monthEnd)}
          </Text>
        </View>

        {prRows.length === 0 ? (
          <Text className="text-sm text-muted-foreground">No PRs this period</Text>
        ) : (
          prRows.map((pr, i) => (
            <View key={pr.exercise_id}>
              {i > 0 && <View className="h-px bg-border my-2" />}
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-primary/10 items-center justify-center">
                  <Icon as={Trophy} className="size-4 text-primary" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                    {capitalizeWords(pr.exercise_name)}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {Math.round(displayWeight(pr.weight, weightUnit))} {weightUnit} × {pr.reps} · {formatShortDate(pr.best_date)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-bold text-foreground">
                    {Math.round(displayWeight(pr.est_1rm, weightUnit))} {weightUnit}
                  </Text>
                  <Text className="text-[9px] font-semibold text-muted-foreground tracking-widest">
                    EST. 1RM
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
