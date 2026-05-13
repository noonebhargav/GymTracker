import { useLocalSearchParams, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useEffect, useMemo } from 'react';
import { View, Pressable, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { getDayWorkoutDetail, type DayWorkoutDetailRow } from '@/lib/database';
import { getExerciseImage } from '@/lib/exercise-assets';
import { capitalizeWords } from '@/lib/utils';
import { ArrowLeft, Search } from 'lucide-react-native';

function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

type SetEntry = { setNumber: number; weight: number; reps: number };
type ExerciseGroup = {
  exerciseId: string;
  name: string;
  bodyPart: string;
  equipment: string | null;
  assetId: string | null;
  sets: SetEntry[];
};

export default function HistoryDateDetail() {
  const db = useSQLiteContext();
  const { date } = useLocalSearchParams<{ date: string }>();
  const [detail, setDetail] = useState<DayWorkoutDetailRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!date) return;
    getDayWorkoutDetail(db, date).then((rows) => {
      setDetail(rows);
      setLoaded(true);
    });
  }, [db, date]);

  const groups = useMemo(() => {
    const map = new Map<string, DayWorkoutDetailRow[]>();
    for (const row of detail) {
      if (!map.has(row.exercise_id)) map.set(row.exercise_id, []);
      map.get(row.exercise_id)!.push(row);
    }
    return [...map.entries()].map(([exerciseId, rows]) => ({
      exerciseId,
      name: rows[0].exercise_name,
      bodyPart: rows[0].body_part,
      equipment: rows[0].equipment,
      assetId: rows[0].assetId,
      sets: rows.map((r) => ({
        setNumber: r.set_number,
        weight: r.weight,
        reps: r.reps,
      })),
    }));
  }, [detail]);

  const daySummary = useMemo(() => {
    const bodyParts = new Set<string>();
    let setCount = 0;
    let totalWeight = 0;
    let totalReps = 0;
    for (const row of detail) {
      bodyParts.add(row.body_part);
      setCount++;
      totalWeight += row.weight;
      totalReps += row.reps;
    }
    return {
      bodyParts: [...bodyParts],
      exerciseCount: groups.length,
      setCount,
      avgWeight: setCount > 0 ? totalWeight / setCount : 0,
      avgReps: setCount > 0 ? totalReps / setCount : 0,
    };
  }, [detail, groups]);

  if (!loaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (detail.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-base text-muted-foreground text-center">
          No workout data for this date
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-2 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-1 mr-2" aria-label="Go back">
          <Icon as={ArrowLeft} className="size-5 text-foreground" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground flex-1" numberOfLines={1}>
          {formatDateLong(date!)}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Day Summary Card */}
        <View className="mx-4 mt-4 rounded-xl border border-primary/10 p-4">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Day Summary
          </Text>
          {daySummary.bodyParts.length > 0 && (
            <View className="flex-row flex-wrap gap-1.5 mb-3">
              {daySummary.bodyParts.map((bp) => (
                <View
                  key={bp}
                  className="bg-primary/10 rounded-full px-2.5 py-0.5"
                >
                  <Text className="text-xs font-medium text-primary">{bp}</Text>
                </View>
              ))}
            </View>
          )}
          <View className="gap-1">
            <Text className="text-sm text-muted-foreground">
              Exercises: {daySummary.exerciseCount}
              {'  |  '}
              Sets: {daySummary.setCount}
            </Text>
            <Text className="text-sm text-muted-foreground">
              Avg Weight: {Math.round(daySummary.avgWeight)} lbs
              {'  |  '}
              Avg Reps: {Math.round(daySummary.avgReps)}
            </Text>
          </View>
        </View>

        {/* Exercise list */}
        {groups.map((group) => {
          const imageSource = getExerciseImage(group.assetId);
          return (
            <View key={group.exerciseId} className="mt-4 border-b border-border px-4 pb-4">
              <View className="flex-row items-center gap-3 mb-3">
                {imageSource ? (
                  <Image
                    source={imageSource}
                    className="size-10 rounded-md bg-muted"
                    resizeMode="cover"
                    accessibilityLabel={capitalizeWords(group.name)}
                  />
                ) : (
                  <View className="size-10 rounded-md bg-muted items-center justify-center">
                    <Icon as={Search} className="size-4 text-muted-foreground" aria-hidden={true} />
                  </View>
                )}
                <View className="flex-1 min-w-0">
                  <Text className="text-sm font-semibold text-foreground" numberOfLines={2}>
                    {capitalizeWords(group.name)}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {capitalizeWords(group.equipment) || 'N/A'}
                    {group.bodyPart ? ` · ${group.bodyPart}` : ''}
                  </Text>
                </View>
                <Text className="text-xs text-muted-foreground font-medium">
                  {group.sets.length} {group.sets.length === 1 ? 'set' : 'sets'}
                </Text>
              </View>

              <View className="pl-13">
                {group.sets.map((s) => (
                  <View key={s.setNumber} className="flex-row items-center gap-4 mb-1">
                    <Text className="text-sm text-muted-foreground w-6 tabular-nums">
                      {s.setNumber}
                    </Text>
                    <Text className="text-sm text-foreground tabular-nums">
                      {s.weight} lbs
                    </Text>
                    <Text className="text-sm text-muted-foreground">×</Text>
                    <Text className="text-sm text-foreground tabular-nums">
                      {s.reps} reps
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
