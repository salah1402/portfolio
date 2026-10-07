import type gsap from 'gsap';

/**
 * Normalized scroll direction:
 * - `1`: scrolling forward / down
 * - `-1`: scrolling backward / up
 * - `0`: stationary / initial state
 */
export type ScrollDirection = -1 | 0 | 1;

/**
 * Lifecycle events emitted when a section enters or leaves the active scroll window.
 */
export type SectionLifecycleAction = 'enter' | 'leave' | 'enter-back' | 'leave-back';

/**
 * Real-time scroll state for a single registered section.
 */
export interface SectionScrollState {
  /** Unique section identifier matching `site-plan.json` (`sections[].id`). */
  id: string;
  /** Sequential 1-based order of the section (`sections[].order`). */
  order: number;
  /** Normalized section scroll progress clamped to `[0, 1]`. */
  progress: number;
  /** Whether the viewport is currently within the section's active scroll trigger bounds. */
  isActive: boolean;
  /** Whether this section pins the viewport during its active scroll range. */
  pinned: boolean;
  /** Current scroll direction within the section (`-1 | 0 | 1`). */
  direction: ScrollDirection;
  /** Current scroll velocity while inside or updating this section. */
  velocity: number;
}

/**
 * Single unified scroll state shared across 3D scenes, video scrubbers, and DOM animations.
 */
export interface SharedScrollState {
  /** Normalized global page scroll progress clamped to `[0, 1]`. */
  progress: number;
  /** Current scroll offset in pixels. */
  scroll: number;
  /** Maximum scrollable distance in pixels. */
  limit: number;
  /** Instantaneous scroll velocity (pixels/sec or Lenis velocity). */
  velocity: number;
  /** Current scroll direction (`-1` up, `0` idle, `1` down). */
  direction: ScrollDirection;
  /** Whether smooth or native scrolling is actively in motion. */
  isScrolling: boolean;
  /** Whether `prefers-reduced-motion: reduce` is currently active. */
  prefersReducedMotion: boolean;
  /** Identifier of the primary active section, or `null` if between/outside sections. */
  activeSectionId: string | null;
  /** Map of section IDs to their individual `0 -> 1` progress and state. */
  sections: Record<string, SectionScrollState>;
}

/**
 * Payload emitted when a section transitions into or out of its active scroll range.
 */
export interface SectionLifecycleEvent {
  sectionId: string;
  action: SectionLifecycleAction;
  sectionState: Readonly<SectionScrollState>;
  globalState: Readonly<SharedScrollState>;
}

/**
 * Configuration for registering a section with the shared scroll engine.
 * Directly aligns with `SectionScrollChoreography` in `schemas/site-plan.schema.json`.
 */
export interface SectionRegistrationConfig {
  /** Unique section ID (e.g., `"hero"`, `"exploded-view"`). */
  id: string;
  /** DOM element or CSS selector for the section container. */
  element: HTMLElement | string;
  /** 1-based sequential order of the section. */
  order?: number;
  /** Whether the section pins the viewport while scroll progress advances. */
  pinned?: boolean;
  /** Whether GSAP ScrollTrigger should reserve pin spacing in the layout (default: `true`). */
  pinSpacing?: boolean;
  /**
   * Total scroll distance in viewport height units (`vh`), matching `scrollDistanceVh`
   * in `site-plan.schema.json`. Used to compute the ScrollTrigger `end` offset when provided.
   */
  scrollDistanceVh?: number;
  /**
   * Scrub damping time in seconds (`0` or `true` for 1:1 scrubbing), matching `scrubSmoothing`
   * in `site-plan.schema.json`.
   */
  scrubSmoothing?: number | boolean;
  /** Custom ScrollTrigger `start` position override (defaults to `'top top'` if pinned, `'top bottom'` otherwise). */
  start?: string;
  /** Custom ScrollTrigger `end` position override. */
  end?: string | (() => string);
  /** Fired when scrolling forward into the section (`0 -> 1` entry). */
  onEnter?: (sectionState: Readonly<SectionScrollState>, globalState: Readonly<SharedScrollState>) => void;
  /** Fired when scrolling forward past the end of the section (`1` exit). */
  onLeave?: (sectionState: Readonly<SectionScrollState>, globalState: Readonly<SharedScrollState>) => void;
  /** Fired when scrolling backward into the section from below (`1 -> 0` re-entry). */
  onEnterBack?: (sectionState: Readonly<SectionScrollState>, globalState: Readonly<SharedScrollState>) => void;
  /** Fired when scrolling backward past the start of the section (`0` exit upward). */
  onLeaveBack?: (sectionState: Readonly<SectionScrollState>, globalState: Readonly<SharedScrollState>) => void;
  /** Fired whenever the section's normalized `0 -> 1` progress updates. */
  onProgress?: (sectionState: Readonly<SectionScrollState>, globalState: Readonly<SharedScrollState>) => void;
}

/**
 * Global configuration options for initializing the `SharedScrollEngine`.
 * Directly aligns with `GlobalScrollChoreography` in `schemas/site-plan.schema.json`.
 */
export interface ScrollEngineOptions {
  /** Whether smooth inertial scrolling via Lenis is enabled (default: `true`). */
  smoothScroll?: boolean;
  /** Lenis linear interpolation factor `[0, 1]` (default: `0.1`). */
  lerpFactor?: number;
  /** Optional scroll wheel multiplier (default: `1`). */
  wheelMultiplier?: number;
  /** Optional touch scroll multiplier (default: `1`). */
  touchMultiplier?: number;
  /**
   * Whether to automatically detect `prefers-reduced-motion: reduce` and disable
   * smooth-scroll inertia and scrub lag when requested by the user/OS (default: `true`).
   */
  respectReducedMotion?: boolean;
  /** Optional explicit override for reduced-motion mode. */
  forceReducedMotion?: boolean;
  /** Optional scroll wrapper element (defaults to `window`). */
  wrapper?: HTMLElement | Window;
  /** Optional scrollable content element (defaults to `document.documentElement`). */
  content?: HTMLElement;
}

/**
 * Options for programmatic scroll navigation (`scrollTo`).
 */
export interface ScrollToTargetOptions {
  offset?: number;
  duration?: number;
  immediate?: boolean;
  lock?: boolean;
  onComplete?: () => void;
}

export type GlobalScrollListener = (state: Readonly<SharedScrollState>) => void;

export type SectionScrollListener = (
  sectionState: Readonly<SectionScrollState>,
  globalState: Readonly<SharedScrollState>
) => void;

export type SectionLifecycleListener = (event: SectionLifecycleEvent) => void;

/**
 * Public framework-friendly interface for the SharedScrollEngine.
 * Compatible with React (`useSyncExternalStore`), React Three Fiber (`useFrame`),
 * video canvas scrubbers, and GSAP timelines.
 */
export interface ISharedScrollEngine {
  /** Initialize Lenis, GSAP ScrollTrigger bindings, and reduced-motion listeners. */
  init(): void;
  /**
   * Synchronous, zero-allocation state accessor for render loops (`useFrame`, `requestAnimationFrame`)
   * and React's `useSyncExternalStore` `getSnapshot`.
   */
  getState(): Readonly<SharedScrollState>;
  /** Synchronous accessor for a specific registered section's state. */
  getSectionState(sectionId: string): Readonly<SectionScrollState> | undefined;
  /**
   * Subscribe to any global or section scroll state update.
   * Signature matches React's `useSyncExternalStore` `subscribe` parameter.
   */
  subscribe(listener: GlobalScrollListener): () => void;
  /** Subscribe to progress updates for a single section ID. */
  subscribeSection(sectionId: string, listener: SectionScrollListener): () => void;
  /** Subscribe to section `enter`, `leave`, `enter-back`, and `leave-back` lifecycle events. */
  onSectionLifecycle(listener: SectionLifecycleListener): () => void;
  /** Register a DOM section and configure its GSAP ScrollTrigger and `0 -> 1` progress tracking. */
  registerSection(config: SectionRegistrationConfig): () => void;
  /** Remove a previously registered section and kill its ScrollTrigger instance. */
  unregisterSection(sectionId: string): void;
  /**
   * Create a GSAP Timeline bound directly to a registered section's scroll range.
   * Allows DOM animations, 3D scene properties, or video scrubbers to sequence beats in `[0..1]`.
   */
  createSectionTimeline(sectionId: string, vars?: gsap.TimelineVars): gsap.core.Timeline;
  /** Programmatically scroll to a pixel offset, CSS selector, section ID, or DOM element. */
  scrollTo(target: number | string | HTMLElement, options?: ScrollToTargetOptions): void;
  /** Recalculate all section bounds and Lenis dimensions (e.g., after asset load or resize). */
  refresh(): void;
  /** Cleanly dispose of Lenis, all GSAP ScrollTriggers, tickers, and event listeners. */
  destroy(): void;
}
