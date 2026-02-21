import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ConsultationPage from './pages/ConsultationPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './hooks/useAuth';

export type Page = 'home' | 'services' | 'about' | 'consultation' | 'settings';

const VALID_PAGES: Page[] = ['home', 'services', 'about', 'consultation', 'settings'];

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();

  const [page, setPage] = useState<Page>(() => {
    const hash = window.location.hash.replace('#', '') as Page;
    if (VALID_PAGES.includes(hash)) return hash;
    return 'home';
  });

  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash.replace('#', '') as Page;
      if (VALID_PAGES.includes(hash)) {
        setPage(hash);
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
      <Header
        currentPage={page}
        onNavigate={navigate}
        onScrollTo={scrollToSection}
        isAdmin={!!user}
        onSignOut={signOut}
      />
      {page === 'consultation' ? (
        <ConsultationPage />
      ) : page === 'settings' ? (
        showLogin ? (
          <LoginPage onLogin={signIn} />
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
      <Footer onNavigate={navigate} onScrollTo={scrollToSection} />
    </div>
  );
}
