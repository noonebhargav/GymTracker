import { View, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { getAllRoutines, setRoutineDay } from '@/lib/database';
import { GOLD_STANDARD_GROUPS } from '@/lib/exercise-groups';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState, useMemo } from 'react';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CalendarClock, Check } from 'lucide-react-native';

const DAYS = [
  { label: 'Mon', full: 'Monday', index: 0 },
  { label: 'Tue', full: 'Tuesday', index: 1 },
  { label: 'Wed', full: 'Wednesday', index: 2 },
  { label: 'Thu', full: 'Thursday', index: 3 },
  { label: 'Fri', full: 'Friday', index: 4 },
  { label: 'Sat', full: 'Saturday', index: 5 },
  { label: 'Sun', full: 'Sunday', index: 6 },
];

const DAY_SCROLL_CONTENT_STYLE = { paddingHorizontal: 12, paddingVertical: 12, gap: 10 } as const;

export default function RoutineTab() {
  const db = useSQLiteContext();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [routines, setRoutines] = useState<Map<number, Set<string>>>(new Map());

  useEffect(() => {
    getAllRoutines(db).then((rows) => {
      const map = new Map<number, Set<string>>();
      for (const row of rows) {
        if (!map.has(row.day_of_week)) {
          map.set(row.day_of_week, new Set());
        }
        map.get(row.day_of_week)!.add(row.body_part);
      }
      setRoutines(map);
    });
  }, [db]);

  const assignedCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let i = 0; i < 7; i++) {
      counts[i] = routines.get(i)?.size ?? 0;
    }
    return counts;
  }, [routines]);

  const partToDays = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const [day, parts] of routines) {
      for (const part of parts) {
        if (!map.has(part)) map.set(part, []);
        map.get(part)!.push(day);
      }
    }
    return map;
  }, [routines]);

  const handleDayPress = useCallback((dayIndex: number) => {
    setSelectedDay((prev) => (prev === dayIndex ? null : dayIndex));
  }, []);

  const toggleBodyPart = useCallback(
    async (dayIndex: number, bodyPart: string) => {
      const updated = new Map(routines);
      if (!updated.has(dayIndex)) {
        updated.set(dayIndex, new Set());
      }
      const set = updated.get(dayIndex)!;
      if (set.has(bodyPart)) {
        set.delete(bodyPart);
      } else {
        set.add(bodyPart);
      }
      setRoutines(updated);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

      try {
        const parts = Array.from(updated.get(dayIndex) ?? []);
        await setRoutineDay(db, dayIndex, parts);
      } catch {
        setRoutines(new Map(routines));
      }
    },
    [db, routines]
  );

  function getChipState(dayIndex: number, group: string) {
    const isSelected = routines.get(dayIndex)?.has(group) ?? false;
    if (isSelected) return 'selected' as const;

    const assignedDays = partToDays.get(group) ?? [];
    if (assignedDays.length > 0) return 'covered' as const;

    return 'unassigned' as const;
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b border-border"
        contentContainerStyle={DAY_SCROLL_CONTENT_STYLE}
      >
        {DAYS.map((day) => {
          const isSelected = selectedDay === day.index;
          const hasAssignments = assignedCounts[day.index] > 0;

          return (
            <View key={day.index} className="items-center gap-1.5">
              <Pressable
                onPress={() => handleDayPress(day.index)}
                className={`size-12 rounded-full items-center justify-center sm:size-10 ${
                  isSelected
                    ? 'bg-primary border border-primary'
                    : 'bg-muted border border-border active:bg-muted/80'
                }`}
                aria-label={`${day.full} routine${hasAssignments ? `, ${assignedCounts[day.index]} body parts` : ''}`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isSelected ? 'text-primary-foreground' : 'text-foreground'
                  }`}
                >
                  {day.label}
                </Text>
              </Pressable>
              {hasAssignments && !isSelected && (
                <View className="size-1.5 rounded-full bg-primary" />
              )}
            </View>
          );
        })}
      </ScrollView>

      {selectedDay !== null && (
        <Animated.View
          key={selectedDay}
          entering={FadeInDown.duration(250)}
          exiting={FadeOutUp.duration(200)}
          className="px-4 pt-4 pb-5 border-b border-border"
        >
          <Text className="text-lg font-semibold text-foreground mb-3">
            {DAYS[selectedDay].full}
          </Text>
          <View className="flex-row flex-wrap">
            {GOLD_STANDARD_GROUPS.map((group) => {
              const state = getChipState(selectedDay, group);
              return (
                <Pressable
                  key={group}
                  onPress={() => toggleBodyPart(selectedDay, group)}
                  className="w-1/2 p-1"
                  aria-label={`Toggle ${group}`}
                  accessibilityState={{ selected: state === 'selected' }}
                  accessibilityRole="switch"
                >
                  <View
                    className={`px-3 py-2.5 rounded-full items-center justify-center flex-row gap-1.5 ${
                      state === 'selected'
                        ? 'bg-primary border border-primary'
                        : state === 'covered'
                          ? 'bg-primary/15 border border-primary/25'
                          : 'bg-muted/50 border border-border active:bg-muted'
                    }`}
                  >
                    {state === 'covered' && (
                      <Icon as={Check} className="size-3.5 text-primary/70" />
                    )}
                    <Text
                      className={`text-sm font-medium ${
                        state === 'selected'
                          ? 'text-primary-foreground'
                          : state === 'covered'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {group}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      )}

      {selectedDay === null && (
        <View className="items-center justify-center py-24">
          <Icon
            as={CalendarClock}
            className="size-12 text-muted-foreground mb-4"
          />
          <Text className="text-base text-muted-foreground text-center px-8">
            Select a day above to assign body parts
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
