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
import { ExerciseRow as ExerciseRowComponent, DoneBadge, RowChevron } from '@/components/exercise-row';
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

const TAB_BAR_WRAPPER_STYLE = { flexGrow: 0, flexShrink: 1 } as const;
const TAB_BAR_CONTENT_STYLE = { paddingHorizontal: 12, paddingVertical: 10, gap: 10 } as const;

function todayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function yesterdayDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function mapJsDayToOur(jsDay: number): number {
  return (jsDay + 6) % 7;
}


const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function SessionPill({ label }: { label: string }) {
  return (
    <View className="bg-primary rounded-full px-2.5 py-1">
      <Text className="text-[11px] font-semibold text-primary-foreground" numberOfLines={1}>
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
  const [streak, setStreak] = useState(0);

  const today = todayDateStr();
  const todayIndex = mapJsDayToOur(new Date().getDay());

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
    getLoggedBodyPartsForDate(db, yesterdayDateStr()).then((parts) => {
      setLoggedYesterdayParts(new Set(parts));
    });
  }, [db, loaded, queueEnabled]);

  useEffect(() => {
    if (!loaded) return;
    if (todayParts.length === 0) {
      setRecentExercises([]);
      return;
    }
    getRecentExercises(db, todayParts, 15).then((rows) => {
      setRecentExercises(rows);
    });
  }, [db, loaded, todayParts]);

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

  const filteredExercises = useMemo(() => {
    if (!searchText) return baseFiltered;
    const q = searchText.toLowerCase();
    return baseFiltered.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.equipment?.toLowerCase().includes(q)
    );
  }, [baseFiltered, searchText]);

  const tabs = useMemo(() => {
    const t: { key: string; label: string }[] = [{ key: 'recent', label: 'Recent' }];
    for (const part of todayParts) t.push({ key: part, label: part });
    t.push({ key: 'all', label: 'All' });
    return t;
  }, [todayParts]);

  const navigateToTab = useCallback((tabKey: string) => {
    setSearchText('');
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
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
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
              className="p-3"
              aria-label="Clear search"
            >
              <Icon as={X} className="size-4 text-muted-foreground" aria-hidden={true} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Horizontal filter tabs — below search */}
      <View style={TAB_BAR_WRAPPER_STYLE}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="border-b border-border"
          contentContainerStyle={TAB_BAR_CONTENT_STYLE}
        >
          {tabs.map((t) => {
            const active = t.key === selectedTab;
            return (
              <Pressable
                key={t.key}
                onPress={() => navigateToTab(t.key)}
                className={`h-9 px-4 items-center justify-center rounded-full ${
                  active
                    ? 'bg-primary border border-primary'
                    : 'bg-secondary text-muted-foreground active:bg-secondary/80'
                }`}
                aria-label={`Filter by ${t.label}`}
              >
                <Text
                  className={`text-sm font-medium ${
                    active ? 'text-primary-foreground' : 'text-foreground'
                  }`}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

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
    </View>
  );
}
