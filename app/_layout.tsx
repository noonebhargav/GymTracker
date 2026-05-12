import '@/global.css';

import { initAndSeedDatabase } from '@/lib/database';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useUniwind } from 'uniwind';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const { theme } = useUniwind();

  return (
    <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
      <SQLiteProvider databaseName="gymtracker.db" onInit={initAndSeedDatabase}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <PortalHost />
      </SQLiteProvider>
    </ThemeProvider>
  );
}
