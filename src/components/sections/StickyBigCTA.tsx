import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface StickyBigCTAProps {
  onOpenLeadModal?: () => void;
}

const CTA_WORDS = ["Let's", "talk", "about", "your", "project."];

/**
 * Sticky Big CTA Banner (.cta-big) matching thinkingods.com
 * Features:
 * - Pinned oversized typography banner: "Let's talk about your project."
 * - Exact math model: litWordCount = Math.floor(scrollProgress * CTA_WORDS.length)
 * - Typography: clamp(44px, 9vw, 144px), tracking -0.05em, line-height 0.88
 * - Space Mono action trigger button
 */
export const StickyBigCTA: React.FC<StickyBigCTAProps> = ({ onOpenLeadModal }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [litCount, setLitCount] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const totalScrollDistance = rect.height - viewportHeight;
      if (totalScrollDistance <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.min(1, Math.max(0, currentScroll / totalScrollDistance));

      const revealProgress = Math.min(1, progress / 0.75);
      const count = progress <= 0 ? 0 : Math.min(CTA_WORDS.length, Math.floor(revealProgress * (CTA_WORDS.length + 0.4)));
      setLitCount(count);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={trackRef}
      className="cta-big relative w-full min-h-[175vh] sm:min-h-[200vh] bg-white text-[#2b2b2b] border-t border-[#2b2b2b]/10"
    >
      {/* Sticky Frame Centered in Viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-5xl flex flex-col items-center gap-8 sm:gap-10">
          {/* Sequential Word Illumination Display Headline */}
          <h2 className="font-display font-medium text-[clamp(44px,8.6vw,140px)] tracking-[-0.045em] leading-[0.88] max-w-[12ch] mx-auto flex flex-wrap justify-center gap-x-3 sm:gap-x-5 select-none m-0">
            {CTA_WORDS.map((word, idx) => {
              const isLit = idx < litCount;

              return (
                <span
                  key={idx}
                  className={`w transition-colors duration-300 ${
                    isLit ? 'lit text-[#2b2b2b]' : 'text-[#2b2b2b]/20'
                  }`}
                  style={{
                    color: isLit ? '#2b2b2b' : 'rgba(43, 43, 43, 0.16)',
                  }}
                >
                  {word}
                </span>
              );
            })}
          </h2>

          <p className="font-sans text-[clamp(15px,1.18vw,18.5px)] text-[#2b2b2b]/75 max-w-xl leading-relaxed m-0 text-pretty">
            Taking select design &amp; 3D engineering commissions for this quarter. Let’s build something extraordinary together.
          </p>

          <button
            type="button"
            onClick={onOpenLeadModal}
            className="btn btn--solid py-[13px] px-[26px] text-xs tracking-[0.12em] font-medium"
          >
            <span>Start a conversation</span>
            <ArrowUpRight className="w-4 h-4 opacity-80" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default StickyBigCTA;
