import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export default function WorkoutTab() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-foreground">Workout</Text>
    </View>
  );
}
