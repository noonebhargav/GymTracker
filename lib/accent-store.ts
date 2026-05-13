import { useState, useEffect } from 'react';

let _hex: string | undefined;
const listeners = new Set<() => void>();

export function setAccent(hex: string | undefined) {
  _hex = hex;
  listeners.forEach((fn) => fn());
}

export function useAccentHex() {
  const [hex, setHex] = useState(_hex);

  useEffect(() => {
    const cb = () => setHex(_hex);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  return hex;
}
