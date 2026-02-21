import { Award } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function ClientExperienceSection() {
  const leftRef = useScrollReveal<HTMLDivElement>();
  const rightRef = useScrollReveal<HTMLDivElement>();

  return (
    <section className="py-14 sm:py-28 bg-stone-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-center">
          <div ref={leftRef} className="reveal-slide-left">
            <p className="text-xs font-semibold text-accent-500 uppercase tracking-widest mb-3">
              Our Track Record
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900 leading-tight mb-4">
              Institutional Experience
            </h2>
            <p className="text-navy-500 text-base leading-relaxed mb-4">
              Beehive Associates has worked with executive leaders, technical professionals,
              and operational teams across energy, public administration, financial services,
              and development sectors.
            </p>
            <p className="text-navy-500 text-base leading-relaxed">
              Our engagements are structured, evidence-based, and aligned with institutional
              mandates.
            </p>
          </div>

          <div ref={rightRef} className="reveal-slide-right grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { label: 'Energy', detail: 'Upstream, midstream, and regulatory bodies' },
              { label: 'Public Administration', detail: 'Ministries, agencies, and civil service' },
              { label: 'Financial Services', detail: 'Banks, regulators, and development finance' },
              { label: 'Development Sector', detail: 'Multilateral and bilateral programmes' },
            ].map((sector) => (
              <div
                key={sector.label}
                className="p-4 sm:p-5 bg-white rounded-xl border border-navy-100/60 hover:shadow-sm transition-shadow"
              >
                <div className="w-9 h-9 bg-brand-100 rounded-lg flex items-center justify-center mb-3">
                  <Award className="w-4 h-4 text-brand-500" />
                </div>
                <p className="text-sm font-bold text-navy-900 mb-1">{sector.label}</p>
                <p className="text-xs text-navy-400 leading-relaxed">{sector.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
