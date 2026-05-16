import { useState, useEffect } from 'react';

let _counter = 0;
const listeners = new Set<() => void>();

export function forceReset() {
  _counter++;
  listeners.forEach((fn) => fn());
}

export function useResetKey() {
  const [key, setKey] = useState(_counter);

  useEffect(() => {
    const cb = () => setKey(_counter);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  return key;
}
