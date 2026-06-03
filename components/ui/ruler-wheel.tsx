import { useRef, useCallback, useEffect, useState } from 'react';
import { useAccentHex } from '@/lib/accent-store';
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { useUniwind } from 'uniwind';
import { THEME } from '@/lib/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  SlideInDown,
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';

const TICK_WIDTH = 12;

interface RulerWheelProps {
  title: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  labelEvery?: number;
  unit: string;
  quickSteps?: number[];
  onDone: () => void;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function RulerWheel({
  title,
  value,
  onChange,
  min = 0,
  max = 500,
  step = 5,
  labelEvery = 5,
  unit,
  quickSteps,
  onDone,
}: RulerWheelProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [liveValue, setLiveValue] = useState(value);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    setLiveValue(value);
  }, [value]);

  // Mirror the latest `value` so commitEdit always compares against the current
  // prop, even if a quick-step tap moved it while the inline editor was focused.
  const valueRef = useRef(value);
  valueRef.current = value;

  const steps = Math.round((max - min) / step);
  const defaultQuickSteps = unit === 'reps' ? [-5, -1, 1, 5] : [-10, -5, 5, 10, 25];
  const qSteps = quickSteps ?? defaultQuickSteps;
  const accentHex = useAccentHex();
  const { theme } = useUniwind();
  const isDark = theme === 'dark';
  const palette = isDark ? THEME.dark : THEME.light;
  // Major ticks/labels use the themed muted-foreground; minor ticks are a faded
  // shade of the same color so they read as a lighter step, not a separate hue.
  const majorTickColor = palette.mutedForeground;
  const labelColor = palette.mutedForeground;
  // Faded shade of the SAME muted-foreground (dark #6c6f78 / light #8b8e96) so minor ticks
  // sit a clear step below major ticks in both themes.
  const minorTickColor = isDark ? 'rgba(108,111,120,0.5)' : 'rgba(139,142,150,0.5)';

  const valueToOffset = useCallback(
    (v: number) => ((v - min) / step) * TICK_WIDTH,
    [min, step]
  );

  useEffect(() => {
    const offset = valueToOffset(value);
    scrollRef.current?.scrollTo({ x: offset, animated: false });
  }, []);

  const onScrollEvent = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const idx = Math.round(x / TICK_WIDTH);
      const newVal = clamp(min + idx * step, min, max);
      setLiveValue((prev) => (prev === newVal ? prev : newVal));
    },
    [min, max, step]
  );

  // Native `snapToInterval` + `decelerationRate="fast"` already settles the strip on a tick,
  // so we only read the resulting offset and commit the value. We deliberately do NOT call
  // `scrollTo` here: an animated programmatic scroll on momentum-end fights the native snap
  // and can re-trigger momentum, causing visible jitter / a feedback loop (mainly iOS).
  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const idx = Math.round(x / TICK_WIDTH);
      const newVal = clamp(min + idx * step, min, max);
      setLiveValue(newVal);
      if (newVal !== value) onChange(newVal);
    },
    [min, max, step, onChange, value]
  );

  // Reads the closed-over `value` directly (unlike commitEdit's valueRef): this
  // fires synchronously from a button tap, so the closure value is always current.
  const applyQuickStep = useCallback(
    (delta: number) => {
      const newVal = clamp(value + delta, min, max);
      setLiveValue(newVal);
      onChange(newVal);
      scrollRef.current?.scrollTo({ x: valueToOffset(newVal), animated: true });
    },
    [value, min, max, onChange, valueToOffset]
  );

  const commitEdit = useCallback(() => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) {
      // snap to the nearest valid tick so the ruler pin lines up
      const stepped = min + Math.round((clamp(parsed, min, max) - min) / step) * step;
      const newVal = clamp(stepped, min, max);
      setLiveValue(newVal);
      if (newVal !== valueRef.current) onChange(newVal);
      scrollRef.current?.scrollTo({ x: valueToOffset(newVal), animated: false });
    }
    setDraft('');
    setEditing(false);
  }, [draft, min, max, step, onChange, valueToOffset]);

  // Lift the bottom-anchored sheet above the keyboard while editing the value.
  const keyboard = useAnimatedKeyboard();
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboard.height.value }],
  }));

  const padding = screenWidth / 2 - TICK_WIDTH / 2;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(150)}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' }}
      >
        <Pressable style={{ flex: 1 }} onPress={onDone} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        entering={SlideInDown.duration(280)}
        className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[24px]"
        style={[{ paddingBottom: bottom + 8 }, sheetStyle]}
      >
        {/* Handle */}
        <View className="items-center mt-3 mb-2">
          <View className="w-10 h-1 rounded-full bg-muted" />
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-2">
          <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            {title}
          </Text>
          <Pressable
            onPress={onDone}
            className="bg-primary rounded-full px-4 py-1.5 active:opacity-80"
          >
            <Text className="text-xs font-bold text-primary-foreground">Done</Text>
          </Pressable>
        </View>

        {/* Value display — tap to type a value directly */}
        <View className="items-center py-2">
          {editing ? (
            <View className="flex-row items-baseline bg-secondary rounded-2xl border border-primary px-5 py-1">
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onBlur={commitEdit}
                onSubmitEditing={commitEdit}
                keyboardType="decimal-pad"
                selectTextOnFocus
                autoFocus
                className="font-bold text-foreground text-center p-0 min-w-16"
                style={{ fontSize: 44, lineHeight: 52 }}
              />
              <Text className="text-lg text-muted-foreground font-medium"> {unit}</Text>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                setDraft(String(liveValue));
                setEditing(true);
              }}
              className="flex-row items-baseline bg-secondary rounded-2xl border border-border px-5 py-1 active:opacity-70"
            >
              <Text className="font-bold text-foreground" style={{ fontSize: 44, lineHeight: 52 }}>
                {liveValue}
              </Text>
              <Text className="text-lg text-muted-foreground font-medium"> {unit}</Text>
            </Pressable>
          )}
        </View>

        {/* Ruler strip */}
        <View style={{ height: 64, position: 'relative' }}>
          <ScrollView
            ref={scrollRef}
            horizontal
            scrollEnabled={!editing}
            showsHorizontalScrollIndicator={false}
            snapToInterval={TICK_WIDTH}
            decelerationRate="fast"
            onScroll={onScrollEvent}
            scrollEventThrottle={16}
            onScrollEndDrag={onScrollEnd}
            onMomentumScrollEnd={onScrollEnd}
            contentContainerStyle={{ paddingHorizontal: padding }}
          >
            {Array.from({ length: steps + 1 }, (_, i) => {
              const isMajor = i % labelEvery === 0;
              return (
                <View
                  key={i}
                  style={{ width: TICK_WIDTH, alignItems: 'center', justifyContent: 'flex-start' }}
                >
                  <View
                    style={{
                      width: 1.5,
                      height: isMajor ? 22 : 10,
                      backgroundColor: isMajor ? majorTickColor : minorTickColor,
                      marginTop: 8,
                    }}
                  />
                  {isMajor && (
                    <Text
                      style={{
                        position: 'absolute',
                        top: 32,
                        width: 36,
                        left: -12,
                        fontSize: 9,
                        color: labelColor,
                        textAlign: 'center',
                      }}
                    >
                      {min + i * step}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* Center pin */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: screenWidth / 2 - 1,
              width: 2,
              backgroundColor: accentHex,
            }}
          />
        </View>

        {/* Quick-jump buttons */}
        <View className="flex-row items-center justify-center gap-2 px-5 py-4">
          {qSteps.map((delta) => (
            <Pressable
              key={delta}
              onPress={() => applyQuickStep(delta)}
              className="bg-secondary rounded-xl px-3 h-9 items-center justify-center active:opacity-70"
            >
              <Text className="text-sm font-semibold text-foreground">
                {delta > 0 ? `+${delta}` : `${delta}`}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}
