import { useEffect, useState } from 'react';
import { breakpoints } from '@sera/shared';

export type LayoutMode = 'mobile' | 'tablet' | 'desktop';

function getLayoutMode(width: number): LayoutMode {
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'mobile';
}

/**
 * Returns the current responsive layout mode ('mobile' | 'tablet' | 'desktop'),
 * updating on window resize. Used by ResponsiveWrapper / AppShell to switch
 * between the mobile bottom-nav layout and the desktop sidebar layout.
 */
export function useLayoutMode(): LayoutMode {
  const [mode, setMode] = useState<LayoutMode>(() =>
    typeof window === 'undefined' ? 'desktop' : getLayoutMode(window.innerWidth),
  );

  useEffect(() => {
    const onResize = () => setMode(getLayoutMode(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return mode;
}
