import { View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import {
  getWorkoutDates,
  getWorkoutDateRange,
  getMonthlyAggregates,
  getSetting,
  displayWeight,
  type DayAggregateRow,
} from '@/lib/database';
import { useSQLiteContext } from 'expo-sqlite';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react-native';

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

function formatMonthYear(y: number, m: number): string {
  return new Date(y, m).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
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
  const monday = mon.toLocaleDateString('en-US', opts);
  const sunday = sun.toLocaleDateString('en-US', opts);
  return `WEEK OF ${monday.toUpperCase()} – ${sunday.toUpperCase()}`;
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

export default function HistoryTab() {
  const db = useSQLiteContext();
  const [mode, setMode] = useState<'calendar' | 'summary'>('calendar');
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [workoutDates, setWorkoutDates] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<{
    first: string;
    last: string;
  } | null>(null);
  const [aggregates, setAggregates] = useState<DayAggregateRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');

  const loadMonthData = useCallback(
    async (year: number, month: number) => {
      const start = dateStr(year, month, 1);
      const end = dateStr(year, month, daysInMonth(year, month));
      const [dates, range, aggs, wu] = await Promise.all([
        getWorkoutDates(db),
        getWorkoutDateRange(db),
        getMonthlyAggregates(db, start, end),
        getSetting(db, 'weight_unit'),
      ]);
      setWorkoutDates(new Set(dates.map((r) => r.date_logged)));
      if (range?.first_date) {
        setDateRange({ first: range.first_date, last: range.last_date! });
      } else {
        setDateRange(null);
      }
      setAggregates(aggs);
      setWeightUnit((wu as 'lbs' | 'kg') ?? 'lbs');
      setLoaded(true);
    },
    [db]
  );

  useEffect(() => {
    loadMonthData(currentYear, currentMonth);
  }, [loadMonthData, currentYear, currentMonth]);

  useFocusEffect(
    useCallback(() => {
      if (!loaded) return;
      loadMonthData(currentYear, currentMonth);
    }, [loaded, loadMonthData, currentYear, currentMonth])
  );

  const grid = useMemo(
    () => getMonthGrid(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const canGoPrev = useMemo(() => {
    if (!dateRange?.first) return false;
    const [fy, fm] = dateRange.first.split('-').map(Number);
    return currentYear > fy || (currentYear === fy && currentMonth > fm - 1);
  }, [dateRange, currentYear, currentMonth]);

  const canGoNext = useMemo(() => {
    const now = new Date();
    return (
      currentYear < now.getFullYear() ||
      (currentYear === now.getFullYear() && currentMonth < now.getMonth())
    );
  }, [currentYear, currentMonth]);

  const monthWeeks = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

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
        return { monday: mon, bodyParts: [], exerciseCount: 0, setCount: 0, avgWeight: 0, avgReps: 0, hasData: false };
      }
      const bodyParts = new Set<string>();
      let exerciseCount = 0;
      let setCount = 0;
      let totalWeight = 0;
      let totalReps = 0;
      let weightCount = 0;
      for (const d of days) {
        for (const bp of d.body_parts.split(',').map((s) => s.trim()).filter(Boolean)) {
          bodyParts.add(bp);
        }
        exerciseCount += d.exercise_count;
        setCount += d.set_count;
        totalWeight += d.avg_weight * d.set_count;
        totalReps += d.avg_reps * d.set_count;
        weightCount += d.set_count;
      }
      return {
        monday: mon,
        bodyParts: [...bodyParts],
        exerciseCount,
        setCount,
        avgWeight: weightCount > 0 ? totalWeight / weightCount : 0,
        avgReps: weightCount > 0 ? totalReps / weightCount : 0,
        hasData: true,
      };
    });
  }, [aggregates, currentYear, currentMonth]);

  const goToPrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }, [currentMonth]);

  if (!loaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (!dateRange) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Icon as={Clock} className="size-12 text-muted-foreground mb-4" aria-hidden={true} />
        <Text className="text-base font-medium text-foreground text-center mb-1">
          No workouts logged yet
        </Text>
        <Text className="text-sm text-muted-foreground text-center">
          Head over to the Workout tab to log your first exercise.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Segmented control */}
      <View className="flex-row mx-4 mt-3 bg-muted rounded-lg p-0.5">
        <Pressable
          onPress={() => setMode('calendar')}
          className={`flex-1 h-10 rounded-md items-center justify-center ${
            mode === 'calendar' ? 'bg-background shadow-sm' : ''
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              mode === 'calendar' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Calendar
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode('summary')}
          className={`flex-1 h-10 rounded-md items-center justify-center ${
            mode === 'summary' ? 'bg-background shadow-sm' : ''
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              mode === 'summary' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Summary
          </Text>
        </Pressable>
      </View>

      {/* Month navigator */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable
          onPress={goToPrevMonth}
          disabled={!canGoPrev}
          className="p-3"
          aria-label="Previous month"
        >
          <Icon
            as={ChevronLeft}
            className={`size-5 ${canGoPrev ? 'text-foreground' : 'text-muted-foreground/20'}`}
          />
        </Pressable>
        <Text className="text-base font-semibold text-foreground">
          {formatMonthYear(currentYear, currentMonth)}
        </Text>
        <Pressable
          onPress={goToNextMonth}
          disabled={!canGoNext}
          className="p-3"
          aria-label="Next month"
        >
          <Icon
            as={ChevronRight}
            className={`size-5 ${canGoNext ? 'text-foreground' : 'text-muted-foreground/20'}`}
          />
        </Pressable>
      </View>

      {mode === 'calendar' ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 32 }}
        >
          {/* Day headers */}
          <View className="flex-row mb-1">
            {DAY_HEADERS.map((d) => (
              <View key={d} className="flex-1 items-center py-1">
                <Text className="text-xs text-muted-foreground font-medium">
                  {d}
                </Text>
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
                const ds = dateStr(currentYear, currentMonth, day);
                const hasWorkout = workoutDates.has(ds);
                const today = isToday(currentYear, currentMonth, day);
                const future = isFuture(currentYear, currentMonth, day);

                return (
                  <Pressable
                    key={di}
                    onPress={
                      hasWorkout ? () => router.push(`/history/${ds}`) : undefined
                    }
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
                        className={`size-1.5 rounded-full mt-0.5 ${
                          today ? 'bg-primary-foreground/60' : 'bg-primary'
                        }`}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 10 }}
        >
          {monthWeeks.map((week) => (
            <View
              key={week.monday}
              className={`rounded-xl p-4 bg-card ${
                week.hasData
                  ? 'border border-border'
                  : 'border border-dashed border-border'
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
                        <View
                          key={bp}
                          className="bg-primary/10 rounded-full px-2.5 py-0.5"
                        >
                          <Text className="text-xs font-medium text-primary">
                            {bp}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <View className="gap-1">
                    <Text className="text-sm text-muted-foreground">
                      Exercises: {week.exerciseCount}
                      {'  |  '}
                      Sets: {week.setCount}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      Avg Weight: {Math.round(displayWeight(week.avgWeight, weightUnit))} {weightUnit}
                      {'  |  '}
                      Avg Reps: {Math.round(week.avgReps)}
                    </Text>
                  </View>
                </>
              ) : (
                <Text className="text-sm text-muted-foreground">No exercises logged this week</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
