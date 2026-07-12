import { Link } from 'react-router-dom';
import { Card } from './Card';
import './ModuleCard.css';

interface ModuleCardProps {
  to: string;
  icon: string;
  title: string;
  description: string;
}

// The tile used on the dashboard grid for each of the 8 modules,
// matching the card layout shown in the desktop/mobile mockups.
export function ModuleCard({ to, icon, title, description }: ModuleCardProps) {
  return (
    <Link to={to} className="module-card-link">
      <Card interactive className="module-card">
        <span className="module-card__icon" aria-hidden="true">
          {icon}
        </span>
        <div>
          <h3 className="module-card__title">{title}</h3>
          <p className="module-card__description">{description}</p>
        </div>
      </Card>
    </Link>
  );
}
