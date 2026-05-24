import * as DialogPrimitive from '@rn-primitives/dialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { View } from 'react-native';
import type { ComponentProps } from 'react';

type ButtonProps = ComponentProps<typeof Button>;

function AlertDialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <View className="absolute inset-0 bg-black/50" />
      <View className="absolute inset-0 items-center justify-center p-4">
        <DialogPrimitive.Content
          className={cn(
            'w-full max-w-sm rounded-xl bg-background border border-border p-6 shadow-lg',
            className
          )}
        >
          {children}
        </DialogPrimitive.Content>
      </View>
    </DialogPrimitive.Portal>
  );
}

function AlertDialogHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <View className={cn('gap-1.5', className)}>{children}</View>;
}

function AlertDialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={cn('flex-row justify-end gap-3 mt-5', className)}>
      {children}
    </View>
  );
}

function AlertDialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Title
      className={cn('text-lg font-semibold text-foreground', className)}
    >
      {children}
    </DialogPrimitive.Title>
  );
}

function AlertDialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Description
      className={cn('text-sm text-muted-foreground', className)}
    >
      {children}
    </DialogPrimitive.Description>
  );
}

/**
 * Wraps children in a destructive button that auto-closes the dialog on press.
 * NOTE: Not suitable for async operations (e.g. confirmations that await a
 * result before closing). Use a manual `<Button>` and `onOpenChange` for those.
 */
function AlertDialogAction({
  children,
  className,
  onPress,
  ...props
}: ButtonProps) {
  return (
    <DialogPrimitive.Close asChild>
      <Button
        variant="destructive"
        size="sm"
        className={className}
        onPress={onPress}
        {...props}
      >
        {children}
      </Button>
    </DialogPrimitive.Close>
  );
}

function AlertDialogCancel({
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <DialogPrimitive.Close asChild>
      <Button variant="outline" size="sm" className={className} {...props}>
        {children}
      </Button>
    </DialogPrimitive.Close>
  );
}

const AlertDialog = DialogPrimitive.Root;
const AlertDialogTrigger = DialogPrimitive.Trigger;

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
