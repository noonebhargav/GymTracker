import { getAllExercises, type ExerciseRow } from '@/lib/database';
import {
  GOLD_STANDARD_GROUPS,
  toGoldStandardGroup,
  formatEquipmentLabel,
} from '@/lib/exercise-groups';
import { getExerciseImage } from '@/lib/exercise-assets';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useSQLiteContext } from 'expo-sqlite';
import { ArrowLeft, ChevronRight, Search } from 'lucide-react-native';
import { capitalizeWords } from '@/lib/utils';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, View } from 'react-native';

const GOLD_LOWER = GOLD_STANDARD_GROUPS.map((g) => g.toLowerCase());

function resolveFilter(raw: string): { type: 'group' | 'equipment'; value: string; label: string } | null {
  const lower = raw.toLowerCase();
  const groupIdx = GOLD_LOWER.indexOf(lower);
  if (groupIdx !== -1) {
    return { type: 'group', value: GOLD_STANDARD_GROUPS[groupIdx], label: GOLD_STANDARD_GROUPS[groupIdx] };
  }
  return { type: 'equipment', value: raw, label: formatEquipmentLabel(raw) };
}

export default function FilterPage() {
  const db = useSQLiteContext();
  const { filter } = useLocalSearchParams<{ filter: string }>();
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const resolved = resolveFilter(filter ?? '');

  useEffect(() => {
    getAllExercises(db).then(setExercises);
  }, [db]);

  const filtered = useMemo(() => {
    if (!resolved) return [];
    if (resolved.type === 'group') {
      return exercises.filter(
        (e) => toGoldStandardGroup(e.body_part, e.target) === resolved.value
      );
    }
    return exercises.filter((e) => e.equipment === resolved.value);
  }, [exercises, resolved]);

  const label = resolved?.label ?? filter;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-2 border-b border-border">
        <Pressable onPress={() => router.back()} className="p-1 mr-2">
          <Icon as={ArrowLeft} className="size-5 text-foreground" />
        </Pressable>
        <Text className="text-base font-semibold text-foreground flex-1">
          {label} ({filtered.length})
        </Text>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/explore/${filter}/${item.id}`)}
            className="active:bg-muted"
          >
            <View className="flex-row items-center px-4 py-3 border-b border-border gap-3">
              {getExerciseImage(item.assetId) ? (
                <Image
                  source={getExerciseImage(item.assetId)!}
                  className="size-12 rounded-md bg-muted"
                  resizeMode="cover"
                />
              ) : (
                <View className="size-12 rounded-md bg-muted items-center justify-center">
                  <Icon as={Search} className="size-5 text-muted-foreground" />
                </View>
              )}
              <View className="flex-1 min-w-0">
                <Text className="text-sm font-medium text-foreground" numberOfLines={2}>
                  {capitalizeWords(item.name)}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {capitalizeWords(item.equipment) || 'N/A'}
                </Text>
              </View>
              <Icon as={ChevronRight} className="size-4 text-muted-foreground" />
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
