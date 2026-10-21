export type Currency = 'INR' | 'USD' | 'EUR';

export type ProjectTypeId = 'landing' | 'portfolio' | 'multipage' | 'ecommerce' | 'web-app';

export interface CalculatorState {
  projectType: ProjectTypeId;
  pageCount: '1' | '3-5' | '6-10' | '10+';
  motionEffort: 'standard' | 'creative';
  urgency: 'standard' | 'rush';
  currency: Currency;
}

export interface CalculatorResult {
  priceINR: number;
  displayPrice: number;
  formattedPrice: string;
  timelineWeeks: number;
  formattedTimeline: string;
  isCustomQuote?: boolean;
}

export interface LeadIntakeFormData {
  name: string;
  email: string;
  companyUrl?: string;
  scope: string;
  budget: string;
  timeline: string;
  message: string;
}

export interface ModalContextType {
  isOpen: boolean;
  openModal: (initialData?: Partial<LeadIntakeFormData>) => void;
  closeModal: () => void;
}

export interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  category: string;
  year: string;
  timeline: string;
  role: string;
  deliverables: string[];
  metrics: { label: string; value: string; description: string }[];
  brief: string;
  execution: { architecture: string; threeDAndMotion: string; stack: string[] };
  results: string;
  coverImage: string;
  galleryImages: string[];
  liveUrl?: string;
  githubUrl?: string;
}
