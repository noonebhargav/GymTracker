import { useWindowDimensions } from 'react-native';

const DESKTOP_BREAKPOINT = 600;

export function useResponsive() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  return { width, isDesktop };
}
