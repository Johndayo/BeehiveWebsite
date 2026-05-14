import { ChevronRight, Home } from 'lucide-react';
import type { Page } from '../App';

interface BreadcrumbItem {
  label: string;
  page: Page | 'home';
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (page: Page) => void;
  className?: string;
}

// Export for reuse in other components
export const pageLabels: Record<Page | 'home', string> = {
  home: 'Home',
  team: 'Team',
  services: 'Services',
  about: 'About',
  consultation: 'Book Consultation',
  settings: 'Settings',
};

export default function Breadcrumb({ items, onNavigate, className = '' }: BreadcrumbProps) {
  return (
    <nav
      className={`flex items-center gap-2 text-sm ${className}`}
      aria-label="breadcrumb"
    >
      <ol className="flex items-center gap-2">
        <li>
          <button
            onClick={() => onNavigate('home' as Page)}
            className="flex items-center gap-1.5 text-navy-600 hover:text-brand-500 transition-colors"
            aria-current="false"
          >
            <Home size={16} className="flex-shrink-0" aria-hidden="true" />
            <span className="sr-only">{pageLabels.home}</span>
          </button>
        </li>

        {items.map((item, index) => (
          <li key={item.page} className="flex items-center gap-2">
            <ChevronRight size={16} className="text-navy-400" aria-hidden="true" />
            {index === items.length - 1 ? (
              <span className="text-navy-600 font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(item.page as Page)}
                className="text-navy-600 hover:text-brand-500 transition-colors"
                aria-current="false"
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function getBreadcrumbItems(currentPage: Page): BreadcrumbItem[] {
  const breadcrumbs: Record<Page, BreadcrumbItem[]> = {
    home: [],
    team: [{ label: pageLabels.team, page: 'team' }],
    services: [{ label: pageLabels.services, page: 'services' }],
    about: [{ label: pageLabels.about, page: 'about' }],
    consultation: [{ label: pageLabels.consultation, page: 'consultation' }],
    settings: [{ label: pageLabels.settings, page: 'settings' }],
  };
  return breadcrumbs[currentPage] || [];
}