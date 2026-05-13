import { View, Pressable, Text as RNText } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LABELS: Record<string, string> = {
  workout: 'Workout',
  routine: 'Routine',
  explore: 'Explore',
  history: 'History',
  settings: 'Settings',
};

export function TabBar({ state, descriptors, navigation, activeColor }: BottomTabBarProps & { activeColor?: string }) {
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const primary = activeColor ?? colors.primary;

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        paddingBottom: bottom,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const color = isFocused ? primary : colors.text;
        const label = LABELS[route.name] ?? options.title ?? route.name;

        function onPress() {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 8,
              paddingBottom: 8,
              minWidth: 0,
              borderTopWidth: 3,
              borderTopColor: isFocused ? primary : 'transparent',
            }}
          >
            {options.tabBarIcon?.({ focused: isFocused, color, size: 24 })}
            <RNText
              style={{
                color,
                fontSize: 12,
                fontWeight: isFocused ? '600' : '400',
                marginTop: 4,
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {label}
            </RNText>
          </Pressable>
        );
      })}
    </View>
  );
}
