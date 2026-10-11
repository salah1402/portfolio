import gsap from 'gsap';
import type { ISharedScrollEngine } from '../scroll/index.js';
import type { SectionPlaceholderHandle } from '../main.js';

export const SECTION_ID = 'services' as const;
export const SECTION_ORDER = 3 as const;
export const PLANNED_TECHNIQUE = 'standard-dom' as const;
export const IMPLEMENTED_TECHNIQUE = 'standard-dom' as const;

export const SCROLL_CHOREOGRAPHY = {
  pinned: true,
  scrollDistanceVh: 200,
  scrubSmoothing: 0.15
} as const;

export interface ServiceTierItem {
  id: string;
  number: string;
  title: string;
  status: string;
  lead: string;
  description: string;
  points: string[];
  timeline: string;
  price: string;
}

export const SERVICE_TIERS: ServiceTierItem[] = [
  {
    id: 'landing',
    number: '01',
    title: 'LANDING',
    status: 'SINGLE-PAGE',
    lead: 'Single-page cinematic site.',
    description:
      'Hero, 3-4 sections, contact. Built for product launches, personal brands, and one-pagers that need to hit hard in under a minute.',
    points: ['Custom design system', 'Motion & scroll choreography', 'Contact + form integration'],
    timeline: 'timeline · 1-2 weeks',
    price: "investment · let's talk"
  },
  {
    id: 'website',
    number: '02',
    title: 'WEBSITE',
    status: 'MULTI-PAGE',
    lead: 'Multi-page business site.',
    description:
      'Custom design, SEO, CMS-ready. For service providers and businesses that need a full digital presence with room to grow.',
    points: [
      '4-6 custom-designed pages',
      'SEO & performance tuned',
      'CMS or editable content layer'
    ],
    timeline: 'timeline · 2-4 weeks',
    price: "investment · let's talk"
  },
  {
    id: 'experience',
    number: '03',
    title: 'EXPERIENCE',
    status: 'IMMERSIVE',
    lead: 'Immersive 3D scroll-world or custom web app.',
    description:
      'WebGL, motion systems, integrations. For brands that want a signature digital presence - the kind of site people screenshot and share.',
    points: [
      'WebGL / 3D scroll-world',
      'Custom motion system',
      'API / backend integrations'
    ],
    timeline: 'timeline · 4-8 weeks',
    price: "investment · let's talk"
  }
];

export function mountSection_services(
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

  // Elements
  const header = targetContainer.querySelector<HTMLElement>('.services__header');
  const items = targetContainer.querySelectorAll<HTMLElement>('.services__item');
  const previewPanels = targetContainer.querySelectorAll<HTMLElement>('.services__preview-inner');

  let activeIndex = 0;
  let isReducedMotion = scrollEngine.getState().prefersReducedMotion;

  let isUserSelected = false;
  let userSelectTimer: ReturnType<typeof setTimeout> | null = null;

  function setActive(index: number, byUser = false): void {
    if (byUser) {
      isUserSelected = true;
      if (userSelectTimer) clearTimeout(userSelectTimer);
      userSelectTimer = setTimeout(() => {
        isUserSelected = false;
      }, 2500);
    }
    if (index === activeIndex && items[index]?.classList.contains('is-active')) return;
    const prevIndex = activeIndex;
    activeIndex = Math.max(0, Math.min(previewPanels.length - 1, index));

    // Update item active state
    items.forEach((item, i) => {
      if (i === activeIndex) {
        item.classList.add('is-active');
      } else {
        item.classList.remove('is-active');
      }
    });

    if (isReducedMotion) {
      previewPanels.forEach((panel) => {
        panel.removeAttribute('hidden');
        panel.style.opacity = '1';
      });
      return;
    }

    // Swap preview panels with fade
    previewPanels.forEach((panel, i) => {
      if (i === activeIndex) {
        panel.removeAttribute('hidden');
        gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      } else if (i === prevIndex) {
        gsap.to(panel, {
          opacity: 0,
          duration: 0.25,
          ease: 'power2.in',
          overwrite: 'auto',
          onComplete: () => {
            if (i !== activeIndex) {
              panel.setAttribute('hidden', '');
            }
          }
        });
      } else {
        panel.setAttribute('hidden', '');
        panel.style.opacity = '0';
      }
    });
  }

  function applyProgress(progress: number): void {
    if (!isMounted) return;

    if (isReducedMotion) {
      applyReducedMotionState();
      return;
    }

    const clamped = Math.max(0, Math.min(1, progress));

    // 0.00 - 0.10 -> header fades in
    if (header) {
      const headerProgress = Math.max(0, Math.min(1, clamped / 0.1));
      header.style.opacity = headerProgress.toString();
    }

    // Don't override if user recently tapped a tab
    if (isUserSelected) return;

    // 0.10 - 0.85 -> map progress to tier index: floor(((progress - 0.10) / 0.75) * 3) clamped to 0..2
    if (clamped >= 0.1 && clamped <= 0.85) {
      const tierNorm = (clamped - 0.1) / 0.75;
      const targetTier = Math.max(0, Math.min(2, Math.floor(tierNorm * 3)));
      setActive(targetTier);
    } else if (clamped < 0.1) {
      setActive(0);
    } else if (clamped > 0.85) {
      setActive(2);
    }
  }

  function applyReducedMotionState(): void {
    if (header) header.style.opacity = '1';
    items.forEach((item) => item.classList.add('is-active'));
    previewPanels.forEach((panel) => {
      panel.removeAttribute('hidden');
      panel.style.opacity = '1';
    });
  }

  // Click listeners for items
  const clickHandlers: Array<{ el: HTMLElement; fn: () => void }> = [];
  items.forEach((item, index) => {
    const fn = () => {
      setActive(index, true);
    };
    item.addEventListener('click', fn);
    clickHandlers.push({ el: item, fn });
  });

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
      const currentProgress = scrollEngine.getSectionState(SECTION_ID)?.progress ?? 0;
      applyProgress(currentProgress);
    }
  });

  // Initial setup
  if (isReducedMotion) {
    applyReducedMotionState();
  } else {
    items.forEach((item, i) => {
      if (i === 0) item.classList.add('is-active');
      else item.classList.remove('is-active');
    });
    previewPanels.forEach((panel, i) => {
      if (i === 0) {
        panel.removeAttribute('hidden');
        panel.style.opacity = '1';
      } else {
        panel.setAttribute('hidden', '');
        panel.style.opacity = '0';
      }
    });
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
      const currentProgress = scrollEngine.getSectionState(SECTION_ID)?.progress ?? 0;
      applyProgress(currentProgress);
    },
    dispose(): void {
      isMounted = false;
      if (userSelectTimer) clearTimeout(userSelectTimer);
      unsubscribeSection();
      unsubscribeGlobal();
      clickHandlers.forEach(({ el, fn }) => el.removeEventListener('click', fn));
    }
  };
}
