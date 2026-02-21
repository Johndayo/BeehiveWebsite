import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import HomePage from './pages/HomePage';
import ConsultationPage from './pages/ConsultationPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './hooks/useAuth';

export type Page = 'home' | 'services' | 'about' | 'consultation' | 'settings';

const VALID_PAGES: Page[] = ['home', 'services', 'about', 'consultation', 'settings'];

export default function App() {
  const { user, loading: authLoading, signIn, signOut, resetPassword } = useAuth();

  const [page, setPage] = useState<Page | '404'>(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash || hash === '') return 'home';
    if (VALID_PAGES.includes(hash as Page)) return hash as Page;
    return '404';
  });

  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash.replace('#', '');
      if (!hash || hash === '') {
        setPage('home');
      } else if (VALID_PAGES.includes(hash as Page)) {
        setPage(hash as Page);
      } else {
        setPage('404');
      }
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function navigate(target: Page) {
    setPage(target);
    window.location.hash = target;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function scrollToSection(sectionId: string) {
    if (page !== 'home') {
      setPage('home');
      window.location.hash = 'home';
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const requiresAuth = page === 'settings';
  const showLogin = requiresAuth && !authLoading && !user;

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-navy-800 focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>
      <Header
        currentPage={page}
        onNavigate={navigate}
        onScrollTo={scrollToSection}
        isAdmin={!!user}
        onSignOut={signOut}
      />
      <div id="main-content">
        {page === '404' ? (
          <NotFoundPage onNavigate={navigate} />
        ) : page === 'consultation' ? (
          <ConsultationPage />
        ) : page === 'settings' ? (
          showLogin ? (
            <LoginPage onLogin={signIn} onResetPassword={resetPassword} />
          ) : authLoading ? (
            <main className="flex-1 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-navy-300 border-t-navy-600 rounded-full animate-spin" />
            </main>
          ) : (
            <SettingsPage onSignOut={signOut} userEmail={user?.email} />
          )
        ) : (
          <HomePage onNavigate={navigate} />
        )}
      </div>
      <Footer onNavigate={navigate} onScrollTo={scrollToSection} />
      <BackToTop />
    </div>
  );
}
