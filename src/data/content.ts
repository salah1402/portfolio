export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
}

export const TESTIMONIALS: TestimonialItem[] = [
  {
    quote:
      'Good digital experiences don’t happen by accident. Every detail has a purpose — from the first interaction to the final implementation. I bring design thinking, engineering discipline, and creative experimentation together to build digital experiences with intention.',
    author: 'SALAH STUDIO',
    role: 'CREATIVE DEVELOPMENT',
    company: 'INTERACTIVE WEB',
  },
  {
    quote:
      'We combine engineering rigor with editorial typography, spatial design, and hardware-accelerated 3D to build digital flagships that convert visitors into lasting partners.',
    author: 'SALAH STUDIO',
    role: 'STUDIO ETHOS',
    company: 'MODERN WEB CRAFT',
  },
  {
    quote: 'Simplicity is not the absence of clutter, but the presence of purpose.',
    author: 'SALAH STUDIO',
    role: 'DESIGN ENGINEERING',
    company: 'CREATIVE SYSTEMS',
  },
];

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQS: FAQItem[] = [
  {
    question: 'How does an engagement with SALAH studio typically work?',
    answer:
      'Every project starts with a conversation about your goals, audience, and requirements. From there, I define the scope, establish a clear direction, build the experience, and refine it through feedback and testing before launch.'
  },
  {
    question: 'What is your 3D and front-end technology stack?',
    answer:
      "I work with modern front-end technologies, including React, TypeScript, and creative development tools such as Three.js and React Three Fiber. The stack is chosen around each project's needs, with performance, responsiveness, and maintainability in mind."
  },
  {
    question: 'How is project pricing determined, and what are your payment terms?',
    answer:
      "Pricing depends on the project's scope, complexity, functionality, and timeline. The pricing calculator provides an initial estimate, not a fixed quote. After discussing your requirements, I'll confirm the scope, final price, milestones, and payment schedule before work begins."
  },
  {
    question: 'How long does a typical project take from brief to launch?',
    answer:
      'Timelines depend on the scope and complexity of the project. A focused landing page may take around 1–2 weeks, while a multi-page website typically takes 3–5 weeks. Projects involving custom 3D experiences, integrations, or complex functionality may take longer. A realistic timeline will be agreed upon before development begins.'
  },
  {
    question: 'Do you work with international clients outside India?',
    answer:
      'Yes. SALAH can work with clients internationally through remote collaboration, digital communication, and structured feedback cycles. Project scope, timelines, and communication expectations are agreed upon before work begins.'
  },
  {
    question: 'Can you integrate custom APIs, CMS platforms, or AI backends?',
    answer:
      "Yes, depending on the project's requirements. I can build front-end integrations with APIs, connect suitable CMS platforms, and work with AI-powered backends. The implementation depends on the available services, technical constraints, and the scope agreed upon."
  }
];
