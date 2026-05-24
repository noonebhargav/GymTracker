import '@/global.css';

import { initAndSeedDatabase, getSetting } from '@/lib/database';
import { NAV_THEME } from '@/lib/theme';
import { applyAccentColor, ACCENT_COLORS } from '@/lib/accent-colors';
import { setAccent } from '@/lib/accent-store';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'react-native';
import { useEffect } from 'react';
import { useUniwind, Uniwind } from 'uniwind';
import * as SystemUI from 'expo-system-ui';

SystemUI.setBackgroundColorAsync('transparent');

export { ErrorBoundary } from 'expo-router';

function AccentLoader() {
  const db = useSQLiteContext();
  const { theme } = useUniwind();

  useEffect(() => {
    (async () => {
      const accent = await getSetting(db, 'accent_color');
      const thm = await getSetting(db, 'theme');
      if (thm === 'system' || thm === 'light' || thm === 'dark') {
        Uniwind.setTheme(thm);
      }
      const effective = (thm === 'system' ? (theme as string) : thm) || theme;
      applyAccentColor(accent, (effective ?? 'light') as 'light' | 'dark');
      const color = ACCENT_COLORS.find((c) => c.key === accent);
      setAccent(color ? color.swatchHex : undefined);
    })();
  }, [db, theme]);

  return null;
}

export default function RootLayout() {
  const { theme } = useUniwind();
  const isDark = theme === 'dark';

  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
  }, [isDark]);

  return (
    <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
      <SQLiteProvider databaseName="gymtracker.db" onInit={initAndSeedDatabase}>
        <AccentLoader />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="exercise-detail/[id]" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>
        <PortalHost />
      </SQLiteProvider>
    </ThemeProvider>
  );
}
