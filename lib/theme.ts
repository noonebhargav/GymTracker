import { DarkTheme, DefaultTheme } from 'expo-router';
import { useUniwind } from 'uniwind';

type Theme = typeof DarkTheme;

export const THEME = {
  light: {
    background: '#f6f6f3',
    foreground: '#0a0b0d',
    card: '#ffffff',
    cardForeground: '#0a0b0d',
    primary: '#d8fe3d',
    primaryForeground: '#0a0b0d',
    muted: '#f3f3f0',
    mutedForeground: '#8b8e96',
    destructive: '#ff5868',
    border: 'rgba(0,0,0,0.07)',
  },
  dark: {
    background: '#0a0b0d',
    foreground: '#f4f5f7',
    card: '#15171b',
    cardForeground: '#f4f5f7',
    primary: '#d8fe3d',
    primaryForeground: '#0a0b0d',
    muted: '#1d2026',
    mutedForeground: '#6c6f78',
    destructive: '#ff5868',
    border: 'rgba(255,255,255,0.07)',
  },
};

// Resolved theme palette for the current Uniwind theme. Avoids repeating the
// `isDark ? THEME.dark.* : THEME.light.*` branch in every component.
export function useThemeColors() {
  const { theme } = useUniwind();
  const isDark = theme === 'dark';
  return { isDark, colors: isDark ? THEME.dark : THEME.light };
}

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
