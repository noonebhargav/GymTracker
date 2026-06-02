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
        <View className="border-b border-border">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          >
            <TabsList variant="pills">
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
                    className={marked ? 'bg-primary/15 border-primary/25' : undefined}
                    textClassName={marked ? 'text-primary' : undefined}
                    aria-label={`${day.full} routine${hasAssignments ? `, ${assignedCounts[day.index]} body parts` : ''}`}
                  >
                    <Text>{day.label}</Text>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </ScrollView>
        </View>

        {DAYS.map((day) => (
          <TabsContent key={day.index} value={String(day.index)} className="flex-1">
            <ScrollView className="flex-1" contentInsetAdjustmentBehavior="automatic">
              <View className="px-4 pt-4 pb-5 border-b border-border">
                <Text className="text-lg font-semibold text-foreground mb-3">
                  {day.full}
                </Text>
                <View className="flex-row flex-wrap">
                  {GOLD_STANDARD_GROUPS.map((group) => {
                    const state = getChipState(day.index, group);
                    return (
                      <Pressable
                        key={group}
                        onPress={() => toggleBodyPart(day.index, group)}
                        className="w-1/2 p-2"
                        aria-label={`Toggle ${group}`}
                        accessibilityState={{ selected: state === 'selected' }}
                        accessibilityRole="switch"
                      >
                        <View
                          className={cn(
                            'h-9 px-4 rounded-full items-center justify-center flex-row gap-1.5',
                            state === 'selected'
                              ? 'bg-primary border border-primary'
                              : state === 'covered'
                                ? 'bg-primary/15 border border-primary/25'
                                : 'bg-secondary border border-border active:bg-secondary/80'
                          )}
                        >
                          {state === 'covered' && (
                            <Icon as={Check} className="size-3.5 text-primary/70" />
                          )}
                          <Text
                            className={cn(
                              'text-sm font-medium',
                              state === 'selected'
                                ? 'text-primary-foreground'
                                : state === 'covered'
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                            )}
                          >
                            {group}
                          </Text>
                        </View>
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
