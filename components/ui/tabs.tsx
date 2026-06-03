import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as TabsPrimitive from '@rn-primitives/tabs';
import { Platform } from 'react-native';

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root className={cn('flex flex-col gap-2', className)} {...props} />;
}

function TabsList({
  className,
  variant = 'track',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: 'track' | 'pills';
}) {
  return (
    <TabsPrimitive.List
      className={cn(
        // `track` = grouped segmented control on a muted background (fixed sets).
        // `pills` = free-standing pills with gaps (scrollable / variable sets).
        variant === 'pills'
          ? 'flex flex-row items-center gap-2'
          : 'bg-muted flex h-13 flex-row items-center justify-center rounded-lg p-[3px]',
        Platform.select({ web: 'inline-flex w-fit', native: 'mr-auto' }),
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  textClassName,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  variant?: 'default' | 'primary' | 'pill';
  textClassName?: string;
}) {
  const { value } = TabsPrimitive.useRootContext();
  const isActive = props.value === value;

  // `pill`    = free-standing rounded pill (secondary → primary on active).
  // `primary` = saturated accent fill on a track when active.
  // `default` = RNR raised pill on a track.
  // Screens layer `className`/`textClassName` on top for any extra (third) state.
  const shape =
    variant === 'pill'
      ? 'h-11 px-5 rounded-full border border-transparent active:opacity-80'
      : 'rounded-md border border-transparent px-4 py-3 shadow-none shadow-black/5';

  let bg: string | undefined;
  let text: string;
  if (variant === 'pill') {
    // Press feedback is opacity-based (in `shape`) so a screen's bg override
    // (e.g. Routine's marked-day tint) can't conflict with a press-state color.
    bg = isActive ? 'bg-primary' : 'bg-secondary';
    text = isActive ? 'text-primary-foreground' : 'text-foreground';
  } else if (variant === 'primary') {
    bg = isActive ? 'bg-primary' : undefined;
    text = isActive ? 'text-primary-foreground' : 'text-muted-foreground';
  } else {
    bg = isActive ? 'bg-background dark:border-foreground/10 dark:bg-input/30' : undefined;
    text = cn('text-foreground dark:text-muted-foreground', isActive && 'dark:text-foreground');
  }

  return (
    <TextClassContext.Provider value={cn('text-sm font-medium', text, textClassName)}>
      <TabsPrimitive.Trigger
        className={cn(
          'flex flex-row items-center justify-center gap-1.5',
          shape,
          Platform.select({
            web: 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring inline-flex cursor-default whitespace-nowrap transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring-[3px] disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
          }),
          props.disabled && 'opacity-50',
          bg,
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(Platform.select({ web: 'flex-1 outline-none' }), className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
