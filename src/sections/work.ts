import gsap from 'gsap';
import type { ISharedScrollEngine } from '../scroll/index.js';
import type { SectionPlaceholderHandle } from '../main.js';

export const SECTION_ID = 'work' as const;
export const SECTION_ORDER = 2 as const;
export const PLANNED_TECHNIQUE = 'standard-dom' as const;
export const IMPLEMENTED_TECHNIQUE = 'standard-dom' as const;

export const SCROLL_CHOREOGRAPHY = {
  pinned: true,
  scrollDistanceVh: 300,
  scrubSmoothing: 0.15
} as const;

export interface ProjectItem {
  id: string;
  number: string;
  title: string;
  category: string;
  status: string;
  year: string;
  description: string;
  tags: string[];
  link?: string;
  isDummy?: boolean;
}

export const PROJECTS: ProjectItem[] = [
  {
    id: 'sahara',
    number: '01',
    title: 'SAHARA — Legal Metrology Inspection System',
    category: 'Legal Metrology Inspection System',
    status: 'AI INSPECTION SYSTEM',
    year: '2026',
    description:
      'AI-powered legal metrology inspection system that extracts product-label data, checks PCR 2011 compliance, and generatess inspection reports.',
    tags: [
      'React',
      'Vite',
      'FastAPI',
      'Python',
      'NVIDIA Nemotron OCR v2',
      'Nemotron 3 Ultra 550B',
      'ReportLab',
      'Vercel',
      'Render'
    ],
    link: 'https://saharalegalmetrology.vercel.app',
    isDummy: false
  },
  {
    id: 'privilege-interior',
    number: '02',
    title: 'PRIVILEGE INTERIOR',
    category: 'Full Home Interior Design Solutions',
    status: 'SPATIAL & INTERIOR DESIGN',
    year: '2001—PRESENT',
    description:
      'Complete home interior design and spatial solutions across bespoke residential living, modular kitchens, custom cabinetry, and commercial environments.',
    tags: [
      'Full Home Interiors',
      'Modular Kitchens',
      'Living & Bedroom Plans',
      'False Ceiling Design',
      'Flooring & Furniture',
      'Commercial Spaces',
      'Turnkey Execution'
    ],
    link: 'https://privilegeinteriorsolutions.com',
    isDummy: false
  },
  {
    id: 'dummy-03',
    number: '03',
    title: 'DUMMY PROJECT 03',
    category: 'Future Project Slot · Cloud Architecture',
    status: 'PLACEHOLDER SLOT',
    year: '2025',
    description:
      'Intentional placeholder reservation for an upcoming cloud-native system, distributed architecture, and event-sourced workflow engine.',
    tags: ['Placeholder Slot', 'Distributed Systems', 'Cloud Native', 'In Progress'],
    link: '#dummy-03',
    isDummy: true
  },
  {
    id: 'dummy-04',
    number: '04',
    title: 'DUMMY PROJECT 04',
    category: 'Future Project Slot · Experimental Lab',
    status: 'PLACEHOLDER SLOT',
    year: '2026',
    description:
      'Intentional placeholder reservation for an upcoming exploration in generative UI authoring, human-AI systems, and spatial ambient interaction.',
    tags: ['Placeholder Slot', 'Generative UI', 'Spatial Canvas', 'Research'],
    link: '#dummy-04',
    isDummy: true
  }
];

/**
 * Mounts the WORK section with Veloria-inspired 4-stage layered choreography:
 * - Large visual composition stage
 * - Layered project detail cards sliding into position
 * - Numbered side progress rail indicator
 * - Synchronized via the single SharedScrollEngine
 */
export function mountSection_work(
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
  const railItems = targetContainer.querySelectorAll<HTMLElement>('.work__rail-item');
  const railProgressBar = targetContainer.querySelector<HTMLElement>('.work__rail-progress-bar');
  const visualSlides = targetContainer.querySelectorAll<HTMLElement>('.work__visual-slide');
  const cards = targetContainer.querySelectorAll<HTMLElement>('.work__card');
  const counterCurrent = targetContainer.querySelector<HTMLElement>('.work__header-counter .current-stage');

  let isReducedMotion = scrollEngine.getState().prefersReducedMotion;
  const totalStages = 4;
  let isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  let activeMobileStage = 0;

  function setMobileStage(index: number): void {
    activeMobileStage = Math.max(0, Math.min(totalStages - 1, index));

    // Update rail
    railItems.forEach((item, i) => {
      if (i === activeMobileStage) {
        item.classList.add('is-active');
        try {
          item.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
        } catch {}
      } else {
        item.classList.remove('is-active');
      }
    });

    if (counterCurrent) {
      counterCurrent.textContent = `0${activeMobileStage + 1}`;
    }

    // Update visual slides
    visualSlides.forEach((slide, i) => {
      if (i === activeMobileStage) {
        slide.classList.add('is-active');
        gsap.to(slide, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
      } else {
        slide.classList.remove('is-active');
        gsap.to(slide, { opacity: 0, scale: 0.98, duration: 0.2, ease: 'power2.in', overwrite: 'auto' });
      }
    });

    // Update cards
    cards.forEach((card, i) => {
      if (i === activeMobileStage) {
        card.classList.add('is-active');
        gsap.to(card, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
          pointerEvents: 'auto',
          overwrite: 'auto'
        });
      } else {
        card.classList.remove('is-active');
        gsap.to(card, {
          opacity: 0,
          y: 12,
          scale: 0.98,
          duration: 0.2,
          ease: 'power2.in',
          pointerEvents: 'none',
          overwrite: 'auto'
        });
      }
    });
  }

  /**
   * Updates stage presentation based on normalized progress [0, 1]
   */
  function applyProgress(progress: number): void {
    if (!isMounted) return;

    if (isMobile) {
      // In mobile mode, stages are controlled directly via tabs/swipes
      return;
    }

    if (isReducedMotion) {
      applyReducedMotionState();
      return;
    }

    const clampedProgress = Math.max(0, Math.min(1, progress));
    // Virtual position across 0 to (totalStages - 1)
    const virtualPos = clampedProgress * (totalStages - 1);
    const activeStageIndex = Math.min(totalStages - 1, Math.floor(clampedProgress * totalStages));

    // 1. Update side rail indicator
    if (railProgressBar) {
      const progressPercent = clampedProgress * 100;
      railProgressBar.style.transform = `scaleY(${Math.max(0.04, clampedProgress)})`;
    }

    railItems.forEach((item, index) => {
      const isActive = index === activeStageIndex;
      if (isActive) {
        item.classList.add('is-active');
      } else {
        item.classList.remove('is-active');
      }
    });

    if (counterCurrent) {
      counterCurrent.textContent = `0${activeStageIndex + 1}`;
    }

    // 2. Continuous interpolation for cards
    cards.forEach((card, index) => {
      const diff = virtualPos - index;
      let opacity = 0;
      let y = 0;
      let scale = 1;

      if (diff >= -1 && diff <= 1) {
        opacity = 1 - Math.abs(diff);
        opacity = Math.pow(Math.max(0, opacity), 0.7);
        y = -diff * 40;
        scale = 1 - Math.abs(diff) * 0.03;
      } else if (diff < -1) {
        opacity = 0;
        y = 50;
        scale = 0.97;
      } else {
        opacity = 0;
        y = -40;
        scale = 0.97;
      }

      gsap.set(card, {
        opacity: Math.max(0, Math.min(1, opacity)),
        y,
        scale,
        pointerEvents: Math.abs(diff) < 0.4 ? 'auto' : 'none',
        zIndex: Math.abs(diff) < 0.5 ? 10 : 1
      });
    });

    // 3. Continuous interpolation for visual slides
    visualSlides.forEach((slide, index) => {
      const diff = virtualPos - index;
      let opacity = 0;
      let scale = 1;

      if (diff >= -1 && diff <= 1) {
        opacity = 1 - Math.abs(diff);
        opacity = Math.pow(Math.max(0, opacity), 0.85);
        scale = 1 - diff * 0.04;
      } else {
        opacity = 0;
      }

      gsap.set(slide, {
        opacity: Math.max(0, Math.min(1, opacity)),
        scale,
        zIndex: Math.abs(diff) < 0.5 ? 5 : 1
      });
    });
  }

  function applyReducedMotionState(): void {
    if (railProgressBar) {
      railProgressBar.style.transform = 'scaleY(1)';
    }
    cards.forEach((card) => {
      gsap.set(card, {
        opacity: 1,
        y: 0,
        scale: 1,
        pointerEvents: 'auto',
        zIndex: 'auto'
      });
    });
    visualSlides.forEach((slide) => {
      gsap.set(slide, {
        opacity: 1,
        scale: 1,
        zIndex: 'auto'
      });
    });
  }

  // Click on rail item: on mobile switch stage directly; on desktop scroll to stage
  const railClickHandlers: Array<{ el: HTMLElement; fn: (e: MouseEvent) => void }> = [];
  railItems.forEach((item, index) => {
    const handler = (e: MouseEvent) => {
      if (isMobile) {
        e.preventDefault();
        setMobileStage(index);
        return;
      }
      if (isReducedMotion) return;
      const targetRatio = index / (totalStages - 1);
      const sectionState = scrollEngine.getSectionState(SECTION_ID);
      const triggerEl = targetContainer;
      const rect = triggerEl.getBoundingClientRect();
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      const sectionTop = currentScroll + rect.top;
      const totalDistancePx = (SCROLL_CHOREOGRAPHY.scrollDistanceVh / 100) * window.innerHeight;
      const targetScroll = sectionTop + targetRatio * totalDistancePx;

      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    };
    item.addEventListener('click', handler);
    railClickHandlers.push({ el: item, fn: handler });
  });

  // Mobile touch swipe gesture support
  let touchStartX = 0;
  let touchStartY = 0;
  const onTouchStart = (e: TouchEvent) => {
    if (!isMobile) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (!isMobile) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0 && activeMobileStage < totalStages - 1) {
        setMobileStage(activeMobileStage + 1);
      } else if (dx > 0 && activeMobileStage > 0) {
        setMobileStage(activeMobileStage - 1);
      }
    }
  };
  targetContainer.addEventListener('touchstart', onTouchStart, { passive: true });
  targetContainer.addEventListener('touchend', onTouchEnd, { passive: true });

  // Handle window resize between mobile and desktop modes
  const onResize = () => {
    const wasMobile = isMobile;
    isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    if (isMobile !== wasMobile) {
      if (isMobile) {
        setMobileStage(activeMobileStage);
      } else {
        const currentProgress = scrollEngine.getSectionState(SECTION_ID)?.progress ?? 0;
        applyProgress(currentProgress);
      }
    }
  };
  window.addEventListener('resize', onResize);

  // Subscribe to section scroll updates from shared scroll engine
  const unsubscribeSection = scrollEngine.subscribeSection(SECTION_ID, (sectionState) => {
    if (!isMounted) return;
    applyProgress(sectionState.progress);
  });

  // Subscribe to global engine changes (e.g. reduced motion toggle)
  const unsubscribeGlobal = scrollEngine.subscribe((state) => {
    if (isReducedMotion === state.prefersReducedMotion) return;
    isReducedMotion = state.prefersReducedMotion;
    if (isReducedMotion) {
      applyReducedMotionState();
    } else {
      if (isMobile) {
        setMobileStage(activeMobileStage);
      } else {
        const currentProgress = scrollEngine.getSectionState(SECTION_ID)?.progress ?? 0;
        applyProgress(currentProgress);
      }
    }
  });

  // Initial render
  if (isMobile) {
    setMobileStage(0);
  } else {
    applyProgress(0);
  }

  return {
    sectionId: SECTION_ID,
    order: SECTION_ORDER,
    plannedTechnique: PLANNED_TECHNIQUE,
    implementedTechnique: IMPLEMENTED_TECHNIQUE,
    get mounted(): boolean {
      return isMounted;
    },
    update(): void {
      if (isMobile) {
        setMobileStage(activeMobileStage);
      } else {
        const currentProgress = scrollEngine.getSectionState(SECTION_ID)?.progress ?? 0;
        applyProgress(currentProgress);
      }
    },
    dispose(): void {
      isMounted = false;
      unsubscribeSection();
      unsubscribeGlobal();
      window.removeEventListener('resize', onResize);
      targetContainer.removeEventListener('touchstart', onTouchStart);
      targetContainer.removeEventListener('touchend', onTouchEnd);
      railClickHandlers.forEach(({ el, fn }) => el.removeEventListener('click', fn));
    }
  };
}
