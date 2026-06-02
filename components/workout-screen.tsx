import {
  View,
  Pressable,
  ScrollView,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import {
  getAllExercises,
  getAllRoutines,
  getSetting,
  getLoggedBodyPartsForDate,
  getRecentExercises,
  getWorkoutLogsForToday,
  getWorkoutStreak,
  type ExerciseRow,
} from '@/lib/database';
import { toGoldStandardGroup } from '@/lib/exercise-groups';
import { capitalizeWords } from '@/lib/utils';
import { useToday } from '@/lib/use-today';
import { mapJsDayToOur } from '@/lib/date-utils';
import { ExerciseRow as ExerciseRowComponent, DoneBadge, RowChevron } from '@/components/exercise-row';
import { ScreenWrapper } from '@/components/ui/screen-wrapper';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSQLiteContext } from 'expo-sqlite';
import { router, useFocusEffect } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Flame,
  Search,
  X,
} from 'lucide-react-native';
import { useUniwind } from 'uniwind';
import { THEME } from '@/lib/theme';

const DEFAULTS: Record<string, string> = {
  default_sets: '3',
  default_weight: '20',
  default_reps: '10',
  weight_unit: 'lbs',
  queue_enabled: 'false',
};

const TAB_BAR_CONTENT_STYLE = { paddingHorizontal: 16, paddingVertical: 8 } as const;

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function SessionPill({ label }: { label: string }) {
  return (
    <View className="bg-primary rounded-full px-2.5 py-1 max-w-[160px]">
      <Text
        className="text-[11px] font-semibold text-primary-foreground"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
    </View>
  );
}

export function WorkoutScreen({ tab }: { tab: string }) {
  const db = useSQLiteContext();
  const { theme } = useUniwind();
  const placeholderColor =
    theme === 'dark' ? THEME.dark.mutedForeground : THEME.light.mutedForeground;
  const selectedTab = tab;

  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [routines, setRoutines] = useState<Map<number, Set<string>>>(new Map());
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [recentExercises, setRecentExercises] = useState<ExerciseRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [queueEnabled, setQueueEnabled] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [streak, setStreak] = useState(0);

  const today = useToday();
  const todayIndex = useMemo(() => mapJsDayToOur(new Date(today + 'T00:00:00').getDay()), [today]);
  const yesterday = useMemo(() => {
    const d = new Date(today + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, [today]);

  const [loggedYesterdayParts, setLoggedYesterdayParts] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const [ex, routs, compIds] = await Promise.all([
        getAllExercises(db),
        getAllRoutines(db),
        getWorkoutLogsForToday(db, today).then((rows) => new Set(rows.map((r) => r.exercise_id))),
      ]);

      setExercises(ex);
      setCompletedToday(compIds);

      const map = new Map<number, Set<string>>();
      for (const r of routs) {
        if (!map.has(r.day_of_week)) map.set(r.day_of_week, new Set());
        map.get(r.day_of_week)!.add(r.body_part);
      }
      setRoutines(map);

      setLoaded(true);
    })();
  }, [db, today]);

  useFocusEffect(
    useCallback(() => {
      if (!loaded) return;
      Promise.all([
        getSetting(db, 'queue_enabled'),
        getWorkoutLogsForToday(db, today),
        getAllRoutines(db),
        getWorkoutStreak(db),
      ]).then(([qe, todayLogs, routs, s]) => {
        setQueueEnabled((qe ?? DEFAULTS.queue_enabled) === 'true');
        setCompletedToday(new Set(todayLogs.map((r) => r.exercise_id)));
        setStreak(s);
        const map = new Map<number, Set<string>>();
        for (const r of routs) {
          if (!map.has(r.day_of_week)) map.set(r.day_of_week, new Set());
          map.get(r.day_of_week)!.add(r.body_part);
        }
        setRoutines(map);
      });
    }, [db, loaded, today])
  );

  const todayParts = useMemo(() => {
    const parts = new Set(routines.get(todayIndex) ?? []);
    if (queueEnabled) {
      const yesterdayIndex = (todayIndex + 6) % 7;
      const yesterdayParts = routines.get(yesterdayIndex);
      if (yesterdayParts) {
        for (const p of yesterdayParts) {
          if (!loggedYesterdayParts.has(p)) parts.add(p);
        }
      }
    }
    return [...parts];
  }, [routines, todayIndex, queueEnabled, loggedYesterdayParts]);

  useEffect(() => {
    if (!loaded || !queueEnabled) return;
    getLoggedBodyPartsForDate(db, yesterday).then((parts) => {
      setLoggedYesterdayParts(new Set(parts));
    });
  }, [db, loaded, queueEnabled, yesterday]);

  // Lazy: only fetch recents while the Recent tab is actually being viewed.
  // Re-runs if todayParts change so the list stays correct when returning to the tab.
  useEffect(() => {
    if (!loaded || selectedTab !== 'recent') return;
    if (todayParts.length === 0) {
      setRecentExercises([]);
      return;
    }
    getRecentExercises(db, todayParts, 15).then((rows) => {
      setRecentExercises(rows);
    });
  }, [db, loaded, todayParts, selectedTab]);

  const goldMap = useMemo(() => {
    const map = new Map<string, ExerciseRow[]>();
    for (const ex of exercises) {
      const g = toGoldStandardGroup(ex.body_part, ex.target);
      if (!g) continue;
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(ex);
    }
    return map;
  }, [exercises]);

  const baseFiltered = useMemo(() => {
    let result: ExerciseRow[];
    if (selectedTab === 'recent') {
      result = recentExercises;
    } else if (selectedTab === 'all') {
      const ids = new Set<string>();
      result = [];
      for (const part of todayParts) {
        for (const ex of goldMap.get(part) ?? []) {
          if (!ids.has(ex.id)) {
            ids.add(ex.id);
            result.push(ex);
          }
        }
      }
    } else {
      result = goldMap.get(selectedTab) ?? [];
    }
    return [...result].sort((a, b) => {
      const aDone = completedToday.has(a.id);
      const bDone = completedToday.has(b.id);
      if (aDone && !bDone) return -1;
      if (!aDone && bDone) return 1;
      return 0;
    });
  }, [selectedTab, recentExercises, todayParts, goldMap, completedToday]);

  // Debounce filtering so typing doesn't re-filter the full list on every keystroke.
  // The TextInput stays bound to searchText for instant feedback; only the filter waits.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchText), 150);
    return () => clearTimeout(id);
  }, [searchText]);

  const filteredExercises = useMemo(() => {
    if (!debouncedSearch) return baseFiltered;
    const q = debouncedSearch.toLowerCase();
    return baseFiltered.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.equipment?.toLowerCase().includes(q)
    );
  }, [baseFiltered, debouncedSearch]);

  const tabs = useMemo(() => {
    const t: { key: string; label: string }[] = [{ key: 'recent', label: 'Recent' }];
    for (const part of todayParts) t.push({ key: part, label: part });
    t.push({ key: 'all', label: 'All' });
    return t;
  }, [todayParts]);

  // If the selected body-part tab was removed from today's routine (edited on the
  // Routine screen), it's no longer in `tabs` — fall back to Recent so the stale
  // exercise list for the removed part doesn't linger.
  useEffect(() => {
    if (!loaded) return;
    if (!tabs.some((t) => t.key === selectedTab)) {
      router.setParams({ tab: 'recent' });
    }
  }, [loaded, tabs, selectedTab]);

  // Parts shown today only because Queue mode rolled them over from yesterday's
  // unfinished routine (i.e. not also scheduled for today). Used to badge their chips.
  const carryoverParts = useMemo(() => {
    const carry = new Set<string>();
    if (!queueEnabled) return carry;
    const scheduledToday = routines.get(todayIndex) ?? new Set<string>();
    const yesterdayParts = routines.get((todayIndex + 6) % 7);
    if (yesterdayParts) {
      for (const p of yesterdayParts) {
        if (!loggedYesterdayParts.has(p) && !scheduledToday.has(p)) carry.add(p);
      }
    }
    return carry;
  }, [queueEnabled, routines, todayIndex, loggedYesterdayParts]);

  const navigateToTab = useCallback((tabKey: string) => {
    // Keep the search query when switching tabs — the component stays mounted, so
    // the user's text (and results) persist across body-part filters.
    router.setParams({ tab: tabKey === 'recent' ? 'recent' : tabKey });
  }, []);

  const renderExerciseRow = useCallback(
    ({ item }: { item: ExerciseRow }) => {
      const g = toGoldStandardGroup(item.body_part, item.target);
      return (
        <ExerciseRowComponent
          name={item.name}
          equipment={item.equipment}
          group={g}
          assetId={item.assetId}
          right={completedToday.has(item.id) ? <DoneBadge /> : <RowChevron />}
          onPress={() => router.push(`/workout/${encodeURIComponent(selectedTab)}/${item.id}`)}
        />
      );
    },
    [completedToday, selectedTab]
  );

  if (!loaded) {
    return (
      <ScreenWrapper className="items-center justify-center">
        <ActivityIndicator />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Day name + streak header */}
      <View className="px-4 pt-3 pb-1">
        <Text className="text-[13px] font-semibold text-muted-foreground uppercase tracking-widest">
          {DAY_NAMES[todayIndex]}
        </Text>
        {streak > 0 && (
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <Icon as={Flame} className="size-3.5 text-warn" aria-hidden={true} />
            <Text className="text-xs font-bold text-foreground">{streak}</Text>
            <Text className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              day streak
            </Text>
          </View>
        )}
      </View>

      {/* Search bar */}
      <View className="px-4 pt-2 pb-2">
        <View className="flex-row items-center bg-secondary rounded-full px-3 h-[46px] border border-border">
          <Icon as={Search} className="size-4 text-muted-foreground mr-2.5" aria-hidden={true} />
          <TextInput
            className="flex-1 text-sm text-foreground"
            placeholder="Search exercises…"
            placeholderTextColor={placeholderColor}
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            autoComplete="off"
            aria-label="Search exercises"
          />
          {searchText.length > 0 && (
            <Pressable
              onPress={() => setSearchText('')}
              className="p-3.5"
              aria-label="Clear search"
            >
              <Icon as={X} className="size-4 text-muted-foreground" aria-hidden={true} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Horizontal filter tabs — below search */}
      <Tabs value={selectedTab} onValueChange={navigateToTab}>
        <View className="border-b border-border">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={TAB_BAR_CONTENT_STYLE}
          >
            <TabsList variant="pills">
              {tabs.map((t) => {
                const active = t.key === selectedTab;
                const isCarryover = carryoverParts.has(t.key);
                return (
                  <TabsTrigger
                    key={t.key}
                    value={t.key}
                    variant="pill"
                    aria-label={`Filter by ${t.label}${isCarryover ? ', carried over from yesterday' : ''}`}
                  >
                    <Text>{t.label}</Text>
                    {isCarryover && (
                      <View
                        className={`absolute top-1 right-1 size-1.5 rounded-full ${active ? 'bg-primary-foreground' : 'bg-primary'}`}
                      />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </ScrollView>
        </View>
      </Tabs>

      {/* Today's session card */}
      {completedToday.size > 0 && (
        <View className="mx-4 mb-3 bg-secondary rounded-[14px] p-4">
          <View className="flex-row items-center justify-between mb-2.5">
            <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Today's session
            </Text>
            <Text className="text-[13px] font-bold text-foreground tabular-nums">
              {completedToday.size} done
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-1.5">
            {[...completedToday].map((id) => {
              const e = exercises.find((ex) => ex.id === id);
              return e ? <SessionPill key={id} label={capitalizeWords(e.name)} /> : null;
            })}
          </View>
        </View>
      )}

      {/* Exercise list */}
      {filteredExercises.length === 0 ? (
        searchText ? (
          <View className="flex-1 items-center justify-center px-8">
            <Icon as={Search} className="size-12 text-muted-foreground mb-4" aria-hidden={true} />
            <Text className="text-base text-muted-foreground text-center">No exercises found</Text>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-base text-muted-foreground text-center" numberOfLines={2}>
              {selectedTab === 'recent'
                ? 'No recent exercises'
                : `No exercises for ${selectedTab}`}
            </Text>
            {todayParts.length === 0 && (
              <Pressable
                onPress={() => router.push('/routine')}
                className="mt-4 bg-primary rounded-full px-4 py-2 active:opacity-80"
                accessibilityRole="button"
                aria-label="Set up your routine"
              >
                <Text className="text-sm font-semibold text-primary-foreground">
                  Set up your routine
                </Text>
              </Pressable>
            )}
          </View>
        )
      ) : (
        <FlatList
          className="flex-1"
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          renderItem={renderExerciseRow}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </ScreenWrapper>
  );
}
