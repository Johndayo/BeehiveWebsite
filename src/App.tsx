import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import TeamPage from './pages/TeamPage';
import ConsultationPage from './pages/ConsultationPage';
import ClientsAndTrainings from './pages/ClientsAndTrainings';
import NotFoundPage from './pages/NotFoundPage';
import { organizationSchema, faqSchema } from './data/seoSchema';

export type Page = 'home' | 'team' | 'services' | 'about' | 'consultation' | 'clients';

const VALID_PAGES: Page[] = ['home', 'team', 'services', 'about', 'consultation', 'clients'];

export default function App() {
  const [page, setPage] = useState<Page | '404'>(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash || hash === '') return 'home';
    if (VALID_PAGES.includes(hash as Page)) return hash as Page;
    return '404';
  });

  // Update SEO based on current page
  useEffect(() => {
    const pageSEO: Record<Page | '404', { title: string; description: string; keywords: string[] }> = {
      home: {
        title: 'Business Consulting Services | Strategic & Management Consulting | Beehive Associates',
        description: 'Award-winning consulting firm providing strategic consulting, management consulting, and business transformation services. Helping executives and organizations achieve operational excellence.',
        keywords: ['business consulting', 'strategic consulting', 'management consulting', 'business transformation', 'consulting services'],
      },
      team: {
        title: 'Our Team | Expert Consultants | Beehive Associates',
        description: 'Meet the experienced consultants and advisors at Beehive Associates. Industry experts in strategic consulting, business transformation, and organizational development.',
        keywords: ['consulting team', 'business consultants', 'expert advisors', 'management consultants', 'professional consultants'],
      },
      services: {
        title: 'Consulting Services | Strategic & Operational Excellence | Beehive Associates',
        description: 'Comprehensive consulting services including strategic planning, operational excellence, organizational development, and institutional capacity building.',
        keywords: ['consulting services', 'strategic services', 'operational consulting', 'advisory services', 'business advisory'],
      },
      about: {
        title: 'About Us | Beehive Associates Consulting',
        description: 'Learn about Beehive Associates - a leading consulting firm dedicated to institutional capacity building and strategic advisory services.',
        keywords: ['about beehive', 'consulting company', 'about us', 'company profile', 'consulting firm'],
      },
      consultation: {
        title: 'Book a Consultation | Beehive Associates',
        description: 'Schedule a free consultation with our expert consultants to discuss your organization\'s strategic and operational challenges.',
        keywords: ['consultation', 'book consultation', 'free consultation', 'consult with us', 'business consultation'],
      },
      clients: {
        title: 'Our Clients | Beehive Associates',
        description: 'Discover the organisations Beehive Associates has supported through business partnerships and training engagements.',
        keywords: ['clients', 'trainings', 'partners', 'beehive associates', 'business collaborations'],
      },
      '404': {
        title: 'Page Not Found | Beehive Associates',
        description: 'The page you are looking for could not be found.',
        keywords: ['404', 'not found'],
      },
    };

    const seo = pageSEO[page];
    if (seo) {
      // Update title
      document.title = seo.title;
      
      // Update meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', seo.description);
      }

      // Update keywords
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', seo.keywords.join(', '));
      }

      // Update OG tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', seo.title);
      
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', seo.description);

      // Add structured data for home page
      if (page === 'home') {
        addStructuredData([organizationSchema, faqSchema]);
      } else {
        // Remove dynamic structured data for non-home pages
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        scripts.forEach(script => {
          const content = script.innerHTML;
          // Only remove if it's not the base organization schema from index.html
          if (content.includes('BreadcrumbList') || content.includes('Article')) {
            script.remove();
          }
        });
      }
    }
  }, [page]);

  // Helper function to add structured data
  function addStructuredData(data: any[]): void {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(script => {
      const content = script.innerHTML;
      if (content.includes('BreadcrumbList') || content.includes('FAQPage')) {
        script.remove();
      }
    });

    data.forEach(schemaItem => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schemaItem);
      document.head.appendChild(script);
    });
  }

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
      />
      <div id="main-content">
        {page === '404' ? (
          <NotFoundPage onNavigate={navigate} />
        ) : page === 'consultation' ? (
          <ConsultationPage />
        ) : page === 'team' ? (
          <TeamPage />
        ) : page === 'about' ? (
          <AboutPage onNavigate={navigate} />
        ) : page === 'clients' ? (
          <ClientsAndTrainings />
        ) : (
          <HomePage onNavigate={navigate} />
        )}
      </div>
      <Footer onNavigate={navigate} onScrollTo={scrollToSection} />
      <BackToTop />
    </div>
  );
}
