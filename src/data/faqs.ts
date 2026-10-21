export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'process' | 'technology' | 'pricing' | 'engagement';
}

export const FAQS: FaqItem[] = [
  {
    id: 'studio-process',
    category: 'process',
    question: 'How does an engagement with SALAH studio typically work?',
    answer:
      'Every project starts with a conversation about your goals, audience, and requirements. From there, I define the scope, establish a clear direction, build the experience, and refine it through feedback and testing before launch.'
  },
  {
    id: 'technology-stack',
    category: 'technology',
    question: 'What is your 3D and front-end technology stack?',
    answer:
      "I work with modern front-end technologies, including React, TypeScript, and creative development tools such as Three.js and React Three Fiber. The stack is chosen around each project's needs, with performance, responsiveness, and maintainability in mind."
  },
  {
    id: 'pricing-and-terms',
    category: 'pricing',
    question: 'How is project pricing determined, and what are your payment terms?',
    answer:
      "Pricing depends on the project's scope, complexity, functionality, and timeline. The pricing calculator provides an initial estimate, not a fixed quote. After discussing your requirements, I'll confirm the scope, final price, milestones, and payment schedule before work begins."
  },
  {
    id: 'project-timelines',
    category: 'process',
    question: 'How long does a typical project take from brief to launch?',
    answer:
      'Timelines depend on the scope and complexity of the project. A focused landing page may take around 1–2 weeks, while a multi-page website typically takes 3–5 weeks. Projects involving custom 3D experiences, integrations, or complex functionality may take longer. A realistic timeline will be agreed upon before development begins.'
  },
  {
    id: 'international-clients',
    category: 'engagement',
    question: 'Do you work with international clients outside India?',
    answer:
      'Yes. SALAH can work with clients internationally through remote collaboration, digital communication, and structured feedback cycles. Project scope, timelines, and communication expectations are agreed upon before work begins.'
  },
  {
    id: 'custom-integrations',
    category: 'technology',
    question: 'Can you integrate custom APIs, CMS platforms, or AI backends?',
    answer:
      "Yes, depending on the project's requirements. I can build front-end integrations with APIs, connect suitable CMS platforms, and work with AI-powered backends. The implementation depends on the available services, technical constraints, and the scope agreed upon."
  }
];
