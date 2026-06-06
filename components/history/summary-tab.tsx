import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  getMonthlyAggregates,
  displayWeight,
  formatVolume,
  type DayAggregateRow,
} from '@/lib/database';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function dateStr(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

function getMondayOfWeek(ds: string): string {
  const d = new Date(ds + 'T00:00:00');
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatWeekRange(mondayStr: string): string {
  const mon = new Date(mondayStr + 'T00:00:00');
  const sun = new Date(mon);
  sun.setDate(sun.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `WEEK OF ${mon.toLocaleDateString('en-US', opts).toUpperCase()} – ${sun.toLocaleDateString('en-US', opts).toUpperCase()}`;
}

interface SummaryTabProps {
  year: number;
  month: number;
  weightUnit: 'lbs' | 'kg';
}

export function SummaryTab({ year, month, weightUnit }: SummaryTabProps) {
  const db = useSQLiteContext();
  const [aggregates, setAggregates] = useState<DayAggregateRow[]>([]);

  const load = useCallback(async () => {
    const start = dateStr(year, month, 1);
    const end = dateStr(year, month, daysInMonth(year, month));
    const aggs = await getMonthlyAggregates(db, start, end);
    setAggregates(aggs);
  }, [db, year, month]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const monthWeeks = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstMonday = new Date(firstDay);
    const dow = firstMonday.getDay();
    firstMonday.setDate(firstMonday.getDate() - (dow === 0 ? 6 : dow - 1));

    const mondays: string[] = [];
    const cursor = new Date(firstMonday);
    while (cursor <= lastDay) {
      mondays.push(
        `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`
      );
      cursor.setDate(cursor.getDate() + 7);
    }

    const aggMap = new Map<string, DayAggregateRow[]>();
    for (const agg of aggregates) {
      const mon = getMondayOfWeek(agg.date_logged);
      if (!aggMap.has(mon)) aggMap.set(mon, []);
      aggMap.get(mon)!.push(agg);
    }

    return mondays.map((mon) => {
      const days = aggMap.get(mon) ?? [];
      if (days.length === 0) {
        return { monday: mon, bodyParts: [], exerciseCount: 0, setCount: 0, avgWeight: 0, avgReps: 0, volume: 0, hasData: false };
      }
      const bodyParts = new Set<string>();
      let exerciseCount = 0;
      let setCount = 0;
      let totalWeight = 0;
      let totalReps = 0;
      let weightCount = 0;
      let volume = 0;
      for (const d of days) {
        for (const bp of d.body_parts.split(',').map((s) => s.trim()).filter(Boolean)) {
          bodyParts.add(bp);
        }
        exerciseCount += d.exercise_count;
        setCount += d.set_count;
        totalWeight += d.avg_weight * d.set_count;
        totalReps += d.avg_reps * d.set_count;
        weightCount += d.set_count;
        volume += d.volume;
      }
      return {
        monday: mon,
        bodyParts: [...bodyParts],
        exerciseCount,
        setCount,
        avgWeight: weightCount > 0 ? totalWeight / weightCount : 0,
        avgReps: weightCount > 0 ? totalReps / weightCount : 0,
        volume,
        hasData: true,
      };
    });
  }, [aggregates, year, month]);

  const statCells = (week: typeof monthWeeks[number]) => [
    { label: 'WORKOUTS', value: String(week.exerciseCount) },
    { label: 'SETS', value: String(week.setCount) },
    {
      label: 'AVG WGT',
      value: `${Math.round(displayWeight(week.avgWeight, weightUnit))} ${weightUnit}`,
    },
    { label: 'AVG REPS', value: String(Math.round(week.avgReps)) },
    {
      label: 'VOLUME',
      value: `${formatVolume(week.volume, weightUnit)} ${weightUnit}`,
    },
  ];

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 10 }}
    >
      {monthWeeks.map((week) => (
        <View
          key={week.monday}
          className={`rounded-xl p-4 bg-card ${
            week.hasData ? 'border border-border' : 'border border-dashed border-border'
          }`}
        >
          <Text className="text-xs font-semibold text-muted-foreground mb-2">
            {formatWeekRange(week.monday)}
          </Text>
          {week.hasData ? (
            <>
              {week.bodyParts.length > 0 && (
                <View className="flex-row flex-wrap gap-1.5 mb-3">
                  {week.bodyParts.map((bp) => (
                    <View key={bp} className="bg-primary/10 rounded-full px-2.5 py-0.5">
                      <Text className="text-xs font-medium text-primary">{bp}</Text>
                    </View>
                  ))}
                </View>
              )}
              {/* 4-cell stat grid */}
              <View className="flex-row flex-wrap">
                {statCells(week).map(({ label, value }) => (
                  <View key={label} className="w-1/2 pr-2 pb-2">
                    <Text className="text-xl font-bold text-foreground">{value}</Text>
                    <Text className="text-[10px] font-semibold text-muted-foreground tracking-widest mt-0.5">
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text className="text-sm text-muted-foreground">No exercises logged this week</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
