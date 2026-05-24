import { type ReactNode, memo } from 'react';
import { View, Pressable, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Check, ChevronRight, Dumbbell } from 'lucide-react-native';
import { getExerciseImage } from '@/lib/exercise-assets';
import { capitalizeWords } from '@/lib/utils';

interface ExerciseRowProps {
  name: string;
  equipment: string | null;
  group: string | null;
  assetId: string | null;
  right?: ReactNode;
  onPress?: () => void;
}

export const ExerciseRow = memo(function ExerciseRow({
  name,
  equipment,
  group,
  assetId,
  right,
  onPress,
}: ExerciseRowProps) {
  const imageSource = getExerciseImage(assetId);
  const sub = [capitalizeWords(equipment) || 'N/A', group].filter(Boolean).join(' · ');

  return (
    <Pressable onPress={onPress} className="active:bg-muted">
      <View className="flex-row items-center px-4 py-3.5 border-b border-border gap-3">
        {imageSource ? (
          <Image
            source={imageSource}
            className="w-[52px] h-[52px] rounded-[12px] bg-secondary"
            resizeMode="cover"
            accessibilityLabel={capitalizeWords(name)}
          />
        ) : (
          <View className="w-[52px] h-[52px] rounded-[12px] bg-secondary items-center justify-center">
            <Icon as={Dumbbell} className="size-6 text-muted-foreground" aria-hidden={true} />
          </View>
        )}
        <View className="flex-1 min-w-0">
          <Text className="font-semibold text-[15px] text-foreground" numberOfLines={2}>
            {capitalizeWords(name)}
          </Text>
          <Text className="text-[13px] text-muted-foreground mt-0.5">{sub}</Text>
        </View>
        {right}
      </View>
    </Pressable>
  );
});

export function DoneBadge() {
  return (
    <View className="flex-row items-center gap-1 bg-primary rounded-full px-2.5 py-1">
      <Icon as={Check} className="size-3 text-primary-foreground" aria-hidden={true} />
      <Text className="text-xs font-semibold text-primary-foreground">Done</Text>
    </View>
  );
}

export function RowChevron() {
  return <Icon as={ChevronRight} className="size-4 text-muted-foreground" aria-hidden={true} />;
}
