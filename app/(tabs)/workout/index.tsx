import { WorkoutScreen } from '@/components/workout-screen';
import { useLocalSearchParams } from 'expo-router';

// Render the workout screen directly (no redirect) to avoid a cold-start flash.
// The active tab is held in the `tab` search param (set via router.setParams in
// the screen); the set editor lives at the nested /workout/[tab]/[id] route.
export default function WorkoutIndex() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  return <WorkoutScreen tab={tab ? decodeURIComponent(tab) : 'recent'} />;
}
