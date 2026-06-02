import { View, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ScreenWrapper } from '@/components/ui/screen-wrapper';
import { getSetting, getWorkoutDateRange } from '@/lib/database';
import { useSQLiteContext } from 'expo-sqlite';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { CalendarTab } from '@/components/history/calendar-tab';
import { SummaryTab } from '@/components/history/summary-tab';
import { InsightsTab } from '@/components/history/insights-tab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToday } from '@/lib/use-today';

type Mode = 'calendar' | 'summary' | 'insights';

function formatMonthYear(y: number, m: number): string {
  return new Date(y, m).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export default function HistoryTab() {
  const db = useSQLiteContext();
  const today = useToday();
  const [mode, setMode] = useState<Mode>('calendar');
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
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
    const [ty, tm] = today.split('-').map(Number);
    return (
      currentYear < ty ||
      (currentYear === ty && currentMonth < tm - 1)
    );
  }, [currentYear, currentMonth, today]);

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
      <ScreenWrapper className="items-center justify-center">
        <ActivityIndicator />
      </ScreenWrapper>
    );
  }

  if (!dateRange) {
    return (
      <ScreenWrapper className="items-center justify-center px-8">
        <Icon as={Clock} className="size-12 text-muted-foreground mb-4" aria-hidden={true} />
        <Text className="text-base font-medium text-foreground text-center mb-1">
          No workouts logged yet
        </Text>
        <Text className="text-sm text-muted-foreground text-center mb-4">
          Head over to the Workout tab to log your first exercise.
        </Text>
        <Pressable
          onPress={() => router.push('/workout')}
          className="bg-primary rounded-full px-4 py-2 active:opacity-80"
          accessibilityRole="button"
          aria-label="Go to Workout tab"
        >
          <Text className="text-sm font-semibold text-primary-foreground">
            Go to Workout
          </Text>
        </Pressable>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Tabs
        value={mode}
        onValueChange={(v) => {
          Haptics.selectionAsync().catch(() => {});
          setMode(v as Mode);
        }}
        className="flex-1">

        <TabsList className="mx-auto mt-3">
          <TabsTrigger value="calendar" variant="primary">
            <Text>Calendar</Text>
          </TabsTrigger>
          <TabsTrigger value="summary" variant="primary">
            <Text>Summary</Text>
          </TabsTrigger>
          <TabsTrigger value="insights" variant="primary">
            <Text>Insights</Text>
          </TabsTrigger>
        </TabsList>

        {/* Shared month switcher — drives all three tabs */}
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

        <TabsContent value="calendar" className="flex-1">
          <CalendarTab year={currentYear} month={currentMonth} weightUnit={weightUnit} today={today} />
        </TabsContent>

        <TabsContent value="summary" className="flex-1">
          <SummaryTab year={currentYear} month={currentMonth} weightUnit={weightUnit} />
        </TabsContent>

        <TabsContent value="insights" className="flex-1">
          <InsightsTab year={currentYear} month={currentMonth} today={today} weightUnit={weightUnit} />
        </TabsContent>
      </Tabs>
    </ScreenWrapper>
  );
}
