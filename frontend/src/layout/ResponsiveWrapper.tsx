import type { ReactNode } from 'react';
import { useLayoutMode } from '../design-system/useLayoutMode';

interface ResponsiveWrapperProps {
  mobile: ReactNode;
  desktop: ReactNode;
  tablet?: ReactNode;
}

/**
 * Renders different content depending on the current breakpoint.
 * Falls back to `mobile` for tablet if no `tablet` variant is provided.
 */
export function ResponsiveWrapper({ mobile, tablet, desktop }: ResponsiveWrapperProps) {
  const mode = useLayoutMode();
  if (mode === 'desktop') return <>{desktop}</>;
  if (mode === 'tablet') return <>{tablet ?? mobile}</>;
  return <>{mobile}</>;
}
