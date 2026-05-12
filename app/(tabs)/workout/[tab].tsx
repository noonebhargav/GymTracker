import { WorkoutScreen } from '@/components/workout-screen';
import { useLocalSearchParams } from 'expo-router';

export default function WorkoutTabRoute() {
  const { tab } = useLocalSearchParams<{ tab: string }>();
  return <WorkoutScreen tab={decodeURIComponent(tab ?? 'recent')} />;
}
