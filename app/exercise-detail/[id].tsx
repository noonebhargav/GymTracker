import { getExerciseById, type ExerciseDetail } from '@/lib/database';
import { getExerciseGif } from '@/lib/exercise-assets';
import { capitalizeWords } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useSQLiteContext } from 'expo-sqlite';
import { ArrowLeft } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, View, StatusBar, Platform } from 'react-native';
import { useUniwind } from 'uniwind';

export default function ExerciseDetailModal() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [detail, setDetail] = useState<ExerciseDetail | null>(null);
  const { theme } = useUniwind();
  const isDark = theme === 'dark';

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
        style={{ paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 16 }}
      >
        <Pressable onPress={() => router.back()} className="p-1 mr-2">
          <Icon as={ArrowLeft} className="size-5 text-foreground" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground flex-1" numberOfLines={1}>
          {capitalizeWords(detail.name)}
        </Text>
      </View>

      <ScrollView className="flex-1">
        {gifSource && (
          <View className="items-center justify-center">
            <Image source={gifSource} className="w-full h-64" resizeMode="contain" />
          </View>
        )}
        {gifSource && <View className="border-b border-border" />}

        <View className="px-4 py-3 gap-3">
          {detail.target && (
            <DetailRow label="Target" value={capitalizeWords(detail.target)} />
          )}
          {detail.muscle_group && (
            <DetailRow label="Muscle Group" value={capitalizeWords(detail.muscle_group)} />
          )}
          {detail.equipment && (
            <DetailRow label="Equipment" value={capitalizeWords(detail.equipment)} />
          )}

          {secondaryMuscles.length > 0 && (
            <View>
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Secondary Muscles
              </Text>
              <View className="flex-row flex-wrap gap-1.5">
                {secondaryMuscles.map((m, i) => (
                  <View
                    key={i}
                    className="bg-muted rounded-full px-3 py-1"
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text className="text-xs text-foreground" style={{ textAlign: 'center' }}>
                      {capitalizeWords(m)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {secondaryMuscles.length > 0 && <View className="border-b border-border" />}

          {steps.length > 0 && (
            <View>
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Instructions
              </Text>
              {steps.map((step, i) => (
                <View key={i} className="flex-row gap-2 mb-2">
                  <Text className="text-sm text-muted-foreground font-medium w-5">{i + 1}.</Text>
                  <Text className="text-sm text-foreground flex-1">{step}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Text className="text-xs font-semibold text-muted-foreground uppercase w-24">{label}</Text>
      <Text className="text-sm text-foreground flex-1">{value}</Text>
    </View>
  );
}

function parseJsonArray(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
