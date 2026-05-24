import { useRef, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

const TICK_WIDTH = 12;

interface RulerWheelProps {
  title: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
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
  unit,
  quickSteps,
  onDone,
}: RulerWheelProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const steps = Math.round((max - min) / step);
  const defaultQuickSteps = unit === 'reps' ? [-5, -1, 1, 5] : [-10, -5, 5, 10, 25];
  const qSteps = quickSteps ?? defaultQuickSteps;

  const valueToOffset = useCallback(
    (v: number) => ((v - min) / step) * TICK_WIDTH,
    [min, step]
  );

  useEffect(() => {
    const offset = valueToOffset(value);
    scrollRef.current?.scrollTo({ x: offset, animated: false });
  }, []);

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const idx = Math.round(x / TICK_WIDTH);
      const newVal = clamp(min + idx * step, min, max);
      onChange(newVal);
    },
    [min, max, step, onChange]
  );

  const applyQuickStep = useCallback(
    (delta: number) => {
      const newVal = clamp(value + delta, min, max);
      onChange(newVal);
      scrollRef.current?.scrollTo({ x: valueToOffset(newVal), animated: true });
    },
    [value, min, max, onChange, valueToOffset]
  );

  const padding = screenWidth / 2;

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
        entering={SlideInDown.duration(280).springify().damping(20)}
        className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[24px]"
        style={{ paddingBottom: bottom + 8 }}
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

        {/* Value display */}
        <View className="items-center py-2">
          <Text className="font-bold text-foreground" style={{ fontSize: 44, lineHeight: 52 }}>
            {value}
            <Text className="text-lg text-muted-foreground font-medium"> {unit}</Text>
          </Text>
        </View>

        {/* Ruler strip */}
        <View style={{ height: 64, position: 'relative' }}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={TICK_WIDTH}
            decelerationRate="fast"
            onMomentumScrollEnd={onScrollEnd}
            contentContainerStyle={{ paddingHorizontal: padding }}
          >
            {Array.from({ length: steps + 1 }, (_, i) => {
              const isMajor = i % 5 === 0;
              return (
                <View
                  key={i}
                  style={{ width: TICK_WIDTH, alignItems: 'center', justifyContent: 'flex-start' }}
                >
                  <View
                    style={{
                      width: 1.5,
                      height: isMajor ? 22 : 10,
                      backgroundColor: isMajor ? '#6c6f78' : 'rgba(255,255,255,0.15)',
                      marginTop: 8,
                    }}
                  />
                  {isMajor && (
                    <Text
                      style={{ fontSize: 9, color: '#6c6f78', marginTop: 2 }}
                      numberOfLines={1}
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
              backgroundColor: '#d8fe3d',
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
