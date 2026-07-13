import type { ReactNode } from 'react';
import './ContentGrid.css';

interface ContentGridProps {
  children: ReactNode;
}

// Desktop two-column layout for module content; collapses to a single
// column automatically on narrower viewports via CSS.
export function ContentGrid({ children }: ContentGridProps) {
  return <div className="content-grid">{children}</div>;
}
