import gsap from 'gsap';
import type { ISharedScrollEngine } from '../scroll/index.js';
import type { SectionPlaceholderHandle } from '../main.js';

export const SECTION_ID = 'about' as const;
export const SECTION_ORDER = 4 as const;
export const PLANNED_TECHNIQUE = 'standard-dom' as const;
export const IMPLEMENTED_TECHNIQUE = 'standard-dom' as const;

/**
 * The ABOUT section is unpinned: it does NOT capture, scrub, or respond
 * to page vertical scroll. Page scrolling moves the section normally.
 */
export const SCROLL_CHOREOGRAPHY = {
  pinned: false,
  scrollDistanceVh: 0,
  scrubSmoothing: 0
} as const;

export interface AboutCardData {
  number: string;
  tag: string;
  title: string;
  desc: string;
  points: string[];
  footerMeta: string;
}

export const ABOUT_CARDS: AboutCardData[] = [
  {
    number: '01',
    tag: 'PROFILE',
    title: 'ABOUT ME',
    desc: 'Software Developer · Vibe Coder\nI build thoughtful digital products, immersive web experiences, and AI-powered systems.',
    points: [
      'AI systems & autonomous agents',
      'Creative web development',
      'Interactive digital experiences'
    ],
    footerMeta: 'OPEN TO COMMITMENTS'
  },
  {
    number: '02',
    tag: 'ACADEMICS',
    title: 'EDUCATION',
    desc: 'B.Tech · Electronics & Communication Engineering\nDhanalakshmi Srinivasan University · 2025—2029',
    points: [
      'Computer Science & Engineering fundamentals',
      'Electronics & embedded systems',
      'AI, networks & system design'
    ],
    footerMeta: 'CONTINUOUS SELF-DIRECTED RESEARCH'
  },
  {
    number: '03',
    tag: 'ENGAGEMENT',
    title: 'PARTICIPATIONS',
    desc: 'Hackathons, Sprints & Community\nActive participant across fast-paced AI builder sprints, hackathons, and open-source ecosystems.',
    points: [
      'Rapid prototyping & hackathon builder sprints',
      'Autonomous agent frameworks & experiments',
      'Open-source contributions & architecture reviews'
    ],
    footerMeta: 'BUILD · SHIP · ITERATE'
  },
  {
    number: '04',
    tag: 'INQUIRY',
    title: 'EXPLORING',
    desc: 'Emerging Frontiers & Curiosities\nInvestigating real-time multi-agent orchestration, compact local SLMs, and spatial web canvases.',
    points: [
      'Multi-agent systems & orchestration',
      'Local AI / LLM inference',
      'Spatial & interactive web'
    ],
    footerMeta: 'RESEARCH & EXPERIMENTS'
  },
  {
    number: '05',
    tag: 'IN PROGRESS',
    title: 'CURRENTLY BUILDING',
    desc: 'Active Systems & Platforms\nShipping production-grade AI platforms and high-fidelity interactive digital experiences.',
    points: [
      'SAHARA · Legal Metrology AI',
      'Agentic systems & AI workflows',
      'Immersive web experiences'
    ],
    footerMeta: 'ACTIVE PIPELINE · 2026'
  },
  {
    number: '06',
    tag: 'PERSPECTIVES',
    title: 'BEYOND THE SCREEN',
    desc: 'Craft, Philosophy & Worldview\nGuided by patient craftsmanship, editorial minimalism, and the quiet pursuit of mastery.',
    points: [
      'Substance over spectacle',
      'Architecture & editorial design',
      'Patience, precision & craftsmanship'
    ],
    footerMeta: 'THE PURSUIT OF MASTERY'
  }
];

/**
 * Mounts the ABOUT section as the true 3D Cylindrical Circular Carousel:
 * - Wide, large horizontal cylindrical carousel dominating the section
 * - 6 crisp editorial warm-ivory cards positioned with equal angular spacing
 * - 04 and 05 naturally occupy the front region
 * - 03 and 06 progressively rotate away and recede
 * - 02 and 01 continue receding toward the sides
 * - Controlled overlap between neighbouring cards, no huge gaps
 * - Self-contained continuous drift and pointer drag with momentum
 * - Does NOT respond to page vertical scroll
 * - Hover on ANY card pauses the entire carousel immediately, freezes every card,
 *   gently scales up the hovered card (~1.05) and lifts it forward via translateZ (+32px),
 *   resuming drift on mouse leave.
 */
export function mountSection_about(
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
  const carousel = targetContainer.querySelector<HTMLElement>('#about-carousel') ||
                   targetContainer.querySelector<HTMLElement>('.circular-carousel') ||
                   targetContainer.querySelector<HTMLElement>('.about__carousel');
  const stage = targetContainer.querySelector<HTMLElement>('#about-stage') ||
                targetContainer.querySelector<HTMLElement>('.circular-carousel__stage');
  const camera = targetContainer.querySelector<HTMLElement>('#about-camera') ||
                 targetContainer.querySelector<HTMLElement>('.circular-carousel__camera');
  const ring = targetContainer.querySelector<HTMLElement>('#about-ring') ||
               targetContainer.querySelector<HTMLElement>('.circular-carousel__ring');
  const cardElements = Array.from(targetContainer.querySelectorAll<HTMLElement>('.circular-carousel__card'));
  const currIndicator = targetContainer.querySelector<HTMLElement>('.about-progress__curr');
  const totalCards = cardElements.length || 6;

  let isReducedMotion = scrollEngine.getState().prefersReducedMotion;

  // Initial angle:
  // Desktop: -210° places Card 04 at -30° and Card 05 at +30° (front region)
  // Mobile: -180° centers Card 04 directly at 0°
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  let currentAngle = isMobile ? -180 : -210;
  let targetAngle = currentAngle;
  let dragVelocity = 0;
  let isDragging = false;
  let isHovered = false;
  let hoveredIndex = -1;

  // Individual card hover lift state
  const cardHoverStates = Array.from({ length: totalCards }, () => ({
    scale: 1,
    zLift: 0
  }));

  function wrapDeg(deg: number): number {
    return ((((deg + 180) % 360) + 360) % 360) - 180;
  }

  /**
   * Computes responsive cylinder parameters using equal 60° angular steps
   */
  function getCylinderGeometry(): { radius: number; stepDeg: number; tilt: number; perspective: number } {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1440;
    if (width > 1200) {
      return {
        radius: 595,
        stepDeg: 60,
        tilt: -6.5,
        perspective: 2400
      };
    } else if (width > 768) {
      return {
        radius: 500,
        stepDeg: 60,
        tilt: -6.0,
        perspective: 2000
      };
    } else if (width > 420) {
      return {
        radius: 290,
        stepDeg: 60,
        tilt: -3.5,
        perspective: 1400
      };
    } else if (width > 360) {
      return {
        radius: 255,
        stepDeg: 60,
        tilt: -3.0,
        perspective: 1300
      };
    } else {
      return {
        radius: 225,
        stepDeg: 60,
        tilt: -2.5,
        perspective: 1200
      };
    }
  }

  function updateCameraTransform(): void {
    if (!camera || !stage) return;
    const width = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const { radius, tilt, perspective } = getCylinderGeometry();
    const camDist = width <= 360 ? radius + 230 : (width <= 768 ? radius + 190 : radius);
    stage.style.perspective = `${perspective}px`;
    camera.style.transform = `translate3d(0, ${width <= 768 ? -16 : -26}px, ${-camDist}px) rotateX(${tilt}deg)`;
  }

  updateCameraTransform();

  /**
   * Continuous animation loop: independent drift, drag momentum, and 3D card placement
   */
  let lastTime = performance.now();

  let isAboutVisible = true;

  const unsubscribeSection = scrollEngine.subscribeSection(SECTION_ID, (sectionState) => {
    if (!isMounted) return;
    // Section is active if progress > -0.2 and < 1.2
    isAboutVisible = sectionState.isActive || (sectionState.progress > -0.15 && sectionState.progress < 1.15);
  });

  function renderFrame(time: number): void {
    if (!isMounted || !isAboutVisible) {
      lastTime = time;
      return;
    }

    if (isReducedMotion) {
      renderStaticFallback();
      return;
    }

    const dt = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    const width = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const { radius, stepDeg, tilt, perspective } = getCylinderGeometry();
    const camDist = width <= 360 ? radius + 230 : (width <= 768 ? radius + 190 : radius);

    if (stage) stage.style.perspective = `${perspective}px`;
    if (camera) camera.style.transform = `translate3d(0, ${width <= 768 ? -16 : -26}px, ${-camDist}px) rotateX(${tilt}deg)`;

    // Movement physics:
    if (!isHovered) {
      if (isDragging) {
        const diff = targetAngle - currentAngle;
        currentAngle += diff * 0.45;
      } else {
        // Subtle continuous drift (~2.2 deg / sec)
        const driftSpeed = 2.2;
        currentAngle -= driftSpeed * dt;

        // Apply friction decay to drag velocity
        if (Math.abs(dragVelocity) > 0.05) {
          currentAngle += dragVelocity * dt;
          dragVelocity *= 0.93;
        } else {
          dragVelocity = 0;
        }
      }
    } else {
      // HOVER FREEZE: Carousel stops immediately and locks every card in place
      dragVelocity = 0;
      targetAngle = currentAngle;
    }

    // Update 3D ring transform
    if (ring) {
      ring.style.transform = `rotateY(${currentAngle.toFixed(2)}deg)`;
    }

    // Place each card rigidly on the 3D cylinder ring
    cardElements.forEach((card, index) => {
      const base = index * stepDeg;
      const isHov = hoveredIndex === index;
      const hover = cardHoverStates[index];
      const zBoost = hover.zLift;
      const finalScale = hover.scale;

      // Rigid cylinder transform + individual hover lift
      card.style.transform = `rotateY(${base}deg) translateZ(${(radius + zBoost).toFixed(2)}px) scale(${finalScale.toFixed(3)})`;

      // World angle relative to camera
      const worldAngle = wrapDeg(base + currentAngle);
      const facing = Math.cos((worldAngle * Math.PI) / 180);

      // Smooth depth shading for front and back faces (increased rear-card visibility)
      const frontFade = Math.max(0, 0.30 * Math.pow(Math.max(0, (1 - facing) / 2), 1.2));
      const backFade = Math.max(0, 0.30 * Math.pow(Math.max(0, (1 + facing) / 2), 1.2));

      const frontShade = card.querySelector<HTMLElement>('.circular-carousel__tile--front .card-shade');
      if (frontShade) frontShade.style.opacity = frontFade.toFixed(3);
      const backShade = card.querySelector<HTMLElement>('.circular-carousel__tile--back .card-shade');
      if (backShade) backShade.style.opacity = backFade.toFixed(3);

      // Depth z-index
      const baseZIndex = Math.round(100 - Math.abs(worldAngle));
      card.style.zIndex = (isHov ? 500 : baseZIndex).toString();

      // On narrow mobile devices, fade cards that recede into the sides/back so the front card is crisp
      if (width <= 768) {
        const absAngle = Math.abs(worldAngle);
        const mobileOpacity = absAngle > 45 ? 0 : Math.max(0, 1 - Math.pow(absAngle / 35, 2));
        card.style.opacity = mobileOpacity.toFixed(2);
      } else {
        card.style.opacity = '1';
      }
    });

    // Update 01 / 06 indicator based on actual card facing the viewer
    const activeIndex = ((Math.round(-currentAngle / stepDeg) % totalCards) + totalCards) % totalCards;
    if (currIndicator) {
      currIndicator.textContent = `0${activeIndex + 1}`;
    }
    cardElements.forEach((c, idx) => c.classList.toggle('is-active', idx === activeIndex));
  }

  function renderStaticFallback(): void {
    if (currIndicator) {
      currIndicator.textContent = '04';
    }
    cardElements.forEach((card, index) => {
      card.classList.remove('is-hovered');
      card.classList.toggle('is-active', index === 3);
      card.style.visibility = 'visible';
      card.style.opacity = '1';
      card.style.transform = 'none';
      card.style.zIndex = 'auto';
    });
  }

  // Hook into continuous ticker
  gsap.ticker.add(renderFrame);

  // Resize listener
  const onResize = () => {
    updateCameraTransform();
  };
  window.addEventListener('resize', onResize);

  const cleanupListeners: Array<() => void> = [
    () => window.removeEventListener('resize', onResize)
  ];

  // 1. Hover interaction listeners on cards:
  cardElements.forEach((card, index) => {
    const onEnter = (e: MouseEvent) => {
      if (isReducedMotion) return;
      if (typeof window !== 'undefined' && (window.innerWidth <= 768 || window.matchMedia('(hover: none)').matches)) return;
      if ('pointerType' in e && (e as any).pointerType === 'touch') return;
      isHovered = true;
      hoveredIndex = index;
      dragVelocity = 0;
      targetAngle = currentAngle;

      card.classList.add('is-hovered');
      // Subtle premium scale (~1.05) and translateZ (+36px toward viewer)
      gsap.to(cardHoverStates[index], {
        scale: 1.05,
        zLift: 36,
        duration: 0.32,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    };

    const onLeave = () => {
      if (isReducedMotion) return;
      card.classList.remove('is-hovered');
      // Smoothly restore scale and depth
      gsap.to(cardHoverStates[index], {
        scale: 1.0,
        zLift: 0,
        duration: 0.28,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: () => {
          if (hoveredIndex === index) {
            isHovered = false;
            hoveredIndex = -1;
          }
        }
      });
    };

    const onClick = () => {
      if (isReducedMotion || hasDragged) return;
      const { stepDeg } = getCylinderGeometry();
      let target = -index * stepDeg;
      target += 360 * Math.round((currentAngle - target) / 360);
      targetAngle = target;
      dragVelocity = 0;
    };

    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mouseleave', onLeave);
    card.addEventListener('click', onClick);

    cleanupListeners.push(() => {
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mouseleave', onLeave);
      card.removeEventListener('click', onClick);
    });
  });

  // 2. Drag & Momentum pointer listeners on carousel:
  let hasDragged = false;
  if (carousel) {
    let pointerStartX = 0;
    let pointerLastX = 0;
    let pointerLastTime = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (isReducedMotion) return;
      if (e.pointerType !== 'touch' && e.button !== 0) return;
      isDragging = true;
      hasDragged = false;
      isHovered = false;
      pointerStartX = e.clientX;
      pointerLastX = e.clientX;
      pointerLastTime = performance.now();
      dragVelocity = 0;
      carousel.classList.add('is-dragging');
      try {
        carousel.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      if (Math.abs(e.clientX - pointerStartX) > 6) {
        hasDragged = true;
      }
      const now = performance.now();
      const dt = Math.max((now - pointerLastTime) / 1000, 0.008);
      const dx = e.clientX - pointerLastX;
      pointerLastX = e.clientX;
      pointerLastTime = now;

      const { radius } = getCylinderGeometry();
      const perPixel = 180 / (Math.PI * radius);
      const angleDelta = dx * perPixel;
      targetAngle += angleDelta;
      currentAngle += angleDelta;
      dragVelocity = angleDelta / dt;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      carousel.classList.remove('is-dragging');
      try {
        carousel.releasePointerCapture(e.pointerId);
      } catch {}
      dragVelocity = Math.max(-120, Math.min(120, dragVelocity * 0.4));
    };

    carousel.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    cleanupListeners.push(() => {
      carousel.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    });
  }

  // Global engine changes (reduced motion toggle)
  const unsubscribeGlobal = scrollEngine.subscribe((state) => {
    if (isReducedMotion === state.prefersReducedMotion) return;
    isReducedMotion = state.prefersReducedMotion;
    if (isReducedMotion) {
      renderStaticFallback();
    }
  });

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
      gsap.ticker.remove(renderFrame);
      unsubscribeSection();
      unsubscribeGlobal();
      cleanupListeners.forEach((fn) => fn());
    }
  };
}
