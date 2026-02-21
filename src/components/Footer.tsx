import { Mail, MapPin, Phone } from 'lucide-react';
import type { Page } from '../App';

interface FooterProps {
  onNavigate: (page: Page) => void;
  onScrollTo: (sectionId: string) => void;
}

export default function Footer({ onNavigate, onScrollTo }: FooterProps) {
  return (
    <footer className="bg-navy-900 text-white mt-auto border-t-[3px] border-accent-500">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="py-10 sm:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <button
              onClick={() => onNavigate('home')}
              className="hover:opacity-90 transition-opacity"
            >
              <img
                src="/Beehive_Associates_logo.png"
                alt="Beehive Associates"
                className="h-40 sm:h-56 w-auto brightness-0 invert"
              />
            </button>
            <p className="text-sm text-navy-300 leading-relaxed mt-4 max-w-xs">
              Partnering with public and private institutions to strengthen systems,
              empower teams, and deliver measurable performance outcomes.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-navy-400 mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-sm text-navy-300 hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('services')}
                  className="text-sm text-navy-300 hover:text-white transition-colors"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('about')}
                  className="text-sm text-navy-300 hover:text-white transition-colors"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('consultation')}
                  className="text-sm text-navy-300 hover:text-white transition-colors"
                >
                  Request Consultation
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-navy-400 mb-4">
              Services
            </h4>
            <ul className="space-y-2.5">
              <li className="text-sm text-navy-300">Training & Capacity Development</li>
              <li className="text-sm text-navy-300">Management & Advisory Consulting</li>
              <li className="text-sm text-navy-300">Governance & Compliance</li>
              <li className="text-sm text-navy-300">Strategic Planning</li>
              <li className="text-sm text-navy-300">Monitoring & Evaluation</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-navy-400 mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:beehiveassociates@gmail.com"
                  className="flex items-start gap-2.5 text-sm text-navy-300 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-navy-400" />
                  beehiveassociates@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+2348099442368"
                  className="flex items-start gap-2.5 text-sm text-navy-300 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-navy-400" />
                  08099442368
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-navy-300">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-navy-400" />
                <span>PAC Apartments Behind Palm City Estate, Life Camp, Abuja, Nigeria</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-navy-300">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-navy-400" />
                <span>63 Esslemont Road PO4 0ES, Portsmouth, United Kingdom</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-navy-500">
            &copy; {new Date().getFullYear()} Beehive Associates. All rights reserved.
          </p>
          <p className="text-xs text-navy-500">
            All submissions are treated as strictly confidential.
          </p>
        </div>
      </div>
    </footer>
  );
}
