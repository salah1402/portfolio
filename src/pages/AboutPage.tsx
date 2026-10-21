import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Clock } from '../components/ui/Clock';
import { useModal } from '../App';
import { CASE_STUDIES } from '../data/projects';

/**
 * Editorial About Page — SALAH / Independent Creative Technology Studio
 * 
 * Re-architected with balanced editorial spread:
 * - 2-column layout: Left column (~36%) holds sticky portrait & metadata;
 *   Right column (~64%) holds headline, intro, experience timeline, and disciplines.
 * - Gap calibrated to 40-56px for harmonious image-to-text connection.
 * - Authentic portrait (aspect-3:4) with clean metadata caption.
 * - Strict 2-year experience timeline (2024-2026) in a 3-column desktop layout.
 * - Numbered disciplines for "What I work on."
 * - Personal principles ("How I approach the work.")
 * - Seamless transition to selected client works & Thanjavur studio clock.
 */
export const AboutPage: React.FC = () => {
  const { openModal } = useModal();

  // Strict 2-year development experience timeline (2024–2026)
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

  // Core areas of practice & creative focus
  const DISCIPLINES = [
    {
      index: '01',
      title: 'CREATIVE DEVELOPMENT',
      description: 'Interactive websites, thoughtful interfaces, and expressive front-end experiences.',
    },
    {
      index: '02',
      title: 'WEBGL & INTERACTIVE 3D',
      description: 'Spatial interfaces, real-time 3D experiences, and browser-based visual storytelling.',
    },
    {
      index: '03',
      title: 'DESIGN ENGINEERING',
      description: 'Translating visual direction into maintainable, responsive, production-minded implementations.',
    },
    {
      index: '04',
      title: 'EXPERIMENTAL WEB',
      description: 'Scroll-driven narratives, motion studies, and unconventional interface concepts.',
    },
  ];

  // Three core personal principles
  const PRINCIPLES = [
    {
      number: '01',
      label: 'CLARITY',
      text: 'Every visual decision should have a reason.',
    },
    {
      number: '02',
      label: 'CRAFT',
      text: 'The details matter, from typography to implementation.',
    },
    {
      number: '03',
      label: 'CURIOSITY',
      text: 'The best work comes from testing ideas beyond the obvious.',
    },
  ];

  // Curated project previews for seamless transition into Work
  const featuredProjects = CASE_STUDIES.slice(0, 2);

  return (
    <article className="w-full max-w-full overflow-x-hidden min-h-screen bg-[#f1f1f1] text-[#1a1a1a] selection:bg-[#fc4778]/20 selection:text-[#1a1a1a]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-10 sm:py-16 lg:py-20 flex flex-col gap-16 sm:gap-24 lg:gap-28">

        {/* ================================================================= */}
        {/* 1. PRIMARY EDITORIAL SPREAD — BALANCED 2-COLUMN GRID              */}
        {/* Left: 34-38% (Portrait, Caption, Metadata)                         */}
        {/* Right: 62-66% (Headline, Intro, Experience Timeline, Disciplines)   */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-14 items-start">
          
          {/* LEFT COLUMN: Portrait & Metadata (lg:col-span-4 / ~34-38%) */}
          <aside className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5 lg:sticky lg:top-24">
            
            {/* Metadata Rail */}
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

            {/* Authentic Portrait Image (Aspect 3:4) */}
            <div className="flex flex-col gap-2.5 max-w-[380px] lg:max-w-none">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#e6e6e6] border border-[#1a1a1a]/15 rounded-[2px]">
                <img
                  src="/assets/portrait.webp"
                  alt="Mohamed Salauddin / Salah"
                  className="w-full h-full object-cover object-center grayscale-[0.06] contrast-[1.02]"
                  loading="eager"
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
          </aside>

          {/* RIGHT COLUMN: Main Content & Editorial Spread (lg:col-span-7 / ~62-66%) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8 sm:gap-10">
            
            {/* A. Editorial Headline & Introduction */}
            <div className="flex flex-col gap-5 sm:gap-6">
              <h1 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] tracking-[-0.035em] leading-[1.08] text-[#1a1a1a] m-0 w-full text-pretty">
                I build digital experiences where design meets technology.
              </h1>

              <div className="flex flex-col gap-3.5 max-w-2xl">
                <p className="font-sans text-base sm:text-lg text-[#1a1a1a]/85 leading-[1.65] m-0 text-pretty">
                  I'm Salah, a creative developer exploring the intersection of front-end engineering, interactive 3D, and digital design. I turn ambitious ideas into thoughtful, immersive web experiences through a balance of engineering discipline and visual experimentation.
                </p>

                <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#1a1a1a]/65 m-0 font-medium">
                  Design with intent. Code with precision. Build with curiosity.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => openModal()}
                  className="group inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.14em] text-[#1a1a1a] font-semibold hover:text-[#fc4778] transition-colors"
                >
                  <span>Initiate a Commission</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
                <span className="text-[#1a1a1a]/20">/</span>
                <Link
                  to="/contact"
                  className="font-mono text-xs uppercase tracking-[0.14em] text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors"
                >
                  Direct Channels
                </Link>
              </div>
            </div>

            {/* B. EXPERIENCE TIMELINE — STRICT 2-YEAR WINDOW (3 COLUMNS) */}
            <section className="flex flex-col gap-5 border-t border-[#1a1a1a]/15 pt-8 sm:pt-10">
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
                    {/* Col 1: Period */}
                    <div className="md:col-span-3">
                      <span className="font-mono text-xs font-semibold tracking-wider text-[#fc4778] tabular-nums">
                        {entry.period}
                      </span>
                    </div>
                    {/* Col 2: Milestone Title */}
                    <div className="md:col-span-4">
                      <h3 className="font-display font-medium text-base sm:text-lg text-[#1a1a1a] m-0 tracking-tight">
                        {entry.title}
                      </h3>
                    </div>
                    {/* Col 3: Description */}
                    <div className="md:col-span-5">
                      <p className="font-sans text-xs sm:text-sm text-[#1a1a1a]/75 leading-relaxed m-0">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* C. CREATIVE PRACTICE — WHAT I WORK ON */}
            <section className="flex flex-col gap-5 border-t border-[#1a1a1a]/15 pt-8 sm:pt-10">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display font-medium text-xl sm:text-2xl text-[#1a1a1a] tracking-tight m-0">
                  What I work on.
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#1a1a1a]/50">
                  Core Disciplines
                </span>
              </div>

              <div className="flex flex-col border-t border-[#1a1a1a]/10 mt-2">
                {DISCIPLINES.map((item) => (
                  <div
                    key={item.index}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6 py-4 sm:py-5 border-b border-[#1a1a1a]/10 items-baseline group"
                  >
                    <div className="md:col-span-2">
                      <span className="font-mono text-xs font-semibold tracking-wider text-[#fc4778] tabular-nums">
                        {item.index}
                      </span>
                    </div>
                    <div className="md:col-span-5">
                      <h3 className="font-display font-medium text-base sm:text-lg text-[#1a1a1a] m-0 tracking-tight group-hover:text-[#fc4778] transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <div className="md:col-span-5">
                      <p className="font-sans text-xs sm:text-sm text-[#1a1a1a]/70 leading-relaxed m-0">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* D. PERSONAL PHILOSOPHY — HOW I APPROACH THE WORK */}
            <section className="flex flex-col gap-5 border-t border-[#1a1a1a]/15 pt-8 sm:pt-10">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#fc4778] font-semibold">
                  ETHOS &amp; PRINCIPLES
                </span>
                <h2 className="font-display font-medium text-xl sm:text-2xl text-[#1a1a1a] tracking-tight m-0">
                  How I approach the work.
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                {PRINCIPLES.map((principle) => (
                  <div
                    key={principle.number}
                    className="flex flex-col gap-2.5 border-t border-[#1a1a1a]/15 pt-4"
                  >
                    <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#fc4778] font-semibold tabular-nums">
                      {principle.number} / {principle.label}
                    </span>
                    <p className="font-display font-medium text-base sm:text-lg text-[#1a1a1a] leading-snug m-0">
                      {principle.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>


        {/* ================================================================= */}
        {/* 2. SELECTED WORK TRANSITION — “THE WORK SPEAKS, TOO.”             */}
        {/* ================================================================= */}
        <section className="border-t border-[#1a1a1a]/15 pt-12 sm:pt-16 flex flex-col gap-8 sm:gap-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-2 max-w-xl">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#fc4778] font-semibold">
                SELECTED PORTFOLIO
              </span>
              <h2 className="font-display font-medium text-2xl sm:text-3xl text-[#1a1a1a] tracking-tight m-0">
                The work speaks, too.
              </h2>
              <p className="font-sans text-sm text-[#1a1a1a]/70 leading-relaxed m-0">
                A closer look at the ideas, experiments, and digital experiences I've been building.
              </p>
            </div>

            <Link
              to="/#work"
              className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-[#1a1a1a] font-semibold hover:text-[#fc4778] transition-colors shrink-0 self-start sm:self-auto"
            >
              <span>EXPLORE SELECTED WORK</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {featuredProjects.map((project) => (
              <Link
                key={project.slug}
                to={`/work/${project.slug}`}
                className="group flex flex-col gap-3.5 no-underline text-inherit"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#e8e8e8] border border-[#1a1a1a]/12 rounded-[2px]">
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#fc4778] font-semibold">
                      {project.category}
                    </span>
                    <span className="font-mono text-[10px] text-[#1a1a1a]/45 uppercase">
                      Case Study →
                    </span>
                  </div>
                  <h3 className="font-display font-medium text-base sm:text-lg text-[#1a1a1a] m-0 group-hover:text-[#fc4778] transition-colors">
                    {project.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-[#1a1a1a]/70 leading-relaxed m-0 line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>


        {/* ================================================================= */}
        {/* 3. FINAL CONTACT INVITATION & STUDIO BASE                         */}
        {/* ================================================================= */}
        <section className="border-t border-[#1a1a1a]/15 pt-12 sm:pt-16 pb-6 flex flex-col gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end justify-between">
            <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#fc4778] font-semibold">
                GET IN TOUCH
              </span>
              <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl text-[#1a1a1a] tracking-[-0.03em] leading-[1.1] m-0 text-balance">
                Have something worth building?
              </h2>
              <p className="font-sans text-sm sm:text-base text-[#1a1a1a]/75 leading-relaxed m-0 max-w-xl text-pretty">
                I'm open to interesting collaborations, creative experiments, and projects that push the web forward.
              </p>
              
              <div className="pt-1">
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-2.5 font-mono text-xs sm:text-sm uppercase tracking-[0.14em] text-[#1a1a1a] font-bold hover:text-[#fc4778] transition-colors"
                >
                  <span>START A CONVERSATION</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </div>
            </div>

            {/* Thanjavur Studio Base & Live Clock */}
            <div className="lg:col-span-4 flex flex-col lg:items-end gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#1a1a1a]/10">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#1a1a1a]/50">
                Thanjavur, Tamil Nadu, India
              </span>
              <div className="p-3 rounded-[3px] bg-[#1a1a1a]/[0.03] border border-[#1a1a1a]/10">
                <Clock showLocationPrefix={false} showStatusDot={true} />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#1a1a1a]/55 tabular-nums">
                Active Studio Hours · Asia/Kolkata (IST)
              </span>
            </div>
          </div>
        </section>

      </div>
    </article>
  );
};

export default AboutPage;
