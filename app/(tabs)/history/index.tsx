import { View, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { getSetting, getWorkoutDateRange } from '@/lib/database';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react-native';
import { CalendarTab } from '@/components/history/calendar-tab';
import { SummaryTab } from '@/components/history/summary-tab';
import { InsightsTab } from '@/components/history/insights-tab';

type Mode = 'calendar' | 'summary' | 'insights';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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

function addWeeks(dateStr: string, weeks: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + weeks * 7);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatMonthYear(y: number, m: number): string {
  return new Date(y, m).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function formatWindowLabel(windowEndDate: string): string {
  const end = new Date(windowEndDate + 'T00:00:00');
  const start = new Date(end);
  start.setDate(start.getDate() - 69);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts).toUpperCase()} – ${end.toLocaleDateString('en-US', opts).toUpperCase()}`;
}

export default function HistoryTab() {
  const db = useSQLiteContext();
  const [mode, setMode] = useState<Mode>('calendar');
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [windowEndDate, setWindowEndDate] = useState(() => todayStr());
  const [dateRange, setDateRange] = useState<{ first: string; last: string } | null>(null);
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');
  const [loaded, setLoaded] = useState(false);

  const loadMeta = useCallback(async () => {
    const [range, wu] = await Promise.all([
      getWorkoutDateRange(db),
      getSetting(db, 'weight_unit'),
    ]);
    if (range?.first_date) {
      setDateRange({ first: range.first_date, last: range.last_date! });
    } else {
      setDateRange(null);
    }
    setWeightUnit((wu as 'lbs' | 'kg') ?? 'lbs');
    setLoaded(true);
  }, [db]);

  useEffect(() => { loadMeta(); }, [loadMeta]);
  useFocusEffect(useCallback(() => { loadMeta(); }, [loadMeta]));

  // Month navigator bounds
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

  const canGoPrevWindow = useMemo(() => {
    if (!dateRange?.first) return false;
    return dateRange.first < addDays(windowEndDate, -69);
  }, [windowEndDate, dateRange]);

  const canGoNextWindow = useMemo(() => {
    return windowEndDate < todayStr();
  }, [windowEndDate]);

  // Snap: when there are fewer than 10 weeks of data, place the first logged
  // week at W1 so data fills from the left with no empty bars on the left side.
  useEffect(() => {
    if (!dateRange?.first) return;
    if (dateRange.first >= addDays(todayStr(), -69)) {
      setWindowEndDate(addDays(getMondayOfWeek(dateRange.first), 69));
    }
  }, [dateRange?.first]);

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

  const goToPrevWindow = useCallback(() => {
    setWindowEndDate((d) => addWeeks(d, -10));
  }, []);

  const goToNextWindow = useCallback(() => {
    setWindowEndDate((d) => {
      const next = addWeeks(d, 10);
      return next > todayStr() ? todayStr() : next;
    });
  }, []);

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
        {(['calendar', 'summary', 'insights'] as Mode[]).map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            className={`flex-1 h-10 rounded-md items-center justify-center ${
              mode === m ? 'bg-background shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                mode === m ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Navigator */}
      {mode === 'insights' ? (
        <View className="flex-row items-center justify-between px-4 py-2">
          <Pressable
            onPress={goToPrevWindow}
            disabled={!canGoPrevWindow}
            className="p-3"
            aria-label="Previous window"
          >
            <Icon
              as={ChevronLeft}
              className={`size-5 ${canGoPrevWindow ? 'text-foreground' : 'text-muted-foreground/20'}`}
            />
          </Pressable>
          <Text className="text-sm font-semibold text-foreground">
            {formatWindowLabel(windowEndDate)}
          </Text>
          <Pressable
            onPress={goToNextWindow}
            disabled={!canGoNextWindow}
            className="p-3"
            aria-label="Next window"
          >
            <Icon
              as={ChevronRight}
              className={`size-5 ${canGoNextWindow ? 'text-foreground' : 'text-muted-foreground/20'}`}
            />
          </Pressable>
        </View>
      ) : (
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
      )}

      {/* Tab content */}
      {mode === 'calendar' && (
        <CalendarTab year={currentYear} month={currentMonth} weightUnit={weightUnit} />
      )}
      {mode === 'summary' && (
        <SummaryTab year={currentYear} month={currentMonth} weightUnit={weightUnit} />
      )}
      {mode === 'insights' && (
        <InsightsTab windowEndDate={windowEndDate} weightUnit={weightUnit} />
      )}
    </View>
  );
}
