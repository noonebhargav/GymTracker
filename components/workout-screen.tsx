import {
  View,
  Pressable,
  ScrollView,
  TextInput,
  FlatList,
  Image,
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
  getDayWorkoutDetail,
  getWorkoutStreak,
  displayWeight,
  type ExerciseRow,
  type DayWorkoutDetailRow,
  type RoutineRow,
} from '@/lib/database';
import { toGoldStandardGroup, GOLD_STANDARD_GROUPS } from '@/lib/exercise-groups';
import { getExerciseImage } from '@/lib/exercise-assets';
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
  Dumbbell,
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

// day_of_week -> set of body parts scheduled that day.
function buildRoutineMap(routs: RoutineRow[]): Map<number, Set<string>> {
  const map = new Map<number, Set<string>>();
  for (const r of routs) {
    if (!map.has(r.day_of_week)) map.set(r.day_of_week, new Set());
    map.get(r.day_of_week)!.add(r.body_part);
  }
  return map;
}

type TodaySetEntry = { setNumber: number; weight: number; reps: number };
type TodayGroup = {
  exerciseId: string;
  name: string;
  bodyPart: string;
  equipment: string | null;
  assetId: string | null;
  sets: TodaySetEntry[];
};

// Search returned nothing in a non-"All" tab — offer to re-run the query across
// the full exercise library by switching to the All tab (search text persists).
function SearchEmptyState({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center px-8 pt-12">
      <Icon as={Search} className="size-12 text-muted-foreground mb-4" aria-hidden={true} />
      <Text className="text-base text-muted-foreground text-center" numberOfLines={2}>
        No exercises found for {label}
      </Text>
      <Pressable
        onPress={() => router.setParams({ tab: 'all' })}
        className="mt-4 bg-primary rounded-full px-4 py-2 active:opacity-80"
        accessibilityRole="button"
        aria-label="Search in all exercises"
      >
        <Text className="text-sm font-semibold text-primary-foreground">Search in All</Text>
      </Pressable>
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
  const [todayDetail, setTodayDetail] = useState<DayWorkoutDetailRow[]>([]);
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');
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

  // Session-static data loaded once. Per-focus freshness (routines, completedToday,
  // queueEnabled, streak) is owned by the focus effect below.
  useEffect(() => {
    (async () => {
      const [ex, wu] = await Promise.all([
        getAllExercises(db),
        getSetting(db, 'weight_unit'),
      ]);
      setExercises(ex);
      setWeightUnit((wu as 'lbs' | 'kg') ?? 'lbs');
      setLoaded(true);
    })();
  }, [db, today]);

  // Single owner of per-focus freshness data. Runs on every focus, including the
  // initial mount-focus, so it doesn't need to wait on `loaded`.
  useFocusEffect(
    useCallback(() => {
      Promise.all([
        getSetting(db, 'queue_enabled'),
        getWorkoutLogsForToday(db, today),
        getAllRoutines(db),
        getWorkoutStreak(db),
        getSetting(db, 'weight_unit'),
      ]).then(([qe, todayLogs, routs, s, wu]) => {
        setQueueEnabled((qe ?? DEFAULTS.queue_enabled) === 'true');
        setCompletedToday(new Set(todayLogs.map((r) => r.exercise_id)));
        setStreak(s);
        setRoutines(buildRoutineMap(routs));
        setWeightUnit((wu as 'lbs' | 'kg') ?? 'lbs');
      });
    }, [db, today])
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

  // Lazy: only fetch today's logged sets while the Today tab is being viewed.
  // Refetch on focus so edits made in the set editor (which don't change the set
  // of completed exercise ids) are reflected when returning to this tab.
  useFocusEffect(
    useCallback(() => {
      if (!loaded || selectedTab !== 'today') return;
      getDayWorkoutDetail(db, today).then(setTodayDetail);
    }, [db, loaded, selectedTab, today])
  );

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
      // Entire exercise library across all Gold Standard groups, deduped.
      const ids = new Set<string>();
      result = [];
      for (const group of GOLD_STANDARD_GROUPS) {
        for (const ex of goldMap.get(group) ?? []) {
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
  }, [selectedTab, recentExercises, goldMap, completedToday]);

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

  // Today's completed exercises grouped with their logged sets (Today tab).
  const todayGroups = useMemo<TodayGroup[]>(() => {
    const map = new Map<string, DayWorkoutDetailRow[]>();
    for (const row of todayDetail) {
      if (!map.has(row.exercise_id)) map.set(row.exercise_id, []);
      map.get(row.exercise_id)!.push(row);
    }
    let groups: TodayGroup[] = [...map.entries()].map(([exerciseId, rows]) => ({
      exerciseId,
      name: rows[0].exercise_name,
      bodyPart: rows[0].body_part,
      equipment: rows[0].equipment,
      assetId: rows[0].assetId,
      sets: rows.map((r) => ({ setNumber: r.set_number, weight: r.weight, reps: r.reps })),
    }));
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      groups = groups.filter(
        (g) => g.name.toLowerCase().includes(q) || g.equipment?.toLowerCase().includes(q)
      );
    }
    return groups;
  }, [todayDetail, debouncedSearch]);

  const tabs = useMemo(() => {
    const t: { key: string; label: string }[] = [
      { key: 'today', label: 'Today' },
      { key: 'recent', label: 'Recent' },
    ];
    for (const part of todayParts) t.push({ key: part, label: part });
    t.push({ key: 'all', label: 'All' });
    return t;
  }, [todayParts]);

  const currentTabLabel = useMemo(
    () => tabs.find((t) => t.key === selectedTab)?.label ?? selectedTab,
    [tabs, selectedTab]
  );

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

  const renderTodayGroup = useCallback(
    ({ item }: { item: TodayGroup }) => {
      const imageSource = getExerciseImage(item.assetId);
      return (
        <Pressable
          className="border-b border-border px-4 py-3.5 active:bg-muted"
          onPress={() => router.push(`/workout/today/${item.exerciseId}`)}
          accessibilityRole="button"
        >
          <View className="flex-row items-center gap-3 mb-3">
            {imageSource ? (
              <Image
                source={imageSource}
                className="w-[52px] h-[52px] rounded-[12px] bg-secondary"
                resizeMode="cover"
                accessibilityLabel={capitalizeWords(item.name)}
              />
            ) : (
              <View className="w-[52px] h-[52px] rounded-[12px] bg-secondary items-center justify-center">
                <Icon as={Dumbbell} className="size-6 text-muted-foreground" aria-hidden={true} />
              </View>
            )}
            <View className="flex-1 min-w-0">
              <Text className="font-semibold text-[15px] text-foreground" numberOfLines={2}>
                {capitalizeWords(item.name)}
              </Text>
              <Text className="text-[13px] text-muted-foreground mt-0.5">
                {capitalizeWords(item.equipment ?? '') || 'N/A'}
                {item.bodyPart ? ` · ${item.bodyPart}` : ''}
              </Text>
            </View>
            <Text className="text-xs text-muted-foreground font-medium">
              {item.sets.length} {item.sets.length === 1 ? 'set' : 'sets'}
            </Text>
          </View>
          <View className="pl-16">
            {item.sets.map((s) => (
              <View key={s.setNumber} className="flex-row items-center gap-4 mb-1">
                <Text className="text-sm text-muted-foreground w-6 tabular-nums">{s.setNumber}</Text>
                <Text className="text-sm text-foreground tabular-nums">
                  {displayWeight(s.weight, weightUnit)} {weightUnit}
                </Text>
                <Text className="text-sm text-muted-foreground">×</Text>
                <Text className="text-sm text-foreground tabular-nums">{s.reps} reps</Text>
              </View>
            ))}
          </View>
        </Pressable>
      );
    },
    [weightUnit]
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

      {/* Today tab — completed workouts with logged sets */}
      {selectedTab === 'today' ? (
        todayGroups.length === 0 ? (
          searchText ? (
            <SearchEmptyState label="Today" />
          ) : (
            <View className="flex-1 items-center justify-center px-8">
              <Text className="text-base text-muted-foreground text-center" numberOfLines={2}>
                No workouts logged today
              </Text>
            </View>
          )
        ) : (
          <FlatList
            className="flex-1"
            data={todayGroups}
            keyExtractor={(item) => item.exerciseId}
            renderItem={renderTodayGroup}
            keyboardShouldPersistTaps="handled"
          />
        )
      ) : /* Exercise list */ filteredExercises.length === 0 ? (
        searchText ? (
          selectedTab === 'all' ? (
            <View className="flex-1 items-center justify-center px-8">
              <Icon as={Search} className="size-12 text-muted-foreground mb-4" aria-hidden={true} />
              <Text className="text-base text-muted-foreground text-center">No exercises found</Text>
            </View>
          ) : (
            <SearchEmptyState label={currentTabLabel} />
          )
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
