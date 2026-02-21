import { Landmark, Building2, Heart } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const SECTORS = [
  {
    icon: Landmark,
    title: 'Government & Public Institutions',
    description:
      'Supporting ministries, agencies, and public bodies with structured capacity development and advisory services.',
  },
  {
    icon: Building2,
    title: 'Corporate Organisations',
    description:
      'Enhancing leadership capability, governance structures, and performance systems within private sector institutions.',
  },
  {
    icon: Heart,
    title: 'NGOs & Development Organisations',
    description:
      'Strengthening operational frameworks, accountability mechanisms, and programme delivery systems.',
  },
];

export default function SectorsSection() {
  const headingRef = useScrollReveal<HTMLDivElement>();
  const cardsRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="py-14 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div ref={headingRef} className="reveal-fade-up text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3">
            Who We Serve
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900 leading-tight">
            Sectors We Serve
          </h2>
        </div>

        <div ref={cardsRef} className="reveal-stagger grid grid-cols-1 md:grid-cols-3 gap-6">
          {SECTORS.map((sector) => {
            const Icon = sector.icon;
            return (
              <div
                key={sector.title}
                className="relative p-6 sm:p-8 bg-stone-50 rounded-2xl border border-navy-100/60 hover:border-brand-300/60 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-accent-500" />
                </div>
                <h3 className="text-base font-bold text-navy-900 mb-2">
                  {sector.title}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed">
                  {sector.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
