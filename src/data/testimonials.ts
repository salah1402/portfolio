export interface Testimonial {
  id: string;
  quote: string;
  description?: string;
  author: string;
  role: string;
  company: string;
  location: string;
  projectSlug?: string;
  metric?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'studio-intent',
    quote: "Good digital experiences don't happen by accident.",
    description:
      'Every detail has a purpose — from the first interaction to the final implementation. I bring design thinking, engineering discipline, and creative experimentation together to build digital experiences with intention.',
    author: 'SALAH STUDIO',
    role: 'CREATIVE DEVELOPMENT',
    company: 'INTERACTIVE WEB',
    location: 'Thanjavur, India',
  },
  {
    id: 'studio-craft',
    quote: 'Design with intent. Code with precision. Build with curiosity.',
    description:
      'Fluid typography scales, tactile micro-interactions, and real-time WebGL graphics that elevate brand perception without degrading device performance.',
    author: 'SALAH STUDIO',
    role: 'FRONT-END ARCHITECTURE',
    company: 'SPATIAL GRAPHICS',
    location: 'Thanjavur, India',
  },
  {
    id: 'studio-clarity',
    quote: 'Simplicity is not the absence of clutter, but the presence of purpose.',
    description:
      'Translating visual ambition and technical complexity into maintainable, responsive web experiences that load with sub-second immediacy.',
    author: 'SALAH STUDIO',
    role: 'DESIGN ENGINEERING',
    company: 'CREATIVE SYSTEMS',
    location: 'Thanjavur, India',
  },
];
