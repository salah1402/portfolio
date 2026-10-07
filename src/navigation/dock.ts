/**
 * Compact Sable-Inspired Proximity Navigation Dock
 * Provides smooth spring-like proximity expansion and shifting for header nav items.
 */

interface DockItemState {
  el: HTMLElement;
  targetScale: number;
  currentScale: number;
  targetShift: number;
  currentShift: number;
}

export interface NavigationDockHandle {
  dispose(): void;
}

export function initNavigationDock(dockEl?: HTMLElement | null): NavigationDockHandle {
  const dock =
    dockEl ?? (typeof document !== 'undefined' ? document.getElementById('nav-dock') : null);

  if (!dock || typeof window === 'undefined') {
    return { dispose() {} };
  }

  const isReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice =
    (typeof window.matchMedia === 'function' && window.matchMedia('(hover: none)').matches) ||
    (typeof window !== 'undefined' && 'ontouchstart' in window) ||
    (typeof window !== 'undefined' && window.innerWidth <= 768);

  // Reduced motion or touch: maintain static clean links with CSS transitions only
  if (isReducedMotion || isTouchDevice) {
    return { dispose() {} };
  }

  const linkElements = Array.from(dock.querySelectorAll<HTMLElement>('.nav-dock__link'));
  if (linkElements.length === 0) {
    return { dispose() {} };
  }

  const items: DockItemState[] = linkElements.map((el) => ({
    el,
    targetScale: 1,
    currentScale: 1,
    targetShift: 0,
    currentShift: 0
  }));

  let isHovering = false;
  let rafId: number | null = null;
  const springFactor = 0.22; // smooth spring lerp

  function renderFrame() {
    let active = false;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.currentScale += (item.targetScale - item.currentScale) * springFactor;
      item.currentShift += (item.targetShift - item.currentShift) * springFactor;

      const scaleDelta = Math.abs(item.targetScale - item.currentScale);
      const shiftDelta = Math.abs(item.targetShift - item.currentShift);

      if (scaleDelta > 0.001 || shiftDelta > 0.04) {
        active = true;
      } else {
        item.currentScale = item.targetScale;
        item.currentShift = item.targetShift;
      }

      item.el.style.transform = `scale(${item.currentScale.toFixed(3)}) translateX(${item.currentShift.toFixed(2)}px)`;
    }

    if (active || isHovering) {
      rafId = requestAnimationFrame(renderFrame);
    } else {
      rafId = null;
    }
  }

  function startLoop() {
    if (rafId === null) {
      rafId = requestAnimationFrame(renderFrame);
    }
  }

  function onPointerMove(e: PointerEvent) {
    if (e.pointerType === 'touch' || window.innerWidth <= 768) return;
    isHovering = true;
    const pointerX = e.clientX;
    const radius = 80; // proximity radius in px

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rect = item.el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const dist = Math.abs(pointerX - centerX);

      if (dist < radius) {
        // Cosine ease for organic smooth proximity falloff
        const factor = 1 - dist / radius;
        const curve = Math.sin((factor * Math.PI) / 2);

        // Hovered item expands slightly
        item.targetScale = 1 + 0.15 * curve;

        // Nearby items subtly widen / shift away from pointer
        const dir = centerX >= pointerX ? 1 : -1;
        const shiftMag = Math.sin(factor * Math.PI) * 3.2;
        item.targetShift = dir * shiftMag;
      } else {
        item.targetScale = 1;
        item.targetShift = 0;
      }
    }

    startLoop();
  }

  function onPointerLeave() {
    isHovering = false;
    for (let i = 0; i < items.length; i++) {
      items[i].targetScale = 1;
      items[i].targetShift = 0;
    }
    startLoop();
  }

  dock.addEventListener('pointermove', onPointerMove, { passive: true });
  dock.addEventListener('pointerleave', onPointerLeave, { passive: true });

  return {
    dispose() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      dock.removeEventListener('pointermove', onPointerMove);
      dock.removeEventListener('pointerleave', onPointerLeave);
      for (let i = 0; i < items.length; i++) {
        items[i].el.style.transform = '';
      }
    }
  };
}
