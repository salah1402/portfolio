import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Layers,
  Cpu,
  Activity,
  Clock,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Calendar,
  Briefcase
} from 'lucide-react';
import { getCaseStudy, getNextCaseStudy, CASE_STUDIES } from '../data/projects';
import { useModal } from '../App';

// Inline SVG Github icon matching studio bone aesthetic
const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export const CaseStudyPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { openModal } = useModal();
  const project = getCaseStudy(slug);

  // Graceful 404 Not Found state
  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#fc4778] mb-4">
          [ 404 · Not Found ]
        </span>
        <h1 className="font-display text-4xl sm:text-6xl font-normal tracking-tight text-[#1a1a1a] mb-6">
          Case Study Unavailable
        </h1>
        <p className="text-base sm:text-lg text-[#1a1a1a]/70 max-w-xl font-sans mb-10">
          The requested project deep dive could not be found or has been relocated within our studio archive.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/#work"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1a1a1a] text-[#f1f1f1] font-mono text-xs uppercase tracking-wider hover:bg-[#fc4778] hover:text-[#1a1a1a] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Selected Works</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#e2e2e2] bg-[#fafafa] text-[#1a1a1a] font-mono text-xs uppercase tracking-wider hover:border-[#1a1a1a] transition-all"
          >
            <span>Studio Home</span>
          </Link>
        </div>

        {/* Suggestion list */}
        <div className="mt-16 pt-12 border-t border-[#e2e2e2] w-full max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-wider text-[#1a1a1a]/50 block mb-4">
            Available Case Studies:
          </span>
          <div className="flex flex-wrap justify-center gap-3">
            {CASE_STUDIES.map((c) => (
              <Link
                key={c.slug}
                to={`/work/${c.slug}`}
                className="px-4 py-2 rounded-lg border border-[#e2e2e2] bg-[#fafafa] font-mono text-xs text-[#1a1a1a] hover:border-[#fc4778] hover:text-[#fc4778] transition-colors"
              >
                {c.title} ↗
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate project sequential index for editorial numbering
  const currentIndex = CASE_STUDIES.findIndex((c) => c.slug === project.slug);
  const currentNum = currentIndex >= 0 ? currentIndex + 1 : 1;
  const currentFormatted = String(currentNum).padStart(2, '0');
  const totalFormatted = String(CASE_STUDIES.length).padStart(2, '0');

  // Cyclic traversal to next project
  const nextProject = getNextCaseStudy(project.slug);
  const nextIndex = CASE_STUDIES.findIndex((c) => c.slug === nextProject.slug);
  const nextFormatted = String(nextIndex >= 0 ? nextIndex + 1 : 1).padStart(2, '0');

  return (
    <article className="min-h-screen py-16 sm:py-24 selection:bg-[#fc4778]/20 selection:text-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-16 sm:gap-24">
        {/* Top Breadcrumb & Return Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e2e2e2] pb-6">
          <Link
            to="/#work"
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-[#1a1a1a]/65 font-medium tabular-nums hover:text-[#fc4778] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Return to Selected Works</span>
          </Link>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] font-medium tabular-nums text-[#1a1a1a]/60">
            <span className="text-[#fc4778]">[ Index {currentFormatted}/{totalFormatted} ]</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{project.category}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{project.year}</span>
          </div>
        </div>

        {/* Hero Section */}
        <header className="flex flex-col gap-8 max-w-5xl">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e2e2e2] bg-[#fafafa] font-mono text-xs tracking-wider uppercase text-[#1a1a1a]/70 font-medium tabular-nums">
              <span className="w-2 h-2 rounded-full bg-[#fc4778] animate-pulse" />
              <span>Case Study ({currentFormatted}/{totalFormatted})</span>
            </div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#1a1a1a]/50">
              {project.category}
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.95] text-[#1a1a1a]">
            {project.title}
          </h1>

          {project.subtitle && (
            <p className="font-sans text-lg sm:text-xl text-[#1a1a1a]/75 max-w-3xl leading-relaxed">
              {project.subtitle}
            </p>
          )}

          {/* Project Metadata Matrix: Client, Category, Year, Timeline, Role */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-6 border-t border-[#e2e2e2]">
            <div>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#1a1a1a]/45 block mb-1 font-medium tabular-nums">
                Client
              </span>
              <span className="font-sans text-sm font-semibold text-[#1a1a1a] block">
                {project.client}
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#1a1a1a]/45 block mb-1 font-medium tabular-nums">
                Category
              </span>
              <span className="font-sans text-sm font-semibold text-[#1a1a1a] block">
                {project.category}
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#1a1a1a]/45 block mb-1 font-medium tabular-nums">
                Year
              </span>
              <span className="font-sans text-sm font-semibold text-[#1a1a1a] flex items-center gap-1.5 tabular-nums">
                <Calendar className="w-3.5 h-3.5 text-[#fc4778]" />
                {project.year}
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#1a1a1a]/45 block mb-1 font-medium tabular-nums">
                Timeline
              </span>
              <span className="font-sans text-sm font-semibold text-[#1a1a1a] flex items-center gap-1.5 tabular-nums">
                <Clock className="w-3.5 h-3.5 text-[#fc4778]" />
                {project.timeline}
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#1a1a1a]/45 block mb-1 font-medium tabular-nums">
                Role &amp; Discipline
              </span>
              <span className="font-sans text-sm font-semibold text-[#1a1a1a] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#fc4778]" />
                {project.role}
              </span>
            </div>
          </div>

          {/* Direct Live Preview & High-Ticket Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#1a1a1a] text-[#f1f1f1] font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#fc4778] hover:text-[#1a1a1a] shadow-sm transition-all duration-200 group"
              >
                <span>Launch Experience</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-[#e2e2e2] bg-[#fafafa] text-[#1a1a1a] font-mono text-xs uppercase tracking-wider font-medium hover:border-[#1a1a1a] hover:bg-[#f1f1f1] transition-all duration-200 group"
              >
                <GithubIcon className="w-4 h-4 text-[#1a1a1a] group-hover:text-[#fc4778] transition-colors" />
                <span>GitHub Repository</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#1a1a1a]/50" />
              </a>
            )}

            <button
              type="button"
              onClick={() => openModal({ scope: project.slug })}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-dashed border-[#1a1a1a]/30 text-[#1a1a1a] font-mono text-xs uppercase tracking-wider font-medium hover:border-[#fc4778] hover:text-[#fc4778] transition-all duration-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#fc4778]" />
              <span>Inquire Scope</span>
            </button>
          </div>
        </header>

        {/* Primary Cover Image Stage */}
        <section className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden border border-[#e2e2e2] bg-[#fafafa] shadow-xs group">
          <img
            src={project.coverImage}
            alt={project.title}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            loading="eager"
            onError={(e) => {
              const target = e.currentTarget;
              if (project.slug === 'bleach-ichigo') target.src = '/assets/bleach-ichigo.svg';
              else if (project.slug === 'ironvault') target.src = '/assets/ironvault.svg';
            }}
          />
          {project.liveUrl && (
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a]/85 backdrop-blur-md text-[#f1f1f1] font-mono text-xs uppercase tracking-wider font-medium hover:bg-[#fc4778] hover:text-[#1a1a1a] transition-all shadow-md"
              >
                <span>Live Preview</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 px-3.5 py-1.5 rounded-full bg-[#1a1a1a]/85 backdrop-blur-md font-mono text-[11px] text-[#f1f1f1] uppercase tracking-wider font-medium tabular-nums">
            [ Verified Production Build · {project.year} ]
          </div>
        </section>

        {/* Quantitative Business Conversion Metrics (4-Card Grid) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#fc4778] font-medium tabular-nums">
              [ Quantitative Impact &amp; Business Metrics ]
            </span>
            <span className="font-mono text-xs text-[#1a1a1a]/50 uppercase tracking-wider tabular-nums">
              04 Performance Pillars
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {project.metrics.map((metric, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl border border-[#e2e2e2] bg-[#fafafa] flex flex-col justify-between gap-6 transition-all duration-300 hover:border-[#1a1a1a]/40 hover:-translate-y-0.5 shadow-xs"
              >
                <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#fc4778] font-semibold tabular-nums">
                  [ 0{idx + 1} / METRIC ]
                </div>
                <div className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1a1a1a] tabular-nums">
                  {metric.value}
                </div>
                <div>
                  <h2 className="font-mono text-xs uppercase tracking-wider text-[#1a1a1a] mb-2 font-semibold tabular-nums">
                    {metric.label}
                  </h2>
                  <p className="font-sans text-xs sm:text-sm text-[#1a1a1a]/75 leading-relaxed">
                    {metric.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Two-Column Editorial Deep Dive: Brief & Deliverables */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-8 border-t border-[#e2e2e2]">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#fc4778] font-medium tabular-nums">
              [ The Brief &amp; Strategic Context ]
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1a1a1a] tracking-tight leading-tight">
              Transforming complex objectives into intuitive digital form.
            </h2>
            <div className="mt-2 font-mono text-xs text-[#1a1a1a]/60 tracking-wider">
              Client: <span className="text-[#1a1a1a] font-semibold">{project.client}</span>
            </div>
          </div>
          <div className="lg:col-span-7 flex flex-col gap-6">
            <p className="font-sans text-base sm:text-lg text-[#1a1a1a]/85 leading-relaxed text-pretty">
              {project.brief}
            </p>

            {/* Scope & Deliverables Checklist */}
            <div className="mt-4 p-6 sm:p-8 rounded-2xl border border-[#e2e2e2] bg-[#fafafa]">
              <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-[#1a1a1a] mb-5 flex items-center gap-2 font-semibold tabular-nums">
                <ShieldCheck className="w-4 h-4 text-[#fc4778]" />
                <span>Scope &amp; Deliverables Checklist</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {project.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 font-sans text-xs sm:text-sm text-[#1a1a1a]/80">
                    <CheckCircle2 className="w-4 h-4 text-[#fc4778] flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Technical & 3D WebGL Execution Breakdown */}
        <section className="flex flex-col gap-8 pt-8 border-t border-[#e2e2e2]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#fc4778] block mb-1 font-medium tabular-nums">
                [ Technical Architecture &amp; Execution Breakdown ]
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#1a1a1a] tracking-tight">
                Engineering Discipline &amp; Spatial Motion
              </h2>
            </div>
            <span className="font-mono text-xs text-[#1a1a1a]/55 uppercase tracking-wider font-medium tabular-nums">
              Dual Pillar Specification
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl border border-[#e2e2e2] bg-[#fafafa] flex flex-col gap-6 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#1a1a1a] text-[#f1f1f1]">
                  <Layers className="w-5 h-5 text-[#fc4778]" />
                </div>
                <div>
                  <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#1a1a1a]/55 block font-medium tabular-nums">
                    Engineering Pillar 01
                  </span>
                  <h3 className="font-display text-2xl font-semibold text-[#1a1a1a] tracking-tight">
                    Architectural &amp; Front-End Execution
                  </h3>
                </div>
              </div>
              <p className="font-sans text-sm sm:text-base text-[#1a1a1a]/80 leading-relaxed text-pretty">
                {project.execution.architecture}
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-[#e2e2e2] bg-[#fafafa] flex flex-col gap-6 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#1a1a1a] text-[#f1f1f1]">
                  <Cpu className="w-5 h-5 text-[#fc4778]" />
                </div>
                <div>
                  <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#1a1a1a]/55 block font-medium tabular-nums">
                    Engineering Pillar 02
                  </span>
                  <h3 className="font-display text-2xl font-semibold text-[#1a1a1a] tracking-tight">
                    3D, WebGL &amp; Motion Engineering
                  </h3>
                </div>
              </div>
              <p className="font-sans text-sm sm:text-base text-[#1a1a1a]/80 leading-relaxed text-pretty">
                {project.execution.threeDAndMotion}
              </p>
            </div>
          </div>
        </section>

        {/* Tech Stack Pills */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl border border-[#e2e2e2] bg-[#fafafa] shadow-xs">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-[#fc4778]" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#1a1a1a] font-semibold tabular-nums">
              Technologies &amp; Frameworks Deployed:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.execution.stack.map((tech) => (
              <span
                key={tech}
                className="px-3.5 py-1.5 rounded-full border border-[#e2e2e2] bg-[#f1f1f1] font-mono text-xs text-[#1a1a1a] font-medium tabular-nums hover:border-[#fc4778] hover:text-[#fc4778] transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Visual Archive & Project Gallery */}
        {project.galleryImages && project.galleryImages.length > 0 && (
          <section className="flex flex-col gap-8 pt-8 border-t border-[#e2e2e2]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#fc4778] block mb-1 font-medium tabular-nums">
                  [ Visual Archive · High-Resolution Artifacts ]
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#1a1a1a] tracking-tight">
                  Project Gallery &amp; Interface Renders
                </h2>
              </div>
              <span className="font-mono text-xs text-[#1a1a1a]/55 uppercase tracking-wider font-medium tabular-nums">
                {project.galleryImages.length} Curated {project.galleryImages.length === 1 ? 'Frame' : 'Frames'}
              </span>
            </div>

            <div className={`grid grid-cols-1 ${project.galleryImages.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
              {project.galleryImages.map((imgUrl, i) => (
                <div
                  key={i}
                  className="group relative rounded-2xl overflow-hidden border border-[#e2e2e2] bg-[#fafafa] shadow-xs aspect-[16/10] flex items-center justify-center"
                >
                  <img
                    src={imgUrl}
                    alt={`${project.title} Artifact 0${i + 1}`}
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (project.slug === 'bleach-ichigo') target.src = '/assets/bleach-ichigo.svg';
                      else if (project.slug === 'ironvault') target.src = '/assets/ironvault.svg';
                    }}
                  />
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[#1a1a1a]/85 backdrop-blur-xs font-mono text-[10px] text-[#f1f1f1] uppercase tracking-wider font-medium tabular-nums">
                    Artifact 0{i + 1}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Business Results Callout */}
        <section className="p-8 sm:p-12 rounded-3xl bg-[#1a1a1a] text-[#f1f1f1] flex flex-col gap-6 shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#fc4778] font-medium tabular-nums">
              [ Business Impact &amp; Conversion Results ]
            </span>
            <span className="font-mono text-xs text-[#f1f1f1]/40 uppercase tracking-wider">
              {project.client}
            </span>
          </div>
          <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-normal leading-snug max-w-4xl text-pretty">
            "{project.results}"
          </p>
          <div className="pt-4 border-t border-[#f1f1f1]/10 flex flex-wrap items-center justify-between gap-4">
            <div className="font-mono text-xs text-[#f1f1f1]/60">
              Verified Studio Case Study · {project.year}
            </div>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-[#fc4778] uppercase tracking-wider hover:underline"
              >
                <span>Experience Production Platform</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </section>

        {/* Bottom Navigation & Cyclic Next Project Teaser Card */}
        <nav
          aria-label="Case Study Navigation"
          className="pt-12 border-t border-[#e2e2e2] flex flex-col gap-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#fc4778] font-medium tabular-nums">
              [ Continuous Traversal · Next Deep Dive ]
            </span>
            <span className="font-mono text-xs text-[#1a1a1a]/55 uppercase tracking-wider font-medium tabular-nums">
              Case Study {nextFormatted} of {totalFormatted}
            </span>
          </div>

          <Link
            to={`/work/${nextProject.slug}`}
            className="group relative block p-6 sm:p-8 rounded-3xl border border-[#e2e2e2] bg-[#fafafa] hover:border-[#1a1a1a] transition-all duration-300 shadow-xs"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 sm:w-28 sm:h-20 rounded-xl overflow-hidden border border-[#e2e2e2] bg-[#f1f1f1] flex-shrink-0">
                  <img
                    src={nextProject.coverImage}
                    alt={nextProject.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (nextProject.slug === 'bleach-ichigo') target.src = '/assets/bleach-ichigo.svg';
                      else if (nextProject.slug === 'ironvault') target.src = '/assets/ironvault.svg';
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#fc4778] font-semibold tabular-nums">
                    Next Project · {nextFormatted}/{totalFormatted}
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#1a1a1a] group-hover:text-[#fc4778] transition-colors tracking-tight">
                    {nextProject.title}
                  </h3>
                  <div className="font-sans text-xs text-[#1a1a1a]/60">
                    {nextProject.client} · <span className="font-mono">{nextProject.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center font-mono text-xs uppercase tracking-wider text-[#1a1a1a] font-medium">
                <span>Explore Deep Dive</span>
                <div className="w-10 h-10 rounded-full border border-[#1a1a1a] flex items-center justify-center group-hover:bg-[#1a1a1a] group-hover:text-[#f1f1f1] transition-all">
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <Link
              to="/#work"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All 6 Archive Case Studies</span>
            </Link>

            <button
              type="button"
              onClick={() => openModal({ scope: project.slug })}
              className="px-7 py-3.5 rounded-full bg-[#1a1a1a] text-[#f1f1f1] font-mono text-xs uppercase tracking-wider font-medium hover:bg-[#fc4778] hover:text-[#1a1a1a] transition-all"
            >
              Inquire About Similar Project
            </button>
          </div>
        </nav>
      </div>
    </article>
  );
};
