import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function ScreenWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { top } = useSafeAreaInsets();

  return (
    <View className={cn('flex-1 bg-background', className)} style={{ paddingTop: top }}>
      {children}
    </View>
  );
}
