import { Uniwind } from 'uniwind';

export type AccentColor = {
  name: string;
  key: string;
  swatchHex: string;
  light: { primary: string; primaryHex: string; ring: string };
  dark: { primary: string; primaryHex: string; ring: string };
};

export const ACCENT_COLORS: AccentColor[] = [
  {
    name: 'Blue',
    key: 'blue',
    swatchHex: '#3B82F6',
    light: { primary: 'oklch(0.42 0.24 252)', primaryHex: '#2563EB', ring: 'oklch(0.58 0.18 250)' },
    dark: { primary: 'oklch(0.68 0.16 252)', primaryHex: '#60A5FA', ring: 'oklch(0.62 0.12 250)' },
  },
  {
    name: 'Green',
    key: 'green',
    swatchHex: '#10B981',
    light: { primary: 'oklch(0.4 0.22 148)', primaryHex: '#059669', ring: 'oklch(0.55 0.16 148)' },
    dark: { primary: 'oklch(0.66 0.14 148)', primaryHex: '#34D399', ring: 'oklch(0.6 0.1 148)' },
  },
  {
    name: 'Indigo',
    key: 'indigo',
    swatchHex: '#6366F1',
    light: { primary: 'oklch(0.4 0.22 265)', primaryHex: '#4F46E5', ring: 'oklch(0.53 0.16 265)' },
    dark: { primary: 'oklch(0.65 0.14 265)', primaryHex: '#818CF8', ring: 'oklch(0.6 0.1 265)' },
  },
  {
    name: 'Orange',
    key: 'orange',
    swatchHex: '#F97316',
    light: { primary: 'oklch(0.48 0.22 55)', primaryHex: '#EA580C', ring: 'oklch(0.6 0.16 55)' },
    dark: { primary: 'oklch(0.7 0.14 55)', primaryHex: '#FB923C', ring: 'oklch(0.64 0.1 55)' },
  },
  {
    name: 'Pink',
    key: 'pink',
    swatchHex: '#EC4899',
    light: { primary: 'oklch(0.45 0.24 350)', primaryHex: '#DB2777', ring: 'oklch(0.58 0.18 350)' },
    dark: { primary: 'oklch(0.68 0.16 350)', primaryHex: '#F472B6', ring: 'oklch(0.62 0.12 350)' },
  },
  {
    name: 'Purple',
    key: 'purple',
    swatchHex: '#A855F7',
    light: { primary: 'oklch(0.4 0.22 300)', primaryHex: '#9333EA', ring: 'oklch(0.53 0.16 300)' },
    dark: { primary: 'oklch(0.65 0.14 300)', primaryHex: '#C084FC', ring: 'oklch(0.6 0.1 300)' },
  },
  {
    name: 'Red',
    key: 'red',
    swatchHex: '#EF4444',
    light: { primary: 'oklch(0.42 0.28 20)', primaryHex: '#DC2626', ring: 'oklch(0.55 0.22 20)' },
    dark: { primary: 'oklch(0.68 0.18 20)', primaryHex: '#F87171', ring: 'oklch(0.62 0.14 20)' },
  },
  {
    name: 'Teal',
    key: 'teal',
    swatchHex: '#14B8A6',
    light: { primary: 'oklch(0.4 0.2 185)', primaryHex: '#0D9488', ring: 'oklch(0.53 0.14 185)' },
    dark: { primary: 'oklch(0.65 0.12 185)', primaryHex: '#2DD4BF', ring: 'oklch(0.6 0.08 185)' },
  },
  {
    name: 'Neutral',
    key: 'neutral',
    swatchHex: '#6B7280',
    light: { primary: 'oklch(0.205 0 0)', primaryHex: '#1A1A1A', ring: 'oklch(0.708 0 0)' },
    dark: { primary: 'oklch(0.922 0 0)', primaryHex: '#EBEBEB', ring: 'oklch(0.556 0 0)' },
  },
];

const LIGHT_DEFAULTS: Record<string, string> = {
  '--color-primary': 'oklch(0.205 0 0)',
  '--color-primary-foreground': 'oklch(0.985 0 0)',
  '--color-ring': 'oklch(0.708 0 0)',
  '--color-sidebar-primary': 'oklch(0.205 0 0)',
  '--color-sidebar-primary-foreground': 'oklch(0.985 0 0)',
};

const DARK_DEFAULTS: Record<string, string> = {
  '--color-primary': 'oklch(0.922 0 0)',
  '--color-primary-foreground': 'oklch(0.205 0 0)',
  '--color-ring': 'oklch(0.556 0 0)',
  '--color-sidebar-primary': 'oklch(0.488 0.243 264.376)',
  '--color-sidebar-primary-foreground': 'oklch(0.985 0 0)',
};

export function applyAccentColor(
  key: string | null,
  _theme: 'light' | 'dark'
) {
  if (!key || key === 'neutral') {
    Uniwind.updateCSSVariables('light', LIGHT_DEFAULTS);
    Uniwind.updateCSSVariables('dark', DARK_DEFAULTS);
    return;
  }

  const color = ACCENT_COLORS.find((c) => c.key === key);
  if (!color) return;

  Uniwind.updateCSSVariables('light', {
    '--color-primary': color.light.primary,
    '--color-ring': color.light.ring,
    '--color-sidebar-primary': color.light.primary,
  });

  Uniwind.updateCSSVariables('dark', {
    '--color-primary': color.dark.primary,
    '--color-ring': color.dark.ring,
    '--color-sidebar-primary': color.dark.primary,
  });
}
