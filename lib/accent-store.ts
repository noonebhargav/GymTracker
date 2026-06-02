import { useEffect, useState } from 'react';
import { useUniwind } from 'uniwind';
import { ACCENT_COLORS, DEFAULT_ACCENT_KEY } from './accent-colors';

// Holds the selected accent *key* (not a fixed hex) so consumers can resolve the
// theme-appropriate primary — light variants are deeper than the dark/bright ones.
let _key: string | undefined;
const listeners = new Set<() => void>();

export function setAccent(key: string | undefined) {
  _key = key;
  listeners.forEach((fn) => fn());
}

export function useAccentHex(): string {
  const [key, setKey] = useState(_key);
  const { theme } = useUniwind();

  useEffect(() => {
    const cb = () => setKey(_key);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  const color =
    ACCENT_COLORS.find((c) => c.key === key) ??
    ACCENT_COLORS.find((c) => c.key === DEFAULT_ACCENT_KEY) ??
    ACCENT_COLORS[0];
  return theme === 'dark' ? color.dark.primary : color.light.primary;
}
