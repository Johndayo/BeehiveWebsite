import { ArrowRight, FileDown } from 'lucide-react';
import type { Page } from '../App';

interface HeroSectionProps {
  onNavigate: (page: Page) => void;
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-14 sm:py-24 lg:py-36">
        <div className="max-w-3xl">
          <h1
            className="text-[1.7rem] sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold text-white leading-[1.15] tracking-tight animate-fade-in-up"
          >
            Building Institutional Capacity for{' '}
            <span className="relative inline-block">
              <span className="relative z-10">Sustainable Growth</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-accent-500/30 -skew-x-2" />
            </span>
          </h1>

          <p
            className="text-base sm:text-lg text-navy-300 leading-relaxed mt-6 max-w-2xl animate-fade-in-up"
            style={{ animationDelay: '120ms', animationFillMode: 'both' }}
          >
            Beehive Associates partners with public and private institutions to strengthen
            systems, empower teams, and deliver measurable performance outcomes through
            structured training and strategic advisory services.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-3 mt-8 animate-fade-in-up"
            style={{ animationDelay: '240ms', animationFillMode: 'both' }}
          >
            <button
              onClick={() => onNavigate('consultation')}
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-accent-500 transition-all shadow-lg shadow-brand-500/20"
            >
              Request a Consultation
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => {}}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/5 text-white text-sm font-semibold rounded-lg border border-white/10 hover:bg-white/10 transition-all"
            >
              <FileDown className="w-4 h-4" />
              Download Company Profile
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-500/40 to-transparent" />
    </section>
  );
}
