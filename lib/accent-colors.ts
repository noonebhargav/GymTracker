import { Uniwind } from 'uniwind';

export type AccentColor = {
  name: string;
  key: string;
  swatchHex: string;
  primaryForegroundHex: string;
  light: { primary: string; primaryHex: string; ring: string };
  dark: { primary: string; primaryHex: string; ring: string };
};

export const ACCENT_COLORS: AccentColor[] = [
  {
    name: 'Electric Lime',
    key: 'lime',
    swatchHex: '#d8fe3d',
    primaryForegroundHex: '#0a0b0d',
    light: { primary: '#d8fe3d', primaryHex: '#d8fe3d', ring: '#b8d820' },
    dark:  { primary: '#d8fe3d', primaryHex: '#d8fe3d', ring: '#b8d820' },
  },
  {
    name: 'Alarm Red',
    key: 'red',
    swatchHex: '#ff5868',
    primaryForegroundHex: '#ffffff',
    light: { primary: '#ff5868', primaryHex: '#ff5868', ring: '#e04050' },
    dark:  { primary: '#ff5868', primaryHex: '#ff5868', ring: '#e04050' },
  },
  {
    name: 'Electric Blue',
    key: 'blue',
    swatchHex: '#5ec3ff',
    primaryForegroundHex: '#0a0b0d',
    light: { primary: '#5ec3ff', primaryHex: '#5ec3ff', ring: '#3ea0e0' },
    dark:  { primary: '#5ec3ff', primaryHex: '#5ec3ff', ring: '#3ea0e0' },
  },
  {
    name: 'Dynamo Orange',
    key: 'orange',
    swatchHex: '#ff8a3d',
    primaryForegroundHex: '#0a0b0d',
    light: { primary: '#ff8a3d', primaryHex: '#ff8a3d', ring: '#e07020' },
    dark:  { primary: '#ff8a3d', primaryHex: '#ff8a3d', ring: '#e07020' },
  },
  {
    name: 'Ultra Violet',
    key: 'violet',
    swatchHex: '#c476ff',
    primaryForegroundHex: '#ffffff',
    light: { primary: '#c476ff', primaryHex: '#c476ff', ring: '#a050e0' },
    dark:  { primary: '#c476ff', primaryHex: '#c476ff', ring: '#a050e0' },
  },
];

const LIME_DEFAULTS = {
  '--color-primary': '#d8fe3d',
  '--color-primary-foreground': '#0a0b0d',
  '--color-ring': '#b8d820',
  '--color-sidebar-primary': '#d8fe3d',
  '--color-sidebar-primary-foreground': '#0a0b0d',
};

export function applyAccentColor(key: string | null, _theme: 'light' | 'dark') {
  const color = ACCENT_COLORS.find((c) => c.key === key);

  if (!color) {
    Uniwind.updateCSSVariables('light', LIME_DEFAULTS);
    Uniwind.updateCSSVariables('dark', LIME_DEFAULTS);
    return;
  }

  const vars = {
    '--color-primary': color.light.primary,
    '--color-primary-foreground': color.primaryForegroundHex,
    '--color-ring': color.light.ring,
    '--color-sidebar-primary': color.light.primary,
    '--color-sidebar-primary-foreground': color.primaryForegroundHex,
  };

  Uniwind.updateCSSVariables('light', vars);
  Uniwind.updateCSSVariables('dark', {
    ...vars,
    '--color-primary': color.dark.primary,
    '--color-ring': color.dark.ring,
    '--color-sidebar-primary': color.dark.primary,
  });
}
