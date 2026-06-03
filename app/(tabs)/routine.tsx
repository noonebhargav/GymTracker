import { View, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ScreenWrapper } from '@/components/ui/screen-wrapper';
import { getAllRoutines, setRoutineDay } from '@/lib/database';
import { GOLD_STANDARD_GROUPS } from '@/lib/exercise-groups';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const DAYS = [
  { label: 'Mon', full: 'Monday', index: 0 },
  { label: 'Tue', full: 'Tuesday', index: 1 },
  { label: 'Wed', full: 'Wednesday', index: 2 },
  { label: 'Thu', full: 'Thursday', index: 3 },
  { label: 'Fri', full: 'Friday', index: 4 },
  { label: 'Sat', full: 'Saturday', index: 5 },
  { label: 'Sun', full: 'Sunday', index: 6 },
];

function getTodayIndex(): number {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

export default function RoutineTab() {
  const db = useSQLiteContext();
  const [selectedDay, setSelectedDay] = useState(String(getTodayIndex()));
  const [routines, setRoutines] = useState<Map<number, Set<string>>>(new Map());

  useFocusEffect(
    useCallback(() => {
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
    }, [db])
  );

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
    <ScreenWrapper>
      <Tabs value={selectedDay} onValueChange={setSelectedDay} className="flex-1">
        <View className="border-b border-border px-4 pt-3 pb-2">
          {/* Selected-day label, styled to match the Workout screen header. */}
          <Text className="text-[13px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            {DAYS[Number(selectedDay)].full}
          </Text>
          {/* Whole week stays visible: pills wrap to 4 + 3 (centered) instead of
              scrolling horizontally, so no day is hidden off-screen. */}
          <TabsList variant="pills" className="w-full flex-wrap justify-center">
            {DAYS.map((day) => {
              const isSelected = selectedDay === String(day.index);
              const hasAssignments = assignedCounts[day.index] > 0;
              // Third state: a day with assigned body parts that isn't the
              // current selection gets a tinted fill + accent text.
              const marked = !isSelected && hasAssignments;

              return (
                <TabsTrigger
                  key={day.index}
                  value={String(day.index)}
                  variant="pill"
                  // basis-[22%] + grow-0/shrink-0 → exactly 4 pills per row
                  // (4 × 22% + gap-2 ≈ 95%), so the 7 days wrap to a fixed
                  // 4 + 3 (centered). shrink-0 keeps it rigid on web too.
                  className={cn(
                    'basis-[22%] grow-0 shrink-0',
                    marked && 'bg-primary/15 border-primary/25'
                  )}
                  textClassName={marked ? 'text-primary' : undefined}
                  aria-label={`${day.full} routine${hasAssignments ? `, ${assignedCounts[day.index]} body parts` : ''}`}
                >
                  <Text>{day.label}</Text>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </View>

        {DAYS.map((day) => (
          <TabsContent key={day.index} value={String(day.index)} className="flex-1">
            <ScrollView className="flex-1" contentInsetAdjustmentBehavior="automatic">
              <View className="px-4 pt-4 pb-5">
                <View className="rounded-2xl border border-border overflow-hidden">
                  {GOLD_STANDARD_GROUPS.map((group, i) => {
                    const state = getChipState(day.index, group);
                    // Other days this group is assigned to (shown as a hint on
                    // `covered` rows, e.g. "Mon · Wed").
                    const otherDays = (partToDays.get(group) ?? [])
                      .filter((d) => d !== day.index)
                      .sort((a, b) => a - b)
                      .map((d) => DAYS[d].label)
                      .join(' · ');
                    return (
                      <Pressable
                        key={group}
                        onPress={() => toggleBodyPart(day.index, group)}
                        className={cn(
                          'h-14 px-4 flex-row items-center justify-between active:opacity-70',
                          i > 0 && 'border-t border-border',
                          state === 'selected' && 'bg-primary/10'
                        )}
                        aria-label={`Toggle ${group}`}
                        accessibilityState={{ selected: state === 'selected' }}
                        accessibilityRole="switch"
                      >
                        <Text
                          className={cn(
                            'text-base font-medium',
                            state === 'selected'
                              ? 'text-primary' // active day → accent highlight
                              : state === 'covered'
                                ? 'text-muted-foreground' // taken on another day → dimmed
                                : 'text-foreground' // available → bright
                          )}
                        >
                          {group}
                        </Text>
                        {state === 'selected' ? (
                          <Icon as={Check} className="size-5 text-primary" />
                        ) : state === 'covered' ? (
                          <Text className="text-xs text-muted-foreground">{otherDays}</Text>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </TabsContent>
        ))}
      </Tabs>
    </ScreenWrapper>
  );
}
