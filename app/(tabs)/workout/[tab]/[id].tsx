import { useLocalSearchParams, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Pressable, ScrollView, Image } from 'react-native';
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
  getExercisePRHistory,
  displayWeight,
  toKg,
  type ExerciseDetail,
  type WorkoutSetInput,
} from '@/lib/database';
import { getExerciseImage } from '@/lib/exercise-assets';
import { capitalizeWords } from '@/lib/utils';
import { toGoldStandardGroup } from '@/lib/exercise-groups';
import { RulerWheel } from '@/components/ui/ruler-wheel';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Check,
  Dumbbell,
  ExternalLink,
  MinusCircle,
  Plus,
  Trash2,
  Trophy,
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
  const [defaultWeight, setDefaultWeight] = useState(20);
  const [defaultReps, setDefaultReps] = useState(10);
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');
  const [setValues, setSetValues] = useState<SetValues[]>([]);
  const [initialSetValues, setInitialSetValues] = useState<SetValues[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [rulerWheel, setRulerWheel] = useState<{ setIdx: number; field: 'weight' | 'reps' } | null>(null);
  const [prWeight, setPrWeight] = useState<number | null>(null);

  const today = todayDateStr();
  const isKg = weightUnit === 'kg';
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
      if (!ex) { router.back(); return; }
      setExercise(ex);

      const dsNum = Number(ds ?? DEFAULTS.default_sets);
      const dwKg = Number(dw ?? DEFAULTS.default_weight);
      const drNum = Number(dr ?? DEFAULTS.default_reps);
      const resolvedUnit = (wu as 'lbs' | 'kg') ?? (DEFAULTS.weight_unit as 'lbs' | 'kg');
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
              sets.push({ weight: displayWeight(lastSets[i].weight, resolvedUnit), reps: lastSets[i].reps });
            } else if (lastSets.length > 0) {
              const last = lastSets[lastSets.length - 1];
              sets.push({ weight: displayWeight(last.weight, resolvedUnit), reps: last.reps });
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
  }, []);

  const addSet = useCallback(() => {
    setSetValues((prev) => {
      const last = prev[prev.length - 1] ?? { weight: defaultWeight, reps: defaultReps };
      return [...prev, { ...last }];
    });
  }, [defaultWeight, defaultReps]);

  const removeSet = useCallback((idx: number) => {
    setSetValues((prev) => prev.filter((_, i) => i !== idx));
  }, []);

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

      const sessionMax = Math.max(...setValues.map((s) => s.weight));
      const historicalMax = await getExercisePRHistory(db, exercise.id, today);
      if (sessionMax > historicalMax) {
        setPrWeight(sessionMax);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setIsDone(true);
      setInitialSetValues([...setValues]);
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
    if (exercise) router.push(`/exercise-detail/${exercise.id}`);
  }, [exercise]);

  const unit = isKg ? 'kg' : 'lbs';
  const weightMax = isKg ? 300 : 600;
  const weightStep = isKg ? 2.5 : 5;
  const weightQuickSteps = isKg ? [-5, -2.5, 2.5, 5] : [-10, -5, 5, 10, 25];

  if (!loaded) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  if (!exercise) return null;

  const activeSetIdx = rulerWheel?.setIdx ?? null;
  const activeField = rulerWheel?.field ?? null;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-2 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-3" aria-label="Back">
          <Icon as={ArrowLeft} className="size-5 text-foreground" aria-hidden={true} />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground flex-1" numberOfLines={1}>
          {capitalizeWords(exercise.name)}
        </Text>
        {prWeight !== null && (
          <View className="flex-row items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mr-1">
            <Icon as={Trophy} className="size-3.5 text-primary" aria-hidden={true} />
            <Text className="text-xs font-bold text-primary">PR — {prWeight} {unit}</Text>
          </View>
        )}
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {/* Exercise info row */}
        <Pressable onPress={goToDetail} className="active:bg-muted/50">
          <View className="flex-row items-center px-4 py-4 gap-3 border-b border-border">
            {imageSource ? (
              <Image source={imageSource} className="w-[52px] h-[52px] rounded-[12px] bg-secondary" resizeMode="cover" />
            ) : (
              <View className="w-[52px] h-[52px] rounded-[12px] bg-secondary items-center justify-center">
                <Icon as={Dumbbell} className="size-6 text-muted-foreground" />
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

        {/* Set rows */}
        <View className="px-4 pt-4">
          {setValues.map((s, idx) => (
            <View key={idx} className="flex-row items-center gap-2 mb-3">
              {/* Set number */}
              <View className="w-9 h-9 rounded-full bg-secondary items-center justify-center shrink-0">
                <Text className="text-sm font-bold text-muted-foreground">{idx + 1}</Text>
              </View>

              {/* Field cards */}
              <View className="flex-row gap-2 flex-1">
                {/* Weight card */}
                <Pressable
                  onPress={() => setRulerWheel({ setIdx: idx, field: 'weight' })}
                  className="flex-1 bg-secondary rounded-xl p-2 items-center"
                  style={{
                    borderWidth: 2,
                    borderColor: activeSetIdx === idx && activeField === 'weight' ? '#d8fe3d' : 'transparent',
                  }}
                  aria-label={`Set ${idx + 1} weight: ${s.weight} ${unit}`}
                >
                  <Text className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Weight
                  </Text>
                  <Text className="font-bold text-[22px] text-foreground tabular-nums leading-tight">
                    {s.weight}
                    <Text className="text-xs text-muted-foreground font-medium"> {unit}</Text>
                  </Text>
                </Pressable>

                {/* Reps card */}
                <Pressable
                  onPress={() => setRulerWheel({ setIdx: idx, field: 'reps' })}
                  className="flex-1 bg-secondary rounded-xl p-2 items-center"
                  style={{
                    borderWidth: 2,
                    borderColor: activeSetIdx === idx && activeField === 'reps' ? '#d8fe3d' : 'transparent',
                  }}
                  aria-label={`Set ${idx + 1} reps: ${s.reps}`}
                >
                  <Text className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Reps
                  </Text>
                  <Text className="font-bold text-[22px] text-foreground tabular-nums leading-tight">
                    {s.reps}
                    <Text className="text-xs text-muted-foreground font-medium"> reps</Text>
                  </Text>
                </Pressable>
              </View>

              {/* Remove button */}
              {setValues.length > 1 ? (
                <Pressable
                  onPress={() => removeSet(idx)}
                  className="w-9 h-9 items-center justify-center rounded-full active:bg-destructive/10 shrink-0"
                  aria-label={`Remove set ${idx + 1}`}
                >
                  <Icon as={MinusCircle} className="size-5 text-destructive" />
                </Pressable>
              ) : (
                <View className="w-9 shrink-0" />
              )}
            </View>
          ))}
        </View>

        {/* Add Set */}
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

        {/* Action buttons */}
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

      {/* RulerWheel overlay */}
      {rulerWheel !== null && (
        <RulerWheel
          title={`SET ${rulerWheel.setIdx + 1} · ${rulerWheel.field.toUpperCase()}`}
          value={rulerWheel.field === 'weight'
            ? setValues[rulerWheel.setIdx].weight
            : setValues[rulerWheel.setIdx].reps}
          onChange={(v) => updateSetValue(rulerWheel.setIdx, rulerWheel.field, v)}
          min={0}
          max={rulerWheel.field === 'weight' ? weightMax : 50}
          step={rulerWheel.field === 'weight' ? weightStep : 1}
          unit={rulerWheel.field === 'weight' ? unit : 'reps'}
          quickSteps={rulerWheel.field === 'weight' ? weightQuickSteps : [-5, -1, 1, 5]}
          onDone={() => setRulerWheel(null)}
        />
      )}
    </View>
  );
}
