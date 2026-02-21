import useScrollReveal from '../hooks/useScrollReveal';

const COUNTRIES = [
  { code: 'ng', name: 'Nigeria' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'us', name: 'United States' },
  { code: 'ae', name: 'United Arab Emirates' },
  { code: 'za', name: 'South Africa' },
];

function SpinningGlobe() {
  return (
    <div className="relative w-14 h-14 mx-auto mb-5">
      <div className="absolute inset-0 rounded-full bg-accent-500/10 animate-pulse-ring" />
      <svg
        viewBox="0 0 64 64"
        className="w-14 h-14 animate-[spin_12s_linear_infinite]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="32" cy="32" r="30" stroke="#f5821f" strokeWidth="2" />
        <ellipse cx="32" cy="32" rx="14" ry="30" stroke="#f5821f" strokeWidth="1.5" />
        <ellipse cx="32" cy="32" rx="24" ry="30" stroke="#f5821f" strokeWidth="1" opacity="0.5" />
        <path d="M4 22h56" stroke="#ed1c24" strokeWidth="1.2" opacity="0.7" />
        <path d="M2 32h60" stroke="#ed1c24" strokeWidth="1.5" />
        <path d="M4 42h56" stroke="#ed1c24" strokeWidth="1.2" opacity="0.7" />
      </svg>
    </div>
  );
}

export default function TrustedSection() {
  const headingRef = useScrollReveal<HTMLDivElement>();
  const countriesRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="py-12 sm:py-20 bg-white border-b border-navy-100/40">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div ref={headingRef} className="reveal-fade-up max-w-3xl mx-auto text-center">
          <SpinningGlobe />
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">
            Trusted Across Borders
          </h2>
          <p className="text-navy-500 mt-3 text-base leading-relaxed max-w-2xl mx-auto">
            Beehive Associates supports institutions and professionals across multiple
            jurisdictions, delivering structured solutions aligned with global standards
            and local realities.
          </p>
        </div>

        <div ref={countriesRef} className="reveal-stagger flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-8 sm:mt-10">
          {COUNTRIES.map((country, i) => (
            <div
              key={country.code}
              className="flex items-center gap-3 px-5 py-3 bg-stone-50 border border-navy-100/60 rounded-full hover:border-brand-300 hover:shadow-sm transition-all"
            >
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full bg-brand-400/30 animate-pulse-ring"
                  style={{ animationDelay: `${i * 0.4}s` }}
                />
                <img
                  src={`https://flagcdn.com/w80/${country.code}.png`}
                  srcSet={`https://flagcdn.com/w160/${country.code}.png 2x`}
                  alt={`${country.name} flag`}
                  className="relative w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                />
              </div>
              <span className="text-sm font-medium text-navy-700">{country.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
