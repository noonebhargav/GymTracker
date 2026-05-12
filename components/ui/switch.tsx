import { Root, Thumb } from '@rn-primitives/switch';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Platform } from 'react-native';

const switchVariants = cva(
  cn(
    'relative shrink-0',
    Platform.select({
      web: 'focus-visible:ring-ring/50 inline-flex focus-visible:ring-[3px]',
    })
  ),
  {
    variants: {
      size: {
        default: 'h-6 w-10 rounded-full',
        sm: 'h-5 w-8 rounded-full',
        lg: 'h-7 w-12 rounded-full',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const thumbVariants = cva('rounded-full shadow-sm', {
  variants: {
    size: {
      default: 'size-5 m-0.5',
      sm: 'size-4 m-0.5',
      lg: 'size-6 m-0.5',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

type SwitchProps = React.ComponentProps<typeof Root> &
  VariantProps<typeof switchVariants>;

function Switch({ className, size, checked, disabled, ...props }: SwitchProps) {
  const isOn = checked ?? false;

  return (
    <Root
      checked={checked}
      disabled={disabled}
      className={cn(
        disabled && 'opacity-50',
        switchVariants({ size }),
        'border',
        isOn ? 'bg-primary border-primary' : 'bg-border border-border',
        className
      )}
      {...props}
    >
      <Thumb
        className={cn(
          thumbVariants({ size }),
          'bg-background',
          isOn && 'translate-x-4'
        )}
      />
    </Root>
  );
}

export { Switch, switchVariants, thumbVariants };
export type { SwitchProps };
