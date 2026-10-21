import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { CASE_STUDIES } from '../../data/projects';

export interface TrailCard {
  id: number;
  x: number;
  y: number;
  project: (typeof CASE_STUDIES)[0];
  rotation: number;
  born: number;
  scale: number;
}

const STEP = 66; // Minimum movement delta (px)
const MIN_MS = 28; // Spawn throttle threshold (ms)
const HOLD = 620; // Stationary hold before retiring (ms)
const MAX = 6; // Active visible pool cap

/**
 * Interactive Floating Thumbnail Trail Canvas (#trail)
 * Features:
 * - Pointer-driven project preview spawning with Euclidean step distance (STEP = 66px)
 * - Throttle gating (MIN_MS = 28ms)
 * - Physics elastic overshoot scale(1.15) -> scale(1.0)
 * - Active visible pool capped at MAX = 6
 * - Hold duration HOLD = 620ms
 * - Autonomous virtual Lissajous parametric drift simulation fallback on touch devices
 * - Direct navigation links to /work/:slug
 */
export const FloatingTrail: React.FC = () => {
  const [cards, setCards] = useState<TrailCard[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSpawnPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastSpawnTime = useRef<number>(0);
  const projectIdxRef = useRef<number>(0);
  const nextIdRef = useRef<number>(0);
  const isTouchDevice = useRef<boolean>(false);

  // Spawn a card at (x, y) coordinates relative to container
  const spawnCardAt = useCallback((x: number, y: number) => {
    const proj = CASE_STUDIES[projectIdxRef.current % CASE_STUDIES.length];
    projectIdxRef.current += 1;

    // Subtle restrained tilt -2.5deg to +2.5deg matching editorial refinement
    const rotation = (Math.random() - 0.5) * 5;

    const newCard: TrailCard = {
      id: nextIdRef.current++,
      x,
      y,
      project: proj,
      rotation,
      born: Date.now(),
      scale: 1.15, // Overshoot scale entry
    };

    setCards((prev) => {
      const next = prev.length >= MAX ? prev.slice(prev.length - MAX + 1) : prev;
      return [...next, newCard];
    });

    // Animate scale to 1.0 after entry tick
    setTimeout(() => {
      setCards((prev) =>
        prev.map((c) => (c.id === newCard.id ? { ...c, scale: 1.0 } : c))
      );
    }, 40);
  }, []);

  // Desktop Pointer Move Handler - Strictly constrained to #trail stage canvas
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const now = Date.now();
    const timeDelta = now - lastSpawnTime.current;
    if (timeDelta < MIN_MS) return;

    const rect = containerRef.current.getBoundingClientRect();

    // Check pointer is strictly within the stage container bounds
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      return;
    }

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Constrain spawn coordinates strictly inside the stage canvas bounds
    const cardHalfWidth = 105;
    const cardHalfHeight = 70;
    const clampedX = Math.max(cardHalfWidth + 12, Math.min(rect.width - cardHalfWidth - 12, x));
    const clampedY = Math.max(cardHalfHeight + 12, Math.min(rect.height - cardHalfHeight - 12, y));

    const dx = clampedX - lastSpawnPos.current.x;
    const dy = clampedY - lastSpawnPos.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist >= STEP) {
      lastSpawnPos.current = { x: clampedX, y: clampedY };
      lastSpawnTime.current = now;
      spawnCardAt(clampedX, clampedY);
    }
  };

  // Card Hold & Retirement Lifecycle
  useEffect(() => {
    const retirementInterval = setInterval(() => {
      const now = Date.now();
      setCards((prev) => prev.filter((card) => now - card.born < HOLD + 800));
    }, 150);

    return () => clearInterval(retirementInterval);
  }, []);

  // Autonomous Lissajous Parametric Drift Simulation for Touch Devices
  useEffect(() => {
    // Refined check: Only run autonomous simulation if device has coarse touch AND lacks fine pointer
    const isTouchOnly =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse) and not (pointer: fine)').matches;

    isTouchDevice.current = isTouchOnly;

    if (!isTouchOnly) return;

    let animFrame: number;
    let startTime = performance.now();
    let lastSimSpawn = 0;

    const lissajousX = (t: number, w: number) =>
      w * (0.5 + 0.38 * Math.sin(1.25 * t) * Math.cos(0.29 * t));

    const lissajousY = (t: number, h: number) =>
      h * (0.52 + 0.3 * Math.sin(0.97 * t + 1.2));

    const loop = (timestamp: number) => {
      const t = (timestamp - startTime) / 1000;
      if (containerRef.current) {
        const w = containerRef.current.clientWidth || 600;
        const h = containerRef.current.clientHeight || 400;

        const vx = lissajousX(t, w);
        const vy = lissajousY(t, h);

        const now = Date.now();
        if (now - lastSimSpawn > 850) {
          lastSimSpawn = now;
          spawnCardAt(vx, vy);
        }
      }
      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [spawnCardAt]);

  return (
    <div
      id="trail"
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className="relative min-h-[420px] sm:min-h-[480px] w-full rounded-3xl border border-[#e2e2e2] bg-[#fafafa] p-8 sm:p-12 overflow-hidden flex flex-col justify-between cursor-crosshair select-none shadow-xs"
    >
      {/* Background Spatial Watermark & Instructions */}
      <div className="z-10 flex flex-col gap-2 pointer-events-none">
        <h2 className="font-display font-medium text-[clamp(34px,4.4vw,68px)] tracking-[-0.04em] leading-[0.92] text-[#2b2b2b] m-0">
          See for<br />yourself
        </h2>
      </div>

      <div className="z-10 font-mono text-[11px] text-[#2b2b2b]/65 uppercase tracking-[0.14em] font-medium tabular-nums pointer-events-none">
        Move your cursor &mdash; click any project
      </div>

      {/* Floating Spawned Cards */}
      {cards.map((card) => (
        <div
          key={card.id}
          style={{
            left: `${card.x}px`,
            top: `${card.y}px`,
            transform: `translate(-50%, -50%) rotate(${card.rotation}deg) scale(${card.scale})`,
            transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease-out',
          }}
          className="absolute z-20 w-44 sm:w-52 p-2.5 rounded-2xl border border-[#e2e2e2] bg-[#fafafa]/95 backdrop-blur-md shadow-lg pointer-events-none select-none animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="w-full h-24 rounded-xl overflow-hidden bg-[#f1f1f1] mb-2 border border-[#e2e2e2]/60">
            <img
              src={card.project.coverImage}
              alt={card.project.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex items-center justify-between gap-1">
            <div className="flex flex-col gap-0.5 overflow-hidden">
              <span className="font-display font-semibold text-xs text-[#1a1a1a] tracking-tight truncate">
                {card.project.title}
              </span>
              <span className="font-mono text-[10px] text-[#fc4778] uppercase tracking-[0.12em] font-medium tabular-nums truncate">
                {card.project.client}
              </span>
            </div>
            <Link
              to={`/work/${card.project.slug}`}
              className="pointer-events-auto p-1.5 rounded-full bg-[#1a1a1a] text-[#f1f1f1] hover:bg-[#fc4778] hover:text-[#1a1a1a] transition-colors focus:outline-none shrink-0"
              title={`View ${card.project.title}`}
              aria-label={`View ${card.project.title}`}
            >
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};
