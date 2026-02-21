import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProgressiveImage from './ProgressiveImage';
import useScrollReveal from '../hooks/useScrollReveal';

const SLIDES = [
  {
    src: 'https://images.pexels.com/photos/3321795/pexels-photo-3321795.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Professional training seminar',
    label: 'Training & Capacity Development',
  },
  {
    src: 'https://images.pexels.com/photos/7495196/pexels-photo-7495196.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Team collaboration in modern office',
    label: 'Team Collaboration',
  },
  {
    src: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Strategic planning workshop',
    label: 'Strategic Planning',
  },
  {
    src: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Business advisory consulting session',
    label: 'Management & Advisory Consulting',
  },
  {
    src: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Leadership development meeting',
    label: 'Leadership Development',
  },
  {
    src: 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    alt: 'Governance and compliance review',
    label: 'Governance & Compliance',
  },
];

const AUTO_PLAY_INTERVAL = 5000;

export default function ShowcaseCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useScrollReveal<HTMLElement>({ threshold: 0.15 });

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [isTransitioning],
  );

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length);
  }, [current, goTo]);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setTimeout(next, AUTO_PLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, isPaused, next]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      }
    }
    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [next, prev]);

  return (
    <section
      ref={sectionRef}
      className="reveal-fade-up py-14 sm:py-24 bg-navy-900 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">
            Our Work in Action
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Building Capacity, Delivering Results
          </h2>
        </div>

        <div ref={containerRef} tabIndex={0} className="relative outline-none" role="region" aria-label="Image carousel" aria-roledescription="carousel">
          <div className="relative aspect-[16/9] sm:aspect-[2.2/1] rounded-2xl overflow-hidden bg-navy-800">
            {SLIDES.map((slide, i) => (
              <div
                key={slide.src}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  i === current
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-105'
                }`}
              >
                <ProgressiveImage
                  src={slide.src}
                  alt={slide.alt}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-900/20 to-transparent" />
              </div>
            ))}

            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-brand-500/90 text-white text-xs font-semibold rounded-full mb-2 backdrop-blur-sm">
                    {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {SLIDES[current].label}
                  </h3>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={prev}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={next}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-5 sm:mt-6">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
                style={{ width: i === current ? 32 : 12 }}
              >
                <span className="absolute inset-0 bg-navy-600 rounded-full" />
                {i === current && (
                  <span
                    className="absolute inset-0 bg-brand-500 rounded-full origin-left"
                    style={{
                      animation: isPaused
                        ? 'none'
                        : `carousel-progress ${AUTO_PLAY_INTERVAL}ms linear`,
                    }}
                  />
                )}
                {i !== current && (
                  <span className="absolute inset-0 bg-navy-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex sm:hidden items-center justify-center gap-3 mt-4">
            <button
              onClick={prev}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-navy-600 text-navy-300 hover:bg-navy-800 hover:text-white transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-navy-600 text-navy-300 hover:bg-navy-800 hover:text-white transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
