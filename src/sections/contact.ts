import gsap from 'gsap';
import type { ISharedScrollEngine } from '../scroll/index.js';
import type { SectionPlaceholderHandle } from '../main.js';

export const SECTION_ID = 'contact' as const;
export const SECTION_ORDER = 5 as const;
export const PLANNED_TECHNIQUE = 'standard-dom' as const;
export const IMPLEMENTED_TECHNIQUE = 'standard-dom' as const;

export const SCROLL_CHOREOGRAPHY = {
  pinned: false,
  scrollDistanceVh: 0,
  scrubSmoothing: 0
} as const;

export interface ContactItem {
  id: string;
  num: string;
  label: string;
  title: string;
  valueText: string;
  href: string;
  external: boolean;
}

export const CONTACT_ITEMS: ContactItem[] = [
  {
    id: 'start-convo',
    num: '01',
    label: 'COMMITMENT / WORK',
    title: 'START A CONVO',
    valueText: 'salauddin142008@gmail.com',
    href: 'mailto:salauddin142008@gmail.com?subject=Project%20Inquiry%20%E2%80%94%20Salah',
    external: false
  },
  {
    id: 'whatsapp',
    num: '02',
    label: 'INSTANT DIRECT',
    title: 'WHATSAPP',
    valueText: '+91 97900 94500',
    href: 'https://wa.me/919790094500',
    external: true
  },
  {
    id: 'call',
    num: '03',
    label: 'DIRECT LINE',
    title: 'CALL',
    valueText: '+91 97900 94500',
    href: 'tel:+919790094500',
    external: false
  },
  {
    id: 'github',
    num: '04',
    label: 'SOURCE ARCHIVE',
    title: 'GITHUB',
    valueText: 'github.com/salah1402',
    href: 'https://github.com/salah1402',
    external: true
  },
  {
    id: 'linkedin',
    num: '05',
    label: 'NETWORK & UPDATES',
    title: 'LINKEDIN',
    valueText: 'Mohamed Salauddin A',
    href: 'https://www.linkedin.com/in/mohamed-salauddin-a-b124593b1',
    external: true
  }
];

/**
 * Mounts the CONTACT section: Living Editorial Grid
 * - Exact asymmetric 3-col upper / 2-block lower architectural layout
 * - Soft warm cursor-following light moving through the container
 * - Subtle localized cell highlight & brighter thin border
 * - Refined 2-4px magnetic content follow + max 1.5° 3D tilt
 * - Arrow forward shift on approach/hover
 * - Restrained tactile click ripple
 * - Touch fallback: clean vertical editorial grid, interaction gracefully disabled
 */
export function mountSection_contact(
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

  const grid = targetContainer.querySelector<HTMLElement>('.contact__grid');
  const cells = Array.from(targetContainer.querySelectorAll<HTMLElement>('.contact__cell'));
  const glow = targetContainer.querySelector<HTMLElement>('.contact__glow');

  let isReducedMotion = scrollEngine.getState().prefersReducedMotion;
  const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const cleanupListeners: Array<() => void> = [];

  // Desktop Living Editorial Grid interactive behavior
  if (grid && !isTouch) {
    let mouseX = 0;
    let mouseY = 0;
    let isInside = false;

    const onGridEnter = () => {
      if (isReducedMotion) return;
      isInside = true;
      if (glow) {
        gsap.to(glow, { opacity: 1, duration: 0.4, ease: 'power2.out' });
      }
    };

    const onGridLeave = () => {
      isInside = false;
      if (glow) {
        gsap.to(glow, { opacity: 0, duration: 0.6, ease: 'power2.out' });
      }
    };

    const onGridMove = (e: MouseEvent) => {
      if (isReducedMotion) return;
      const rect = grid.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      // Update ambient spotlight position via CSS custom properties
      grid.style.setProperty('--mouse-x', `${mouseX}px`);
      grid.style.setProperty('--mouse-y', `${mouseY}px`);

      if (glow) {
        gsap.to(glow, {
          x: mouseX,
          y: mouseY,
          duration: 0.15,
          ease: 'power1.out',
          overwrite: 'auto'
        });
      }
    };

    grid.addEventListener('mouseenter', onGridEnter);
    grid.addEventListener('mouseleave', onGridLeave);
    grid.addEventListener('mousemove', onGridMove);

    cleanupListeners.push(() => {
      grid.removeEventListener('mouseenter', onGridEnter);
      grid.removeEventListener('mouseleave', onGridLeave);
      grid.removeEventListener('mousemove', onGridMove);
    });

    // Individual Cell Magnetic & Tilt Interactions
    cells.forEach((cell) => {
      const inner = cell.querySelector<HTMLElement>('.contact__cell-inner');
      const arrow = cell.querySelector<HTMLElement>('.contact__cell-arrow');

      const onCellMove = (e: MouseEvent) => {
        if (isReducedMotion) return;
        const rect = cell.getBoundingClientRect();
        const cellX = e.clientX - rect.left;
        const cellY = e.clientY - rect.top;

        // Normalized offsets [-1, 1]
        const normX = (cellX / rect.width) * 2 - 1;
        const normY = (cellY / rect.height) * 2 - 1;

        // Micro magnetic shift: 2px - 3.5px max
        const moveX = normX * 3.5;
        const moveY = normY * 3.5;

        // Ultra-subtle tilt: max 1.5 degrees
        const tiltX = -normY * 1.5;
        const tiltY = normX * 1.5;

        if (inner) {
          gsap.to(inner, {
            x: moveX,
            y: moveY,
            rotateX: tiltX,
            rotateY: tiltY,
            duration: 0.35,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }

        if (arrow) {
          gsap.to(arrow, {
            x: 4 + normX * 2,
            y: -4 + normY * 2,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      };

      const onCellLeave = () => {
        if (isReducedMotion) return;
        if (inner) {
          gsap.to(inner, {
            x: 0,
            y: 0,
            rotateX: 0,
            rotateY: 0,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }

        if (arrow) {
          gsap.to(arrow, {
            x: 0,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      };

      // Tactile restrained click ripple
      const onCellClick = (e: MouseEvent) => {
        if (isReducedMotion) return;
        const rect = cell.getBoundingClientRect();
        const rx = e.clientX - rect.left;
        const ry = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.className = 'contact__cell-ripple';
        ripple.style.left = `${rx}px`;
        ripple.style.top = `${ry}px`;
        cell.appendChild(ripple);

        gsap.fromTo(
          ripple,
          { scale: 0, opacity: 0.35 },
          {
            scale: 2.4,
            opacity: 0,
            duration: 0.65,
            ease: 'power2.out',
            onComplete: () => {
              ripple.remove();
            }
          }
        );
      };

      cell.addEventListener('mousemove', onCellMove);
      cell.addEventListener('mouseleave', onCellLeave);
      cell.addEventListener('click', onCellClick);

      cleanupListeners.push(() => {
        cell.removeEventListener('mousemove', onCellMove);
        cell.removeEventListener('mouseleave', onCellLeave);
        cell.removeEventListener('click', onCellClick);
      });
    });
  }

  // Scroll Engine subscription for accessibility / reduced motion
  const unsubscribeGlobal = scrollEngine.subscribe((state) => {
    if (isReducedMotion === state.prefersReducedMotion) return;
    isReducedMotion = state.prefersReducedMotion;
    if (isReducedMotion) {
      cells.forEach((cell) => {
        const inner = cell.querySelector<HTMLElement>('.contact__cell-inner');
        const arrow = cell.querySelector<HTMLElement>('.contact__cell-arrow');
        if (inner) gsap.set(inner, { clearProps: 'all' });
        if (arrow) gsap.set(arrow, { clearProps: 'all' });
      });
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
      unsubscribeGlobal();
      cleanupListeners.forEach((fn) => fn());
    }
  };
}
