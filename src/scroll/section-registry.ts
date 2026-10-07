import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type {
  ScrollDirection,
  SectionLifecycleAction,
  SectionRegistrationConfig,
  SectionScrollState
} from './types.js';

function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function normalizeDirection(dir: number): ScrollDirection {
  if (dir > 0) return 1;
  if (dir < 0) return -1;
  return 0;
}

export interface ManagedSectionEntry {
  config: SectionRegistrationConfig;
  state: SectionScrollState;
  trigger: ScrollTrigger | null;
  timelines: Set<gsap.core.Timeline>;
}

export interface SectionRegistryCallbacks {
  getVelocity: () => number;
  isReducedMotion: () => boolean;
  onSectionProgress: (sectionState: SectionScrollState) => void;
  onSectionLifecycle: (action: SectionLifecycleAction, sectionState: SectionScrollState) => void;
}

/**
 * Manages GSAP ScrollTrigger instances for all registered sections and normalizes
 * their `0 -> 1` progress, velocity, direction, and enter/leave events into the shared state.
 */
export class SectionRegistry {
  private readonly entries = new Map<string, ManagedSectionEntry>();
  private readonly callbacks: SectionRegistryCallbacks;

  constructor(callbacks: SectionRegistryCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Register a section and create its underlying GSAP ScrollTrigger if in a browser environment.
   */
  public register(config: SectionRegistrationConfig): () => void {
    if (this.entries.has(config.id)) {
      this.unregister(config.id);
    }

    const order = config.order ?? this.entries.size + 1;
    const pinned = Boolean(config.pinned);

    const initialState: SectionScrollState = {
      id: config.id,
      order,
      progress: 0,
      isActive: false,
      pinned,
      direction: 0,
      velocity: 0
    };

    const entry: ManagedSectionEntry = {
      config,
      state: initialState,
      trigger: null,
      timelines: new Set()
    };

    this.entries.set(config.id, entry);
    this.mountTrigger(entry);

    return () => {
      this.unregister(config.id);
    };
  }

  /**
   * Unregister a section and clean up its ScrollTrigger and any attached timelines.
   */
  public unregister(sectionId: string): void {
    const entry = this.entries.get(sectionId);
    if (!entry) return;

    for (const timeline of entry.timelines) {
      timeline.scrollTrigger?.kill();
      timeline.kill();
    }
    entry.timelines.clear();

    if (entry.trigger) {
      entry.trigger.kill();
      entry.trigger = null;
    }

    this.entries.delete(sectionId);
  }

  /**
   * Create a GSAP timeline synchronized with a registered section's scroll bounds.
   */
  public createTimeline(sectionId: string, vars: gsap.TimelineVars = {}): gsap.core.Timeline {
    const entry = this.entries.get(sectionId);
    if (!entry) {
      throw new Error(
        `[SharedScrollEngine] Cannot create timeline for unregistered section "${sectionId}".`
      );
    }

    const { config } = entry;
    const reducedMotion = this.callbacks.isReducedMotion();
    const scrubValue = reducedMotion ? true : (config.scrubSmoothing ?? true);

    const timeline = gsap.timeline({
      ...vars,
      scrollTrigger: {
        trigger: config.element,
        start: this.resolveStart(config),
        end: this.resolveEnd(config),
        scrub: scrubValue,
        ...(vars.scrollTrigger ?? {})
      }
    });

    entry.timelines.add(timeline);
    return timeline;
  }

  /**
   * Retrieve the current state snapshot of a single section.
   */
  public getSectionState(sectionId: string): SectionScrollState | undefined {
    return this.entries.get(sectionId)?.state;
  }

  /**
   * Retrieve the map of all section states for the global `SharedScrollState`.
   */
  public getAllSectionStates(): Record<string, SectionScrollState> {
    const record: Record<string, SectionScrollState> = {};
    for (const [id, entry] of this.entries.entries()) {
      record[id] = entry.state;
    }
    return record;
  }

  /**
   * Retrieve the DOM element or selector associated with a registered section ID.
   */
  public getSectionElement(sectionId: string): HTMLElement | string | undefined {
    return this.entries.get(sectionId)?.config.element;
  }

  /**
   * Rebuild triggers when reduced-motion preference changes.
   */
  public rebuildAll(): void {
    for (const entry of this.entries.values()) {
      if (entry.trigger) {
        entry.trigger.kill();
        entry.trigger = null;
      }
      this.mountTrigger(entry);
    }
    if (typeof window !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }

  /**
   * Destroy all section triggers and clear registry.
   */
  public destroy(): void {
    for (const sectionId of Array.from(this.entries.keys())) {
      this.unregister(sectionId);
    }
  }

  private resolveStart(config: SectionRegistrationConfig): string {
    if (config.start) return config.start;
    return config.pinned ? 'top top' : 'top bottom';
  }

  private resolveEnd(config: SectionRegistrationConfig): string | (() => string) {
    if (config.end) return config.end;
    if (typeof config.scrollDistanceVh === 'number' && config.scrollDistanceVh > 0) {
      const distanceVh = config.scrollDistanceVh;
      return () => `+=${Math.round((distanceVh / 100) * window.innerHeight)}`;
    }
    return config.pinned ? '+=100%' : 'bottom top';
  }

  private mountTrigger(entry: ManagedSectionEntry): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const { config } = entry;
    const reducedMotion = this.callbacks.isReducedMotion();
    const scrub = reducedMotion ? true : (config.scrubSmoothing ?? true);

    entry.trigger = ScrollTrigger.create({
      id: `section-${config.id}`,
      trigger: config.element,
      pin: Boolean(config.pinned),
      pinSpacing: config.pinSpacing ?? true,
      start: this.resolveStart(config),
      end: this.resolveEnd(config),
      scrub,
      onUpdate: (self) => {
        const nextState: SectionScrollState = {
          ...entry.state,
          progress: clamp01(self.progress),
          isActive: self.isActive,
          direction: normalizeDirection(self.direction),
          velocity: this.callbacks.getVelocity()
        };
        entry.state = nextState;
        this.callbacks.onSectionProgress(nextState);
      },
      onEnter: (self) => {
        this.handleLifecycle('enter', entry, self);
      },
      onLeave: (self) => {
        this.handleLifecycle('leave', entry, self);
      },
      onEnterBack: (self) => {
        this.handleLifecycle('enter-back', entry, self);
      },
      onLeaveBack: (self) => {
        this.handleLifecycle('leave-back', entry, self);
      }
    });
  }

  private handleLifecycle(
    action: SectionLifecycleAction,
    entry: ManagedSectionEntry,
    self: ScrollTrigger
  ): void {
    const isEntering = action === 'enter' || action === 'enter-back';
    const boundaryProgress =
      action === 'leave' ? 1 : action === 'leave-back' ? 0 : clamp01(self.progress);

    const nextState: SectionScrollState = {
      ...entry.state,
      progress: boundaryProgress,
      isActive: isEntering,
      direction: normalizeDirection(self.direction),
      velocity: this.callbacks.getVelocity()
    };

    entry.state = nextState;
    this.callbacks.onSectionLifecycle(action, nextState);
  }
}
