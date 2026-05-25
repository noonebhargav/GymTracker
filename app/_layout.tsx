import '@/global.css';

import { initAndSeedDatabase, getSetting } from '@/lib/database';
import { NAV_THEME, THEME } from '@/lib/theme';
import { applyAccentColor, ACCENT_COLORS } from '@/lib/accent-colors';
import { setAccent } from '@/lib/accent-store';
import { ThemeProvider, Stack } from 'expo-router';
import { PortalHost } from '@rn-primitives/portal';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useUniwind, Uniwind } from 'uniwind';
import * as SystemUI from 'expo-system-ui';

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
      applyAccentColor(accent);
      const color = ACCENT_COLORS.find((c) => c.key === accent);
      setAccent(color ? color.swatchHex : undefined);
    })();
  }, [db, theme]);

  return null;
}

export default function RootLayout() {
  const { theme } = useUniwind();
  const isDark = theme === 'dark';
  const bgColor = isDark ? THEME.dark.background : THEME.light.background;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(bgColor);
  }, [bgColor]);

  return (
    <ThemeProvider value={NAV_THEME[isDark ? 'dark' : 'light']}>
      <SQLiteProvider databaseName="gymtracker.db" onInit={initAndSeedDatabase}>
        <AccentLoader />
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ contentStyle: { backgroundColor: bgColor } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="exercise-detail/[id]" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>
        <PortalHost />
      </SQLiteProvider>
    </ThemeProvider>
  );
}
