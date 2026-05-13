import { useEffect, useState, useCallback } from 'react';
import { Platform, Pressable } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Dumbbell, CalendarDays, Search, Clock, Settings, Menu } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { DrawerMenu } from '@/components/navigation/drawer-menu';
import { TabBar } from '@/components/navigation/tab-bar';
import { useResponsive } from '@/lib/use-responsive';
import { useTheme } from '@react-navigation/native';
import { useAccentHex } from '@/lib/accent-store';

export default function TabLayout() {
  const { isDesktop } = useResponsive();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { colors } = useTheme();
  const accentPrimary = useAccentHex();

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (e: PopStateEvent) => {
      if (drawerOpen) {
        e.preventDefault();
        setDrawerOpen(false);
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [drawerOpen]);

  const renderTabBar = useCallback(
    (props: BottomTabBarProps) => (!isDesktop ? <TabBar {...props} activeColor={accentPrimary} /> : null),
    [isDesktop, accentPrimary]
  );

  return (
    <Drawer
      open={drawerOpen}
      onOpen={() => setDrawerOpen(true)}
      onClose={() => setDrawerOpen(false)}
      drawerType="front"
      drawerStyle={{ width: 300, backgroundColor: colors.card }}
      renderDrawerContent={() => <DrawerMenu onSelect={() => setDrawerOpen(false)} />}
    >
      <Tabs
        initialRouteName="workout"
        tabBar={renderTabBar}
        screenOptions={{
          headerLeft: () => (
            <Pressable
              onPress={() => setDrawerOpen(true)}
              className="ml-4 p-2"
            >
              <Icon as={Menu} className="size-5 text-foreground" />
            </Pressable>
          ),
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
    </Drawer>
  );
}
