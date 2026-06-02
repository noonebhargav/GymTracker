import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Trophy } from 'lucide-react-native';
import {
  getMonthlyAggregates,
  getBodyPartAvgWeights,
  getWindowPRs,
  displayWeight,
  type DayAggregateRow,
  type BodyPartAvgRow,
  type WindowPRRow,
} from '@/lib/database';
import { GOLD_STANDARD_GROUPS, toGoldStandardGroup } from '@/lib/exercise-groups';
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
  const [bodyPartRows, setBodyPartRows] = useState<BodyPartAvgRow[]>([]);
  const [prRows, setPrRows] = useState<WindowPRRow[]>([]);

  const loadStats = useCallback(async () => {
    const [aggs, prs] = await Promise.all([
      getMonthlyAggregates(db, chartStart, chartEnd),
      getWindowPRs(db, monthStart, monthEnd),
    ]);
    setDailyAggs(aggs);
    setPrRows(prs);
  }, [db, chartStart, chartEnd, monthStart, monthEnd]);

  const loadHeatmap = useCallback(async () => {
    const bpAvgs = await getBodyPartAvgWeights(db, heatmapStart, heatmapEnd);
    setBodyPartRows(bpAvgs);
  }, [db, heatmapStart, heatmapEnd]);

  // Two independent focus effects: each refetches on focus and only when its own
  // inputs change (month range for stats, selected-week range for the heatmap),
  // so a bar tap refetches the heatmap alone — never the stats.
  useFocusEffect(useCallback(() => { loadStats(); }, [loadStats]));
  useFocusEffect(useCallback(() => { loadHeatmap(); }, [loadHeatmap]));

  const weekAvgs = useMemo(() => {
    const map = new Map<string, { totalWeight: number; count: number }>();
    for (const a of dailyAggs) {
      const mon = getMondayOfWeek(a.date_logged);
      const existing = map.get(mon) ?? { totalWeight: 0, count: 0 };
      map.set(mon, {
        totalWeight: existing.totalWeight + a.avg_weight * a.set_count,
        count: existing.count + a.set_count,
      });
    }
    return weeks.map((mon) => {
      const entry = map.get(mon);
      if (!entry || entry.count === 0) return 0;
      return entry.totalWeight / entry.count;
    });
  }, [dailyAggs, weeks]);

  const chartMax = useMemo(() => Math.max(...weekAvgs, 1), [weekAvgs]);
  // Latest week in the month that has data drives the header number + delta.
  const lastIdx = useMemo(() => {
    for (let i = weekAvgs.length - 1; i >= 0; i--) {
      if (weekAvgs[i] > 0) return i;
    }
    return -1;
  }, [weekAvgs]);
  const lastWeekAvg = lastIdx >= 0 ? weekAvgs[lastIdx] : 0;
  const prevWeekAvg = lastIdx > 0 ? weekAvgs[lastIdx - 1] : 0;
  const delta = prevWeekAvg > 0 && lastWeekAvg > 0
    ? Math.round(((lastWeekAvg - prevWeekAvg) / prevWeekAvg) * 100)
    : null;

  // --- Heatmap data ---
  const heatmapData = useMemo(() => {
    const grouped = new Map<string, { total: number; count: number }>();
    for (const row of bodyPartRows) {
      const group = toGoldStandardGroup(row.body_part);
      if (!group) continue;
      const existing = grouped.get(group) ?? { total: 0, count: 0 };
      grouped.set(group, {
        total: existing.total + row.avg_weight,
        count: existing.count + 1,
      });
    }
    const cells = GOLD_STANDARD_GROUPS.map((group) => {
      const entry = grouped.get(group);
      const avg = entry ? entry.total / entry.count : 0;
      return { group, avg };
    });
    const maxAvg = Math.max(...cells.map((c) => c.avg), 1);
    return cells.map((c) => ({ ...c, intensity: c.avg / maxAvg }));
  }, [bodyPartRows]);

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 20 }}
    >
      {/* ── Chart ── */}
      <View className="bg-card border border-border rounded-xl p-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Weekly avg weight
          </Text>
          <View className="flex-row items-center gap-2">
            {lastWeekAvg > 0 && (
              <Text className="text-sm font-bold text-foreground">
                {Math.round(displayWeight(lastWeekAvg, weightUnit))} {weightUnit}
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
            const avg = weekAvgs[i];
            const hasData = avg > 0;
            const barHeight = hasData ? Math.max(4, (avg / chartMax) * 96) : 4;
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
          {heatmapData.map(({ group, avg, intensity }) => (
            <View
              key={group}
              className="rounded-xl p-3 bg-secondary"
              style={{
                width: '22%',
                minWidth: 72,
                flex: 1,
                backgroundColor: avg > 0
                  ? rgba(accentRgb, 0.08 + intensity * 0.45)
                  : undefined,
              }}
            >
              <Text className="text-[10px] font-semibold text-muted-foreground mb-1" numberOfLines={1}>
                {group}
              </Text>
              {avg > 0 ? (
                <Text className="text-xs font-bold text-foreground">
                  {Math.round(displayWeight(avg, weightUnit))} {weightUnit}
                </Text>
              ) : (
                <Text className="text-xs text-muted-foreground">Rest</Text>
              )}
            </View>
          ))}
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
                    {formatShortDate(pr.best_date)}
                  </Text>
                </View>
                <Text className="text-sm font-bold text-foreground">
                  {Math.round(displayWeight(pr.max_weight, weightUnit))} {weightUnit}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
