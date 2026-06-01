import { useCallback } from 'react';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Dumbbell, CalendarDays, Search, Clock, Settings } from 'lucide-react-native';
import { TabBar } from '@/components/navigation/tab-bar';
import { useAccentHex } from '@/lib/accent-store';
import { useThemeColors } from '@/lib/theme';

export default function TabLayout() {
  const accentPrimary = useAccentHex();
  const { colors } = useThemeColors();

  type TabBarProps = NonNullable<ComponentProps<typeof Tabs>['tabBar']> extends (props: infer P) => unknown ? P : never;
  const renderTabBar = useCallback(
    (props: TabBarProps) => <TabBar {...props} activeColor={accentPrimary} />,
    [accentPrimary]
  );

  return (
    <Tabs
      initialRouteName="workout"
      tabBar={renderTabBar}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.foreground,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color }) => <Dumbbell color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: 'Routine',
          tabBarIcon: ({ color }) => <CalendarDays color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Search color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Clock color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings color={color} size={20} />,
        }}
      />
    </Tabs>
  );
}
