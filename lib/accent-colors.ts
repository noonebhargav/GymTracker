import { Uniwind } from 'uniwind';

type AccentColor = {
  name: string;
  key: string;
  // Per-theme primary fill + its foreground text + focus ring. Light variants are
  // deepened so accent text/tints/chips keep contrast against the light background
  // (#f6f6f3 / #ffffff); dark variants stay bright against the dark background.
  light: { primary: string; foreground: string; ring: string };
  dark: { primary: string; foreground: string; ring: string };
};

export const DEFAULT_ACCENT_KEY = 'lime';

export const ACCENT_COLORS: AccentColor[] = [
  {
    name: 'Electric Lime',
    key: 'lime',
    light: { primary: '#5b8c00', foreground: '#ffffff', ring: '#4a7000' },
    dark:  { primary: '#d8fe3d', foreground: '#0a0b0d', ring: '#b8d820' },
  },
  {
    name: 'Alarm Red',
    key: 'red',
    light: { primary: '#d92d43', foreground: '#ffffff', ring: '#b81f33' },
    dark:  { primary: '#ff5868', foreground: '#ffffff', ring: '#e04050' },
  },
  {
    name: 'Electric Blue',
    key: 'blue',
    light: { primary: '#0c84d6', foreground: '#ffffff', ring: '#0a6cb0' },
    dark:  { primary: '#5ec3ff', foreground: '#0a0b0d', ring: '#3ea0e0' },
  },
  {
    name: 'Dynamo Orange',
    key: 'orange',
    light: { primary: '#c25e15', foreground: '#ffffff', ring: '#a8500f' },
    dark:  { primary: '#ff8a3d', foreground: '#0a0b0d', ring: '#e07020' },
  },
  {
    name: 'Ultra Violet',
    key: 'violet',
    light: { primary: '#7c3aed', foreground: '#ffffff', ring: '#6627d4' },
    dark:  { primary: '#c476ff', foreground: '#ffffff', ring: '#a050e0' },
  },
];

export function applyAccentColor(key: string | null) {
  const color = ACCENT_COLORS.find((c) => c.key === key);

  if (!color) {
    // Unknown/null key falls back to the default accent (guard against recursion
    // in the unlikely case the default is ever missing from ACCENT_COLORS).
    if (key !== DEFAULT_ACCENT_KEY) applyAccentColor(DEFAULT_ACCENT_KEY);
    return;
  }

  Uniwind.updateCSSVariables('light', {
    '--color-primary': color.light.primary,
    '--color-primary-foreground': color.light.foreground,
    '--color-ring': color.light.ring,
    '--color-sidebar-primary': color.light.primary,
    '--color-sidebar-primary-foreground': color.light.foreground,
  });
  Uniwind.updateCSSVariables('dark', {
    '--color-primary': color.dark.primary,
    '--color-primary-foreground': color.dark.foreground,
    '--color-ring': color.dark.ring,
    '--color-sidebar-primary': color.dark.primary,
    '--color-sidebar-primary-foreground': color.dark.foreground,
  });
}
