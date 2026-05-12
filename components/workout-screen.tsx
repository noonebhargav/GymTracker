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
  type ExerciseRow,
} from '@/lib/database';
import { toGoldStandardGroup } from '@/lib/exercise-groups';
import { getExerciseImage } from '@/lib/exercise-assets';
import { capitalizeWords } from '@/lib/utils';
import { useSQLiteContext } from 'expo-sqlite';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  Search,
  X,
} from 'lucide-react-native';

const DEFAULTS: Record<string, string> = {
  default_sets: '3',
  default_weight: '20',
  default_reps: '10',
  weight_unit: 'lbs',
  queue_enabled: 'true',
};

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

export function WorkoutScreen({ tab }: { tab: string }) {
  const db = useSQLiteContext();
  const selectedTab = tab;

  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [routines, setRoutines] = useState<Map<number, Set<string>>>(new Map());
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [recentExercises, setRecentExercises] = useState<ExerciseRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [queueEnabled, setQueueEnabled] = useState(true);
  const [searchText, setSearchText] = useState('');

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
      ]).then(([qe, todayLogs, routs]) => {
        setQueueEnabled((qe ?? DEFAULTS.queue_enabled) === 'true');
        setCompletedToday(new Set(todayLogs.map((r) => r.exercise_id)));
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
    if (!loaded || todayParts.length === 0) return;
    getRecentExercises(db, todayParts, 15).then((rows) => {
      const ids = new Set(rows.map((r) => r.exercise_id));
      setRecentExercises(exercises.filter((e) => ids.has(e.id)));
    });
  }, [db, loaded, todayParts, exercises]);

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
    if (selectedTab === 'recent') return recentExercises;
    if (selectedTab === 'all') {
      const ids = new Set<string>();
      const result: ExerciseRow[] = [];
      for (const part of todayParts) {
        for (const ex of goldMap.get(part) ?? []) {
          if (!ids.has(ex.id)) {
            ids.add(ex.id);
            result.push(ex);
          }
        }
      }
      return result;
    }
    return goldMap.get(selectedTab) ?? [];
  }, [selectedTab, recentExercises, todayParts, goldMap]);

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
    router.push(`/workout/${encodeURIComponent(tabKey)}`);
  }, []);

  if (!loaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Search bar — on top */}
      <View className="px-4 pt-2 pb-2">
        <View className="flex-row items-center bg-muted rounded-lg px-3 h-10">
          <Icon as={Search} className="size-4 text-muted-foreground mr-2" aria-hidden={true} />
          <TextInput
            className="flex-1 text-sm text-foreground"
            placeholder="Search exercises…"
            placeholderTextColor="hsl(0 0% 45%)"
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
              className="p-1"
              aria-label="Clear search"
            >
              <Icon as={X} className="size-4 text-muted-foreground" aria-hidden={true} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Horizontal filter tabs — below search */}
      <View style={{ flexGrow: 0, flexShrink: 1 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="border-b border-border"
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 10 }}
        >
          {tabs.map((t) => {
            const active = t.key === selectedTab;
            return (
              <Pressable
                key={t.key}
                onPress={() => navigateToTab(t.key)}
                className={`h-9 px-3 items-center justify-center rounded-full ${
                  active
                    ? 'bg-primary border border-primary'
                    : 'bg-muted border border-border active:bg-muted/80'
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
          renderItem={({ item }) => {
            const isDone = completedToday.has(item.id);
            const g = toGoldStandardGroup(item.body_part, item.target);
            const imageSource = getExerciseImage(item.assetId);

            return (
              <Pressable
                onPress={() =>
                  router.push(
                    `/workout/${encodeURIComponent(selectedTab)}/${item.id}`
                  )
                }
                className="active:bg-muted"
              >
                <View className="flex-row items-center px-4 py-3 border-b border-border gap-3">
                  {imageSource ? (
                    <Image
                      source={imageSource}
                      className="size-12 rounded-md bg-muted"
                      resizeMode="cover"
                      accessibilityLabel={capitalizeWords(item.name)}
                    />
                  ) : (
                    <View className="size-12 rounded-md bg-muted items-center justify-center">
                      <Icon as={Search} className="size-5 text-muted-foreground" aria-hidden={true} />
                    </View>
                  )}
                  <View className="flex-1 min-w-0">
                    <Text className="text-sm font-medium text-foreground" numberOfLines={2}>
                      {capitalizeWords(item.name)}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      {capitalizeWords(item.equipment) || 'N/A'}
                      {g ? ` · ${g}` : ''}
                    </Text>
                  </View>
                  {isDone && (
                    <View className="bg-primary/15 rounded-full px-2.5 py-0.5">
                      <Text className="text-xs font-semibold text-primary">Done</Text>
                    </View>
                  )}
                  <Icon
                    as={ChevronRight}
                    className="size-4 text-muted-foreground"
                    aria-hidden={true}
                  />
                </View>
              </Pressable>
            );
          }}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}
