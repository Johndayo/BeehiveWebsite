import { Home, ArrowLeft } from 'lucide-react';
import type { Page } from '../App';

interface NotFoundPageProps {
  onNavigate: (page: Page) => void;
}

export default function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  return (
    <main className="flex-1 flex items-center justify-center px-5 sm:px-6 py-16 sm:py-24">
      <div className="text-center max-w-lg">
        <div className="relative inline-block mb-6">
          <span className="text-[8rem] sm:text-[10rem] font-bold text-navy-100 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center">
              <Home className="w-8 h-8 text-brand-500" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-navy-500 text-sm sm:text-base leading-relaxed mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-navy-800 text-white text-sm font-semibold rounded-lg hover:bg-navy-900 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </button>
          <button
            onClick={() => onNavigate('consultation')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-navy-700 text-sm font-semibold rounded-lg border border-navy-200 hover:bg-navy-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Request Consultation
          </button>
        </div>
      </div>
    </main>
  );
}
