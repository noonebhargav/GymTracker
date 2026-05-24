import { View, ScrollView } from 'react-native';
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

const PRIMARY_COLOR = '#d8fe3d';

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

function buildWeeks(windowEndDate: string): string[] {
  const weeks: string[] = [];
  for (let i = 9; i >= 0; i--) {
    const monday = getMondayOfWeek(addDays(windowEndDate, -i * 7));
    weeks.push(monday);
  }
  return weeks;
}

interface InsightsTabProps {
  windowEndDate: string;
  weightUnit: 'lbs' | 'kg';
}

export function InsightsTab({ windowEndDate, weightUnit }: InsightsTabProps) {
  const db = useSQLiteContext();
  const windowStartDate = useMemo(() => addDays(windowEndDate, -69), [windowEndDate]);
  const heatmapStart = useMemo(() => addDays(windowEndDate, -6), [windowEndDate]);

  const [dailyAggs, setDailyAggs] = useState<DayAggregateRow[]>([]);
  const [bodyPartRows, setBodyPartRows] = useState<BodyPartAvgRow[]>([]);
  const [prRows, setPrRows] = useState<WindowPRRow[]>([]);

  const load = useCallback(async () => {
    const [aggs, bpAvgs, prs] = await Promise.all([
      getMonthlyAggregates(db, windowStartDate, windowEndDate),
      getBodyPartAvgWeights(db, heatmapStart, windowEndDate),
      getWindowPRs(db, windowStartDate, windowEndDate),
    ]);
    setDailyAggs(aggs);
    setBodyPartRows(bpAvgs);
    setPrRows(prs);
  }, [db, windowStartDate, windowEndDate, heatmapStart]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // --- Chart data ---
  const weeks = useMemo(() => buildWeeks(windowEndDate), [windowEndDate]);

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
  const lastWeekAvg = weekAvgs[9] ?? 0;
  const prevWeekAvg = weekAvgs[8] ?? 0;
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
                    ? 'rgba(216,254,61,0.15)'
                    : 'rgba(239,68,68,0.15)',
                }}
              >
                <Text
                  className="text-[10px] font-bold"
                  style={{ color: delta >= 0 ? PRIMARY_COLOR : '#ef4444' }}
                >
                  {delta >= 0 ? '+' : ''}{delta}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bars */}
        <View className="flex-row items-end gap-1" style={{ height: 100 }}>
          {weekAvgs.map((avg, i) => {
            const isLast = i === 9;
            const barHeight = avg > 0 ? Math.max(4, (avg / chartMax) * 96) : 4;
            return (
              <View key={i} className="flex-1 items-center justify-end" style={{ height: 100 }}>
                <View
                  style={{ height: barHeight, borderRadius: 3 }}
                  className={`w-full ${isLast ? 'bg-primary' : 'bg-secondary'}`}
                />
              </View>
            );
          })}
        </View>

        {/* X-axis labels */}
        <View className="flex-row mt-1">
          {weeks.map((_, i) => (
            <View key={i} className="flex-1 items-center">
              {(i === 0 || i === 4 || i === 9) && (
                <Text className="text-[9px] text-muted-foreground">
                  W{i + 1}
                </Text>
              )}
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
          <Text className="text-[10px] text-muted-foreground">Last 7 days</Text>
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
                  ? `rgba(216,254,61,${0.08 + intensity * 0.45})`
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
                style={{ flex: 1, height: 4, backgroundColor: `rgba(216,254,61,${opacity})` }}
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
            {formatShortDate(windowStartDate)} – {formatShortDate(windowEndDate)}
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
                    {pr.exercise_name}
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
