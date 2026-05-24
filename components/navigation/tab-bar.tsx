import { View, Pressable, Text as RNText } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { THEME } from '@/lib/theme';

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
  const { theme } = useUniwind();
  const currentTheme = (theme === 'dark' ? 'dark' : 'light') as 'light' | 'dark';
  const primary = activeColor ?? colors.primary;
  const mutedColor = THEME[currentTheme].mutedForeground;

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        paddingBottom: bottom,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const iconColor = isFocused ? primary : mutedColor;
        const labelColor = isFocused ? colors.text : mutedColor;
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
              position: 'relative',
            }}
          >
            {isFocused && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  alignSelf: 'center',
                  width: 24,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: primary,
                }}
              />
            )}
            {options.tabBarIcon?.({ focused: isFocused, color: iconColor, size: 24 })}
            <RNText
              style={{
                color: labelColor,
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
