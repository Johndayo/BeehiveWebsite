import { GraduationCap, Briefcase } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const SERVICES = [
  {
    icon: GraduationCap,
    title: 'Training & Capacity Development',
    description:
      'We provide structured training programmes that equip professionals and institutions with practical skills, frameworks, and performance tools.',
    label: 'Key Focus Areas',
    areas: [
      'Leadership & Management Development',
      'Governance & Compliance Training',
      'Public Sector Capacity Building',
      'Strategic Planning Workshops',
      'Monitoring & Evaluation Frameworks',
    ],
  },
  {
    icon: Briefcase,
    title: 'Management & Advisory Consulting',
    description:
      'Our advisory services focus on system improvement, strategic alignment, and institutional effectiveness.',
    label: 'Key Capabilities',
    areas: [
      'Organizational Diagnostics',
      'Process Optimization',
      'Policy & Strategy Development',
      'Institutional Reform Advisory',
      'Performance Management Systems',
    ],
  },
];

export default function ServicesSection() {
  const headingRef = useScrollReveal<HTMLDivElement>();
  const cardsRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section id="services" className="py-14 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div ref={headingRef} className="reveal-fade-up max-w-2xl mb-10 sm:mb-14">
          <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3">
            What We Do
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900 leading-tight">
            Our Core Services
          </h2>
          <p className="text-navy-500 mt-4 text-base leading-relaxed">
            We design and deliver tailored solutions that address institutional capacity
            gaps, strengthen governance structures, and improve operational performance.
          </p>
        </div>

        <div ref={cardsRef} className="reveal-stagger grid grid-cols-1 lg:grid-cols-2 gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="group relative p-6 sm:p-8 bg-stone-50 rounded-2xl border border-navy-100/60 hover:border-brand-300/60 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-navy-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-500 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-sm text-navy-500 leading-relaxed mb-6">
                  {service.description}
                </p>
                <div>
                  <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-3">
                    {service.label}
                  </p>
                  <ul className="space-y-2">
                    {service.areas.map((area) => (
                      <li
                        key={area}
                        className="flex items-start gap-2.5 text-sm text-navy-600"
                      >
                        <span className="w-1.5 h-1.5 bg-accent-500 rounded-full mt-1.5 flex-shrink-0" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
