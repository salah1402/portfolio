/**
 * Entrypoint for salah-portfolio.
 * Initializes a single SharedScrollEngine and mounts sections.
 */
import { createSharedScrollEngine, type ISharedScrollEngine } from './scroll/index.js';
import {
  mountSection_hero,
  SECTION_ID as HERO_SECTION_ID,
  SCROLL_CHOREOGRAPHY as HERO_CHOREOGRAPHY
} from './sections/hero.js';
import {
  mountSection_work,
  SECTION_ID as WORK_SECTION_ID,
  SCROLL_CHOREOGRAPHY as WORK_CHOREOGRAPHY
} from './sections/work.js';
import {
  mountSection_about,
  SECTION_ID as ABOUT_SECTION_ID,
  SCROLL_CHOREOGRAPHY as ABOUT_CHOREOGRAPHY
} from './sections/about.js';
import {
  mountSection_contact,
  SECTION_ID as CONTACT_SECTION_ID,
  SCROLL_CHOREOGRAPHY as CONTACT_CHOREOGRAPHY
} from './sections/contact.js';
import { initNavigationDock } from './navigation/dock.js';

export interface SectionPlaceholderHandle {
  readonly sectionId: string;
  readonly order: number;
  readonly plannedTechnique: string;
  readonly implementedTechnique: string;
  readonly mounted: boolean;
  resize?(width: number, height: number, dpr?: number): void;
  update?(deltaSeconds?: number): unknown;
  dispose(): void;
}

export interface SharedScrollEnginePlaceholder extends ISharedScrollEngine {
  readonly singleInstance: true;
  readonly smoothScroll: boolean;
  readonly lerpFactor: number;
}

function createSharedScrollEnginePlaceholder(config: {
  smoothScroll: boolean;
  lerpFactor: number;
}): SharedScrollEnginePlaceholder {
  const engine = createSharedScrollEngine({
    smoothScroll: config.smoothScroll,
    lerpFactor: config.lerpFactor,
    respectReducedMotion: true
  });
  engine.init();
  return {
    singleInstance: true,
    smoothScroll: config.smoothScroll,
    lerpFactor: config.lerpFactor,
    init() {
      engine.init();
    },
    registerSection(secConfig) {
      return engine.registerSection(secConfig);
    },
    unregisterSection(sectionId) {
      engine.unregisterSection(sectionId);
    },
    getState() {
      return engine.getState();
    },
    getSectionState(sectionId) {
      return engine.getSectionState(sectionId);
    },
    subscribe(listener) {
      return engine.subscribe(listener);
    },
    subscribeSection(sectionId, listener) {
      return engine.subscribeSection(sectionId, listener);
    },
    onSectionLifecycle(listener) {
      return engine.onSectionLifecycle(listener);
    },
    createSectionTimeline(sectionId, vars) {
      return engine.createSectionTimeline(sectionId, vars);
    },
    scrollTo(target, options) {
      engine.scrollTo(target, options);
    },
    refresh() {
      engine.refresh();
    },
    destroy() {
      engine.destroy();
    }
  };
}

export function bootstrapSite(): {
  scrollEngine: SharedScrollEnginePlaceholder;
  sections: SectionPlaceholderHandle[];
  dispose(): void;
} {
  const scrollEngine = createSharedScrollEnginePlaceholder({
    smoothScroll: true,
    lerpFactor: 0.08
  });
  const mountedSections: SectionPlaceholderHandle[] = [];

  const heroContainer =
    typeof document !== 'undefined' ? document.getElementById(HERO_SECTION_ID) : null;
  const isReducedMotion = scrollEngine.getState().prefersReducedMotion;
  const isPinned = !isReducedMotion && HERO_CHOREOGRAPHY.pinned;
  const distanceVh = isPinned ? HERO_CHOREOGRAPHY.scrollDistanceVh : 0;

  if (heroContainer && heroContainer.style) {
    heroContainer.style.minHeight = isPinned ? `${distanceVh}vh` : '100vh';
  }

  scrollEngine.registerSection({
    id: HERO_SECTION_ID,
    element: `#${HERO_SECTION_ID}`,
    order: 1,
    pinned: isPinned,
    scrollDistanceVh: distanceVh,
    start: 'top top',
    end: 'bottom top'
  });

  const heroHandle = mountSection_hero(scrollEngine, heroContainer);
  mountedSections.push(heroHandle);

  // SECTION 02: WORK
  const workContainer =
    typeof document !== 'undefined' ? document.getElementById(WORK_SECTION_ID) : null;
  const isWorkPinned = !isReducedMotion && WORK_CHOREOGRAPHY.pinned;
  const workDistanceVh = isWorkPinned ? WORK_CHOREOGRAPHY.scrollDistanceVh : 0;

  if (workContainer && workContainer.style) {
    workContainer.style.minHeight = isWorkPinned ? '100vh' : 'auto';
  }

  scrollEngine.registerSection({
    id: WORK_SECTION_ID,
    element: `#${WORK_SECTION_ID}`,
    order: 2,
    pinned: isWorkPinned,
    scrollDistanceVh: workDistanceVh,
    start: 'top top',
    end: () => `+=${Math.round((workDistanceVh / 100) * window.innerHeight)}`
  });

  const workHandle = mountSection_work(scrollEngine, workContainer);
  mountedSections.push(workHandle);

  // SECTION 03: ABOUT (Unpinned 3D Circular Carousel Section)
  const aboutContainer =
    typeof document !== 'undefined' ? document.getElementById(ABOUT_SECTION_ID) : null;

  if (aboutContainer && aboutContainer.style) {
    aboutContainer.style.minHeight = '100vh';
  }

  scrollEngine.registerSection({
    id: ABOUT_SECTION_ID,
    element: `#${ABOUT_SECTION_ID}`,
    order: 3,
    pinned: false,
    scrollDistanceVh: 0,
    start: 'top bottom',
    end: 'bottom top'
  });

  const aboutHandle = mountSection_about(scrollEngine, aboutContainer);
  mountedSections.push(aboutHandle);

  // SECTION 04: CONTACT (Living Editorial Grid Section)
  const contactContainer =
    typeof document !== 'undefined' ? document.getElementById(CONTACT_SECTION_ID) : null;

  if (contactContainer && contactContainer.style) {
    contactContainer.style.minHeight = '100vh';
  }

  scrollEngine.registerSection({
    id: CONTACT_SECTION_ID,
    element: `#${CONTACT_SECTION_ID}`,
    order: 4,
    pinned: false,
    scrollDistanceVh: 0,
    start: 'top bottom',
    end: 'bottom top'
  });

  const contactHandle = mountSection_contact(scrollEngine, contactContainer);
  mountedSections.push(contactHandle);

  scrollEngine.refresh();

  // Smooth scroll delegation for in-page anchors
  function handleAnchorClick(e: MouseEvent): void {
    const targetLink = (e.target as HTMLElement)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!targetLink) return;

    const href = targetLink.getAttribute('href');
    if (!href || href === '#') return;

    const targetEl = document.querySelector<HTMLElement>(href);
    if (targetEl) {
      e.preventDefault();
      scrollEngine.scrollTo(targetEl, {
        duration: isReducedMotion ? 0.01 : 1.2,
        immediate: isReducedMotion
      });
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('click', handleAnchorClick);
  }

  // Dynamically update pin registration if prefers-reduced-motion toggles
  let removeMotionListener: (() => void) | null = null;
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleReducedChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const isReduced = e.matches;
      const shouldHeroPin = !isReduced && HERO_CHOREOGRAPHY.pinned;
      if (heroContainer && heroContainer.style) {
        heroContainer.style.minHeight = shouldHeroPin
          ? `${HERO_CHOREOGRAPHY.scrollDistanceVh}vh`
          : '100vh';
      }
      scrollEngine.registerSection({
        id: HERO_SECTION_ID,
        element: `#${HERO_SECTION_ID}`,
        order: 1,
        pinned: shouldHeroPin,
        scrollDistanceVh: shouldHeroPin ? HERO_CHOREOGRAPHY.scrollDistanceVh : 0
      });

      const shouldWorkPin = !isReduced && WORK_CHOREOGRAPHY.pinned;
      if (workContainer && workContainer.style) {
        workContainer.style.minHeight = shouldWorkPin ? '100vh' : 'auto';
      }
      scrollEngine.registerSection({
        id: WORK_SECTION_ID,
        element: `#${WORK_SECTION_ID}`,
        order: 2,
        pinned: shouldWorkPin,
        scrollDistanceVh: shouldWorkPin ? WORK_CHOREOGRAPHY.scrollDistanceVh : 0
      });

      const shouldAboutPin = !isReduced && ABOUT_CHOREOGRAPHY.pinned;
      if (aboutContainer && aboutContainer.style) {
        aboutContainer.style.minHeight = shouldAboutPin ? '100vh' : 'auto';
      }
      scrollEngine.registerSection({
        id: ABOUT_SECTION_ID,
        element: `#${ABOUT_SECTION_ID}`,
        order: 3,
        pinned: shouldAboutPin,
        scrollDistanceVh: shouldAboutPin ? ABOUT_CHOREOGRAPHY.scrollDistanceVh : 0
      });

      scrollEngine.refresh();
    };
    mql.addEventListener('change', handleReducedChange);
    removeMotionListener = () => mql.removeEventListener('change', handleReducedChange);
  }

  const navDockHandle = initNavigationDock();

  return {
    scrollEngine,
    sections: mountedSections,
    dispose(): void {
      navDockHandle.dispose();
      if (typeof document !== 'undefined') {
        document.removeEventListener('click', handleAnchorClick);
      }
      if (removeMotionListener) {
        removeMotionListener();
      }
      for (let i = mountedSections.length - 1; i >= 0; i -= 1) {
        mountedSections[i].dispose();
      }
      scrollEngine.destroy();
    }
  };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  (window as unknown as Record<string, unknown>).__SCROLL_SITE_RUNTIME__ = bootstrapSite();
}
