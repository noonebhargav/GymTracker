import { getExerciseById, type ExerciseDetail } from '@/lib/database';
import { getExerciseGif } from '@/lib/exercise-assets';
import { capitalizeWords, parseJsonArray } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useSQLiteContext } from 'expo-sqlite';
import { ArrowLeft } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, View, StatusBar, Platform } from 'react-native';
import { useUniwind } from 'uniwind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExerciseDetailModal() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [detail, setDetail] = useState<ExerciseDetail | null>(null);
  const { theme } = useUniwind();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();

  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
  }, [isDark]);

  useEffect(() => {
    if (id) {
      getExerciseById(db, id).then(setDetail);
    }
  }, [id, db]);

  if (!detail) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  const gifSource = getExerciseGif(detail.assetId);
  const secondaryMuscles = parseJsonArray(detail.secondary_muscles);
  const steps = parseJsonArray(detail.instruction_steps);

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-row items-center px-4 pb-2 border-b border-border"
        style={{ paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : insets.top }}
      >
        <Pressable onPress={() => router.back()} className="p-3 mr-2">
          <Icon as={ArrowLeft} className="size-5 text-foreground" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground flex-1" numberOfLines={1}>
          {capitalizeWords(detail.name)}
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Hero illustration */}
        {gifSource && (
          <View className="mx-4 mt-2 mb-4 rounded-[20px] py-8 items-center overflow-hidden bg-card border border-border">
            <Image source={gifSource} className="w-48 h-48" resizeMode="contain" />
          </View>
        )}

        {/* Meta table */}
        <View className="px-4 gap-3 mb-4">
          {detail.target && (
            <DetailRow label="Target" value={capitalizeWords(detail.target)} />
          )}
          {detail.muscle_group && (
            <DetailRow label="Group" value={capitalizeWords(detail.muscle_group)} />
          )}
          {detail.equipment && (
            <DetailRow label="Equipment" value={capitalizeWords(detail.equipment)} />
          )}
          {secondaryMuscles.length > 0 && (
            <View>
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Secondary
              </Text>
              <View className="flex-row flex-wrap gap-1.5">
                {secondaryMuscles.map((m, i) => (
                  <View key={i} className="bg-muted rounded-full px-3 py-1">
                    <Text className="text-xs text-foreground">{capitalizeWords(m)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Numbered instructions */}
        {steps.length > 0 && (
          <View className="px-4 mb-8">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Instructions
            </Text>
            {steps.map((step, i) => (
              <View key={i} className="flex-row gap-3.5 py-3 border-b border-border">
                <Text className="text-xs font-bold text-primary w-6 mt-0.5 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </Text>
                <Text className="text-sm text-foreground flex-1 leading-relaxed">{step}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">
        {label}
      </Text>
      <Text className="text-sm text-foreground flex-1">{value}</Text>
    </View>
  );
}

