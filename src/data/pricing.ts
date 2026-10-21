import { CalculatorState, CalculatorResult, Currency, ProjectTypeId } from '../types';

export interface ProjectTypeOption {
  id: ProjectTypeId;
  label: string;
  basePriceINR: number;
  baseTimelineWeeks: number;
  description: string;
  includedPages: string;
}

export interface PageCountOption {
  id: '1' | '3-5' | '6-10' | '10+';
  label: string;
  timelineDeltaWeeks: number;
  description: string;
}

export interface MotionEffortOption {
  id: 'standard' | 'creative';
  label: string;
  timelineDeltaWeeks: number;
  description: string;
}

export interface UrgencyOption {
  id: 'standard' | 'rush';
  label: string;
  timelineMultiplier: number;
  description: string;
}

export interface RetainerTier {
  id: string;
  name: string;
  priceINR: number;
  hours: string;
  sla: string;
  popular?: boolean;
  deliverables: string[];
}

export const PROJECT_TYPES: Record<ProjectTypeId, ProjectTypeOption> = {
  landing: {
    id: 'landing',
    label: 'Landing Page',
    basePriceINR: 12000,
    baseTimelineWeeks: 1.0,
    description: 'High-impact single-page narrative crafted for immediate conversion and rapid loading.',
    includedPages: '1 page included'
  },
  portfolio: {
    id: 'portfolio',
    label: 'Portfolio Website',
    basePriceINR: 18000,
    baseTimelineWeeks: 1.5,
    description: 'Bespoke creative showcase with editorial aesthetics, project gallery, and custom typography.',
    includedPages: 'Up to 3–4 pages included'
  },
  multipage: {
    id: 'multipage',
    label: 'Multi-Page Website',
    basePriceINR: 24000,
    baseTimelineWeeks: 2.5,
    description: 'Clean multi-page site covering 3–5 core pages (Home, Work, About, Contact) with fluid routing.',
    includedPages: '3–5 pages included'
  },
  ecommerce: {
    id: 'ecommerce',
    label: 'E-commerce Website',
    basePriceINR: 40000,
    baseTimelineWeeks: 3.5,
    description: 'Catalogue presentation, checkout integration, product showcases, and razor-sharp performance.',
    includedPages: 'Starting price'
  },
  'web-app': {
    id: 'web-app',
    label: 'Custom Web Application',
    basePriceINR: 45000,
    baseTimelineWeeks: 4.5,
    description: 'Full-stack or stateful web app with custom workflow interfaces, APIs, and client dashboards.',
    includedPages: 'Scope-dependent starting price'
  }
};

export const PAGE_COUNTS: Record<'1' | '3-5' | '6-10' | '10+', PageCountOption> = {
  '1': {
    id: '1',
    label: '1 Page',
    timelineDeltaWeeks: 0,
    description: 'Single-page storytelling layout with focused section transitions.'
  },
  '3-5': {
    id: '3-5',
    label: '3–5 Pages',
    timelineDeltaWeeks: 0,
    description: 'Core structure included in standard multi-page and portfolio base prices.'
  },
  '6-10': {
    id: '6-10',
    label: '6–10 Pages',
    timelineDeltaWeeks: 1.0,
    description: 'Expanded site structure with dedicated sub-pages (+₹8,000 to base).'
  },
  '10+': {
    id: '10+',
    label: '10+ Pages',
    timelineDeltaWeeks: 2.0,
    description: 'Expansive multi-section platform. Custom architectural quotation required.'
  }
};

export const MOTION_EFFORTS: Record<'standard' | 'creative', MotionEffortOption> = {
  standard: {
    id: 'standard',
    label: 'Standard Polish',
    timelineDeltaWeeks: 0,
    description: 'Included in base. Crisp micro-interactions, fluid hover feedback, and smooth page restoration.'
  },
  creative: {
    id: 'creative',
    label: 'Creative / WebGL Motion',
    timelineDeltaWeeks: 1.0,
    description: 'Custom WebGL shaders, Three.js interactive states, physics, and scroll choreography (+₹10,000).'
  }
};

export const URGENCIES: Record<'standard' | 'rush', UrgencyOption> = {
  standard: {
    id: 'standard',
    label: 'Standard Delivery',
    timelineMultiplier: 1.0,
    description: 'Balanced delivery with planned review cycles and proper testing.'
  },
  rush: {
    id: 'rush',
    label: 'Rush / Priority Sprint',
    timelineMultiplier: 0.65,
    description: 'Priority scheduling with a compressed delivery window (+20% rush surcharge).'
  }
};

export const EXCHANGE_RATES: Record<Currency, number> = {
  INR: 1,
  USD: 1 / 85.0,
  EUR: 1 / 92.0
};

export const RETAINERS: RetainerTier[] = [
  {
    id: 'maintenance',
    name: 'Essential Maintenance',
    priceINR: 5000,
    hours: '~6–8 hours / month',
    sla: '48-hour response SLA',
    deliverables: [
      'Core Web Vitals & performance monitoring',
      'Dependency security updates & bug fixes',
      'Minor copy, asset, and styling tweaks',
      'Monthly uptime & health report',
      'Direct email & WhatsApp communication'
    ]
  },
  {
    id: 'studio-iteration',
    name: 'Growth & Content Updates',
    priceINR: 8000,
    hours: '~12–15 hours / month',
    sla: '24-hour response SLA',
    popular: true,
    deliverables: [
      'Everything in Essential Maintenance',
      'New section/page assembly from existing components',
      'Quarterly conversion optimization review',
      'Asset optimization & responsive refinements',
      'Priority sprint queueing for scheduled releases'
    ]
  },
  {
    id: 'feature-expansion',
    name: 'Active Feature Development',
    priceINR: 18000,
    hours: '~25–30 hours / month',
    sla: 'Same-day urgent triage (< 6 hours)',
    deliverables: [
      'Dedicated engineering capacity for new features',
      'Custom motion, interactive forms, and API integrations',
      'Weekly staging deploys and client check-in',
      'Direct Slack/WhatsApp collaboration channel',
      'Continuous performance guarantee'
    ]
  }
];

/**
 * Calculates project scope price and timeline using transparent, non-inflated arithmetic
 */
export function calculateProjectScope(state: CalculatorState): CalculatorResult {
  const pType = PROJECT_TYPES[state.projectType] || PROJECT_TYPES.multipage;
  const urg = URGENCIES[state.urgency] || URGENCIES.standard;
  const pCount = PAGE_COUNTS[state.pageCount] || PAGE_COUNTS['3-5'];
  const mEffort = MOTION_EFFORTS[state.motionEffort] || MOTION_EFFORTS.standard;

  // 1. Calculate Base Price
  let basePrice = pType.basePriceINR;

  // 2. Size adjustments
  let sizeDelta = 0;
  if (state.projectType === 'landing') {
    // 1-page landing project uses its own landing-page base price
    sizeDelta = 0;
  } else if (state.pageCount === '6-10') {
    // 6-10 pages adds ₹8,000 to applicable multi-page/portfolio base
    sizeDelta = 8000;
  } else if (state.pageCount === '10+') {
    // 10+ pages: custom estimate
    sizeDelta = 20000;
  }

  // 3. Effort adjustments
  let effortDelta = 0;
  if (state.motionEffort === 'creative') {
    if (state.projectType === 'web-app') {
      effortDelta = 18000;
    } else if (state.projectType === 'ecommerce') {
      effortDelta = 14000;
    } else if (state.projectType === 'multipage') {
      effortDelta = 10000;
    } else {
      effortDelta = 8000;
    }
  }

  // Subtotal before urgency
  const subtotalINR = basePrice + sizeDelta + effortDelta;

  // 4. Delivery adjustment (+20% for rush)
  const isRush = state.urgency === 'rush';
  const rawPriceINR = isRush ? subtotalINR * 1.20 : subtotalINR;
  const priceINR = Math.round(rawPriceINR / 1000) * 1000;

  // 5. Timeline calculation
  const baseTimeline = pType.baseTimelineWeeks + pCount.timelineDeltaWeeks + mEffort.timelineDeltaWeeks;
  const rawTimeline = isRush ? baseTimeline * urg.timelineMultiplier : baseTimeline;
  const timelineWeeks = Math.max(0.5, Math.round(rawTimeline * 2) / 2);

  const isCustomQuote = state.pageCount === '10+';

  let displayPrice = priceINR;
  let formattedPrice = '';

  if (state.currency === 'USD') {
    displayPrice = Math.round(priceINR / 85.0);
    formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(displayPrice);
  } else if (state.currency === 'EUR') {
    displayPrice = Math.round(priceINR / 92.0);
    formattedPrice = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(displayPrice);
  } else {
    displayPrice = priceINR;
    formattedPrice = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(displayPrice);
  }

  return {
    priceINR,
    displayPrice,
    formattedPrice: isCustomQuote ? `${formattedPrice} (est.)` : formattedPrice,
    timelineWeeks,
    formattedTimeline: `${timelineWeeks} ${timelineWeeks === 1 ? 'week' : 'weeks'}`,
    isCustomQuote
  };
}

// ----------------------------------------------------------------------------
// Backwards Compatibility Exports for Existing Components
// ----------------------------------------------------------------------------

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  deliverables: string[];
  cta: string;
  popular?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'landing',
    name: 'Flagship Landing Page',
    price: '₹12,000',
    period: 'starting',
    description: 'High-converting single-page showcase engineered for performance, clean typography, and conversion.',
    deliverables: [
      'Tailwind CSS + React/Vite architecture',
      'Fluid responsive typography',
      'Bespoke micro-interactions & SVG animations',
      'SEO & Open Graph meta configuration',
      '14-day post-launch warranty'
    ],
    cta: 'Select Scope'
  },
  {
    id: 'multipage',
    name: 'Bespoke Multi-Page Website',
    price: '₹24,000',
    period: 'starting',
    description: 'Comprehensive 3–5 page corporate or creative portfolio with complete design system.',
    deliverables: [
      'Complete React Router multi-page routing',
      'Custom project case study template',
      'Interactive contact intake with validation',
      'Scroll-driven choreography & page transitions',
      '30-day post-launch warranty & SLA'
    ],
    cta: 'Select Scope',
    popular: true
  },
  {
    id: 'web-app',
    name: 'Custom Web Application',
    price: '₹45,000',
    period: 'starting',
    description: 'Stateful web app with custom interfaces, APIs, interactive components, and client dashboards.',
    deliverables: [
      'Custom GLSL shaders or Three.js interactive stages',
      'Component architecture with scalable state machine',
      'Interactive forms & client workflows',
      'Optimized Core Web Vitals for mobile and desktop',
      'Comprehensive 30-day SLA guarantee'
    ],
    cta: 'Select Scope'
  }
];

export const PAYMENT_TERMS = {
  deposit: '50%',
  milestone: '25%',
  final: '25%',
  description: '50% upon kickoff, 25% at midway interactive staging review, 25% upon final deployment.'
};

export const PRICING_FAQ = [
  {
    question: 'How do project estimates translate to formal contracts?',
    answer: 'The numbers generated by the calculator represent transparent scope boundaries based on our production velocity. Once you share your brief, we issue a formal proposal with exact milestones, delivery dates, and a fixed price.'
  },
  {
    question: 'What are the payment milestones?',
    answer: 'Standard engagements operate on a 50/25/25 model: 50% upon project kickoff, 25% upon completion of design & interactive staging, and 25% prior to production handover or DNS cutover.'
  },
  {
    question: 'Can we transition from a project into a monthly retainer?',
    answer: 'Yes. Most clients transition immediately into our Growth & Content Updates or Essential Maintenance retainer post-launch to maintain continuous iteration, motion refinement, and feature expansions.'
  }
];
