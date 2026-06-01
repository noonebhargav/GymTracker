import '@/global.css';

import { initAndSeedDatabase, getSetting } from '@/lib/database';
import { NAV_THEME, useThemeColors } from '@/lib/theme';
import { applyAccentColor, ACCENT_COLORS, DEFAULT_ACCENT_KEY } from '@/lib/accent-colors';
import { setAccent } from '@/lib/accent-store';
import { ThemeProvider, Stack } from 'expo-router';
import { PortalHost } from '@rn-primitives/portal';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState, type ReactNode } from 'react';
import { Uniwind } from 'uniwind';
import * as SystemUI from 'expo-system-ui';
import { View, StatusBar } from 'react-native';

export { ErrorBoundary } from 'expo-router';

const DEFAULT_ACCENT =
  ACCENT_COLORS.find((c) => c.key === DEFAULT_ACCENT_KEY) ?? ACCENT_COLORS[0];

function AccentGate({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const { colors } = useThemeColors();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const accent = await getSetting(db, 'accent_color');
      const thm = await getSetting(db, 'theme');
      if (thm === 'system' || thm === 'light' || thm === 'dark') {
        Uniwind.setTheme(thm);
      }
      applyAccentColor(accent);
      const color = ACCENT_COLORS.find((c) => c.key === accent) ?? DEFAULT_ACCENT;
      setAccent(color.swatchHex);
      setLoaded(true);
    })();
  }, [db]);

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const { isDark, colors } = useThemeColors();
  const bgColor = colors.background;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(bgColor);
  }, [bgColor]);

  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
  }, [isDark]);

  return (
    <ThemeProvider value={NAV_THEME[isDark ? 'dark' : 'light']}>
      <SQLiteProvider databaseName="gymtracker.db" onInit={initAndSeedDatabase}>
        <AccentGate>
          <Stack screenOptions={{ contentStyle: { backgroundColor: bgColor } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="exercise-detail/[id]" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
          <PortalHost />
        </AccentGate>
      </SQLiteProvider>
    </ThemeProvider>
  );
}
