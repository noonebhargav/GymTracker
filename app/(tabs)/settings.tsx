import { View, Pressable, ScrollView, TextInput, ActivityIndicator, InteractionManager, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
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
              className={`size-10 rounded-full ${
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
  const [accentColor, setAccentColor] = useState<string>('neutral');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

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
        setAccentColor(accent ?? 'neutral');
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

  const handleReset = useCallback(async () => {
    setResetting(true);
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
      setAccentColor('neutral');

      Uniwind.setTheme('system');
      InteractionManager.runAfterInteractions(() => {
        const effective = (Uniwind.currentTheme ?? 'light') as 'light' | 'dark';
        applyAccentColor('neutral', effective);
        setAccent(undefined);
      });

      setResetDialogOpen(false);
    } catch {
      Alert.alert('Error', 'Could not reset data. Please try again.');
      setResetDialogOpen(false);
    } finally {
      setResetting(false);
    }
  }, [db]);

  const isKg = weightUnit === 'kg';
  const wtFast = isKg ? 5 : 10;
  const wtSlow = isKg ? 2.5 : 5;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-base text-muted-foreground text-center">
          Could not load settings. Try restarting the app.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
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
      <StepperRow
        label="Weight"
        value={defaultWeight}
        min={0}
        max={999}
        step={wtSlow}
        fastStep={wtFast}
        unit={weightUnit}
        onIncrement={(v) => {
          setDefaultWeight(v);
          persistInt('default_weight', toKg(v, weightUnit));
        }}
      />
      <StepperRow
        label="Reps"
        value={defaultReps}
        min={0}
        max={99}
        step={1}
        fastStep={5}
        onIncrement={(v) => {
          setDefaultReps(v);
          persistInt('default_reps', v);
        }}
      />

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
          InteractionManager.runAfterInteractions(() => {
            const effective = key === 'system'
              ? (Uniwind.currentTheme as 'light' | 'dark')
              : key;
            applyAccentColor(accentColor, effective);
          });
        }}
      />
      <AccentRow
        selected={accentColor}
        onChange={(key) => {
          setAccentColor(key);
          persistStr('accent_color', key);
          InteractionManager.runAfterInteractions(() => {
            const effective = (theme === 'system'
              ? Uniwind.currentTheme
              : theme) as 'light' | 'dark';
            applyAccentColor(key, effective);
          });
          if (key && key !== 'neutral') {
            const color = ACCENT_COLORS.find((c) => c.key === key);
            setAccent(color ? (theme === 'dark' ? color.dark.primaryHex : color.light.primaryHex) : undefined);
          } else {
            setAccent(undefined);
          }
        }}
      />

      <SectionHeader title="Danger Zone" />
      <View className="px-4 py-4">
        <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full" disabled={resetting}>
              <Icon as={TriangleAlert} className="size-4 text-white" />
              <Text>Reset All Data</Text>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset All Data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your workout history, weekly routines, and settings. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {resetting && (
              <View className="items-center py-4">
                <ActivityIndicator />
                <Text className="text-sm text-muted-foreground mt-3">Resetting data...</Text>
              </View>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={resetting}>
                <Text>Cancel</Text>
              </AlertDialogCancel>
              <Button variant="destructive" size="sm" onPress={handleReset} disabled={resetting}>
                {resetting ? (
                  <Text>Resetting...</Text>
                ) : (
                  <Text>Reset</Text>
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </View>

    </ScrollView>
  );
}
