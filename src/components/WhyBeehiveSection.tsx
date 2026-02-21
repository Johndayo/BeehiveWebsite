import { Target, Settings, TrendingUp } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const REASONS = [
  {
    icon: Target,
    title: 'Strategic Alignment',
    description:
      'We ensure every engagement is aligned with your institutional goals, regulatory environment, and long-term vision.',
  },
  {
    icon: Settings,
    title: 'Operational Excellence',
    description:
      'We design structured systems that improve efficiency, accountability, and measurable performance.',
  },
  {
    icon: TrendingUp,
    title: 'Sustainable Impact',
    description:
      'Our solutions are practical, scalable, and built for long-term institutional strengthening \u2014 not short-term fixes.',
  },
];

export default function WhyBeehiveSection() {
  const headingRef = useScrollReveal<HTMLDivElement>();
  const cardsRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section id="about" className="py-14 sm:py-28 bg-stone-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div ref={headingRef} className="reveal-fade-up text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <p className="text-xs font-semibold text-accent-500 uppercase tracking-widest mb-3">
            Why Beehive
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900 leading-tight">
            Why Institutions Choose Beehive
          </h2>
        </div>

        <div ref={cardsRef} className="reveal-stagger grid grid-cols-1 md:grid-cols-3 gap-6">
          {REASONS.map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.title}
                className="group text-center p-6 sm:p-8 bg-white rounded-2xl border border-navy-100/60 hover:border-brand-300/60 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-navy-800 rounded-2xl mb-6 group-hover:bg-brand-500 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-navy-900 mb-3">
                  {reason.title}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
