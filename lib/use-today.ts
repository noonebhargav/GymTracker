import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { formatLocalDate } from '@/lib/date-utils';

function todayDateStr(): string {
  return formatLocalDate(new Date());
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
