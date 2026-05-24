import { getAllExercises, type ExerciseRow } from '@/lib/database';
import {
  GOLD_STANDARD_GROUPS,
  toGoldStandardGroup,
  formatEquipmentLabel,
  DISPLAY_EQUIPMENT,
  toConsolidatedEquipment,
} from '@/lib/exercise-groups';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ExerciseRow as ExerciseRowComponent, RowChevron } from '@/components/exercise-row';
import { useSQLiteContext } from 'expo-sqlite';
import { ArrowLeft, Search, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUniwind } from 'uniwind';
import { THEME } from '@/lib/theme';
import {
  FlatList,
  Pressable,
  ScrollView,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';

export default function ExploreIndex() {
  const db = useSQLiteContext();
  const { theme } = useUniwind();
  const placeholderColor =
    theme === 'dark' ? THEME.dark.mutedForeground : THEME.light.mutedForeground;
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    getAllExercises(db).then((data) => {
      setExercises(data);
      setLoading(false);
    });
  }, [db]);

  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const group of GOLD_STANDARD_GROUPS) counts[group] = 0;
    for (const ex of exercises) {
      const group = toGoldStandardGroup(ex.body_part, ex.target);
      if (group) counts[group]++;
    }
    return counts;
  }, [exercises]);

  const equipmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const eq of DISPLAY_EQUIPMENT) counts[eq] = 0;
    for (const ex of exercises) {
      if (ex.equipment) {
        const consolidated = toConsolidatedEquipment(ex.equipment);
        counts[consolidated]++;
      }
    }
    return counts;
  }, [exercises]);

  const equipmentTypeCount = useMemo(
    () => DISPLAY_EQUIPMENT.filter((t) => (equipmentCounts[t] ?? 0) > 0).length,
    [equipmentCounts]
  );

  const showSearch = searchText.length > 0;

  const searchResults = useMemo(() => {
    if (!showSearch) return [];
    const q = searchText.toLowerCase();
    return exercises.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.body_part.toLowerCase().includes(q) ||
        e.target?.toLowerCase().includes(q) ||
        e.equipment?.toLowerCase().includes(q)
    );
  }, [exercises, searchText, showSearch]);

  const renderSearchResult = useCallback(
    ({ item }: { item: ExerciseRow }) => {
      const g = toGoldStandardGroup(item.body_part, item.target);
      return (
        <ExerciseRowComponent
          name={item.name}
          equipment={item.equipment}
          group={g}
          assetId={item.assetId}
          right={<RowChevron />}
          onPress={() => router.push(`/explore/${g?.toLowerCase() ?? 'other'}/${item.id}`)}
        />
      );
    },
    []
  );

  return (
    <View className="flex-1 bg-background">
      {/* Search bar */}
      <View className="px-4 pt-2 pb-2">
        <View className="flex-row items-center bg-secondary rounded-full px-3 h-[46px] border border-border">
          <Icon as={Search} className="size-4 text-muted-foreground mr-2.5" aria-hidden={true} />
          <TextInput
            className="flex-1 text-sm text-foreground"
            placeholder="Search exercises…"
            placeholderTextColor={placeholderColor}
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            autoComplete="off"
            aria-label="Search exercises"
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')} className="p-3" aria-label="Clear search">
              <Icon as={X} className="size-4 text-muted-foreground" aria-hidden={true} />
            </Pressable>
          )}
        </View>
      </View>

      {showSearch ? (
        <View className="flex-1">
          <View className="flex-row items-center px-4 py-2 border-b border-border">
            <Pressable
              onPress={() => setSearchText('')}
              className="p-3 mr-2"
              aria-label="Back to explore"
            >
              <Icon as={ArrowLeft} className="size-5 text-foreground" aria-hidden={true} />
            </Pressable>
            <Text className="text-base font-semibold text-foreground flex-1">
              {searchResults.length} results for {'“'}{searchText}{'”'}
            </Text>
          </View>
          {searchResults.length === 0 ? (
            <View className="flex-1 items-center justify-center px-8 py-20">
              <Icon as={Search} className="size-12 text-muted-foreground mb-4" aria-hidden={true} />
              <Text className="text-base text-muted-foreground text-center">
                No exercises found for {'“'}{searchText}{'”'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderSearchResult}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      ) : loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Body Parts */}
          <View className="flex-row items-baseline justify-between px-5 pt-4 pb-3">
            <Text className="text-lg font-bold text-foreground">Body parts</Text>
            <Text className="text-xs text-muted-foreground">{GOLD_STANDARD_GROUPS.length}</Text>
          </View>
          <View className="flex-row flex-wrap px-3">
            {GOLD_STANDARD_GROUPS.map((g) => (
              <Pressable
                key={g}
                onPress={() => router.push(`/explore/${g.toLowerCase()}`)}
                style={{ width: '50%' }}
                className="p-1.5"
                aria-label={`${g}, ${groupCounts[g] ?? 0} exercises`}
                accessibilityRole="button"
              >
                <View className="bg-card border border-border rounded-[14px] p-4 active:opacity-70">
                  <Text className="text-base font-semibold text-foreground">{g}</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {groupCounts[g] ?? 0} exercises
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Equipment */}
          <View className="flex-row items-baseline justify-between px-5 pt-5 pb-3">
            <Text className="text-lg font-bold text-foreground">Equipment</Text>
            <Text className="text-xs text-muted-foreground">{equipmentTypeCount}</Text>
          </View>
          <View className="flex-row flex-wrap px-3">
            {DISPLAY_EQUIPMENT.filter((t) => (equipmentCounts[t] ?? 0) > 0).map((t) => (
              <Pressable
                key={t}
                onPress={() => router.push(`/explore/${t.toLowerCase()}`)}
                style={{ width: '50%' }}
                className="p-1.5"
                aria-label={`${formatEquipmentLabel(t)}, ${equipmentCounts[t] ?? 0} exercises`}
                accessibilityRole="button"
              >
                <View className="bg-card border border-border rounded-[14px] p-3.5 active:opacity-70">
                  <Text className="text-[13px] font-semibold text-foreground" numberOfLines={1}>
                    {formatEquipmentLabel(t)}
                  </Text>
                  <Text className="text-[11px] text-muted-foreground mt-0.5">
                    {equipmentCounts[t] ?? 0} exercises
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
