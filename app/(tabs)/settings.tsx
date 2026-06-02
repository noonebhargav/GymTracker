import { View, Pressable, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { SegmentedControl } from '@/components/ui/segmented-control';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { RulerWheel } from '@/components/ui/ruler-wheel';
import { ScreenWrapper } from '@/components/ui/screen-wrapper';
import { getSetting, setSetting, resetAllData, displayWeight, toKg } from '@/lib/database';
import { ACCENT_COLORS, applyAccentColor } from '@/lib/accent-colors';
import { setAccent } from '@/lib/accent-store';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Uniwind } from 'uniwind';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Minus,
  Plus,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const DEFAULTS: Record<string, string> = {
  default_sets: '3',
  default_weight: '20',
  default_reps: '10',
  weight_unit: 'lbs',
  queue_enabled: 'false',
};

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="px-4 pt-4 pb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      {title}
    </Text>
  );
}

function StepperRow({
  label,
  value,
  min,
  max,
  step,
  fastStep,
  unit,
  showFast = true,
  onIncrement,
  SlowDecrease = ChevronLeft,
  SlowIncrease = ChevronRight,
  FastDecrease = ChevronsLeft,
  FastIncrease = ChevronsRight,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  fastStep: number;
  unit?: string;
  showFast?: boolean;
  onIncrement: (v: number) => void;
  SlowDecrease?: LucideIcon;
  SlowIncrease?: LucideIcon;
  FastDecrease?: LucideIcon;
  FastIncrease?: LucideIcon;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(String(value));

  const commit = () => {
    const parsed = parseInt(text, 10);
    if (!isNaN(parsed)) {
      onIncrement(Math.max(min, Math.min(max, parsed)));
    }
    setText(String(value));
    setEditing(false);
  };

  return (
    <View className="flex-row items-center px-4 py-3 border-b border-border">
      <Text className="text-base text-foreground flex-1 min-w-0" numberOfLines={1}>
        {label}
      </Text>
      <View className="flex-row items-center gap-1.5 shrink-0">
        {showFast && (
          <Pressable
            onPress={() => {
              onIncrement(Math.max(min, value - fastStep));
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }}
            className="size-11 items-center justify-center rounded-md bg-muted border border-border active:bg-muted/80"
            aria-label={`Decrease ${label} by ${fastStep}`}
          >
              <Icon as={FastDecrease} className="size-5 text-muted-foreground" aria-hidden={true} />
          </Pressable>
        )}
        <Pressable
          onPress={() => {
            onIncrement(Math.max(min, value - step));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }}
          className="size-11 items-center justify-center rounded-md bg-muted border border-border active:bg-muted/80"
          aria-label={`Decrease ${label} by ${step}`}
        >
          <Icon as={SlowDecrease} className="size-5 text-muted-foreground" aria-hidden={true} />
        </Pressable>

        {editing ? (
          <TextInput
            className="bg-muted border border-primary rounded-md px-3 py-3 text-center text-base font-semibold text-foreground min-w-16 max-w-24"
            value={text}
            onChangeText={setText}
            onBlur={commit}
            onSubmitEditing={commit}
            keyboardType="number-pad"
            selectTextOnFocus
            autoFocus
          />
        ) : (
          <Pressable onPress={() => { setText(String(value)); setEditing(true); }}>
            <Text className="text-base font-semibold text-foreground min-w-16 text-center tabular-nums">
              {value}{unit ? ` ${unit}` : ''}
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => {
            onIncrement(Math.min(max, value + step));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }}
          className="size-11 items-center justify-center rounded-md bg-muted border border-border active:bg-muted/80"
          aria-label={`Increase ${label} by ${step}`}
        >
          <Icon as={SlowIncrease} className="size-5 text-muted-foreground" aria-hidden={true} />
        </Pressable>
        {showFast && (
          <Pressable
            onPress={() => {
              onIncrement(Math.min(max, value + fastStep));
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }}
            className="size-11 items-center justify-center rounded-md bg-muted border border-border active:bg-muted/80"
            aria-label={`Increase ${label} by ${fastStep}`}
          >
            <Icon as={FastIncrease} className="size-5 text-muted-foreground" aria-hidden={true} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function AccentRow({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (key: string) => void;
}) {
  return (
    <View className="px-4 py-3 border-b border-border">
      <Text className="text-base text-foreground mb-3">Accent</Text>
      <View className="flex-row flex-wrap gap-3">
        {ACCENT_COLORS.map((color) => {
          const isSelected = selected === color.key;
          return (
            <Pressable
              key={color.key}
              onPress={() => onChange(color.key)}
              className={`size-11 rounded-full ${
                isSelected ? 'border-2 border-foreground' : 'border border-border'
              }`}
              style={{ backgroundColor: color.swatchHex }}
              aria-label={`${color.name} accent${isSelected ? ' selected' : ''}`}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function SettingsTab() {
  const db = useSQLiteContext();
  const [defaultSets, setDefaultSets] = useState(3);
  const [defaultWeight, setDefaultWeight] = useState(20);
  const [defaultReps, setDefaultReps] = useState(10);
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');
  const [queueEnabled, setQueueEnabled] = useState(false);
  const [theme, setTheme] = useState<string>('system');
  const [accentColor, setAccentColor] = useState<string>('lime');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [rulerOpen, setRulerOpen] = useState<'weight' | 'reps' | null>(null);

  useEffect(() => {
    let timeout = setTimeout(() => setError(true), 5000);
    (async () => {
      try {
        const sets = await getSetting(db, 'default_sets');
        const weight = await getSetting(db, 'default_weight');
        const reps = await getSetting(db, 'default_reps');
        const unit = await getSetting(db, 'weight_unit');
        const queue = await getSetting(db, 'queue_enabled');
        const thm = await getSetting(db, 'theme');
        const accent = await getSetting(db, 'accent_color');

        const resolvedUnit = (unit as 'lbs' | 'kg') ?? (DEFAULTS.weight_unit as 'lbs' | 'kg');
        const weightKg = Number(weight ?? DEFAULTS.default_weight);

        setDefaultSets(Number(sets ?? DEFAULTS.default_sets));
        setDefaultWeight(displayWeight(weightKg, resolvedUnit));
        setDefaultReps(Number(reps ?? DEFAULTS.default_reps));
        setWeightUnit(resolvedUnit);
        setQueueEnabled((queue ?? DEFAULTS.queue_enabled) === 'true');
        setTheme(thm ?? 'system');
        const validAccent = ACCENT_COLORS.some((c) => c.key === accent) ? accent! : 'lime';
        setAccentColor(validAccent);
      } catch {
        setError(true);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    })();
    return () => clearTimeout(timeout);
  }, [db]);

  const persistInt = useCallback(
    (key: string, value: number) => {
      setSetting(db, key, String(value));
    },
    [db]
  );

  const persistStr = useCallback(
    (key: string, value: string) => {
      setSetting(db, key, value);
    },
    [db]
  );

  const handleReset = useCallback(() => {
    // Dismiss the dialog immediately so it isn't blocked by the delete, then run the
    // wipe + restore-defaults after the dismissal interaction settles.
    setResetDialogOpen(false);
    requestAnimationFrame(async () => {
      try {
        await resetAllData(db);

        const kg = Number(DEFAULTS.default_weight);
        const unit = DEFAULTS.weight_unit as 'lbs' | 'kg';

        setDefaultSets(Number(DEFAULTS.default_sets));
        setDefaultWeight(displayWeight(kg, unit));
        setDefaultReps(Number(DEFAULTS.default_reps));
        setWeightUnit(unit);
        setQueueEnabled(false);
        setTheme('system');
        setAccentColor('lime');

        Uniwind.setTheme('system');
        applyAccentColor('lime');
        const lime = ACCENT_COLORS.find((c) => c.key === 'lime');
        setAccent(lime?.swatchHex);
      } catch {
        Alert.alert('Error', 'Could not reset data. Please try again.');
      }
    });
  }, [db]);

  if (loading) {
    return (
      <ScreenWrapper className="items-center justify-center">
        <ActivityIndicator />
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper className="items-center justify-center px-8">
        <Text className="text-base text-muted-foreground text-center">
          Could not load settings. Try restarting the app.
        </Text>
      </ScreenWrapper>
    );
  }

  const isKgRuler = weightUnit === 'kg';
  const weightMax = isKgRuler ? 300 : 600;
  const weightStep = 2.5;
  const weightLabelEvery = 4;
  const weightQuickSteps = isKgRuler ? [-5, -2.5, 2.5, 5] : [-10, -5, 5, 10, 25];

  return (
    <ScreenWrapper>
    <ScrollView
      className="flex-1"
      contentInsetAdjustmentBehavior="automatic"
    >
      <SectionHeader title="General" />
      <SegmentedControl
        label="Units"
        options={[
          { key: 'lbs', label: 'Lbs' },
          { key: 'kg', label: 'Kg' },
        ]}
        value={weightUnit}
        onChange={(v) => {
          const newUnit = v as 'lbs' | 'kg';
          const kg = toKg(defaultWeight, weightUnit);
          const newDisplay = displayWeight(kg, newUnit);
          setWeightUnit(newUnit);
          setDefaultWeight(newDisplay);
          persistStr('weight_unit', newUnit);
          persistInt('default_weight', toKg(newDisplay, newUnit));
        }}
      />
      <SegmentedControl
        label="Mode"
        description={"Skip: only today's scheduled parts show up.\nQueue: missed body parts roll over to today."}
        options={[
          { key: 'false', label: 'Skip' },
          { key: 'true', label: 'Queue' },
        ]}
        value={String(queueEnabled)}
        onChange={(v) => {
          const enabled = v === 'true';
          setQueueEnabled(enabled);
          persistStr('queue_enabled', v);
        }}
      />

      <SectionHeader title="Defaults" />
      <StepperRow
        label="Sets"
        value={defaultSets}
        min={2}
        max={6}
        step={1}
        fastStep={1}
        showFast={false}
        SlowDecrease={Minus}
        SlowIncrease={Plus}
        onIncrement={(v) => {
          setDefaultSets(v);
          persistInt('default_sets', v);
        }}
      />
      <Pressable
        className="flex-row items-center px-4 py-3 border-b border-border active:bg-muted/50"
        onPress={() => setRulerOpen('weight')}
        aria-label={`Default weight: ${defaultWeight} ${weightUnit}. Tap to change`}
      >
        <Text className="text-base text-foreground flex-1">Weight</Text>
        <Text className="text-base font-semibold text-foreground tabular-nums">
          {defaultWeight} {weightUnit}
        </Text>
      </Pressable>
      <Pressable
        className="flex-row items-center px-4 py-3 border-b border-border active:bg-muted/50"
        onPress={() => setRulerOpen('reps')}
        aria-label={`Default reps: ${defaultReps}. Tap to change`}
      >
        <Text className="text-base text-foreground flex-1">Reps</Text>
        <Text className="text-base font-semibold text-foreground tabular-nums">
          {defaultReps} reps
        </Text>
      </Pressable>

      <SectionHeader title="Appearance" />
      <SegmentedControl
        label="Theme"
        options={[
          { key: 'light', label: 'Light' },
          { key: 'system', label: 'System' },
          { key: 'dark', label: 'Dark' },
        ]}
        value={theme}
        onChange={(v) => {
          setTheme(v);
          persistStr('theme', v);
          const key = v as 'light' | 'dark' | 'system';
          Uniwind.setTheme(key);
          requestAnimationFrame(() => {
            applyAccentColor(accentColor);
          });
        }}
      />
      <AccentRow
        selected={accentColor}
        onChange={(key) => {
          setAccentColor(key);
          persistStr('accent_color', key);
          requestAnimationFrame(() => {
            applyAccentColor(key);
          });
          const color = ACCENT_COLORS.find((c) => c.key === key);
          setAccent(color ? color.swatchHex : undefined);
        }}
      />

      <SectionHeader title="Danger Zone" />
      <View className="px-4 py-4">
        <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <AlertDialogTrigger asChild>
            <Pressable
              className="w-full h-[52px] rounded-[14px] bg-danger-soft border border-danger/20 items-center justify-center active:opacity-80"
              aria-label="Reset all data"
            >
              <View className="flex-row items-center gap-2">
                <Icon as={TriangleAlert} className="size-4 text-destructive" />
                <Text className="text-base font-bold text-destructive">Reset all data</Text>
              </View>
            </Pressable>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset All Data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your workout history, weekly routines, and settings. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Text>Cancel</Text>
              </AlertDialogCancel>
              <Button variant="destructive" size="sm" onPress={handleReset}>
                <Text>Reset</Text>
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </View>

    </ScrollView>

    {rulerOpen !== null && (
      <RulerWheel
        title={rulerOpen === 'weight' ? 'DEFAULT WEIGHT' : 'DEFAULT REPS'}
        value={rulerOpen === 'weight' ? defaultWeight : defaultReps}
        onChange={(v) => {
          if (rulerOpen === 'weight') {
            setDefaultWeight(v);
            persistInt('default_weight', toKg(v, weightUnit));
          } else {
            setDefaultReps(v);
            persistInt('default_reps', v);
          }
        }}
        min={0}
        max={rulerOpen === 'weight' ? weightMax : 50}
        step={rulerOpen === 'weight' ? weightStep : 1}
        labelEvery={rulerOpen === 'weight' ? weightLabelEvery : 5}
        unit={rulerOpen === 'weight' ? weightUnit : 'reps'}
        quickSteps={rulerOpen === 'weight' ? weightQuickSteps : [-5, -1, 1, 5]}
        onDone={() => setRulerOpen(null)}
      />
    )}
    </ScreenWrapper>
  );
}
