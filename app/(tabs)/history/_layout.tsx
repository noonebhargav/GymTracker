import { Stack } from 'expo-router';

export default function HistoryLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[date]"
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
    </Stack>
  );
}
