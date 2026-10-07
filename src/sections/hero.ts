import gsap from 'gsap';
import type { ISharedScrollEngine } from '../scroll/index.js';
import type { SectionPlaceholderHandle } from '../main.js';

export const SECTION_ID = 'hero' as const;
export const SECTION_ORDER = 1 as const;
export const PLANNED_TECHNIQUE = 'standard-dom' as const;
export const IMPLEMENTED_TECHNIQUE = 'standard-dom' as const;

export const SCROLL_CHOREOGRAPHY = {
  pinned: false,
  scrollDistanceVh: 100,
  scrubSmoothing: 0.1
} as const;

/**
 * Mounts the SALAH Final Editorial Hero section with GSAP choreography,
 * subtle mouse parallax response, and scroll handoff toward WORK.
 */
export function mountSection_hero(
  scrollEngine: ISharedScrollEngine,
  container: HTMLElement | null
): SectionPlaceholderHandle {
  let isMounted = true;
  const targetContainer =
    container ?? (typeof document !== 'undefined' ? document.getElementById(SECTION_ID) : null);

  if (!targetContainer) {
    return {
      sectionId: SECTION_ID,
      order: SECTION_ORDER,
      plannedTechnique: PLANNED_TECHNIQUE,
      implementedTechnique: IMPLEMENTED_TECHNIQUE,
      get mounted(): boolean {
        return false;
      },
      update(): void {},
      dispose(): void {}
    };
  }

  // DOM Elements
  const portraitEl = targetContainer.querySelector<HTMLElement>('.hero__portrait-layer');
  const contentCol = targetContainer.querySelector<HTMLElement>('.hero__col-content');
  const identityEl = targetContainer.querySelector<HTMLElement>('.hero__identity');
  const headlineLines = targetContainer.querySelectorAll<HTMLElement>('.hero__line');
  const supportingText = targetContainer.querySelector<HTMLElement>('.hero__supporting-text');
  const scrollCue = targetContainer.querySelector<HTMLElement>('.hero__scroll-cue');
  const header = typeof document !== 'undefined' ? document.querySelector<HTMLElement>('.site-header') : null;
  const canvas = targetContainer.querySelector<HTMLCanvasElement>('#hero-pixel-canvas');

  let isReducedMotion = scrollEngine.getState().prefersReducedMotion;
  const activeTweens: gsap.core.Tween[] = [];

  // =========================================================================
  // Pixel-Magnet Background Subsystem (Sparse, restrained ambient drift & magnet)
  // =========================================================================
  interface PixelParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    baseVy: number;
    size: number;
    color: string;
    alpha: number;
    wobblePhase: number;
    wobbleSpeed: number;
    wobbleAmp: number;
  }

  let pixelRafId: number | null = null;
  let particles: PixelParticle[] = [];
  let canvasWidth = 0;
  let canvasHeight = 0;
  let heroPointerActive = false;
  let heroPointerX = -9999;
  let heroPointerY = -9999;
  let isHeroVisible = true;
  let resizeObserver: ResizeObserver | null = null;

  const isTouchDevice =
    (typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(hover: none)').matches) ||
    (typeof window !== 'undefined' && 'ontouchstart' in window) ||
    (typeof window !== 'undefined' && window.innerWidth <= 768);

  function initPixelParticles(): void {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvasWidth = rect.width;
    canvasHeight = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(canvasWidth * dpr);
    canvas.height = Math.floor(canvasHeight * dpr);

    // Particle count: sparse, minimal, non-distracting
    // Desktop: ~45-55 particles over the entire 100vh hero canvas, mobile/touch: ~12
    const count = isTouchDevice ? 12 : Math.min(52, Math.max(28, Math.floor(canvasWidth / 30)));

    // Restored locked palette:
    // Mostly muted Sage (#B9B9A7 / #8FA18F) / Ivory (#F2EBDD), occasional Terracotta (#C87952)
    const palette = [
      '#B9B9A7', '#B9B9A7', '#B9B9A7', '#B9B9A7',
      '#8FA18F', '#8FA18F', '#8FA18F',
      '#F2EBDD', '#F2EBDD',
      '#C87952'
    ];

    particles = [];
    for (let i = 0; i < count; i++) {
      const color = palette[Math.floor(Math.random() * palette.length)];
      // Sparse tiny pixels, approximately 1-2px, opacity 0.2 - 0.45
      const size = Math.random() < 0.72 ? 1 : 2;
      const alpha = color === '#C87952' ? 0.35 : 0.22 + Math.random() * 0.22;
      const baseVy = 0.16 + Math.random() * 0.22; // very slow falling drift

      particles.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        vx: 0,
        vy: 0,
        baseVy,
        size,
        color,
        alpha,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.012 + Math.random() * 0.018,
        wobbleAmp: 0.12 + Math.random() * 0.18
      });
    }
  }

  function renderPixelCanvas(): void {
    if (!canvas || !isMounted || isReducedMotion || !isHeroVisible) {
      pixelRafId = null;
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const magnetRadius = 160;
    const magnetRadiusSq = magnetRadius * magnetRadius;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // 1. Continuous slow drift with slight horizontal variation
      p.wobblePhase += p.wobbleSpeed;
      const driftX = Math.sin(p.wobblePhase) * p.wobbleAmp;
      const driftY = p.baseVy;

      // 2. Magnetic attraction when mouse approaches (desktop only)
      if (heroPointerActive && !isTouchDevice) {
        const dx = heroPointerX - p.x;
        const dy = heroPointerY - p.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < magnetRadiusSq && distSq > 4) {
          const dist = Math.sqrt(distSq);
          const normDist = 1 - dist / magnetRadius; // 1 at cursor, 0 at outer boundary
          // Elastic / lagged attraction force
          const force = normDist * normDist * 0.45;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      // 3. Velocity damping: smoothly returns to ambient drift when cursor moves away
      p.vx *= 0.91;
      p.vy *= 0.91;

      p.x += driftX + p.vx;
      p.y += driftY + p.vy;

      // 4. Wrap around boundaries
      if (p.y > canvasHeight + 8) {
        p.y = -8;
        p.x = Math.random() * canvasWidth;
      } else if (p.y < -8) {
        p.y = canvasHeight + 8;
      }
      if (p.x > canvasWidth + 8) {
        p.x = -8;
      } else if (p.x < -8) {
        p.x = canvasWidth + 8;
      }

      // 5. Draw crisp physical pixel
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }

    ctx.globalAlpha = 1;
    pixelRafId = requestAnimationFrame(renderPixelCanvas);
  }

  function startPixelLoop(): void {
    if (pixelRafId !== null || isReducedMotion || !isMounted || !isHeroVisible) return;
    pixelRafId = requestAnimationFrame(renderPixelCanvas);
  }

  function stopPixelLoop(): void {
    if (pixelRafId !== null) {
      cancelAnimationFrame(pixelRafId);
      pixelRafId = null;
    }
  }

  function onHeroPointerMove(e: PointerEvent): void {
    if (!canvas || e.pointerType === 'touch' || isTouchDevice) return;
    const rect = canvas.getBoundingClientRect();
    heroPointerX = e.clientX - rect.left;
    heroPointerY = e.clientY - rect.top;
    heroPointerActive = true;
  }

  function onHeroPointerLeave(): void {
    heroPointerActive = false;
  }

  function onHeroPointerEnter(e: PointerEvent): void {
    if (!canvas || e.pointerType === 'touch' || isTouchDevice) return;
    const rect = canvas.getBoundingClientRect();
    heroPointerX = e.clientX - rect.left;
    heroPointerY = e.clientY - rect.top;
    heroPointerActive = true;
  }

  if (typeof ResizeObserver !== 'undefined' && canvas) {
    resizeObserver = new ResizeObserver(() => {
      initPixelParticles();
    });
    resizeObserver.observe(targetContainer);
  }

  targetContainer.addEventListener('pointermove', onHeroPointerMove, { passive: true });
  targetContainer.addEventListener('pointerleave', onHeroPointerLeave, { passive: true });
  targetContainer.addEventListener('pointerenter', onHeroPointerEnter, { passive: true });

  initPixelParticles();
  if (!isReducedMotion) {
    startPixelLoop();
  }

  // =========================================================================
  // 1. Entrance Animation Choreography
  // =========================================================================
  function runEntranceAnimation(): void {
    if (isReducedMotion || !isMounted) {
      applyReducedMotionStaticState();
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Initial hidden states
    if (portraitEl) gsap.set(portraitEl, { opacity: 0, scale: 0.98, y: 20 });
    if (identityEl) gsap.set(identityEl, { opacity: 0, y: 10 });
    if (supportingText) gsap.set(supportingText, { opacity: 0, y: 16 });
    if (scrollCue) gsap.set(scrollCue, { opacity: 0, y: 8 });
    if (header) gsap.set(header, { opacity: 0, y: -6 });

    headlineLines.forEach((line) => {
      gsap.set(line, { yPercent: 110 });
    });

    // Staggered restrained reveal sequence
    tl.to(header, { opacity: 1, y: 0, duration: 0.6 }, 0.05)
      .to(portraitEl, { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'power2.out' }, 0.15)
      .to(identityEl, { opacity: 1, y: 0, duration: 0.7 }, 0.25)
      .to(
        headlineLines,
        {
          yPercent: 0,
          duration: 0.95,
          stagger: 0.1,
          ease: 'power3.out'
        },
        0.3
      )
      .to(supportingText, { opacity: 1, y: 0, duration: 0.8 }, 0.55)
      .to(scrollCue, { opacity: 1, y: 0, duration: 0.6 }, 0.7);
  }

  function applyReducedMotionStaticState(): void {
    stopPixelLoop();
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (portraitEl) gsap.set(portraitEl, { opacity: 1, scale: 1, x: 0, y: 0 });
    if (contentCol) gsap.set(contentCol, { opacity: 1, x: 0, y: 0 });
    if (identityEl) gsap.set(identityEl, { opacity: 1, y: 0 });
    if (supportingText) gsap.set(supportingText, { opacity: 1, y: 0 });
    if (scrollCue) gsap.set(scrollCue, { opacity: 1, y: 0 });
    if (header) gsap.set(header, { opacity: 1, y: 0 });

    headlineLines.forEach((line) => {
      gsap.set(line, { yPercent: 0 });
    });
  }

  // =========================================================================
  // 2. Subtle Mouse / Parallax Response
  // =========================================================================
  let mouseX = 0;
  let mouseY = 0;
  let rafId: number | null = null;

  function onPointerMove(e: PointerEvent): void {
    if (isReducedMotion || !isMounted || e.pointerType === 'touch' || isTouchDevice || window.innerWidth <= 768) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    mouseX = (e.clientX / width - 0.5) * 2; // -1 to +1
    mouseY = (e.clientY / height - 0.5) * 2;

    if (rafId === null) {
      rafId = requestAnimationFrame(updateParallax);
    }
  }

  function updateParallax(): void {
    rafId = null;
    if (!isMounted || isReducedMotion) return;

    // Subtle restrained depth response:
    // Portrait shifts slightly opposite cursor for photographic depth
    if (portraitEl) {
      gsap.to(portraitEl, {
        x: -mouseX * 12,
        y: -mouseY * 8,
        duration: 0.85,
        ease: 'power1.out',
        overwrite: 'auto'
      });
    }

    // Typography shifts very gently with cursor
    if (contentCol) {
      gsap.to(contentCol, {
        x: mouseX * 6,
        y: mouseY * 4,
        duration: 0.85,
        ease: 'power1.out',
        overwrite: 'auto'
      });
    }
  }

  if (typeof window !== 'undefined' && !isReducedMotion) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  // =========================================================================
  // 3. Scroll Choreography & Transition toward WORK
  // =========================================================================
  const unsubscribeSection = scrollEngine.subscribeSection(SECTION_ID, (sectionState) => {
    if (!isMounted) return;

    // Pause pixel animation when hero is completely scrolled past to preserve GPU/battery
    if (sectionState.progress > 1.05) {
      if (isHeroVisible) {
        isHeroVisible = false;
        stopPixelLoop();
      }
    } else {
      if (!isHeroVisible && !isReducedMotion) {
        isHeroVisible = true;
        startPixelLoop();
      }
    }

    if (isReducedMotion) return;

    const progress = Math.max(0, Math.min(1, sectionState.progress));

    // Parallax scroll drift across progress
    if (portraitEl) {
      const scrollY = -progress * 60;
      gsap.to(portraitEl, {
        y: scrollY,
        opacity: 1 - Math.max(0, progress - 0.75) * 3, // soft fade toward end of hero
        duration: 0.2,
        ease: 'none',
        overwrite: 'auto'
      });
    }

    if (contentCol) {
      const scrollY = -progress * 45;
      gsap.to(contentCol, {
        y: scrollY,
        opacity: Math.max(0, 1 - progress * 1.3),
        duration: 0.2,
        ease: 'none',
        overwrite: 'auto'
      });
    }
  });

  // =========================================================================
  // 4. Reduced Motion Dynamic Sync
  // =========================================================================
  const unsubscribeGlobal = scrollEngine.subscribe((state) => {
    if (isReducedMotion === state.prefersReducedMotion) return;
    isReducedMotion = state.prefersReducedMotion;

    if (isReducedMotion) {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointermove', onPointerMove);
      }
      stopPixelLoop();
      applyReducedMotionStaticState();
    } else {
      if (typeof window !== 'undefined') {
        window.addEventListener('pointermove', onPointerMove, { passive: true });
      }
      startPixelLoop();
      runEntranceAnimation();
    }
  });

  // Start entrance animation
  runEntranceAnimation();

  return {
    sectionId: SECTION_ID,
    order: SECTION_ORDER,
    plannedTechnique: PLANNED_TECHNIQUE,
    implementedTechnique: IMPLEMENTED_TECHNIQUE,
    get mounted(): boolean {
      return isMounted;
    },
    update(): void {},
    dispose(): void {
      isMounted = false;
      stopPixelLoop();
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      targetContainer.removeEventListener('pointermove', onHeroPointerMove);
      targetContainer.removeEventListener('pointerleave', onHeroPointerLeave);
      targetContainer.removeEventListener('pointerenter', onHeroPointerEnter);

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointermove', onPointerMove);
      }
      activeTweens.forEach((t) => t.kill());
      unsubscribeSection();
      unsubscribeGlobal();
    }
  };
}
