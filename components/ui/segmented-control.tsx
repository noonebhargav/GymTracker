import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';

type Option = { key: string; label: string };

export function Segmented({
  options,
  value,
  onChange,
  className,
}: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <View className={`flex-row bg-muted rounded-lg p-0.5 ${className ?? ''}`}>
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            className={`flex-1 h-10 rounded-md items-center justify-center ${
              active ? 'bg-background shadow-sm' : ''
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            aria-label={opt.label}
          >
            <Text
              className={`text-sm font-medium ${
                active ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
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
      {description && (
        <Text className="text-xs text-muted-foreground mt-1.5">{description}</Text>
      )}
    </View>
  );
}
