import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';

export function SegmentedControl({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
      <Text className="text-base text-foreground shrink min-w-0">{label}</Text>
      <View className="flex-row rounded-lg bg-muted border border-border overflow-hidden shrink-0">
        {options.map((opt, i) => {
          const active = value === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => onChange(opt.key)}
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
  );
}
