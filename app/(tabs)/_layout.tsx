import { useState } from 'react';
import { Pressable } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { Tabs } from 'expo-router';
import { Dumbbell, CalendarDays, Search, Clock, Settings, Menu, Moon, Sun } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { DrawerMenu } from '@/components/navigation/drawer-menu';
import { TabBar } from '@/components/navigation/tab-bar';
import { useResponsive } from '@/lib/use-responsive';
import { useTheme } from '@react-navigation/native';
import { useUniwind, Uniwind } from 'uniwind';

export default function TabLayout() {
  const { isDesktop } = useResponsive();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { colors } = useTheme();
  const { theme } = useUniwind();
  const isDark = theme === 'dark';

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
        tabBar={(props) => (!isDesktop ? <TabBar {...props} /> : null)}
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerLeft: () => (
            <Pressable
              onPress={() => setDrawerOpen(true)}
              className="ml-4 p-2"
            >
              <Icon as={Menu} className="size-5 text-foreground" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => Uniwind.setTheme(isDark ? 'light' : 'dark')}
              className="mr-4 p-2 rounded-full active:bg-muted"
            >
              <Icon
                as={isDark ? Sun : Moon}
                className="size-5 text-foreground"
              />
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
