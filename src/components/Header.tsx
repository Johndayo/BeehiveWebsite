import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import type { Page } from '../App';

interface HeaderProps {
  currentPage: Page | '404';
  onNavigate: (page: Page) => void;
  onScrollTo: (sectionId: string) => void;
  isAdmin?: boolean;
  onSignOut?: () => void;
}

export default function Header({ currentPage, onNavigate, onScrollTo }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [currentPage]);

  const isHome = currentPage === 'home';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-navy-100/60'
          : 'bg-white border-b border-navy-100/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <button
            onClick={() => onNavigate('home')}
            className="flex-shrink-0 hover:opacity-90 transition-opacity"
          >
            <img
              src="/Beehive_Associates_logo.png"
              alt="Beehive Associates"
              className="h-10 sm:h-14 w-auto"
            />
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isHome
                  ? 'text-navy-900 bg-navy-50'
                  : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50/60'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onScrollTo('services')}
              className="px-4 py-2 text-sm font-medium text-navy-600 hover:text-navy-900 hover:bg-navy-50/60 rounded-lg transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => onScrollTo('about')}
              className="px-4 py-2 text-sm font-medium text-navy-600 hover:text-navy-900 hover:bg-navy-50/60 rounded-lg transition-colors"
            >
              About
            </button>
            <button
              onClick={() => onScrollTo('contact')}
              className="px-4 py-2 text-sm font-medium text-navy-600 hover:text-navy-900 hover:bg-navy-50/60 rounded-lg transition-colors"
            >
              Contact
            </button>
            <div className="w-px h-6 bg-navy-200 mx-2" />
            <button
              onClick={() => onNavigate('consultation')}
              className="group flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-accent-500 transition-colors"
            >
              Request Consultation
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2.5 text-navy-700 hover:text-navy-900 hover:bg-navy-50 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-navy-100 bg-white animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-1">
            <button
              onClick={() => { onNavigate('home'); setMobileOpen(false); }}
              className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isHome ? 'text-navy-900 bg-navy-50' : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => { onScrollTo('services'); setMobileOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-navy-600 hover:text-navy-900 hover:bg-navy-50 rounded-lg transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => { onScrollTo('about'); setMobileOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-navy-600 hover:text-navy-900 hover:bg-navy-50 rounded-lg transition-colors"
            >
              About
            </button>
            <button
              onClick={() => { onScrollTo('contact'); setMobileOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-navy-600 hover:text-navy-900 hover:bg-navy-50 rounded-lg transition-colors"
            >
              Contact
            </button>
            <div className="pt-2">
              <button
                onClick={() => { onNavigate('consultation'); setMobileOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-accent-500 transition-colors"
              >
                Request Consultation
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
