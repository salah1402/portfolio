import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PROJECTS } from '../data/projects';
import { TESTIMONIALS } from '../data/content';

interface TrailItem {
  id: number;
  x: number;
  y: number;
  project: (typeof PROJECTS)[0];
  rotation: number;
}

export const ProofStage: React.FC = () => {
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const [currentTestimonial, setCurrentTestimonial] = useState<number>(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const lastSpawnTime = useRef<number>(0);
  const projectIndex = useRef<number>(0);
  const nextId = useRef<number>(0);

  // Floating thumbnail trail physics
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastSpawnTime.current < 120) return; // Throttling spawn rate
    lastSpawnTime.current = now;

    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const proj = PROJECTS[projectIndex.current % PROJECTS.length];
    projectIndex.current += 1;
    const rotation = (Math.random() - 0.5) * 16; // Random tilt -8deg to +8deg

    const newItem: TrailItem = {
      id: nextId.current++,
      x,
      y,
      project: proj,
      rotation,
    };

    setTrail((prev) => [...prev.slice(-6), newItem]); // Keep max 7 active thumbnails
  };

  // Auto cycle testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="proof" className="py-24 border-t border-[#e2e2e2] bg-[#f1f1f1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-16">
        {/* Top Header */}
        <div className="flex flex-col gap-2">
          <div className="font-mono text-xs uppercase tracking-[0.14em] text-[#fc4778]">
            Interactive Proof
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-[#1a1a1a]">
            See for yourself.
          </h2>
        </div>

        {/* The Dual Grid: Interactive Cursor Trail Stage + Testimonial Slider */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Stage 1: Floating Cursor Trail Canvas (Cols 7) */}
          <div
            ref={stageRef}
            onMouseMove={handleMouseMove}
            className="lg:col-span-7 relative min-h-[380px] sm:min-h-[440px] rounded-3xl border border-[#e2e2e2] bg-[#fafafa] p-8 sm:p-12 overflow-hidden flex flex-col justify-between cursor-crosshair select-none shadow-xs"
          >
            {/* Background Hint */}
            <div className="z-10 flex flex-col gap-2 pointer-events-none">
              <span className="font-mono text-xs text-[#fc4778] tracking-widest uppercase">
                Interactive Canvas
              </span>
              <h3 className="font-display text-3xl sm:text-4xl text-[#1a1a1a] max-w-sm leading-tight">
                Move your cursor to explore live projects.
              </h3>
            </div>

            <div className="z-10 font-mono text-xs text-[#1a1a1a]/50 uppercase tracking-wider pointer-events-none">
              Click any spawned card to view full case study ↗
            </div>

            {/* Spawned Thumbnails */}
            {trail.map((item) => (
              <Link
                key={item.id}
                to={`/work/${item.project.slug}`}
                style={{
                  left: `${item.x}px`,
                  top: `${item.y}px`,
                  transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                }}
                className="absolute z-20 w-44 sm:w-52 p-2.5 rounded-xl border border-[#1a1a1a]/20 bg-[#fafafa]/95 backdrop-blur-md shadow-2xl transition-transform hover:scale-105 pointer-events-auto cursor-pointer animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="w-full h-24 rounded-lg overflow-hidden bg-[#fafafa] mb-2">
                  <img
                    src={item.project.coverImage}
                    alt={item.project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans font-medium text-xs text-[#1a1a1a] line-clamp-1">
                    {item.project.title}
                  </span>
                  <span className="font-mono text-[10px] text-[#fc4778] uppercase">
                    {item.project.client}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Stage 2: Testimonials Slider (Cols 5) */}
          <div className="lg:col-span-5 rounded-3xl border border-[#e2e2e2] bg-[#fafafa] p-8 sm:p-10 flex flex-col justify-between shadow-sm">
            <div className="flex flex-col gap-6">
              <span className="text-4xl text-[#fc4778] font-serif leading-none select-none">“</span>
              <p className="font-sans text-lg sm:text-xl text-[#1a1a1a] leading-relaxed transition-opacity duration-300 min-h-[140px]">
                {TESTIMONIALS[currentTestimonial].quote}
              </p>
            </div>

            <div className="pt-6 border-t border-[#e2e2e2] flex items-center justify-between">
              <div>
                <p className="font-sans font-semibold text-sm text-[#1a1a1a]">
                  {TESTIMONIALS[currentTestimonial].author}
                </p>
                <p className="font-mono text-xs text-[#1a1a1a]/60 mt-0.5">
                  {TESTIMONIALS[currentTestimonial].role} · {TESTIMONIALS[currentTestimonial].company}
                </p>
              </div>

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {TESTIMONIALS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentTestimonial(idx)}
                    aria-label={`Testimonial ${idx + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      currentTestimonial === idx
                        ? 'bg-[#fc4778] w-6'
                        : 'bg-[#1a1a1a]/20 hover:bg-[#1a1a1a]/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Latest Delivery Badges / Chips */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#e2e2e2] bg-[#fafafa] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-wider text-[#fc4778]">
              High-Velocity Delivery
            </span>
            <p className="font-display text-xl text-[#1a1a1a]">
              Latest projects shipped on schedule.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-full border border-[#e2e2e2] bg-[#fafafa] flex items-center gap-2">
              <span className="font-sans text-xs font-medium text-[#1a1a1a]">Aura Dental</span>
              <span className="font-mono text-[10px] text-[#1a1a1a]/50">IN · 3 wks</span>
            </div>
            <div className="px-4 py-2 rounded-full border border-[#e2e2e2] bg-[#fafafa] flex items-center gap-2">
              <span className="font-sans text-xs font-medium text-[#1a1a1a]">Privilege Luxury</span>
              <span className="font-mono text-[10px] text-[#1a1a1a]/50">IN · 4 wks</span>
            </div>
            <div className="px-4 py-2 rounded-full border border-[#e2e2e2] bg-[#fafafa] flex items-center gap-2">
              <span className="font-sans text-xs font-medium text-[#1a1a1a]">AgentFrame</span>
              <span className="font-mono text-[10px] text-[#1a1a1a]/50">US · 5 wks</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
