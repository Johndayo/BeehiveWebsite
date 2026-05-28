import { ArrowRight, Globe, ShieldCheck, Users, Briefcase, MapPin, TrendingUp } from 'lucide-react';
import type { Page } from '../App';
import CtaSection from '../components/CtaSection';
import useScrollReveal from '../hooks/useScrollReveal';

interface AboutPageProps {
  onNavigate: (page: Page) => void;
}

const VALUE_POINTS = [
  {
    icon: Globe,
    title: 'Global Perspective',
    description:
      'We bring a cross-border outlook and practical experience across Africa, Europe, and international development relationships.',
  },
  {
    icon: Users,
    title: 'Collaborative Partnerships',
    description:
      'We work closely with clients to design solutions that are aligned to institutional priorities and local realities.',
  },
  {
    icon: ShieldCheck,
    title: 'Governance & Resilience',
    description:
      'Our work strengthens governance, compliance, risk management, and performance systems for sustained impact.',
  },
];

const SECTORS = [
  {
    icon: TrendingUp,
    title: 'Energy & Infrastructure',
    description: 'Advisory for upstream, midstream, regulatory, and infrastructure institutions.',
  },
  {
    icon: Briefcase,
    title: 'Public Administration',
    description: 'Support for ministries, agencies, and development-focused public sector teams.',
  },
  {
    icon: MapPin,
    title: 'Financial Services',
    description: 'Capacity building for banks, regulators, and development finance organisations.',
  },
];

export default function AboutPage({ onNavigate }: AboutPageProps) {
  const headingRef = useScrollReveal<HTMLDivElement>();
  const valuesRef = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  const sectorsRef = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,130,31,0.22),_transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.16),_transparent_28%)]" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div ref={headingRef} className="reveal-fade-up max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-500 mb-4">
              About Beehive Associates
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Building institutional capacity with strategic advisory, practical delivery, and measurable outcomes.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-navy-200 max-w-2xl leading-relaxed">
              Beehive Associates supports public and private institutions in strengthening systems, empowering teams, and delivering performance improvements through tailored training,
              advisory, and implementation support.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { value: '150+', label: 'Projects Delivered' },
                { value: '30+', label: 'Countries Served' },
                { value: '95%', label: 'Client Satisfaction' },
              ].map((metric) => (
                <div key={metric.label} className="rounded-3xl bg-white/5 border border-white/10 p-5 text-center">
                  <p className="text-3xl font-bold text-white">{metric.value}</p>
                  <p className="mt-2 text-sm text-navy-300 leading-tight">{metric.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => onNavigate('consultation')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-accent-500 transition"
              >
                Request Consultation
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('team')}
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                Meet Our Team
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-accent-500 mb-3">What Sets Us Apart</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 leading-tight">
              Trusted consulting for institutions that need structure, clarity, and real results.
            </h2>
            <p className="mt-4 text-base text-navy-600 leading-relaxed">
              We combine strategy, governance, technology, and people-focused capability building to help organisations operate with confidence and stay ahead of changing regulations and market demands.
            </p>
          </div>

          <div ref={valuesRef} className="reveal-stagger grid gap-6 md:grid-cols-3">
            {VALUE_POINTS.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.title} className="rounded-3xl border border-navy-100/70 bg-white p-8 shadow-sm">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-brand-500/10 text-brand-500 mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-navy-900 mb-3">{point.title}</h3>
                  <p className="text-sm text-navy-600 leading-relaxed">{point.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_minmax(320px,1fr)] items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent-500 mb-3">Our Expertise</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 leading-tight">
                Deep experience across critical sectors and institution types.
              </h2>
              <p className="mt-6 text-base text-navy-600 leading-relaxed">
                Beehive Associates works with energy companies, regulators, ministries, financial institutions, and development partners to design strategic programmes, strengthen governance, and improve organisational performance.
              </p>
            </div>

            <div className="grid gap-4">
              {SECTORS.map((sector) => {
                const Icon = sector.icon;
                return (
                  <div key={sector.title} className="rounded-3xl border border-navy-100/70 bg-stone-50 p-6">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-brand-500/10 text-brand-500 mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-navy-900 mb-2">{sector.title}</h3>
                    <p className="text-sm text-navy-600 leading-relaxed">{sector.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent-500 mb-3">Institutional footprint</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 leading-tight">
                Offices in Abuja and the United Kingdom, serving clients worldwide.
              </h2>
              <p className="mt-6 text-base text-navy-600 leading-relaxed">
                Our dual presence enables us to support clients in West Africa, Europe, and beyond with practical, locally informed advisory services.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-white p-6 border border-navy-100/70">
                  <p className="text-sm uppercase tracking-[0.25em] text-accent-500 mb-3">Abuja</p>
                  <p className="text-sm text-navy-600 leading-relaxed">
                    PAC Apartments Behind Palm City Estate, Life Camp, Abuja, Nigeria.
                  </p>
                </div>
                <div className="rounded-3xl bg-white p-6 border border-navy-100/70">
                  <p className="text-sm uppercase tracking-[0.25em] text-accent-500 mb-3">United Kingdom</p>
                  <p className="text-sm text-navy-600 leading-relaxed">
                    14 East Street, PO91AQ, Havant, United Kingdom.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-navy-100/70 bg-white p-8 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-accent-500 mb-4">Our Values</p>
              <ul className="space-y-4 text-sm text-navy-600 leading-relaxed">
                <li>
                  <span className="font-semibold text-navy-900">Integrity:</span> We deliver honest, transparent counsel and practical solutions.
                </li>
                <li>
                  <span className="font-semibold text-navy-900">Impact:</span> We focus on interventions that improve performance and institutional capability.
                </li>
                <li>
                  <span className="font-semibold text-navy-900">Partnership:</span> We invest in relationships and handover knowledge for long-term sustainability.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <CtaSection onNavigate={onNavigate} />
    </main>
  );
}
