import { useLocalSearchParams, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  Keyboard,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import {
  getExerciseById,
  getSetting,
  getWorkoutSetsForDate,
  getLastWorkoutSets,
  replaceWorkoutSets,
  deleteWorkoutSets,
  getWorkoutLogsForToday,
  displayWeight,
  toKg,
  type ExerciseDetail,
  type WorkoutSetInput,
} from '@/lib/database';
import { getExerciseImage } from '@/lib/exercise-assets';
import { capitalizeWords } from '@/lib/utils';
import { toGoldStandardGroup } from '@/lib/exercise-groups';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  MinusCircle,
  Plus,
  Check,
  Trash2,
  Search,
} from 'lucide-react-native';

const DEFAULTS: Record<string, string> = {
  default_sets: '3',
  default_weight: '20',
  default_reps: '10',
  weight_unit: 'lbs',
};

function todayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type SetValues = { weight: number; reps: number };

export default function ExerciseSetEditor() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ tab: string; id: string }>();
  const exerciseId = id ?? '';

  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [defaultSets, setDefaultSets] = useState(3);
  const [defaultWeight, setDefaultWeight] = useState(20);
  const [defaultReps, setDefaultReps] = useState(10);
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');
  const [setValues, setSetValues] = useState<SetValues[]>([]);
  const [initialSetValues, setInitialSetValues] = useState<SetValues[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [weightFocusedIdx, setWeightFocusedIdx] = useState<number | null>(null);
  const [repsFocusedIdx, setRepsFocusedIdx] = useState<number | null>(null);

  const today = todayDateStr();
  const isKg = weightUnit === 'kg';
  const wtFast = isKg ? 5 : 10;
  const wtSlow = isKg ? 2.5 : 5;
  const goldGroup = exercise ? toGoldStandardGroup(exercise.body_part, exercise.target) : null;
  const imageSource = getExerciseImage(exercise?.assetId ?? null);

  const isDirty = useMemo(
    () => JSON.stringify(setValues) !== JSON.stringify(initialSetValues),
    [setValues, initialSetValues]
  );

  useEffect(() => {
    if (!exerciseId) return;

    Promise.all([
      getExerciseById(db, exerciseId),
      getSetting(db, 'default_sets'),
      getSetting(db, 'default_weight'),
      getSetting(db, 'default_reps'),
      getSetting(db, 'weight_unit'),
      getWorkoutLogsForToday(db, today),
    ]).then(([ex, ds, dw, dr, wu, todayLogs]) => {
      if (!ex) {
        router.back();
        return;
      }
      setExercise(ex);

      const dsNum = Number(ds ?? DEFAULTS.default_sets);
      const dwKg = Number(dw ?? DEFAULTS.default_weight);
      const drNum = Number(dr ?? DEFAULTS.default_reps);
      const resolvedUnit = (wu as 'lbs' | 'kg') ?? (DEFAULTS.weight_unit as 'lbs' | 'kg');
      setDefaultSets(dsNum);
      setDefaultWeight(displayWeight(dwKg, resolvedUnit));
      setDefaultReps(drNum);
      setWeightUnit(resolvedUnit);

      const done = new Set(todayLogs.map((r) => r.exercise_id)).has(exerciseId);
      setIsDone(done);

      if (done) {
        getWorkoutSetsForDate(db, today, exerciseId).then((todaySets) => {
          const sets: SetValues[] = todaySets.map((s) => ({
            weight: displayWeight(s.weight, resolvedUnit),
            reps: s.reps,
          }));
          setSetValues(sets.length ? sets : []);
          setInitialSetValues([...sets]);
          setLoaded(true);
        });
      } else {
        getLastWorkoutSets(db, exerciseId).then((lastSets) => {
          const sets: SetValues[] = [];
          for (let i = 0; i < dsNum; i++) {
            if (i < lastSets.length) {
              sets.push({
                weight: displayWeight(lastSets[i].weight, resolvedUnit),
                reps: lastSets[i].reps,
              });
            } else if (lastSets.length > 0) {
              sets.push({
                weight: displayWeight(lastSets[lastSets.length - 1].weight, resolvedUnit),
                reps: lastSets[lastSets.length - 1].reps,
              });
            } else {
              sets.push({ weight: displayWeight(dwKg, resolvedUnit), reps: drNum });
            }
          }
          setSetValues(sets);
          setInitialSetValues([...sets]);
          setLoaded(true);
        });
      }
    });
  }, [db, exerciseId, today]);

  const updateSetValue = useCallback((idx: number, field: 'weight' | 'reps', value: number) => {
    setSetValues((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: Math.max(0, value) };
      return next;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const addSet = useCallback(() => {
    setSetValues((prev) => {
      const last = prev[prev.length - 1] ?? { weight: defaultWeight, reps: defaultReps };
      return [...prev, { ...last }];
    });
  }, [defaultWeight, defaultReps]);

  const markAsDone = useCallback(async () => {
    if (!exercise) return;
    const g = toGoldStandardGroup(exercise.body_part, exercise.target);
    if (!g) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    const inputs: WorkoutSetInput[] = setValues.map((s, i) => ({
      exercise_id: exercise.id,
      set_number: i + 1,
      weight: toKg(s.weight, weightUnit),
      reps: s.reps,
      date_logged: today,
      body_part: g,
    }));
    try {
      await replaceWorkoutSets(db, today, exercise.id, inputs);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.back();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  }, [db, setValues, today, exercise, weightUnit]);

  const removeFromDone = useCallback(async () => {
    if (!exercise) return;
    await deleteWorkoutSets(db, today, exercise.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    router.back();
  }, [db, today, exercise]);

  const goToDetail = useCallback(() => {
    if (exercise) {
      router.push(`/exercise-detail/${exercise.id}`);
    }
  }, [exercise]);

  const removeSet = useCallback((idx: number) => {
    setSetValues((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  if (!loaded) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  if (!exercise) return null;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-2 border-b border-border">
        <Pressable
          onPress={() => router.back()}
          className="p-3"
          aria-label="Back"
        >
          <Icon as={ArrowLeft} className="size-5 text-foreground" aria-hidden={true} />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground flex-1" numberOfLines={1}>
          {capitalizeWords(exercise.name)}
        </Text>
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <Pressable onPress={goToDetail} className="active:bg-muted/50">
          <View className="flex-row items-center px-4 py-4 gap-3 border-b border-border">
            {imageSource ? (
              <Image source={imageSource} className="size-14 rounded-lg bg-muted" resizeMode="cover" />
            ) : (
              <View className="size-14 rounded-lg bg-muted items-center justify-center">
                <Icon as={Search} className="size-6 text-muted-foreground" />
              </View>
            )}
            <View className="flex-1 min-w-0">
              <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                {capitalizeWords(exercise.name)}
              </Text>
              <Text className="text-sm text-muted-foreground mt-0.5">
                {capitalizeWords(exercise.equipment) || 'N/A'}
                {goldGroup ? ` · ${goldGroup}` : ''}
              </Text>
            </View>
            <Icon as={ExternalLink} className="size-4 text-muted-foreground shrink-0" />
          </View>
        </Pressable>

        <View className="px-4 pt-4">
          {setValues.map((s, idx) => (
            <View key={idx} className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs text-muted-foreground font-semibold">
                  Set {idx + 1}
                </Text>
                {setValues.length > 1 && (
                  <Pressable
                    onPress={() => removeSet(idx)}
                    className="size-11 items-center justify-center rounded-full active:bg-destructive/10"
                    aria-label={`Remove set ${idx + 1}`}
                  >
                    <Icon as={MinusCircle} className="size-5 text-destructive" />
                  </Pressable>
                )}
              </View>

              <View className="flex-row items-center justify-center gap-1.5 mb-2">
                <Pressable
                  onPress={() => updateSetValue(idx, 'weight', Math.max(0, s.weight - wtFast))}
                  className="size-11 items-center justify-center rounded-md bg-muted border border-border active:bg-muted/80"
                  aria-label="Decrease weight fast"
                >
                  <Icon as={ChevronsLeft} className="size-5 text-muted-foreground" />
                </Pressable>
                <Pressable
                  onPress={() => updateSetValue(idx, 'weight', s.weight - wtSlow)}
                  className="size-11 items-center justify-center rounded-md bg-muted border border-border active:bg-muted/80"
                  aria-label="Decrease weight"
                >
                  <Icon as={ChevronLeft} className="size-5 text-muted-foreground" />
                </Pressable>
                <TextInput
                  className="bg-transparent border border-border rounded-md px-3 py-3 text-center text-base font-semibold text-foreground tabular-nums"
                  style={{ minWidth: 80 }}
                  value={
                    weightFocusedIdx === idx
                      ? String(s.weight)
                      : `${s.weight} ${isKg ? 'kg' : 'lbs'}`
                  }
                  onFocus={() => setWeightFocusedIdx(idx)}
                  onBlur={() => setWeightFocusedIdx(null)}
                  onChangeText={(t) => {
                    const v = parseFloat(t);
                    if (!isNaN(v)) updateSetValue(idx, 'weight', v);
                  }}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  selectTextOnFocus
                />
                <Pressable
                  onPress={() => updateSetValue(idx, 'weight', s.weight + wtSlow)}
                  className="size-11 items-center justify-center rounded-md bg-muted border border-border active:bg-muted/80"
                  aria-label="Increase weight"
                >
                  <Icon as={ChevronRight} className="size-5 text-muted-foreground" />
                </Pressable>
                <Pressable
                  onPress={() => updateSetValue(idx, 'weight', s.weight + wtFast)}
                  className="size-11 items-center justify-center rounded-md bg-muted border border-border active:bg-muted/80"
                  aria-label="Increase weight fast"
                >
                  <Icon as={ChevronsRight} className="size-5 text-muted-foreground" />
                </Pressable>
              </View>

              <View className="flex-row items-center justify-center gap-1.5">
                <Pressable
                  onPress={() => updateSetValue(idx, 'reps', Math.max(0, s.reps - 5))}
                  className="size-11 items-center justify-center rounded-md bg-muted border border-border active:bg-muted/80"
                  aria-label="Decrease reps fast"
                >
                  <Icon as={ChevronsLeft} className="size-5 text-muted-foreground" />
                </Pressable>
                <Pressable
                  onPress={() => updateSetValue(idx, 'reps', s.reps - 1)}
                  className="size-11 items-center justify-center rounded-md bg-muted border border-border active:bg-muted/80"
                  aria-label="Decrease reps"
                >
                  <Icon as={ChevronLeft} className="size-5 text-muted-foreground" />
                </Pressable>
                <TextInput
                  className="bg-transparent border border-border rounded-md px-3 py-3 text-center text-base font-semibold text-foreground tabular-nums"
                  style={{ minWidth: 80 }}
                  value={repsFocusedIdx === idx ? String(s.reps) : `${s.reps} reps`}
                  onFocus={() => setRepsFocusedIdx(idx)}
                  onBlur={() => setRepsFocusedIdx(null)}
                  onChangeText={(t) => {
                    const v = parseInt(t, 10);
                    if (!isNaN(v)) updateSetValue(idx, 'reps', v);
                  }}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  selectTextOnFocus
                />
                <Pressable
                  onPress={() => updateSetValue(idx, 'reps', s.reps + 1)}
                  className="size-11 items-center justify-center rounded-md bg-muted border border-border active:bg-muted/80"
                  aria-label="Increase reps"
                >
                  <Icon as={ChevronRight} className="size-5 text-muted-foreground" />
                </Pressable>
                <Pressable
                  onPress={() => updateSetValue(idx, 'reps', s.reps + 5)}
                  className="size-11 items-center justify-center rounded-md bg-muted border border-border active:bg-muted/80"
                  aria-label="Increase reps fast"
                >
                  <Icon as={ChevronsRight} className="size-5 text-muted-foreground" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View className="px-4 pb-4 mt-1">
          <Pressable
            onPress={addSet}
            className="py-3 rounded-lg border border-dashed border-border items-center active:bg-muted"
          >
            <View className="flex-row items-center gap-1.5">
              <Icon as={Plus} className="size-4 text-muted-foreground" />
              <Text className="text-sm font-medium text-muted-foreground">Add Set</Text>
            </View>
          </Pressable>
        </View>

        <View className="px-4 pb-8 flex-row gap-3">
          {isDone && !isDirty ? (
            <Pressable
              onPress={removeFromDone}
              className="flex-1 py-3 rounded-lg border border-destructive items-center active:bg-destructive/10"
            >
              <View className="flex-row items-center gap-1.5">
                <Icon as={Trash2} className="size-4 text-destructive" />
                <Text className="text-sm font-semibold text-destructive">Remove</Text>
              </View>
            </Pressable>
          ) : (
            <Pressable
              onPress={markAsDone}
              className="flex-1 py-3 rounded-lg bg-primary items-center active:bg-primary/90"
            >
              <View className="flex-row items-center gap-1.5">
                <Icon as={Check} className="size-4 text-primary-foreground" />
                <Text className="text-sm font-semibold text-primary-foreground">Mark as Done</Text>
              </View>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
