import React from 'react';
import { Hero } from '../components/sections/Hero';
import { Process } from '../components/sections/Process';
import { SelectedWorks } from '../components/sections/SelectedWorks';
import { AboutTeaser } from '../components/sections/AboutTeaser';
import { ProofStage } from '../components/sections/ProofStage';
import { StickyBigCTA } from '../components/sections/StickyBigCTA';
import { PricingCalculator } from '../components/sections/PricingCalculator';
import { FaqAccordion } from '../components/sections/FaqAccordion';
import { useModal } from '../App';

/**
 * HomePage Flagship Studio Experience
 * Coordinates the full editorial sequence matching thinkingods.com:
 * 1. Hero: Display headline, credential ticker, client trust logos (#hero)
 * 2. Process: 4-stage sticky stacking cards (#process) with geometric SVG glyphs
 * 3. SelectedWorks: 2-column responsive grid (#work) with 4:3 cards and hover dimming
 * 4. AboutTeaser: Founder portrait and editorial bio highlight (#about)
 * 5. ProofStage: Interactive dual-column stage (#proof) with pointer floating trail & testimonial slider
 * 6. StickyBigCTA: Scroll-pinned oversized banner (.cta-big) with sequential word illumination
 * 7. PricingCalculator: Dynamic scope & pricing matrix (#pricing) with currency toggle & retainers
 * 8. FaqAccordion: Height-animated expandable FAQs (#faq)
 */
export const HomePage: React.FC = () => {
  const { openModal } = useModal();

  return (
    <div className="flex flex-col selection:bg-[#fc4778]/20 selection:text-[#1a1a1a]">
      {/* 01. Flagship Hero Section */}
      <Hero onOpenLeadModal={() => openModal()} />

      {/* Post-Hero Main Content: Pure Solid White Background (No Dots) */}
      <div className="w-full bg-white text-[#2b2b2b] flex flex-col">
        {/* 02. 4-Stage Process Section */}
        <Process />

        {/* 03. Selected Works Showcase Grid */}
        <SelectedWorks />

        {/* 04. Editorial About Teaser */}
        <AboutTeaser />

        {/* 05. Interactive Proof Stage & Floating Trail */}
        <ProofStage />

        {/* 06. Sticky Big CTA Banner */}
        <StickyBigCTA onOpenLeadModal={() => openModal()} />

        {/* 07. Dynamic Scope & Pricing Calculator */}
        <PricingCalculator onOpenLeadModal={(data) => openModal(data)} />

        {/* 08. FAQ Accordion Section */}
        <FaqAccordion />
      </div>
    </div>
  );
};

export default HomePage;
