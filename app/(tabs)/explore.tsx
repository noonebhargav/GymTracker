import { getExerciseCount } from '@/lib/database';
import { Text } from '@/components/ui/text';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function ExploreTab() {
  const db = useSQLiteContext();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    getExerciseCount(db).then(setCount);
  }, [db]);

  return (
    <View className="flex-1 items-center justify-center gap-2 bg-background">
      <Text className="text-2xl font-bold text-foreground">Explore</Text>
      {count !== null && (
        <Text className="text-muted-foreground">
          {count.toLocaleString()} exercises loaded
        </Text>
      )}
    </View>
  );
}
