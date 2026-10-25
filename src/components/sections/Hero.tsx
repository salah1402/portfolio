import React, { useRef, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useSmoothScroll } from '../../providers/SmoothScrollProvider';
import { HeroCanvas } from '../ui/HeroCanvas';

export interface HeroProps {
  onOpenLeadModal?: () => void;
}

/**
 * Ultra-Premium Editorial Hero matching thinkingods.com & luxury studio benchmarks
 * Features:
 * - Fluid interactive thread wave canvas (HeroCanvas) reacting to pointer travel
 * - Micro-stippled luxury paper texture (paper-canvas)
 * - Sculptural Syne display typography with tight negative tracking
 * - Smooth scroll-driven lift reveal: lifts away with dynamic rounded corners and depth shadow
 * - Dual Space Mono action buttons with Lenis smooth anchor gliding
 */
export const Hero: React.FC<HeroProps> = ({ onOpenLeadModal }) => {
  const { scrollTo } = useSmoothScroll();
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!hero) return;
          const y = window.scrollY;
          const h = hero.offsetHeight || window.innerHeight;
          const p = Math.min(Math.max(y / h, 0), 1);

          if (window.innerWidth > 760) {
            const ty = (-p * h * 0.16).toFixed(1);
            const scale = (1 - p * 0.03).toFixed(4);
            hero.style.transform = `translate3d(0, ${ty}px, 0) scale(${scale})`;
            const radius = (28 + p * 14).toFixed(0);
            hero.style.borderRadius = `0 0 ${radius}px ${radius}px`;
            const shadowOpacity = (0.08 + p * 0.08).toFixed(2);
            hero.style.boxShadow = `0 ${20 + p * 16}px ${50 + p * 30}px rgba(0, 0, 0, ${shadowOpacity})`;
          } else {
            hero.style.transform = 'none';
            hero.style.borderRadius = '0 0 24px 24px';
            hero.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.06)';
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleExploreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollTo('#work', { offset: -60, duration: 1.2 });
  };

  return (
    <header
      id="hero"
      ref={heroRef}
      style={{
        borderRadius: '0 0 28px 28px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08)',
        transformOrigin: '50% 0%',
      }}
      className="paper-canvas relative z-20 w-full min-h-[100svh] sm:min-h-0 flex flex-col items-center justify-between text-center px-4 sm:px-6 lg:px-10 pt-4 sm:pt-12 pb-6 sm:pb-14 border-b border-[#2b2b2b]/10 overflow-hidden will-change-transform"
    >
      {/* Background Interactive Thread Canvas */}
      <HeroCanvas />

      {/* Top Credentials & Availability */}
      {/* Top Status & Availability Ribbon — streamlined single-line pill */}
      <div className="inline-flex relative z-10 items-center justify-center gap-1.5 sm:gap-3 px-3 sm:px-5 py-1 sm:py-2 rounded-full border border-[#2b2b2b]/15 bg-[#fafafa]/90 backdrop-blur-xs mb-6 sm:mb-10 select-none shadow-[0_2px_8px_rgba(0,0,0,0.02)] max-w-[94%]">
        <span className="inline-flex items-center gap-1.5 sm:gap-2 font-mono text-[9px] sm:text-[11.5px] uppercase tracking-[0.08em] sm:tracking-[0.14em] text-[#2b2b2b] font-medium whitespace-nowrap">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fc4778] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#fc4778]" />
          </span>
          <span>Independent Digital Studio</span>
        </span>
        <span className="text-[#2b2b2b]/25" aria-hidden="true">/</span>
        <span className="font-mono text-[9px] sm:text-[11.5px] uppercase tracking-[0.06em] sm:tracking-[0.12em] text-[#2b2b2b] tabular-nums flex items-center whitespace-nowrap">
          <span><strong className="text-[#fc4778] font-bold">Now Open for Projects</strong></span>
        </span>
      </div>

      {/* Middle Core: Monumental Display Headline & Editorial Subtitle */}
      <div className="relative z-10 flex flex-col items-center my-auto py-4 sm:py-2 w-full">
        <h1 className="display-hero text-[clamp(37px,10vw,56px)] sm:text-[clamp(44px,8.2vw,140px)] tracking-[-0.04em] sm:tracking-[-0.045em] leading-[0.92] sm:leading-[0.88] text-[#1a1a1a] max-w-xl sm:max-w-[15ch] mx-auto select-none">
          Crafting 3D websites<br className="inline" />{' '}
          and digital experiences<br className="inline" />{' '}
          worth remembering.
        </h1>

        <p className="mt-4 sm:mt-10 max-w-[38ch] sm:max-w-[48ch] font-sans text-[15px] sm:text-[clamp(15.5px,1.2vw,18px)] text-[#2b2b2b]/85 leading-[1.6] sm:leading-[1.65] mx-auto select-none text-pretty">
          Creative front-end developer and 3D web specialist with 2+ Years experience, partnering with ambitious startups and global agencies across industries.
        </p>
      </div>

      {/* Bottom Area: Action Buttons & Client Trust Strip */}
      <div className="relative z-10 w-full flex flex-col items-center gap-4 sm:gap-6 pt-3 sm:pt-4">
        {/* Dual Technical Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 w-full max-w-[320px] sm:max-w-none mx-auto">
          <button
            type="button"
            onClick={onOpenLeadModal}
            className="btn btn--solid py-[11px] sm:py-[13px] px-5 sm:px-[26px] text-xs tracking-[0.10em] font-medium group min-h-[42px] sm:min-h-[44px] w-full sm:w-auto justify-center"
          >
            <span>Discuss your project</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
          <a
            href="#work"
            onClick={handleExploreClick}
            className="btn py-[11px] sm:py-[13px] px-5 sm:px-[26px] text-xs tracking-[0.10em] font-medium hover:bg-[#fafafa] min-h-[42px] sm:min-h-[44px] w-full sm:w-auto justify-center"
          >
            View selected work ↓
          </a>
        </div>

        {/* Client Trust Strip — matching thinkingods.com .hero-trust */}
        <div className="flex flex-col items-center gap-1.5 pt-1 pb-0.5 select-none">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#2b2b2b]/55 font-medium tabular-nums">
            Trusted by clients &amp; agencies
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-6 gap-y-1 font-display text-[11.5px] sm:text-sm font-medium text-[#2b2b2b]/75 tracking-tight">
            <span>Privilege</span>
            <span className="text-[#2b2b2b]/25">·</span>
            <span>Aura Dental</span>
            <span className="text-[#2b2b2b]/25">·</span>
            <span>Agentframe</span>
            <span className="text-[#2b2b2b]/25">·</span>
            <span>Sahara</span>
            <span className="text-[#2b2b2b]/25">·</span>
            <span>Ironvault</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
