import { View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui/text';

type Option = { key: string; label: string };

// Light selection feedback on an actual change; no buzz when re-tapping the active option.
function selectWithHaptic(current: string, next: string, onChange: (v: string) => void) {
  if (next !== current) Haptics.selectionAsync().catch(() => {});
  onChange(next);
}

export function SegmentedControl({
  label,
  description,
  options,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View className="px-4 py-3 border-b border-border">
      <View className="flex-row items-center justify-between">
        <Text className="text-base text-foreground shrink min-w-0">{label}</Text>
        <View className="flex-row rounded-lg bg-muted border border-border overflow-hidden shrink-0">
          {options.map((opt, i) => {
            const active = value === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => selectWithHaptic(value, opt.key, onChange)}
                className={`px-3.5 h-10 items-center justify-center ${
                  i > 0 ? 'border-l border-border' : ''
                } ${active ? 'bg-primary' : 'active:bg-muted/80'}`}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                aria-label={opt.label}
              >
                <Text
                  className={`text-sm font-medium ${
                    active ? 'text-primary-foreground' : 'text-foreground'
                  }`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {description && (
        <Text className="text-xs text-muted-foreground mt-1.5">{description}</Text>
      )}
    </View>
  );
}
