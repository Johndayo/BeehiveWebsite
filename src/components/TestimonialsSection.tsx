import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, MoveHorizontal } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const TESTIMONIALS = [
  {
    quote:
      'Beehive Associates delivered a highly structured capacity development programme that significantly improved our internal governance processes. Their approach was practical, strategic, and aligned with our institutional objectives.',
    name: 'Dr. Michael Adeyemi',
    role: 'Director of Operations',
    org: 'Energy Development Agency',
    country: 'Nigeria',
    code: 'NG',
    color: '#008751',
  },
  {
    quote:
      'The advisory engagement provided by Beehive Associates strengthened our performance management framework and enhanced cross-departmental coordination. Their professionalism and analytical depth were impressive.',
    name: 'Sarah Thompson',
    role: 'Head of Organisational Development',
    org: 'Infrastructure Advisory Group',
    country: 'United Kingdom',
    code: 'GB',
    color: '#012169',
  },
  {
    quote:
      'Our leadership team benefited greatly from the strategic planning workshop facilitated by Beehive Associates. The structure and clarity of their methodology created immediate improvements in our decision-making processes.',
    name: 'David R. Coleman',
    role: 'Senior Programme Director',
    org: 'Public Sector Reform Initiative',
    country: 'United States',
    code: 'US',
    color: '#3C3B6E',
  },
  {
    quote:
      'Beehive Associates demonstrated strong institutional understanding and delivered solutions that were both technically sound and operationally practical. Their work added measurable value to our organisation.',
    name: 'Fatima Al Mansoori',
    role: 'Strategy & Performance Lead',
    org: 'Government Transformation Office',
    country: 'United Arab Emirates',
    code: 'AE',
    color: '#00732F',
  },
  {
    quote:
      'The team\u2019s approach to capacity building was disciplined and results-oriented. They combined strategic thinking with practical tools that our managers continue to apply.',
    name: 'Thabo Mbeki Jr.',
    role: 'Executive Training Coordinator',
    org: 'Regional Development Institute',
    country: 'South Africa',
    code: 'ZA',
    color: '#007749',
  },
];

export default function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const headingRef = useScrollReveal<HTMLDivElement>();
  const carouselRef = useScrollReveal<HTMLDivElement>({ threshold: 0.05 });
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      setShowHint(false);
    }
    el.addEventListener('scroll', onScroll, { once: true, passive: true });
    const timer = setTimeout(() => setShowHint(false), 4000);
    return () => { el.removeEventListener('scroll', onScroll); clearTimeout(timer); };
  }, []);

  function scroll(direction: 'left' | 'right') {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector<HTMLElement>('[data-card]');
    const cardWidth = card?.offsetWidth ?? 400;
    const amount = direction === 'left' ? -(cardWidth + 24) : cardWidth + 24;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  }

  return (
    <section className="py-16 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div ref={headingRef} className="reveal-fade-up flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3">
              Client Voices
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900 leading-tight">
              What Our Clients Say
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-navy-200 text-navy-500 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-600 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-navy-200 text-navy-500 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-600 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div ref={carouselRef} className="reveal-fade-in">
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pl-5 sm:pl-6 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] pr-5 sm:pr-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {TESTIMONIALS.map((t) => (
          <div
            key={t.name}
            data-card
            className="flex-shrink-0 w-[85vw] max-w-[340px] sm:max-w-none sm:w-[400px] snap-start bg-stone-50 rounded-2xl border border-navy-100/60 p-5 sm:p-8 flex flex-col hover:border-brand-300/60 hover:shadow-md transition-all duration-300"
          >
            <Quote className="w-8 h-8 text-brand-300/50 mb-4 flex-shrink-0" />

            <blockquote className="text-sm sm:text-[15px] text-navy-700 leading-relaxed font-medium italic flex-1 mb-6">
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            <div className="flex items-center gap-3 pt-5 border-t border-navy-100/60">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: t.color }}
              >
                {t.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-navy-900 truncate">{t.name}</p>
                <p className="text-xs text-navy-500 truncate">{t.role}</p>
                <p className="text-xs text-navy-400 mt-0.5 truncate">
                  {t.org}
                  <span className="ml-1.5 inline-flex items-center gap-1">
                    <span
                      className="inline-block w-4 h-4 rounded-full text-[7px] font-bold text-white leading-4 text-center flex-shrink-0"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.code}
                    </span>
                    {t.country}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>

      <div className="flex sm:hidden items-center justify-center gap-3 mt-4 px-4">
        <button
          onClick={() => scroll('left')}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-navy-200 text-navy-500 hover:bg-brand-50 hover:text-brand-600 transition-colors"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span
          className={`flex items-center gap-1.5 text-xs text-navy-400 transition-opacity duration-500 ${
            showHint ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <MoveHorizontal className="w-3.5 h-3.5" />
          Swipe to see more
        </span>
        <button
          onClick={() => scroll('right')}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-navy-200 text-navy-500 hover:bg-brand-50 hover:text-brand-600 transition-colors"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
