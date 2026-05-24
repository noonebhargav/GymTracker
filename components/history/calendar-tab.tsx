import { View, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  getMonthlyAggregates,
  displayWeight,
  type DayAggregateRow,
} from '@/lib/database';

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function dateStr(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

function isToday(y: number, m: number, d: number): boolean {
  const n = new Date();
  return n.getFullYear() === y && n.getMonth() === m && n.getDate() === d;
}

function isFuture(y: number, m: number, d: number): boolean {
  const t = new Date(y, m, d);
  const n = new Date();
  n.setHours(0, 0, 0, 0);
  return t > n;
}

function getMonthGrid(y: number, m: number): (number | null)[][] {
  const firstDay = new Date(y, m, 1).getDay();
  const totalDays = daysInMonth(y, m);
  const offset = (firstDay + 6) % 7;
  const grid: (number | null)[][] = [];
  let week: (number | null)[] = [];
  for (let i = 0; i < offset; i++) week.push(null);
  for (let d = 1; d <= totalDays; d++) {
    week.push(d);
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    grid.push(week);
  }
  return grid;
}

function dotSize(exerciseCount: number): number {
  if (exerciseCount >= 3) return 10;
  if (exerciseCount === 2) return 8;
  return 6;
}

interface CalendarTabProps {
  year: number;
  month: number;
  weightUnit: 'lbs' | 'kg';
}

export function CalendarTab({ year, month, weightUnit }: CalendarTabProps) {
  const db = useSQLiteContext();
  const [aggregates, setAggregates] = useState<DayAggregateRow[]>([]);

  const load = useCallback(async () => {
    const start = dateStr(year, month, 1);
    const end = dateStr(year, month, daysInMonth(year, month));
    const aggs = await getMonthlyAggregates(db, start, end);
    setAggregates(aggs);
  }, [db, year, month]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const aggMap = useMemo(() => {
    const m = new Map<string, DayAggregateRow>();
    for (const a of aggregates) m.set(a.date_logged, a);
    return m;
  }, [aggregates]);

  const grid = useMemo(() => getMonthGrid(year, month), [year, month]);

  const monthStats = useMemo(() => {
    if (aggregates.length === 0) return null;
    let workouts = 0;
    let sets = 0;
    let totalWeight = 0;
    let weightCount = 0;
    for (const a of aggregates) {
      workouts += a.exercise_count;
      sets += a.set_count;
      totalWeight += a.avg_weight * a.set_count;
      weightCount += a.set_count;
    }
    return {
      workouts,
      sets,
      avgWeight: weightCount > 0 ? totalWeight / weightCount : 0,
    };
  }, [aggregates]);

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 32 }}
    >
      {/* Day headers */}
      <View className="flex-row mb-1">
        {DAY_HEADERS.map((d) => (
          <View key={d} className="flex-1 items-center py-1">
            <Text className="text-xs text-muted-foreground font-medium">{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      {grid.map((week, wi) => (
        <View key={wi} className="flex-row">
          {week.map((day, di) => {
            if (day === null) {
              return <View key={di} className="flex-1 items-center py-1" />;
            }
            const ds = dateStr(year, month, day);
            const agg = aggMap.get(ds);
            const hasWorkout = !!agg;
            const today = isToday(year, month, day);
            const future = isFuture(year, month, day);
            const sz = hasWorkout ? dotSize(agg.exercise_count) : 6;

            return (
              <Pressable
                key={di}
                onPress={hasWorkout ? () => router.push(`/history/${ds}`) : undefined}
                disabled={!hasWorkout || future}
                className="flex-1 items-center py-0.5"
                aria-label={`${day} ${hasWorkout ? 'has workouts' : ''}`}
              >
                <View
                  className={`size-10 items-center justify-center rounded-full ${
                    today ? 'bg-primary' : ''
                  }`}
                >
                  <Text
                    className={`text-sm tabular-nums ${
                      today
                        ? 'text-primary-foreground font-bold'
                        : future || !hasWorkout
                          ? 'text-muted-foreground'
                          : 'text-foreground font-medium'
                    }`}
                  >
                    {day}
                  </Text>
                </View>
                {hasWorkout && (
                  <View
                    style={{ width: sz, height: sz, borderRadius: sz / 2, marginTop: 2 }}
                    className={today ? 'bg-primary-foreground/60' : 'bg-primary'}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}

      {/* Monthly stats */}
      {monthStats && (
        <View className="flex-row gap-2 mt-4">
          {[
            { label: 'WORKOUTS', value: String(monthStats.workouts) },
            { label: 'SETS', value: String(monthStats.sets) },
            {
              label: 'AVG WEIGHT',
              value: `${Math.round(displayWeight(monthStats.avgWeight, weightUnit))} ${weightUnit}`,
            },
          ].map(({ label, value }) => (
            <View
              key={label}
              className="flex-1 bg-card border border-border rounded-xl p-3 items-center"
            >
              <Text className="text-lg font-bold text-foreground">{value}</Text>
              <Text className="text-[10px] font-semibold text-muted-foreground tracking-widest mt-0.5">
                {label}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
