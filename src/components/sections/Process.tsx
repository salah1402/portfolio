import React, { useRef, useEffect } from 'react';

export interface ProcessStepItem {
  num: string;
  phase: string;
  title: string;
  desc: string;
  deliverables: string[];
  topOffset: number;
}

const PROCESS_STEPS: ProcessStepItem[] = [
  {
    num: '01',
    phase: 'DISCOVER',
    title: 'Understand the idea',
    desc: 'We start with the problem, the audience, and the vision. I map out what the experience needs to achieve before deciding how it should look or work.',
    deliverables: ['RESEARCH', 'DIRECTION', 'PROJECT SCOPE'],
    topOffset: 104,
  },
  {
    num: '02',
    phase: 'DESIGN',
    title: 'Shape the experience',
    desc: 'I turn ideas into considered layouts, distinctive interfaces, and interaction concepts. Typography, motion, and 3D come together with a clear purpose.',
    deliverables: ['UI DESIGN', 'INTERACTION', '3D CONCEPTS'],
    topOffset: 122,
  },
  {
    num: '03',
    phase: 'BUILD',
    title: 'Bring it to life',
    desc: 'I build responsive, interactive websites with clean frontend code, purposeful animations, and immersive 3D where it adds value. Every detail is refined across screen sizes.',
    deliverables: ['FRONTEND', 'MOTION', 'WEBGL / 3D'],
    topOffset: 140,
  },
  {
    num: '04',
    phase: 'SHIP',
    title: 'Launch and refine',
    desc: 'I test the experience, fix rough edges, and prepare it for launch. After deployment, I can help refine the details based on feedback and real-world use.',
    deliverables: ['TESTING', 'DEPLOYMENT', 'ITERATION'],
    topOffset: 158,
  },
];

/**
 * 4-Stage Process with Authentic Stacking Cards matching thinkingods.com
 * Features:
 * - Section header with .mono tag, bold display headline, and editorial intro
 * - Staggered sticky top offsets: top: 104px, 122px, 140px, 158px
 * - Modern 2-column card layout with icon badge, phase eyebrow, bold title, and deliverables
 * - Bespoke geometric SVG glyphs with hairline strokes and #fc4778 pink focal points
 * - Shadow depth: 0 -12px 36px rgba(0,0,0,0.06)
 */
export const Process: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = container.querySelectorAll<HTMLElement>('article[data-process-card]');
    if (!cards.length) return;

    let ticking = false;

    const runCards = () => {
      const vh = window.innerHeight;
      const isDesktop = window.innerWidth > 768;

      cards.forEach((card) => {
        if (!isDesktop) {
          card.style.transform = 'none';
          card.style.opacity = '1';
          return;
        }

        const rect = card.getBoundingClientRect();
        // Each card runs its own short window as it enters the viewport
        const p = Math.min(Math.max((vh - rect.top) / (vh * 0.5), 0), 1);
        const e = 1 - Math.pow(1 - p, 3); // Cubic easeOut

        const rx = (1 - e) * -78;          // 3D X-axis tilt (starts tilted backward at -78deg)
        const ty = (1 - e) * 190;          // Upward translation (rises 190px from below)
        const sc = 0.9 + e * 0.1;          // Scale interpolation (scales from 0.90 to 1.00)

        card.style.transform = `rotateX(${rx.toFixed(2)}deg) translateY(${ty.toFixed(1)}px) scale(${sc.toFixed(3)})`;
        card.style.opacity = (0.15 + e * 0.85).toFixed(3);
      });

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(runCards);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', runCards, { passive: true });
    runCards();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', runCards);
    };
  }, []);

  return (
    <section id="process" className="relative z-10 w-full pt-8 sm:pt-12 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-10 border-b border-[#2b2b2b]/10 bg-white">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-12 sm:gap-16">
        {/* Section Header */}
        <div className="max-w-4xl flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#2b2b2b]/60 font-medium tabular-nums m-0">
            The Process
          </p>
          <h2 className="font-sans font-bold text-[clamp(36px,4.8vw,68px)] tracking-[-0.035em] leading-[1.08] text-[#1a1a1a] m-0">
            From ambitious ideas to<br />
            <span className="text-[#fc4778]">digital experiences.</span>
          </h2>
          <p className="mt-3.5 font-sans text-[clamp(15px,1.12vw,17.5px)] text-[#2b2b2b]/70 leading-[1.62] max-w-[68ch]">
            I turn ideas into thoughtfully designed websites, interactive interfaces, and immersive 3D experiences. From the first sketch to the final interaction, every detail has a purpose.
          </p>
        </div>

        {/* Stacking Cards Container with 3D Perspective */}
        <div 
          ref={containerRef}
          style={{
            perspective: '1000px',
            perspectiveOrigin: '50% 20%',
          }}
          className="relative flex flex-col gap-5 sm:gap-6 pb-12"
        >
          {PROCESS_STEPS.map((step, idx) => (
            <article
              key={step.num}
              data-process-card
              style={{
                top: `${step.topOffset}px`,
                zIndex: (idx + 1) * 10,
                transformOrigin: '50% 0%',
              }}
              className="sticky rounded-[20px] border border-[#2b2b2b]/15 bg-[#fafafa] p-6 sm:p-8 lg:p-9 transition-[box-shadow] duration-300 shadow-[0_-14px_40px_rgba(0,0,0,0.07)] will-change-transform"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-7">
                {/* Left Icon Badge */}
                <div className="w-12 h-12 rounded-xl bg-[#2b2b2b]/5 border border-[#2b2b2b]/10 flex items-center justify-center shrink-0" aria-hidden="true">
                  {idx === 0 && (
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" strokeWidth="1.75">
                      <circle cx="12" cy="12" r="10" stroke="#2b2b2b" />
                      <circle cx="12" cy="12" r="6" stroke="#2b2b2b" />
                      <circle cx="12" cy="12" r="2" fill="#fc4778" stroke="#fc4778" />
                    </svg>
                  )}
                  {idx === 1 && (
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" strokeWidth="1.75">
                      <path d="m12 2 10 5-10 5-10-5Z" stroke="#2b2b2b" strokeLinejoin="round" />
                      <path d="m2 12 10 5 10-5" stroke="#2b2b2b" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="m2 17 10 5 10-5" stroke="#fc4778" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {idx === 2 && (
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" strokeWidth="1.75">
                      <polyline points="16 18 22 12 16 6" stroke="#2b2b2b" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="8 6 2 12 8 18" stroke="#2b2b2b" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="14" y1="4" x2="10" y2="20" stroke="#fc4778" strokeLinecap="round" />
                    </svg>
                  )}
                  {idx === 3 && (
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" strokeWidth="1.75">
                      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" stroke="#fc4778" strokeLinejoin="round" />
                      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" stroke="#2b2b2b" strokeLinejoin="round" />
                      <circle cx="15" cy="9" r="1.5" fill="#fc4778" stroke="#fc4778" />
                    </svg>
                  )}
                </div>

                {/* Right Content Column */}
                <div className="flex flex-col gap-2 flex-1">
                  {/* Eyebrow: 01 / DISCOVER */}
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#2b2b2b]/55 font-medium tabular-nums m-0 select-none">
                    {step.num} / {step.phase}
                  </p>

                  {/* Title */}
                  <h3 className="font-sans font-bold text-2xl sm:text-[28px] tracking-[-0.03em] leading-tight text-[#1a1a1a] m-0">
                    {step.title}
                  </h3>

                  {/* Body Description */}
                  <p className="mt-1 font-sans text-[15px] sm:text-base text-[#2b2b2b]/75 leading-relaxed m-0 max-w-3xl">
                    {step.desc}
                  </p>

                  {/* Deliverable Tags Strip */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 mt-2 border-t border-[#2b2b2b]/10 font-mono text-[11px] sm:text-xs uppercase tracking-[0.14em] text-[#2b2b2b]/60 tabular-nums select-none">
                    {step.deliverables.join(' · ')}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
