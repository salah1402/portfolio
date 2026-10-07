import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ReducedMotionMonitor } from './reduced-motion.js';
import { SectionRegistry } from './section-registry.js';
import type {
  GlobalScrollListener,
  ISharedScrollEngine,
  ScrollDirection,
  ScrollEngineOptions,
  ScrollToTargetOptions,
  SectionLifecycleAction,
  SectionLifecycleEvent,
  SectionLifecycleListener,
  SectionRegistrationConfig,
  SectionScrollListener,
  SectionScrollState,
  SharedScrollState
} from './types.js';

function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function normalizeDirection(value: number): ScrollDirection {
  if (value > 0) return 1;
  if (value < 0) return -1;
  return 0;
}

/**
 * Unified scroll engine combining Lenis smooth scrolling and GSAP ScrollTrigger orchestration.
 * Exposes a single shared state consumed simultaneously by 3D scenes, video scrubbers,
 * and DOM animations.
 */
export class SharedScrollEngine implements ISharedScrollEngine {
  private readonly options: Required<
    Pick<
      ScrollEngineOptions,
      'smoothScroll' | 'lerpFactor' | 'wheelMultiplier' | 'touchMultiplier' | 'respectReducedMotion'
    >
  > &
    Pick<ScrollEngineOptions, 'forceReducedMotion' | 'wrapper' | 'content'>;

  private readonly reducedMotionMonitor: ReducedMotionMonitor;
  private readonly sectionRegistry: SectionRegistry;

  private lenis: Lenis | null = null;
  private tickerCallback: ((time: number) => void) | null = null;
  private nativeScrollListener: (() => void) | null = null;
  private resizeListener: (() => void) | null = null;
  private initialized = false;
  private lastNativeScrollTop = 0;
  private lastNativeTimestamp = 0;

  private state: SharedScrollState;

  private readonly globalListeners = new Set<GlobalScrollListener>();
  private readonly sectionListeners = new Map<string, Set<SectionScrollListener>>();
  private readonly lifecycleListeners = new Set<SectionLifecycleListener>();
  private readonly sectionConfigs = new Map<string, SectionRegistrationConfig>();

  constructor(options: ScrollEngineOptions = {}) {
    this.options = {
      smoothScroll: options.smoothScroll ?? true,
      lerpFactor: options.lerpFactor ?? 0.1,
      wheelMultiplier: options.wheelMultiplier ?? 1,
      touchMultiplier: options.touchMultiplier ?? 1,
      respectReducedMotion: options.respectReducedMotion ?? true,
      forceReducedMotion: options.forceReducedMotion,
      wrapper: options.wrapper,
      content: options.content
    };

    // Bind core methods so they can be passed directly to React's useSyncExternalStore or R3F hooks
    this.getState = this.getState.bind(this);
    this.getSectionState = this.getSectionState.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.subscribeSection = this.subscribeSection.bind(this);
    this.onSectionLifecycle = this.onSectionLifecycle.bind(this);

    this.reducedMotionMonitor = new ReducedMotionMonitor({
      respectReducedMotion: this.options.respectReducedMotion,
      forceReducedMotion: this.options.forceReducedMotion
    });

    this.state = {
      progress: 0,
      scroll: 0,
      limit: 0,
      velocity: 0,
      direction: 0,
      isScrolling: false,
      prefersReducedMotion: this.reducedMotionMonitor.isReducedMotion(),
      activeSectionId: null,
      sections: {}
    };

    this.sectionRegistry = new SectionRegistry({
      getVelocity: () => this.state.velocity,
      isReducedMotion: () => this.state.prefersReducedMotion,
      onSectionProgress: (sectionState) => this.handleSectionProgress(sectionState),
      onSectionLifecycle: (action, sectionState) => this.handleSectionLifecycle(action, sectionState)
    });

    this.reducedMotionMonitor.subscribe((prefersReducedMotion) => {
      this.handleReducedMotionChange(prefersReducedMotion);
    });
  }

  /**
   * Initialize Lenis, GSAP ScrollTrigger plugin registration, and scroll listeners.
   */
  public init(): void {
    if (this.initialized) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.lagSmoothing(0);

    this.setupScrollDriver();

    this.resizeListener = () => {
      this.refresh();
    };
    window.addEventListener('resize', this.resizeListener, { passive: true });

    this.initialized = true;
    this.refresh();
  }

  /**
   * Synchronous read of the current global and section scroll state.
   * Safe to call inside 60/120fps `requestAnimationFrame` or R3F `useFrame` loops.
   */
  public getState(): Readonly<SharedScrollState> {
    return this.state;
  }

  /**
   * Synchronous read of a specific section's scroll state.
   */
  public getSectionState(sectionId: string): Readonly<SectionScrollState> | undefined {
    return this.state.sections[sectionId] ?? this.sectionRegistry.getSectionState(sectionId);
  }

  /**
   * Subscribe to global scroll state updates.
   * Compatible with React's `useSyncExternalStore(engine.subscribe, engine.getState)`.
   */
  public subscribe(listener: GlobalScrollListener): () => void {
    this.globalListeners.add(listener);
    return () => {
      this.globalListeners.delete(listener);
    };
  }

  /**
   * Subscribe to updates for a specific section ID.
   */
  public subscribeSection(sectionId: string, listener: SectionScrollListener): () => void {
    let set = this.sectionListeners.get(sectionId);
    if (!set) {
      set = new Set();
      this.sectionListeners.set(sectionId, set);
    }
    set.add(listener);

    return () => {
      const currentSet = this.sectionListeners.get(sectionId);
      if (currentSet) {
        currentSet.delete(listener);
        if (currentSet.size === 0) {
          this.sectionListeners.delete(sectionId);
        }
      }
    };
  }

  /**
   * Subscribe to section `enter`, `leave`, `enter-back`, and `leave-back` events.
   */
  public onSectionLifecycle(listener: SectionLifecycleListener): () => void {
    this.lifecycleListeners.add(listener);
    return () => {
      this.lifecycleListeners.delete(listener);
    };
  }

  /**
   * Register a section with the shared scroll engine.
   */
  public registerSection(config: SectionRegistrationConfig): () => void {
    if (!this.initialized && typeof window !== 'undefined') {
      this.init();
    }

    this.sectionConfigs.set(config.id, config);
    const disposeRegistry = this.sectionRegistry.register(config);

    this.state = {
      ...this.state,
      sections: this.sectionRegistry.getAllSectionStates()
    };
    this.emitGlobal();

    return () => {
      disposeRegistry();
      this.sectionConfigs.delete(config.id);
      this.state = {
        ...this.state,
        activeSectionId:
          this.state.activeSectionId === config.id ? null : this.state.activeSectionId,
        sections: this.sectionRegistry.getAllSectionStates()
      };
      this.emitGlobal();
    };
  }

  /**
   * Unregister a section by ID.
   */
  public unregisterSection(sectionId: string): void {
    this.sectionRegistry.unregister(sectionId);
    this.sectionConfigs.delete(sectionId);
    this.sectionListeners.delete(sectionId);

    this.state = {
      ...this.state,
      activeSectionId:
        this.state.activeSectionId === sectionId ? null : this.state.activeSectionId,
      sections: this.sectionRegistry.getAllSectionStates()
    };
    this.emitGlobal();
  }

  /**
   * Create a GSAP timeline bound to a registered section's scroll trigger.
   */
  public createSectionTimeline(
    sectionId: string,
    vars: gsap.TimelineVars = {}
  ): gsap.core.Timeline {
    return this.sectionRegistry.createTimeline(sectionId, vars);
  }

  /**
   * Scroll to a target offset, selector, registered section ID, or DOM element.
   */
  public scrollTo(
    target: number | string | HTMLElement,
    options: ScrollToTargetOptions = {}
  ): void {
    if (typeof window === 'undefined') return;

    const resolvedTarget =
      typeof target === 'string'
        ? (this.sectionRegistry.getSectionElement(target) ?? target)
        : target;

    const immediate = Boolean(options.immediate || this.state.prefersReducedMotion);

    if (this.lenis) {
      this.lenis.scrollTo(resolvedTarget, {
        offset: options.offset ?? 0,
        duration: immediate ? 0 : options.duration,
        immediate,
        lock: options.lock ?? false,
        onComplete: options.onComplete
      });
      return;
    }

    // Native fallback when Lenis is disabled (e.g., reduced motion)
    let targetY = 0;
    if (typeof resolvedTarget === 'number') {
      targetY = resolvedTarget + (options.offset ?? 0);
    } else {
      const el =
        typeof resolvedTarget === 'string'
          ? document.querySelector<HTMLElement>(resolvedTarget)
          : resolvedTarget;
      if (el) {
        const rect = el.getBoundingClientRect();
        targetY = window.scrollY + rect.top + (options.offset ?? 0);
      }
    }

    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: immediate ? 'auto' : 'smooth'
    });
    options.onComplete?.();
  }

  /**
   * Recalculate scroll limits and GSAP ScrollTrigger positions.
   */
  public refresh(): void {
    if (typeof window === 'undefined') return;

    this.lenis?.resize();
    ScrollTrigger.refresh();
    this.syncGlobalMetricsFromEnvironment();
  }

  /**
   * Destroy Lenis, GSAP ScrollTriggers, and all registered listeners.
   */
  public destroy(): void {
    this.teardownScrollDriver();

    if (this.resizeListener && typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeListener);
      this.resizeListener = null;
    }

    this.sectionRegistry.destroy();
    this.reducedMotionMonitor.destroy();

    this.globalListeners.clear();
    this.sectionListeners.clear();
    this.lifecycleListeners.clear();
    this.sectionConfigs.clear();
    this.initialized = false;
  }

  private shouldUseSmoothScroll(): boolean {
    if (this.state.prefersReducedMotion) {
      return false;
    }
    return this.options.smoothScroll;
  }

  private setupScrollDriver(): void {
    this.teardownScrollDriver();

    if (this.shouldUseSmoothScroll()) {
      this.lenis = new Lenis({
        lerp: this.options.lerpFactor,
        smoothWheel: true,
        wheelMultiplier: this.options.wheelMultiplier,
        touchMultiplier: this.options.touchMultiplier,
        ...(this.options.wrapper ? { wrapper: this.options.wrapper } : {}),
        ...(this.options.content ? { content: this.options.content } : {})
      });

      this.lenis.on('scroll', (e: Lenis) => {
        ScrollTrigger.update();

        const limit = e.limit || this.computeNativeLimit();
        const scroll = e.scroll;
        const progress = limit > 0 ? clamp01(scroll / limit) : 0;

        this.state = {
          ...this.state,
          scroll,
          limit,
          progress,
          velocity: e.velocity,
          direction: normalizeDirection(e.direction),
          isScrolling: Boolean(e.isScrolling)
        };

        this.emitGlobal();
      });

      this.tickerCallback = (time: number) => {
        this.lenis?.raf(time * 1000);
      };
      gsap.ticker.add(this.tickerCallback);
    } else if (typeof window !== 'undefined') {
      this.lastNativeScrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      this.lastNativeTimestamp = performance.now();

      this.nativeScrollListener = () => {
        ScrollTrigger.update();

        const now = performance.now();
        const dt = Math.max(1, now - this.lastNativeTimestamp);
        const scroll = window.scrollY || document.documentElement.scrollTop || 0;
        const limit = this.computeNativeLimit();
        const delta = scroll - this.lastNativeScrollTop;
        const velocity = (delta / dt) * 1000;
        const direction = normalizeDirection(delta);

        this.lastNativeScrollTop = scroll;
        this.lastNativeTimestamp = now;

        this.state = {
          ...this.state,
          scroll,
          limit,
          progress: limit > 0 ? clamp01(scroll / limit) : 0,
          velocity,
          direction: direction === 0 ? this.state.direction : direction,
          isScrolling: Math.abs(delta) > 0
        };

        this.emitGlobal();
      };

      window.addEventListener('scroll', this.nativeScrollListener, { passive: true });
    }
  }

  private teardownScrollDriver(): void {
    if (this.tickerCallback) {
      gsap.ticker.remove(this.tickerCallback);
      this.tickerCallback = null;
    }

    if (this.lenis) {
      this.lenis.destroy();
      this.lenis = null;
    }

    if (this.nativeScrollListener && typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.nativeScrollListener);
      this.nativeScrollListener = null;
    }
  }

  private handleReducedMotionChange(prefersReducedMotion: boolean): void {
    this.state = {
      ...this.state,
      prefersReducedMotion,
      velocity: prefersReducedMotion ? 0 : this.state.velocity
    };

    if (this.initialized) {
      this.setupScrollDriver();
      this.sectionRegistry.rebuildAll();
    }

    this.emitGlobal();
  }

  private handleSectionProgress(sectionState: SectionScrollState): void {
    const sections = {
      ...this.state.sections,
      [sectionState.id]: sectionState
    };

    const activeSectionId = sectionState.isActive
      ? sectionState.id
      : this.resolveActiveSectionId(sections);

    this.state = {
      ...this.state,
      activeSectionId,
      sections
    };

    const config = this.sectionConfigs.get(sectionState.id);
    config?.onProgress?.(sectionState, this.state);

    const listeners = this.sectionListeners.get(sectionState.id);
    if (listeners) {
      for (const listener of listeners) {
        listener(sectionState, this.state);
      }
    }

    this.emitGlobal();
  }

  private handleSectionLifecycle(
    action: SectionLifecycleAction,
    sectionState: SectionScrollState
  ): void {
    const sections = {
      ...this.state.sections,
      [sectionState.id]: sectionState
    };

    const activeSectionId = sectionState.isActive
      ? sectionState.id
      : this.resolveActiveSectionId(sections);

    this.state = {
      ...this.state,
      activeSectionId,
      sections
    };

    const config = this.sectionConfigs.get(sectionState.id);
    if (config) {
      if (action === 'enter') config.onEnter?.(sectionState, this.state);
      else if (action === 'leave') config.onLeave?.(sectionState, this.state);
      else if (action === 'enter-back') config.onEnterBack?.(sectionState, this.state);
      else if (action === 'leave-back') config.onLeaveBack?.(sectionState, this.state);
    }

    const eventPayload: SectionLifecycleEvent = {
      sectionId: sectionState.id,
      action,
      sectionState,
      globalState: this.state
    };

    for (const listener of this.lifecycleListeners) {
      listener(eventPayload);
    }

    const sectionSubscribers = this.sectionListeners.get(sectionState.id);
    if (sectionSubscribers) {
      for (const listener of sectionSubscribers) {
        listener(sectionState, this.state);
      }
    }

    this.emitGlobal();
  }

  private resolveActiveSectionId(sections: Record<string, SectionScrollState>): string | null {
    for (const section of Object.values(sections)) {
      if (section.isActive) {
        return section.id;
      }
    }
    return null;
  }

  private computeNativeLimit(): number {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return 0;
    }
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    return Math.max(0, docHeight - window.innerHeight);
  }

  private syncGlobalMetricsFromEnvironment(): void {
    if (typeof window === 'undefined') return;
    const limit = this.lenis?.limit ?? this.computeNativeLimit();
    const scroll =
      this.lenis?.scroll ?? (window.scrollY || document.documentElement.scrollTop || 0);
    const progress = limit > 0 ? clamp01(scroll / limit) : 0;

    this.state = {
      ...this.state,
      scroll,
      limit,
      progress,
      sections: this.sectionRegistry.getAllSectionStates()
    };

    this.emitGlobal();
  }

  private emitGlobal(): void {
    for (const listener of this.globalListeners) {
      listener(this.state);
    }
  }
}

/**
 * Factory function for creating a shared scroll engine instance.
 */
export function createSharedScrollEngine(options?: ScrollEngineOptions): SharedScrollEngine {
  return new SharedScrollEngine(options);
}
