import {
  getAllExercises,
  type ExerciseRow,
} from '@/lib/database';
import {
  GOLD_STANDARD_GROUPS,
  EQUIPMENT_TYPES,
  toGoldStandardGroup,
  formatEquipmentLabel,
} from '@/lib/exercise-groups';
import { getExerciseImage } from '@/lib/exercise-assets';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useSQLiteContext } from 'expo-sqlite';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Search,
  X,
} from 'lucide-react-native';
import { capitalizeWords } from '@/lib/utils';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

function CollapsibleSection({
  title,
  open,
  onToggle,
  count,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <View>
      <Pressable
        onPress={onToggle}
        className="flex-row items-center px-4 py-3 border-b border-border active:bg-muted"
      >
        <Text className="text-base font-semibold text-foreground flex-1" numberOfLines={1}>
          {title}
        </Text>
        {count !== undefined && (
          <Text className="text-sm text-muted-foreground mr-3 min-w-6 text-right">
            {count}
          </Text>
        )}
        <Icon
          as={open ? ChevronDown : ChevronRight}
          className="size-5 text-muted-foreground"
        />
      </Pressable>
      {open && children}
    </View>
  );
}

function CategoryGrid({
  items,
  columns = 2,
}: {
  items: { label: string; count: number; onPress: () => void }[];
  columns?: number;
}) {
  return (
    <View className="flex-row flex-wrap px-2 py-2">
      {items.map((item) => (
        <Pressable
          key={item.label}
          onPress={item.onPress}
          style={{ width: `${100 / columns}%` }}
          className="p-2"
        >
          <View className="bg-card border border-border rounded-lg p-3 items-start active:bg-muted">
            <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
              {item.label}
            </Text>
            <Text className="text-xs text-muted-foreground mt-1">
              {item.count} exercises
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function ExerciseListItem({
  item,
  onPress,
}: {
  item: ExerciseRow;
  onPress: () => void;
}) {
  const imageSource = getExerciseImage(item.assetId);

  return (
    <Pressable onPress={onPress} className="active:bg-muted">
      <View className="flex-row items-center px-4 py-3 border-b border-border gap-3">
        {imageSource ? (
          <Image
            source={imageSource}
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
  );
}

export default function ExploreIndex() {
  const db = useSQLiteContext();
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [bodyPartsOpen, setBodyPartsOpen] = useState(true);
  const [equipmentOpen, setEquipmentOpen] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    getAllExercises(db).then(setExercises);
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
    for (const type of EQUIPMENT_TYPES) counts[type] = 0;
    for (const ex of exercises) {
      if (ex.equipment && counts[ex.equipment] !== undefined) {
        counts[ex.equipment]++;
      }
    }
    return counts;
  }, [exercises]);

  const equipmentTypeCount = useMemo(
    () => EQUIPMENT_TYPES.filter((t) => (equipmentCounts[t] ?? 0) > 0).length,
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

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-2 pb-2">
        <View className="flex-row items-center bg-muted rounded-lg px-3 h-10">
          <Icon as={Search} className="size-4 text-muted-foreground mr-2" />
          <TextInput
            className="flex-1 text-sm text-foreground"
            placeholder="Search exercises..."
            placeholderTextColor="hsl(0 0% 45%)"
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')} className="p-1">
              <Icon as={X} className="size-4 text-muted-foreground" />
            </Pressable>
          )}
        </View>
      </View>

      {showSearch ? (
        <View className="flex-1">
          <View className="flex-row items-center px-4 py-2 border-b border-border">
            <Pressable onPress={() => setSearchText('')} className="p-1 mr-2">
              <Icon as={ArrowLeft} className="size-5 text-foreground" />
            </Pressable>
            <Text className="text-base font-semibold text-foreground flex-1">
              {searchResults.length} results for "{searchText}"
            </Text>
          </View>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ExerciseListItem
                item={item}
                onPress={() => {
                  const g = toGoldStandardGroup(item.body_part, item.target);
                  router.push(`/explore/${g?.toLowerCase() ?? 'other'}/${item.id}`);
                }}
              />
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled">
          <CollapsibleSection
            title="Body Parts"
            open={bodyPartsOpen}
            onToggle={() => setBodyPartsOpen(!bodyPartsOpen)}
            count={GOLD_STANDARD_GROUPS.length}
          >
            <CategoryGrid
              columns={2}
              items={GOLD_STANDARD_GROUPS.map((g) => ({
                label: g,
                count: groupCounts[g] ?? 0,
                onPress: () => router.push(`/explore/${g.toLowerCase()}`),
              }))}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Equipment"
            open={equipmentOpen}
            onToggle={() => setEquipmentOpen(!equipmentOpen)}
            count={equipmentTypeCount}
          >
            <CategoryGrid
              columns={2}
              items={EQUIPMENT_TYPES.filter(
                (t) => (equipmentCounts[t] ?? 0) > 0
              ).map((t) => ({
                label: formatEquipmentLabel(t),
                count: equipmentCounts[t] ?? 0,
                onPress: () => router.push(`/explore/${t}`),
              }))}
            />
          </CollapsibleSection>
        </ScrollView>
      )}
    </View>
  );
}
