import { View, Pressable, ScrollView, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { getSetting, setSetting } from '@/lib/database';
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
  Sun,
  Moon,
  SunMoon,
  type LucideIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const DEFAULTS: Record<string, string> = {
  default_sets: '3',
  default_weight: '20',
  default_reps: '10',
  weight_unit: 'lbs',
  queue_enabled: 'true',
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
            className="size-8 items-center justify-center rounded-md bg-muted border border-border active:bg-muted/80"
            aria-label={`Decrease ${label} by ${fastStep}`}
          >
              <Icon as={FastDecrease} className="size-4 text-muted-foreground" aria-hidden={true} />
          </Pressable>
        )}
        <Pressable
          onPress={() => {
            onIncrement(Math.max(min, value - step));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }}
          className="size-8 items-center justify-center rounded-md bg-muted border border-border active:bg-muted/80"
          aria-label={`Decrease ${label} by ${step}`}
        >
          <Icon as={SlowDecrease} className="size-4 text-muted-foreground" aria-hidden={true} />
        </Pressable>

        {editing ? (
          <TextInput
            className="bg-muted border border-primary rounded-md px-3 py-1.5 text-center text-base font-semibold text-foreground min-w-16"
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
          className="size-8 items-center justify-center rounded-md bg-muted border border-border active:bg-muted/80"
          aria-label={`Increase ${label} by ${step}`}
        >
          <Icon as={SlowIncrease} className="size-4 text-muted-foreground" aria-hidden={true} />
        </Pressable>
        {showFast && (
          <Pressable
            onPress={() => {
              onIncrement(Math.min(max, value + fastStep));
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }}
            className="size-8 items-center justify-center rounded-md bg-muted border border-border active:bg-muted/80"
            aria-label={`Increase ${label} by ${fastStep}`}
          >
            <Icon as={FastIncrease} className="size-4 text-muted-foreground" aria-hidden={true} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function ThemeToggleRow({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const options = [
    { key: 'light', icon: Sun, label: 'Light' },
    { key: 'system', icon: SunMoon, label: 'System' },
    { key: 'dark', icon: Moon, label: 'Dark' },
  ];

  const currentIndex = options.findIndex((o) => o.key === value);
  const current = options[currentIndex === -1 ? 0 : currentIndex];

  const cycle = () => {
    const next = options[(currentIndex + 1) % options.length];
    onChange(next.key);
  };

  return (
    <Pressable
      onPress={cycle}
      className="flex-row items-center justify-between px-4 py-3 border-b border-border active:bg-muted/50"
    >
      <Text className="text-base text-foreground shrink min-w-0">Dark Mode</Text>
      <View className="flex-row items-center gap-1.5 shrink-0">
        <Icon as={current.icon} className="size-5 text-foreground" />
        <Text className="text-sm text-muted-foreground min-w-[68px] text-right" numberOfLines={1}>
          {current.label}
        </Text>
        <Icon
          as={ChevronRight}
          className="size-4 text-muted-foreground"
          aria-hidden={true}
        />
      </View>
    </Pressable>
  );
}

function SwitchRow({
  leftLabel,
  rightLabel,
  checked,
  onToggle,
}: {
  leftLabel: string;
  rightLabel?: string;
  checked: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
      <Text className="text-base text-foreground flex-1">{leftLabel}</Text>
      {rightLabel && (
        <Text className="text-sm text-muted-foreground mr-2 min-w-[36px] text-right" numberOfLines={1}>
          {rightLabel}
        </Text>
      )}
      <Switch checked={checked} onCheckedChange={onToggle} />
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
              className={`size-8 rounded-full ${
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
  const [queueEnabled, setQueueEnabled] = useState(true);
  const [theme, setTheme] = useState<string>('system');
  const [accentColor, setAccentColor] = useState<string>('neutral');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

        setDefaultSets(Number(sets ?? DEFAULTS.default_sets));
        setDefaultWeight(Number(weight ?? DEFAULTS.default_weight));
        setDefaultReps(Number(reps ?? DEFAULTS.default_reps));
        setWeightUnit((unit as 'lbs' | 'kg') ?? (DEFAULTS.weight_unit as 'lbs' | 'kg'));
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

  const convertWeight = useCallback(
    (value: number, from: 'lbs' | 'kg', to: 'lbs' | 'kg') => {
      if (from === to) return value;
      if (to === 'kg') return Math.round((value / 2.20462) * 2) / 2;
      return Math.round((value * 2.20462) / 5) * 5;
    },
    []
  );

  const isKg = weightUnit === 'kg';
  const wtFast = isKg ? 7.5 : 15;
  const wtSlow = isKg ? 2.5 : 5;

  if (loading) return null;

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
      <SwitchRow
        leftLabel="Weight Unit"
        rightLabel={weightUnit === 'kg' ? 'kg' : 'lbs'}
        checked={isKg}
        onToggle={(v) => {
          const newUnit = v ? 'kg' : 'lbs';
          const converted = convertWeight(defaultWeight, weightUnit, newUnit);
          setWeightUnit(newUnit);
          setDefaultWeight(converted);
          persistStr('weight_unit', newUnit);
          persistInt('default_weight', converted);
        }}
      />
      <SwitchRow
        leftLabel="Queue Mode"
        checked={queueEnabled}
        onToggle={(v) => {
          setQueueEnabled(v);
          persistStr('queue_enabled', String(v));
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
          persistInt('default_weight', v);
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
      <ThemeToggleRow
        value={theme}
        onChange={(v) => {
          setTheme(v);
          persistStr('theme', v);
          const key = v as 'light' | 'dark' | 'system';
          Uniwind.setTheme(key);
          applyAccentColor(accentColor, (v === 'system' ? 'light' : v) as 'light' | 'dark');
        }}
      />
      <AccentRow
        selected={accentColor}
        onChange={(key) => {
          setAccentColor(key);
          persistStr('accent_color', key);
          const effective = theme === 'system' ? 'light' : theme;
          applyAccentColor(key, effective as 'light' | 'dark');
          if (key && key !== 'neutral') {
            const color = ACCENT_COLORS.find((c) => c.key === key);
            setAccent(color ? (theme === 'dark' ? color.dark.primaryHex : color.light.primaryHex) : undefined);
          } else {
            setAccent(undefined);
          }
        }}
      />
    </ScrollView>
  );
}
