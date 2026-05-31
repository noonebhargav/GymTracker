import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';

export function todayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useToday(): string {
  const [today, setToday] = useState(todayDateStr);

  useFocusEffect(
    useCallback(() => {
      setToday((prev) => {
        const current = todayDateStr();
        return prev === current ? prev : current;
      });
    }, [])
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      setToday((prev) => {
        const current = todayDateStr();
        return prev === current ? prev : current;
      });
    });
    return () => sub.remove();
  }, []);

  return today;
}
