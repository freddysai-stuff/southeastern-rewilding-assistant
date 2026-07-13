import type { ReactNode } from 'react';
import { useLayoutMode } from '../design-system/useLayoutMode';
import { HeaderArtwork } from './HeaderArtwork';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileNavBar } from './MobileNavBar';
import './AppShell.css';

interface AppShellProps {
  children: ReactNode;
}

/**
 * Root layout wrapper. Switches between the mobile (stacked, bottom nav)
 * and desktop (sidebar, two-column) layouts based on viewport width,
 * matching the provided mockups.
 */
export function AppShell({ children }: AppShellProps) {
  const mode = useLayoutMode();
  const isDesktop = mode === 'desktop';

  return (
    <div className="app-shell">
      <HeaderArtwork />
      <div className="app-shell__body">
        {isDesktop && <DesktopSidebar />}
        <main className="app-shell__content">{children}</main>
      </div>
      {!isDesktop && <MobileNavBar />}
    </div>
  );
}
