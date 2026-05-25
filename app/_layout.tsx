import '@/global.css';

import { initAndSeedDatabase, getSetting } from '@/lib/database';
import { NAV_THEME, THEME } from '@/lib/theme';
import { applyAccentColor, ACCENT_COLORS } from '@/lib/accent-colors';
import { setAccent } from '@/lib/accent-store';
import { ThemeProvider, Stack } from 'expo-router';
import { PortalHost } from '@rn-primitives/portal';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { useUniwind, Uniwind } from 'uniwind';
import * as SystemUI from 'expo-system-ui';
import { View } from 'react-native';

export { ErrorBoundary } from 'expo-router';

const LIME = ACCENT_COLORS[0];

function AccentGate({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const { theme } = useUniwind();
  const [loaded, setLoaded] = useState(false);
  const isDark = theme === 'dark';
  const bgColor = isDark ? THEME.dark.background : THEME.light.background;

  useEffect(() => {
    (async () => {
      const accent = await getSetting(db, 'accent_color');
      const thm = await getSetting(db, 'theme');
      if (thm === 'system' || thm === 'light' || thm === 'dark') {
        Uniwind.setTheme(thm);
      }
      applyAccentColor(accent);
      const color = ACCENT_COLORS.find((c) => c.key === accent) ?? LIME;
      setAccent(color.swatchHex);
      setLoaded(true);
    })();
  }, [db]);

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: bgColor }} />;
  }

  return <>{children}</>;
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
        <AccentGate>
          <StatusBar style={isDark ? 'light' : 'dark'} />
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
