import { Settings, LogOut, User } from 'lucide-react';
import GoogleSheetsSettings from '../components/GoogleSheetsSettings';

interface SettingsPageProps {
  onSignOut: () => void;
  userEmail?: string;
}

export default function SettingsPage({ onSignOut, userEmail }: SettingsPageProps) {
  return (
    <main className="flex-1">
      <div className="relative bg-navy-900 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-navy-700 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-14">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 mb-4 animate-fade-in-up">
                <div className="w-1 h-4 rounded-full bg-brand-500" />
                <p className="text-xs font-semibold text-navy-300 uppercase tracking-widest">
                  Administration
                </p>
              </div>
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight animate-fade-in-up"
                style={{ animationDelay: '80ms', animationFillMode: 'both' }}
              >
                Integration Settings
              </h1>
              <p
                className="text-navy-400 mt-3 max-w-xl text-sm sm:text-base leading-relaxed animate-fade-in-up"
                style={{ animationDelay: '160ms', animationFillMode: 'both' }}
              >
                Configure external integrations for your consultation workflow.
              </p>
            </div>
            <div
              className="hidden sm:flex items-center gap-3 animate-fade-in-up"
              style={{ animationDelay: '160ms', animationFillMode: 'both' }}
            >
              {userEmail && (
                <span className="flex items-center gap-1.5 text-xs text-navy-400">
                  <User className="w-3.5 h-3.5" />
                  {userEmail}
                </span>
              )}
              <button
                onClick={onSignOut}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-navy-300 border border-navy-700 rounded-lg hover:bg-navy-800 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
          <div className="sm:hidden mt-4 flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '160ms', animationFillMode: 'both' }}>
            {userEmail && (
              <span className="flex items-center gap-1.5 text-xs text-navy-400">
                <User className="w-3.5 h-3.5" />
                {userEmail}
              </span>
            )}
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-navy-300 border border-navy-700 rounded-lg hover:bg-navy-800 hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div
          className="bg-white rounded-2xl border border-navy-100 p-5 sm:p-8 animate-fade-in-up"
          style={{ animationDelay: '200ms', animationFillMode: 'both' }}
        >
          <GoogleSheetsSettings />
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl bg-navy-50 border border-navy-100 p-4">
          <Settings className="w-4 h-4 text-navy-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-navy-500 leading-relaxed">
            These settings control how consultation submissions are handled.
            Changes take effect immediately for all new submissions.
          </p>
        </div>
      </div>
    </main>
  );
}
