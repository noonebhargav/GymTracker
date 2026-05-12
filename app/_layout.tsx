import '@/global.css';

import { initAndSeedDatabase } from '@/lib/database';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'react-native';
import { useEffect } from 'react';
import { useUniwind } from 'uniwind';
import * as SystemUI from 'expo-system-ui';

SystemUI.setBackgroundColorAsync('transparent');

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const { theme } = useUniwind();
  const isDark = theme === 'dark';

  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
  }, [isDark]);

  return (
    <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
      <SQLiteProvider databaseName="gymtracker.db" onInit={initAndSeedDatabase}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="exercise-detail/[id]" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>
        <PortalHost />
      </SQLiteProvider>
    </ThemeProvider>
  );
}
