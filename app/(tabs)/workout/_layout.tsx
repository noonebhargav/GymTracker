import { Stack } from 'expo-router';

export default function WorkoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
        contentStyle: { flex: 1 },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[tab]/[id]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
