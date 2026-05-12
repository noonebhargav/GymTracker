import { type ExerciseDetail } from '@/lib/database';
import { getExerciseGif } from '@/lib/exercise-assets';
import { capitalizeWords } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { X } from 'lucide-react-native';
import { Image, Modal, Platform, Pressable, ScrollView, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

interface ExerciseDetailModalProps {
  exercise: ExerciseDetail | null;
  visible: boolean;
  onClose: () => void;
}

export function ExerciseDetailModal({
  exercise,
  visible,
  onClose,
}: ExerciseDetailModalProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === 'dark';

  if (!exercise) return null;

  const gifSource = getExerciseGif(exercise.assetId);
  const secondaryMuscles = parseJsonArray(exercise.secondary_muscles);
  const steps = parseJsonArray(exercise.instruction_steps);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'fullScreen' : undefined}
      statusBarTranslucent={Platform.OS === 'android'}
      onRequestClose={onClose}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-2 border-b border-border">
          <Text className="text-lg font-semibold text-foreground flex-1" numberOfLines={1}>
            {capitalizeWords(exercise.name)}
          </Text>
          <Pressable onPress={onClose} className="p-2 active:bg-muted rounded-full">
            <Icon as={X} className="size-5 text-foreground" />
          </Pressable>
        </View>

        <ScrollView className="flex-1">
          {gifSource && (
            <View className="items-center justify-center">
              <Image
                source={gifSource}
                className="w-full h-64"
                resizeMode="contain"
              />
            </View>
          )}
          {gifSource && <View className="border-b border-border" />}

          <View className="px-4 py-3 gap-3">
            {exercise.target && (
              <DetailRow label="Target" value={capitalizeWords(exercise.target)} />
            )}
            {exercise.muscle_group && (
              <DetailRow label="Muscle Group" value={capitalizeWords(exercise.muscle_group)} />
            )}
            {exercise.equipment && (
              <DetailRow label="Equipment" value={capitalizeWords(exercise.equipment)} />
            )}

            {secondaryMuscles.length > 0 && (
              <View>
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Secondary Muscles
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {secondaryMuscles.map((m, i) => (
                    <View key={i} className="bg-muted rounded-full px-3 py-1" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <Text className="text-xs text-foreground" style={{ textAlign: 'center' }}>{capitalizeWords(m)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {secondaryMuscles.length > 0 && (
              <View className="border-b border-border" />
            )}

            {steps.length > 0 && (
              <View>
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Instructions
                </Text>
                {steps.map((step, i) => (
                  <View key={i} className="flex-row gap-2 mb-2">
                    <Text className="text-sm text-muted-foreground font-medium w-5">
                      {i + 1}.
                    </Text>
                    <Text className="text-sm text-foreground flex-1">{step}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Text className="text-xs font-semibold text-muted-foreground uppercase w-24">
        {label}
      </Text>
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
