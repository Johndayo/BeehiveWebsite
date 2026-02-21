import { ArrowRight, FileDown } from 'lucide-react';
import ProgressiveImage from './ProgressiveImage';
import type { Page } from '../App';

interface HeroSectionProps {
  onNavigate: (page: Page) => void;
}

function HoneycombAccent() {
  const hexPath = (cx: number, cy: number, r: number) => {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return `M${pts.join('L')}Z`;
  };

  const cells: { cx: number; cy: number; r: number; opacity: number; delay: number }[] = [];
  const baseR = 38;
  const gapX = baseR * 1.76;
  const gapY = baseR * 1.52;
  const cols = 5;
  const rows = 7;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = row % 2 === 0 ? 0 : gapX / 2;
      const cx = col * gapX + offsetX + 40;
      const cy = row * gapY + 30;
      const dist = Math.sqrt(
        Math.pow((cx - 120) / 200, 2) + Math.pow((cy - 180) / 300, 2)
      );
      const opacity = Math.max(0.03, 0.18 - dist * 0.12);
      cells.push({ cx, cy, r: baseR, opacity, delay: (row * cols + col) * 0.06 });
    }
  }

  return (
    <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block pointer-events-none overflow-hidden">
      <svg
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[700px] opacity-60"
        viewBox="0 0 400 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {cells.map((cell, i) => (
          <path
            key={i}
            d={hexPath(cell.cx, cell.cy, cell.r)}
            stroke="rgba(245, 130, 31, 0.35)"
            strokeWidth="1"
            fill={`rgba(245, 130, 31, ${cell.opacity})`}
            style={{
              animation: `fade-in 0.8s ease-out ${cell.delay}s both`,
            }}
          />
        ))}
        <circle cx="160" cy="300" r="200" fill="url(#honeycomb-glow)" />
        <defs>
          <radialGradient id="honeycomb-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(245, 130, 31, 0.08)" />
            <stop offset="100%" stopColor="rgba(245, 130, 31, 0)" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden min-h-[520px] sm:min-h-[560px] lg:min-h-[640px]">
      <ProgressiveImage
        src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
        alt=""
        className="w-full h-full object-cover"
        loading="eager"
      />

      <div className="absolute inset-0 bg-gradient-to-br from-navy-950/95 via-navy-900/90 to-navy-950/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/60 via-transparent to-transparent" />

      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <HoneycombAccent />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-28 lg:py-40">
        <div className="max-w-3xl">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full mb-6 animate-fade-in-up"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-xs font-medium text-brand-300 tracking-wide uppercase">
              Strategic Advisory & Capacity Building
            </span>
          </div>

          <h1
            className="text-[1.7rem] sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold text-white leading-[1.15] tracking-tight animate-fade-in-up"
            style={{ animationDelay: '80ms', animationFillMode: 'both' }}
          >
            Building Institutional Capacity for{' '}
            <span className="relative inline-block">
              <span className="relative z-10">Sustainable Growth</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-accent-500/30 -skew-x-2" />
            </span>
          </h1>

          <p
            className="text-base sm:text-lg text-navy-200 leading-relaxed mt-6 max-w-2xl animate-fade-in-up"
            style={{ animationDelay: '180ms', animationFillMode: 'both' }}
          >
            Beehive Associates partners with public and private institutions to strengthen
            systems, empower teams, and deliver measurable performance outcomes through
            structured training and strategic advisory services.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-3 mt-8 animate-fade-in-up"
            style={{ animationDelay: '280ms', animationFillMode: 'both' }}
          >
            <button
              onClick={() => onNavigate('consultation')}
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-accent-500 transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30"
            >
              Request a Consultation
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => {}}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/5 text-white text-sm font-semibold rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
            >
              <FileDown className="w-4 h-4" />
              Download Company Profile
            </button>
          </div>

          <div
            className="flex items-center gap-6 mt-10 animate-fade-in-up"
            style={{ animationDelay: '400ms', animationFillMode: 'both' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">150+</span>
              <span className="text-xs text-navy-300 leading-tight">Projects<br />Delivered</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">30+</span>
              <span className="text-xs text-navy-300 leading-tight">Countries<br />Served</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">95%</span>
              <span className="text-xs text-navy-300 leading-tight">Client<br />Satisfaction</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-500/40 to-transparent" />
    </section>
  );
}
