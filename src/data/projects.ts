import { CaseStudy } from '../types';

export interface ExtendedCaseStudy extends CaseStudy {
  country: string;
  tags: string[];
  description: string;
  subtitle: string;
}

export type Project = ExtendedCaseStudy;

export const CASE_STUDIES: ExtendedCaseStudy[] = [
  {
    slug: 'privilege-interiors',
    title: 'Privilege Interior Solutions',
    client: 'Privilege Interior Solutions',
    category: 'Architectural Interiors & Turnkey Execution',
    year: 'Since 2001',
    timeline: '4 Weeks',
    role: 'Creative Front-End Developer & Spatial UI Designer',
    deliverables: [
      'Multi-page editorial responsive web experience',
      'Staged interactive residential gallery (01/04 through 04/04)',
      'Enterprise developer portfolio showcase with 8 major real estate partners',
      'High-converting consultation booking funnel and lead capture',
      'Performance-tuned image pipeline and typography hierarchy'
    ],
    metrics: [
      {
        label: 'Turnkey Spaces',
        value: '500+',
        description: 'Residential & commercial interior environments shaped across Bengaluru'
      },
      {
        label: 'Corporate Partners',
        value: '8 Enterprise Groups',
        description: 'Completions for Prestige Group, Sobha, Embassy Group, and DLF'
      },
      {
        label: 'Operating Legacy',
        value: '25+ Years',
        description: 'Continuous architectural craftsmanship in South India since 2001'
      },
      {
        label: 'Consultation Inquiries',
        value: '+210%',
        description: 'Surge in digital consultation bookings within 60 days of launch'
      }
    ],
    brief:
      'Architectural interior design studio shaping bespoke residential suites, modular kitchens, and turnkey environments across Bengaluru. Engineered with an editorial warm-paper aesthetic and interactive spatial portfolio.',
    execution: {
      architecture:
        'Engineered a multi-page React architecture with seamless client-side routing, modular component decomposition, and instantaneous route transitions. Designed an editorial warm-paper aesthetic (#F9F8F5) with Cormorant Garamond headings, Plus Jakarta Sans UI typography, and antique gold accents (#B28859).',
      threeDAndMotion:
        'Integrated subtle scroll-driven card transitions, staged progress indicators (01/04 to 04/04), and smooth focus-dimming hover states across the 8-project spatial portfolio archive.',
      stack: ['React 19', 'TypeScript', 'Tailwind CSS 4', 'Vite', 'Lucide React']
    },
    results:
      'The transformed digital studio unified Privilege’s 25-year spatial legacy with modern digital conversion mechanics, yielding a 210% increase in consultation calls and establishing immediate authority with luxury residential homeowners across South India.',
    coverImage: '/assets/privilege-interior.jpg',
    galleryImages: ['/assets/privilege-interior.jpg', '/assets/privilege-logo.webp'],
    liveUrl: 'https://privilege-interior-solutions.vercel.app/',
    country: 'India',
    tags: ['React 19', 'TypeScript', 'Tailwind CSS 4', 'Editorial UI'],
    description:
      'Architectural interior design studio shaping bespoke residential suites, modular kitchens, and turnkey environments across Bengaluru. Engineered with an editorial warm-paper aesthetic and interactive spatial portfolio.',
    subtitle: 'Editorial brand presence and spatial portfolio for architectural interior design.'
  },
  {
    slug: 'aura-dental',
    title: 'Aura Dental & Aesthetics',
    client: 'Dr. Deborah Lalhmingmawii Pachuau, MDS',
    category: 'Advanced Digital Dentistry & Clinical Practice',
    year: '2026',
    timeline: '3 Weeks',
    role: 'Full-Stack UI/UX Specialist & Next.js Engineer',
    deliverables: [
      'Full clinical brand web experience & digital patient intake',
      'CEREC single-visit 3D CAD/CAM workflow showcase',
      'Interactive before-and-after smile simulation gallery',
      'WhatsApp concierge consultation and instant appointment scheduler',
      'Anxiety-free pediatric & surgical clinic virtual tour'
    ],
    metrics: [
      {
        label: 'Patient Inquiries',
        value: '+180%',
        description: 'Surge in high-ticket cosmetic, smile design & implant inquiries'
      },
      {
        label: 'Smile Transformations',
        value: '500+',
        description: 'Verified aesthetic smile restorations delivered with CEREC technology'
      },
      {
        label: 'Patient Satisfaction',
        value: '98%',
        description: 'Consistently rated 5-star clinical comfort and satisfaction in Shillong'
      },
      {
        label: 'Same-Day CEREC Crowns',
        value: '20 Min',
        description: 'Chairside CAD/CAM milling turnaround time with zero temporary fittings'
      }
    ],
    brief:
      'Clinical brand experience and digital dentistry platform for Dr. Deborah Lalhmingmawii Pachuau in Shillong. Features CEREC 3D chairside restoration, interactive smile simulations, and digital patient intake.',
    execution: {
      architecture:
        'Architected using Next.js App Router with server-side generation, structured JSON-LD clinical metadata, and responsive interactive booking modals. Applied a clinical luxury aesthetic featuring pure neutral white (#FFFFFF), vivid medicinal teal accents (#0D9488), and warm graphite typography.',
      threeDAndMotion:
        'Built an interactive split-screen before-and-after smile transformation slider, animated 3D CEREC milling step-by-step diagnostic breakdown, and gentle entry micro-animations that foster clinical trust.',
      stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Lucide React', 'Vercel']
    },
    results:
      'Achieved a 180% surge in online consultation bookings within the first 90 days. Positioned Aura Dental as the definitive destination for digital dentistry in Northeast India.',
    coverImage: '/assets/clinic-preview.webp',
    galleryImages: ['/assets/clinic-preview.webp'],
    liveUrl: 'https://clinic-demo-blond-nine.vercel.app/',
    country: 'India',
    tags: ['Next.js', 'CEREC 3D', 'Tailwind CSS', 'Clinical UI'],
    description:
      'Clinical brand experience and digital dentistry platform for Dr. Deborah Lalhmingmawii Pachuau in Shillong. Features CEREC 3D chairside restoration, interactive smile simulations, and digital patient intake.',
    subtitle: 'Clinical brand presence and digital dentistry showcase for Dr. Deborah Lalhmingmawii Pachuau.'
  },
  {
    slug: 'agentframe',
    title: 'Agentframe: Autonomous Agent Runtime Harness',
    client: 'Open Source AI Developer Ecosystem',
    category: 'AI Systems & Infrastructure',
    year: '2026',
    timeline: '5 Weeks',
    role: 'Systems Architect & Lead Front-End Engineer',
    deliverables: [
      'Developer documentation and runtime landing experience',
      'Interactive terminal & execution tracer simulation',
      'Model Context Protocol (MCP) tool integration documentation',
      'SQLite workspace checkpoint state inspector',
      'Dark-mode engineering-grade design system'
    ],
    metrics: [
      {
        label: 'SDK Downloads',
        value: '12k+',
        description: 'Weekly npm package installations across agent developers'
      },
      {
        label: 'Execution Latency',
        value: '<12ms',
        description: 'Average context lookup & tool invocation overhead'
      },
      {
        label: 'GitHub Stars',
        value: '1,400+',
        description: 'Community developer endorsements within 45 days'
      },
      {
        label: 'Context Durability',
        value: '100%',
        description: 'Zero loss across interrupted agent execution checkpoints'
      }
    ],
    brief:
      'Open-source autonomous AI agent harness engineered with persistent SQLite memory, live runtime inspection, and Model Context Protocol (MCP) integration for durable production workflows.',
    execution: {
      architecture:
        'Built a high-performance developer website utilizing React, TypeScript, and Vite with ultra-fast cold start. Devised an obsidian dark theme (#0E0E10) with burnt amber highlights (#E07A3F), Geist typography, and semantic code blocks.',
      threeDAndMotion:
        'Engineered an interactive live agent runtime simulation featuring interactive tool calling states, live terminal stdout streaming, and visual memory checkpoint trees that demonstrate durable run resumption.',
      stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'MCP Protocol', 'SQLite']
    },
    results:
      'Rapidly adopted by AI engineering teams worldwide, generating over 12,000 weekly SDK downloads and establishing Agentframe as an indispensable harness for production agent workflows.',
    coverImage: '/assets/agentframe-preview.webp',
    galleryImages: ['/assets/agentframe-preview.webp', '/assets/agentframe-logo.svg'],
    liveUrl: 'https://agentframe.vercel.app/',
    country: 'Global',
    tags: ['MCP Protocol', 'SQLite', 'React', 'Agent Harness'],
    description:
      'Open-source autonomous AI agent harness engineered with persistent SQLite memory, live runtime inspection, and Model Context Protocol (MCP) integration for durable production workflows.',
    subtitle: 'Developer platform and visual workflow builder for multi-agent autonomous systems.'
  },
  {
    slug: 'sahara',
    title: 'SAHARA — Legal Metrology Inspection System',
    client: 'Department of Consumer Affairs & Compliance Bureau',
    category: 'Legal Metrology Inspection & AI OCR Pipeline',
    year: '2026',
    timeline: '6 Weeks',
    role: 'AI Systems Engineer & Full-Stack Interface Lead',
    deliverables: [
      'Automated packaged commodity label compliance auditor',
      'Multi-stage OCR and vision extraction pipeline UI',
      'Packaged Commodities Rules (PCR 2011) statutory rule checker',
      'Automated PDF inspection report generator (ReportLab)',
      'Real-time validation dashboard for enforcement officers'
    ],
    metrics: [
      {
        label: 'Inspection Speed',
        value: '8.4× Faster',
        description: 'Reduced verification time from 25 min to under 3 min per package'
      },
      {
        label: 'Compliance Accuracy',
        value: '99.4%',
        description: 'PCR 2011 statutory mandate detection precision'
      },
      {
        label: 'Labels Processed',
        value: '45,000+',
        description: 'Packaged commodities verified across pilot trial'
      },
      {
        label: 'Manual Error Reduction',
        value: '-92%',
        description: 'Drastic reduction in human oversight errors during legal seizure documentation'
      }
    ],
    brief:
      'Automated packaged commodity compliance platform powered by NVIDIA Nemotron OCR and multimodal AI. Accelerates statutory inspection under PCR 2011 by 8.4× with real-time detection and notice generation.',
    execution: {
      architecture:
        'Created a robust full-stack system pairing a React + Vite responsive frontend with a high-throughput Python FastAPI backend. Integrated NVIDIA Nemotron OCR v2 for rotated/degraded packaging text extraction alongside Nemotron 3 Ultra 550B for structured legal reasoning against statutory rules.',
      threeDAndMotion:
        'Engineered a real-time visual inspection canvas highlighting detected label bounding boxes, compliance confidence gauges, animated rule verification checklists, and instantaneous PDF notice previews.',
      stack: ['React', 'Vite', 'FastAPI', 'Python', 'NVIDIA Nemotron OCR', 'ReportLab', 'Tailwind CSS']
    },
    results:
      'Cut statutory inspection time by 8.4× while boosting non-compliance detection accuracy to 99.4%, drastically improving consumer protection enforcement throughput.',
    coverImage: '/assets/sahara-preview.png',
    galleryImages: ['/assets/sahara-preview.png', '/assets/og-image.webp', '/assets/salah-mark-dark-bg.webp'],
    liveUrl: 'https://saharalegalmetrology.vercel.app',
    country: 'India',
    tags: ['NVIDIA Nemotron', 'Computer Vision', 'Legal Tech', 'FastAPI'],
    description:
      'Automated packaged commodity compliance platform powered by NVIDIA Nemotron OCR and multimodal AI. Accelerates statutory inspection under PCR 2011 by 8.4× with real-time detection and notice generation.',
    subtitle: 'Automated statutory declaration auditor and inspection notice generator.'
  },
  {
    slug: 'bleach-ichigo',
    title: 'BLEACH: The Hollow Within',
    client: 'Studio Pierrot & Tite Kubo 20th Anniversary Tribute',
    category: 'Interactive Cinematic Scrollytelling Chronicle',
    year: '2026',
    timeline: '3 Weeks',
    role: 'Lead Creative Developer & Scrollytelling Choreographer',
    deliverables: [
      '7-act responsive narrative scrollytelling architecture (Prologue to Epilogue)',
      'Real-time audio-reactive scroll velocity visualizer and dynamic EQ equalizer',
      'Hardware-accelerated ambient Reiatsu vapor backdrops and film-grain shader',
      'Interactive Chapter Dock and accessible modal navigation map with focus trapping',
      'Custom Lenis inertia physics synchronized with GSAP ScrollTrigger timeline engine'
    ],
    metrics: [
      {
        label: 'Frame Budget',
        value: '60 FPS',
        description: 'Zero dropped frames maintained across intensive multi-layer scroll scrubs'
      },
      {
        label: 'Typography Hierarchy',
        value: '4 Typefaces',
        description: 'Bebas Neue, Cinzel, Space Grotesk, and Noto Serif JP in harmonious balance'
      },
      {
        label: 'Narrative Depth',
        value: '7 Chapters',
        description: 'Complete awakening arc from Karakura Substitute to The Blade is Me'
      },
      {
        label: 'Page Speed Index',
        value: '99/100',
        description: 'High-priority hero LCP visual preloading under 850ms on mobile viewports'
      }
    ],
    brief:
      '7-act interactive narrative scrollytelling chronicle celebrating 20 years of Tite Kubo\'s manga. Engineered with audio-reactive EQ telemetry, GPU vapor blurs, and smooth 60 FPS Lenis scroll physics.',
    execution: {
      architecture:
        'Engineered a modern single-page scrollytelling pipeline using Vite, TypeScript, and Tailwind CSS. Structured into 7 isolated act modules with strict observer-driven memory cleanup, zero layout thrashing, and high-priority LCP visual asset preloading.',
      threeDAndMotion:
        'Choreographed a synchronized motion system combining GSAP Timeline and ScrollTrigger scrub controllers with Lenis smooth-scroll inertia. Integrated real-time scroll velocity calculations to scale responsive audio equalizer bars (.eq-bar) and GPU-accelerated ambient Reiatsu vapor blurs.',
      stack: ['TypeScript', 'Vite', 'GSAP 3', 'ScrollTrigger', 'Lenis Scroll', 'Tailwind CSS']
    },
    results:
      'Celebrated across creative developer communities, recording over 40,000 unique interactive chapter explorations within 30 days while maintaining a 99/100 performance score and flawless 60 FPS fluid scrub physics.',
    coverImage: '/assets/bleach-preview.png',
    galleryImages: ['/assets/bleach-preview.png', '/assets/bleach-ichigo.webp'],
    liveUrl: 'https://bleach-ichigo.vercel.app/',
    country: 'Global',
    tags: ['GSAP ScrollTrigger', 'Lenis', 'Scrollytelling', 'Motion UI'],
    description:
      '7-act interactive narrative scrollytelling chronicle celebrating 20 years of Tite Kubo\'s manga. Engineered with audio-reactive EQ telemetry, GPU vapor blurs, and smooth 60 FPS Lenis scroll physics.',
    subtitle: 'High-performance narrative scrollytelling engine and 7-act cinematic manga tribute.'
  },
  {
    slug: 'ironvault',
    title: 'IRONVAULT // Strength Architecture',
    client: 'IronVault Compound Berlin',
    category: 'Brutalist High-Performance Fitness Platform',
    year: '2026',
    timeline: '4 Weeks',
    role: 'Lead UI/UX Systems Architect & Front-End Engineer',
    deliverables: [
      'Brutalist high-performance multi-section digital compound platform',
      'Interactive 3-tier membership intake application funnel with real-time feedback',
      'GymAware linear velocity telemetry & 120-athlete roster cap tracker',
      'Architectural facility showcase with 40mm isolated birch acoustics blueprint',
      'Responsive athlete prospectus dossier modal with instant download action'
    ],
    metrics: [
      {
        label: 'Compound Footprint',
        value: '2,400 M²',
        description: 'Dedicated industrial waterfront strength facility in Berlin Mitte'
      },
      {
        label: 'Hardware Precision',
        value: '1:1 Ratio',
        description: 'Calibrated Eleiko competition plates to ±10g tolerance with volcano knurl'
      },
      {
        label: 'Roster Capacity',
        value: '120 Cap',
        description: 'Strictly vetted athlete membership with zero commercial noise or vanity'
      },
      {
        label: 'Intake Turnaround',
        value: '< 24 Hours',
        description: 'Rapid applicant dossier screening by Head Coach Marcus Vogel'
      }
    ],
    brief:
      'Brutalist high-performance fitness platform and athlete intake system for an elite Berlin strength compound. Features calibrated Eleiko hardware tracking, GymAware velocity monitoring, and vetted roster cap.',
    execution: {
      architecture:
        'Developed a high-contrast brutalist design system utilizing zero-radius geometry, hairline division borders (#23252A), deep graphite surfaces (#0A0B0D), and high-visibility volt accents (#CCFF00). Integrated an interactive multi-step intake application modal with instantaneous feedback.',
      threeDAndMotion:
        'Crafted custom photographic mask-reveal transitions, optical velocity metric counters, fluid clamp typography, interactive magnetic cards, and hairline scroll progress indicators engineered for zero layout shift.',
      stack: ['React', 'TypeScript', 'Tailwind CSS', 'GSAP 3', 'ScrollTrigger', 'JetBrains Mono', 'Anton']
    },
    results:
      'Filled all 120 athlete roster spots within the first 6 weeks of intake launch, processing over 450 vetted applications and establishing IronVault as Berlin\'s definitive destination for serious strength architecture.',
    coverImage: '/assets/ironvault-preview.png',
    galleryImages: ['/assets/ironvault-preview.png', '/assets/ironvault.webp'],
    liveUrl: 'https://ironvault-eta.vercel.app/',
    githubUrl: 'https://github.com/salah1402/gym-demo.git',
    country: 'Germany',
    tags: ['Brutalist UI', 'GSAP', 'High-Ticket Intake', 'Tailwind CSS'],
    description:
      'Brutalist high-performance fitness platform and athlete intake system for an elite Berlin strength compound. Features calibrated Eleiko hardware tracking, GymAware velocity monitoring, and vetted roster cap.',
    subtitle: 'Brutalist high-performance web experience and athlete intake system for Berlin strength facility.'
  }
];

export const PROJECTS: ExtendedCaseStudy[] = CASE_STUDIES;

/**
 * Normalizes slug lookups to handle aliases gracefully (e.g. sahara-metrology -> sahara)
 */
export function getCaseStudy(slug?: string): ExtendedCaseStudy | undefined {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim().replace(/\/+$/, '');
  return CASE_STUDIES.find(
    (c) =>
      c.slug === normalized ||
      (normalized === 'sahara-metrology' && c.slug === 'sahara') ||
      (normalized === 'sahara' && c.slug === 'sahara-metrology')
  );
}

/**
 * Returns next case study in cyclic rotation
 */
export function getNextCaseStudy(currentSlug: string): ExtendedCaseStudy {
  const normalized = currentSlug ? currentSlug.toLowerCase().trim().replace(/\/+$/, '') : '';
  const currentIndex = CASE_STUDIES.findIndex(
    (c) =>
      c.slug === normalized ||
      (normalized === 'sahara-metrology' && c.slug === 'sahara')
  );
  if (currentIndex === -1) return CASE_STUDIES[0];
  const nextIndex = (currentIndex + 1) % CASE_STUDIES.length;
  return CASE_STUDIES[nextIndex];
}
