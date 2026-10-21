import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

/**
 * Editorial About Section (#about) on Flagship Home
 * Balanced 2-column editorial spread matching the studio's minimal aesthetic:
 * - Left column (~36%): Authentic 3:4 portrait crop, metadata, and metric indicators
 * - Right column (~64%): Disciplined heading, intro, strict 2-year timeline (2024-2026),
 *   and link to full editorial story.
 */
export const AboutTeaser: React.FC = () => {
  const TIMELINE_ENTRIES = [
    {
      period: '2024–2025',
      title: 'FOUNDATIONS',
      description: 'Front-end development, interface design, and engineering fundamentals.',
    },
    {
      period: '2025–2026',
      title: 'CREATIVE DEVELOPMENT',
      description: 'Exploring interactive experiences, motion, WebGL, and 3D-driven web design.',
    },
    {
      period: '2026',
      title: 'CURRENT PRACTICE',
      description: 'Combining creative development and engineering to build thoughtful digital experiences.',
    },
  ];

  return (
    <section id="about" className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-10 border-b border-[#2b2b2b]/10 bg-[#f1f1f1]">
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-14 items-start">
        {/* Left Column: Portrait & Studio Metadata (~36%) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5 lg:sticky lg:top-24">
          <div className="flex flex-col gap-1.5 border-l-2 border-[#fc4778] pl-3.5">
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-[#1a1a1a] font-semibold m-0">
              Independent Creative Developer
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 m-0">
              Mohamed Salauddin A · Thanjavur, India
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/60 m-0 tabular-nums">
              Experience: 2 Years
            </p>
          </div>

          <div className="flex flex-col gap-2.5 max-w-[380px] lg:max-w-none">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#e6e6e6] border border-[#1a1a1a]/15 rounded-[2px]">
              <img
                src="/assets/portrait.webp"
                alt="Mohamed Salauddin / Salah"
                className="w-full h-full object-cover object-center grayscale-[0.06] contrast-[1.02]"
                loading="lazy"
              />
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#1a1a1a] font-semibold">
                MOHAMED SALAUDDIN / SALAH
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#1a1a1a]/50">
                PORTRAIT · 2026
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Copy & 3-Column Experience Timeline (~64%) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8 sm:gap-10">
          <div className="flex flex-col gap-5 sm:gap-6">
            <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] tracking-[-0.035em] leading-[1.08] text-[#1a1a1a] m-0 w-full text-pretty">
              I build digital experiences where design meets technology.
            </h2>

            <div className="flex flex-col gap-3.5 max-w-2xl">
              <p className="font-sans text-base sm:text-lg text-[#1a1a1a]/85 leading-[1.65] m-0 text-pretty">
                I'm Salah, a creative developer exploring the intersection of front-end engineering, interactive 3D, and digital design. I turn ambitious ideas into thoughtful, immersive web experiences through a balance of engineering discipline and visual experimentation.
              </p>

              <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#1a1a1a]/65 m-0 font-medium">
                Design with intent. Code with precision. Build with curiosity.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                to="/about"
                className="group inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.14em] text-[#1a1a1a] font-semibold hover:text-[#fc4778] transition-colors"
              >
                <span>Read Full Editorial Story</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <span className="text-[#1a1a1a]/20">/</span>
              <Link
                to="/contact"
                className="font-mono text-xs uppercase tracking-[0.14em] text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors"
              >
                Direct Channels
              </Link>
            </div>
          </div>

          {/* Experience Chronology — Strict 2-Year Window */}
          <div className="flex flex-col gap-5 border-t border-[#1a1a1a]/15 pt-8 sm:pt-10">
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#fc4778] font-semibold">
                EXPERIENCE
              </span>
              <p className="font-sans text-sm sm:text-base text-[#1a1a1a]/70 italic m-0">
                Two years of building, experimenting, and developing my approach to creative technology.
              </p>
            </div>

            <div className="flex flex-col border-t border-[#1a1a1a]/10 mt-2">
              {TIMELINE_ENTRIES.map((entry) => (
                <div
                  key={entry.period}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6 py-5 sm:py-6 border-b border-[#1a1a1a]/10 items-baseline"
                >
                  <div className="md:col-span-3">
                    <span className="font-mono text-xs font-semibold tracking-wider text-[#fc4778] tabular-nums">
                      {entry.period}
                    </span>
                  </div>
                  <div className="md:col-span-4">
                    <h3 className="font-display font-medium text-base sm:text-lg text-[#1a1a1a] m-0 tracking-tight">
                      {entry.title}
                    </h3>
                  </div>
                  <div className="md:col-span-5">
                    <p className="font-sans text-xs sm:text-sm text-[#1a1a1a]/75 leading-relaxed m-0">
                      {entry.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutTeaser;
