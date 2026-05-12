import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Dumbbell, CalendarDays, Search, Clock, Settings } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { tab: 'workout', label: 'Workout', icon: Dumbbell },
  { tab: 'routine', label: 'Routine', icon: CalendarDays },
  { tab: 'explore', label: 'Explore', icon: Search },
  { tab: 'history', label: 'History', icon: Clock },
  { tab: 'settings', label: 'Settings', icon: Settings },
] as const;

const PATHS: Record<string, string> = {
  workout: '/(tabs)/workout',
  routine: '/(tabs)/routine',
  explore: '/(tabs)/explore',
  history: '/(tabs)/history',
  settings: '/(tabs)/settings',
};

interface DrawerMenuProps {
  onSelect?: () => void;
}

export function DrawerMenu({ onSelect }: DrawerMenuProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-4 border-b border-border">
        <Text className="text-xl font-bold text-foreground">GymTracker</Text>
      </View>
      <View className="flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.includes(item.tab);
          return (
            <Pressable
              key={item.tab}
              onPress={() => {
                const path = PATHS[item.tab]!;
                router.navigate(path as any);
                onSelect?.();
              }}
              className={cn(
                'flex-row items-center px-6 py-4 gap-4',
                isActive && 'bg-muted border-l-2 border-primary',
              )}
            >
              <Icon
                as={item.icon}
                className={cn('size-5', isActive ? 'text-primary' : 'text-muted-foreground')}
              />
              <Text
                className={cn(
                  'text-base flex-1',
                  isActive ? 'font-semibold text-primary' : 'text-foreground',
                )}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
