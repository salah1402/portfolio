import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS } from '../../data/testimonials';

/**
 * Testimonial Quote Carousel matching thinkingods.com (.proof-quote)
 * Features:
 * - Deep graphite card (#1b1b1b) with stippled dot texture
 * - Oversized quotation mark and packed display quote typography
 * - Author in bold, company/role in Space Mono
 * - Minimalist dot controls and prev/next buttons
 * - Mouseenter pause gating and visibilitychange resync
 */
export const TestimonialSlider: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSlides = TESTIMONIALS.length;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Auto-cycle timer with pause and visibility handling
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 3600);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, totalSlides]);

  // Tab visibility resync
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const current = TESTIMONIALS[activeIndex];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        backgroundImage: 'radial-gradient(rgba(241,241,241,.10) 1px, transparent 1px)',
        backgroundSize: '5px 5px',
      }}
      className="rounded-[20px] bg-[#1b1b1b] text-[#f1f1f1] p-8 sm:p-12 flex flex-col justify-between shadow-md min-h-[420px] sm:min-h-[480px] w-full"
    >
      {/* Top Header / Indicators */}
      <div className="flex items-center justify-between pb-4">
        <span className="font-display text-5xl sm:text-6xl text-[#f1f1f1]/40 leading-none select-none">
          &ldquo;
        </span>

        {/* Prev / Next Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous testimonial"
            className="p-2 rounded-full border border-[#f1f1f1]/20 bg-[#f1f1f1]/5 text-[#f1f1f1] hover:border-[#fc4778] hover:text-[#fc4778] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next testimonial"
            className="p-2 rounded-full border border-[#f1f1f1]/20 bg-[#f1f1f1]/5 text-[#f1f1f1] hover:border-[#fc4778] hover:text-[#fc4778] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quote Body */}
      <div className="py-2 flex flex-col gap-4">
        <blockquote className="m-0 font-display font-normal text-[clamp(20px,2.4vw,34px)] tracking-[-0.035em] leading-[1.12] text-[#f1f1f1] text-balance">
          {current.quote}
        </blockquote>

        {current.description && (
          <p className="font-sans text-[clamp(13px,1.05vw,15.5px)] text-[#f1f1f1]/80 leading-relaxed m-0 max-w-xl text-pretty">
            {current.description}
          </p>
        )}

        <figcaption className="mt-2 flex flex-col gap-1">
          <strong className="font-display font-semibold text-base sm:text-[17px] text-[#f1f1f1] tracking-tight">
            {current.author}
          </strong>
          <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-[#f1f1f1]/65 font-medium tabular-nums">
            {current.role} &middot; {current.company}
          </span>
        </figcaption>
      </div>

      {/* Dot Indicators */}
      <div className="flex items-center gap-2.5 pt-4">
        {TESTIMONIALS.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIndex(idx)}
            aria-label={`Go to testimonial ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeIndex === idx
                ? 'w-6 bg-[#f1f1f1]'
                : 'w-2 bg-[#f1f1f1]/30 hover:bg-[#f1f1f1]/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialSlider;
