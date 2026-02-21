import { ArrowRight } from 'lucide-react';
import type { Page } from '../App';
import useScrollReveal from '../hooks/useScrollReveal';

interface CtaSectionProps {
  onNavigate: (page: Page) => void;
}

export default function CtaSection({ onNavigate }: CtaSectionProps) {
  const ctaRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section id="contact" className="py-14 sm:py-28 bg-stone-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div ref={ctaRef} className="reveal-scale relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-500/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10 text-center py-12 sm:py-20 px-5 sm:px-12 lg:px-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
              Let's Strengthen Your
              <br />
              Institution's Capacity.
            </h2>
            <p className="text-navy-300 text-base leading-relaxed mb-8 max-w-xl mx-auto">
              Schedule a consultation to explore how Beehive Associates can support
              your strategic objectives and operational effectiveness.
            </p>
            <button
              onClick={() => onNavigate('consultation')}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-accent-500 transition-all shadow-lg shadow-brand-500/20"
            >
              Request a Consultation
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
