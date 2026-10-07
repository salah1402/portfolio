export type ReducedMotionChangeListener = (prefersReducedMotion: boolean) => void;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Monitors OS/browser `prefers-reduced-motion` settings and notifies the scroll engine
 * so smooth-scroll inertia and scrub lag can be dynamically enabled or disabled.
 */
export class ReducedMotionMonitor {
  private mediaQueryList: MediaQueryList | null = null;
  private prefersReducedMotion = false;
  private readonly respectSystemPreference: boolean;
  private readonly forcedValue?: boolean;
  private readonly listeners = new Set<ReducedMotionChangeListener>();

  private readonly handleMediaChange = (event: MediaQueryListEvent): void => {
    if (typeof this.forcedValue === 'boolean') {
      return;
    }
    const nextValue = this.respectSystemPreference ? event.matches : false;
    if (nextValue !== this.prefersReducedMotion) {
      this.prefersReducedMotion = nextValue;
      this.emit();
    }
  };

  constructor(options: { respectReducedMotion?: boolean; forceReducedMotion?: boolean } = {}) {
    this.respectSystemPreference = options.respectReducedMotion ?? true;
    this.forcedValue = options.forceReducedMotion;

    if (typeof this.forcedValue === 'boolean') {
      this.prefersReducedMotion = this.forcedValue;
    } else if (
      this.respectSystemPreference &&
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function'
    ) {
      this.mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
      this.prefersReducedMotion = this.mediaQueryList.matches;
      this.mediaQueryList.addEventListener('change', this.handleMediaChange);
    }
  }

  /**
   * Returns whether reduced motion is currently active.
   */
  public isReducedMotion(): boolean {
    return this.prefersReducedMotion;
  }

  /**
   * Subscribe to changes in reduced-motion state.
   */
  public subscribe(listener: ReducedMotionChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Clean up media query listeners.
   */
  public destroy(): void {
    if (this.mediaQueryList) {
      this.mediaQueryList.removeEventListener('change', this.handleMediaChange);
      this.mediaQueryList = null;
    }
    this.listeners.clear();
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.prefersReducedMotion);
    }
  }
}
