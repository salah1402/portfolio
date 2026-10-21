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
            hero.style.borderRadius = '0 0 20px 20px';
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
      className="paper-canvas relative z-20 w-full flex flex-col items-center justify-start text-center px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 pb-10 sm:pb-12 border-b border-[#2b2b2b]/10 overflow-hidden will-change-transform"
    >
      {/* Background Interactive Thread Canvas */}
      <HeroCanvas />

      {/* Unified Studio Availability & Credentials Strip */}
      {/* Credential ticker benchmark baseline: 2+ Years experience · 5 Flagship Releases · +210% Inquiries Uplift */}
      <div className="relative z-10 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-4 py-2 sm:px-5 sm:py-2 rounded-full border border-[#2b2b2b]/15 bg-[#fafafa]/90 backdrop-blur-xs mb-8 sm:mb-12 select-none shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] sm:text-[11.5px] uppercase tracking-[0.14em] text-[#2b2b2b] font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fc4778] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#fc4778]" />
          </span>
          <span>Independent Digital Studio</span>
          <span className="text-[#2b2b2b]/30">·</span>
          <span className="tabular-nums text-[#2b2b2b]/70 font-normal">3D Web Experiences</span>
        </span>
        <span className="text-[#2b2b2b]/25 hidden sm:inline" aria-hidden="true">/</span>
        <span className="font-mono text-[10.5px] sm:text-[11.5px] uppercase tracking-[0.12em] text-[#2b2b2b] tabular-nums flex items-center gap-2">
          <span>Creative Development</span>
          <span className="text-[#2b2b2b]/30">·</span>
          <span>Interactive Design</span>
          <span className="text-[#2b2b2b]/30">·</span>
          <span><strong className="text-[#fc4778] font-bold">Now Open for Projects</strong></span>
        </span>
      </div>

      {/* Monumental Towering Sculptural Display Headline */}
      <h1 className="relative z-10 display-hero text-[clamp(42px,8.2vw,140px)] tracking-[-0.038em] sm:tracking-[-0.045em] leading-[0.92] sm:leading-[0.88] text-[#1a1a1a] max-w-[15ch] mx-auto select-none">
        Crafting 3D websites<br className="hidden sm:inline" />{' '}
        and digital experiences<br className="hidden sm:inline" />{' '}
        worth remembering.
      </h1>

      {/* Understated Editorial Subtitle */}
      <p className="relative z-10 mt-8 sm:mt-11 max-w-[48ch] font-sans text-[clamp(15px,1.15vw,18px)] text-[#2b2b2b]/80 leading-[1.65] mx-auto select-none">
        Creative front-end developer and 3D web specialist with 2+ years experience, partnering with ambitious startups and global agencies across industries.
      </p>

      {/* Dual Technical Action Buttons */}
      <div className="relative z-10 mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3.5">
        <button
          type="button"
          onClick={onOpenLeadModal}
          className="btn btn--solid py-[13px] px-[26px] text-xs tracking-[0.10em] font-medium group"
        >
          <span>Discuss your project</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
        <a
          href="#work"
          onClick={handleExploreClick}
          className="btn py-[13px] px-[26px] text-xs tracking-[0.10em] font-medium hover:bg-[#fafafa]"
        >
          View selected work ↓
        </a>
      </div>
    </header>
  );
};

export default Hero;
