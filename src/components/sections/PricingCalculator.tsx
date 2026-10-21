import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  PROJECT_TYPES,
  PAGE_COUNTS,
  MOTION_EFFORTS,
  URGENCIES,
  RETAINERS,
  calculateProjectScope,
} from '../../data/pricing';
import { CalculatorState, Currency, ProjectTypeId } from '../../types';

export interface PricingCalculatorSectionProps {
  onOpenLeadModal?: (initialData?: { scope?: string; budget?: string; timeline?: string; message?: string }) => void;
}

const PAGE_KEYS: Array<'1' | '3-5' | '6-10' | '10+'> = ['1', '3-5', '6-10', '10+'];
const EFFORT_KEYS: Array<'standard' | 'creative'> = ['standard', 'creative'];
const URGENCY_KEYS: Array<'standard' | 'rush'> = ['standard', 'rush'];

export const PricingCalculator: React.FC<PricingCalculatorSectionProps> = ({ onOpenLeadModal }) => {
  const [activeTab, setActiveTab] = useState<'single' | 'recurring'>('single');
  const [calcState, setCalcState] = useState<CalculatorState>({
    projectType: 'multipage',
    pageCount: '3-5',
    motionEffort: 'standard',
    urgency: 'standard',
    currency: 'INR',
  });

  const calcResult = calculateProjectScope(calcState);

  // Animated number counter for the estimated investment amount
  const [animatedDisplayPrice, setAnimatedDisplayPrice] = useState<number>(calcResult.displayPrice);
  const prevPriceRef = useRef<number>(calcResult.displayPrice);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const targetPrice = calcResult.displayPrice;
    const startPrice = prevPriceRef.current;

    if (startPrice === targetPrice) {
      return;
    }

    // Respect prefers-reduced-motion: immediately set final value
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setAnimatedDisplayPrice(targetPrice);
      prevPriceRef.current = targetPrice;
      return;
    }

    const duration = 500; // ~500ms duration
    const startTime = performance.now();

    // Smooth cubic ease-out: 1 - Math.pow(1 - t, 3)
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentVal = Math.round(startPrice + (targetPrice - startPrice) * easedProgress);
      setAnimatedDisplayPrice(currentVal);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedDisplayPrice(targetPrice);
        prevPriceRef.current = targetPrice;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [calcResult.displayPrice]);

  // Format animated price matching currency & custom quote rules
  const getFormattedAnimatedPrice = () => {
    let formatted = '';
    if (calcState.currency === 'USD') {
      formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(animatedDisplayPrice);
    } else if (calcState.currency === 'EUR') {
      formatted = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(animatedDisplayPrice);
    } else {
      const kVal = Math.round(animatedDisplayPrice / 1000);
      formatted = `₹${kVal}k`;
    }

    return calcResult.isCustomQuote ? `${formatted} (est.)` : formatted;
  };

  const handleBookWithEstimate = () => {
    onOpenLeadModal?.({
      scope: calcState.projectType,
      budget:
        calcResult.priceINR <= 25000
          ? 'under-1.5l'
          : calcResult.priceINR <= 60000
          ? '1.5l-3l'
          : '3l-5l',
      timeline: calcState.urgency === 'rush' ? 'rush' : 'standard',
      message: `Estimated scope: ${PROJECT_TYPES[calcState.projectType].label} (${calcResult.formattedTimeline}, approx ${calcResult.formattedPrice})`,
    });
  };

  const handleReserveRetainer = (tierId: string, priceINR: number) => {
    onOpenLeadModal?.({
      scope: `retainer-${tierId}`,
      budget: `retainer-${Math.round(priceINR / 1000)}k`,
      timeline: 'retainer',
      message: `Inquiry regarding the ${RETAINERS.find(r => r.id === tierId)?.name || 'Retainer'} (₹${priceINR.toLocaleString('en-IN')}/month).`,
    });
  };

  const getRetainerDisplayPrice = (priceINR: number) => {
    if (calcState.currency === 'USD') {
      const val = Math.round(priceINR / 85);
      return `$${val.toLocaleString('en-US')}`;
    }
    if (calcState.currency === 'EUR') {
      const val = Math.round(priceINR / 92);
      return `€${val.toLocaleString('de-DE')}`;
    }
    return `₹${priceINR.toLocaleString('en-IN')}`;
  };

  const pageIndex = PAGE_KEYS.indexOf(calcState.pageCount);

  return (
    <section id="pricing" className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-12 border-b border-[#2b2b2b]/10 bg-[#f1f1f1]">
      <div className="max-w-[1520px] mx-auto flex flex-col gap-12 sm:gap-16">
        
        {/* Section Header: Editorial & Minimal */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#2b2b2b]/15">
          <div className="flex flex-col gap-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#fc4778]" />
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#2b2b2b]/65 font-medium tabular-nums m-0">
                Studio Quote Instrument
              </p>
            </div>
            <h2 className="font-display font-medium text-[clamp(34px,4.5vw,72px)] tracking-[-0.04em] leading-[0.95] text-[#2b2b2b] m-0">
              Interactive pricing.
            </h2>
            <p className="font-sans text-[clamp(15px,1.1vw,18px)] text-[#2b2b2b]/75 leading-relaxed m-0 text-pretty">
              Clear, transparent investment estimates for independent client engagements. Custom design and code built with intention.
            </p>
          </div>

          {/* Currency Switcher & Mode Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Currency Select */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2b2b2b]/15 bg-[#fafafa]/80 backdrop-blur-xs">
              <label htmlFor="currency-select" className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#2b2b2b]/60 font-medium tabular-nums">
                Currency
              </label>
              <select
                id="currency-select"
                value={calcState.currency}
                onChange={(e) => setCalcState({ ...calcState, currency: e.target.value as Currency })}
                className="bg-transparent font-mono text-xs text-[#2b2b2b] font-semibold focus:outline-none cursor-pointer tabular-nums"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center p-1 rounded-full border border-[#2b2b2b]/15 bg-[#fafafa]/80 backdrop-blur-xs">
              <button
                type="button"
                onClick={() => setActiveTab('single')}
                className={`px-4 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-wider font-medium tabular-nums transition-all ${
                  activeTab === 'single'
                    ? 'bg-[#2b2b2b] text-[#f1f1f1] shadow-xs'
                    : 'text-[#2b2b2b]/65 hover:text-[#2b2b2b]'
                }`}
              >
                Single project
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('recurring')}
                className={`px-4 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-wider font-medium tabular-nums transition-all ${
                  activeTab === 'recurring'
                    ? 'bg-[#2b2b2b] text-[#f1f1f1] shadow-xs'
                    : 'text-[#2b2b2b]/65 hover:text-[#2b2b2b]'
                }`}
              >
                Recurring maintenance
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: Single Project Floating Studio Instrument */}
        {activeTab === 'single' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Interactive Configuration Sliders & Selectors */}
            <div className="lg:col-span-7 flex flex-col gap-10">
              
              {/* Step 1: Project Type Selection */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-[#fc4778] tabular-nums">01</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#2b2b2b]/70 font-semibold">
                      Project Type
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#2b2b2b]/55 font-medium tabular-nums">
                    Starting: {calcState.currency === 'INR' ? `₹${PROJECT_TYPES[calcState.projectType].basePriceINR.toLocaleString('en-IN')}` : calcState.currency === 'USD' ? `$${Math.round(PROJECT_TYPES[calcState.projectType].basePriceINR / 85)}` : `€${Math.round(PROJECT_TYPES[calcState.projectType].basePriceINR / 92)}`}
                  </span>
                </div>

                {/* Dropdown Selector */}
                <div className="relative">
                  <select
                    value={calcState.projectType}
                    onChange={(e) => setCalcState({ ...calcState, projectType: e.target.value as ProjectTypeId })}
                    className="w-full bg-[#fafafa] border border-[#2b2b2b]/15 hover:border-[#2b2b2b]/35 focus:border-[#2b2b2b] rounded-[10px] px-4 py-3.5 font-sans text-base text-[#2b2b2b] focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    {Object.values(PROJECT_TYPES).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label} &mdash; Starting at ₹{t.basePriceINR.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#2b2b2b]/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="font-sans text-xs text-[#2b2b2b]/65 m-0 leading-normal">
                  {PROJECT_TYPES[calcState.projectType].description} ({PROJECT_TYPES[calcState.projectType].includedPages})
                </p>
              </div>

              {/* Step 2: Project Size (Tactile Horizontal Slider) */}
              <div className="flex flex-col gap-4 pt-4 border-t border-[#2b2b2b]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-[#fc4778] tabular-nums">02</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#2b2b2b]/70 font-semibold">
                      Project Size
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-semibold text-[#2b2b2b]">
                      {PAGE_COUNTS[calcState.pageCount].label}
                    </span>
                    {PAGE_COUNTS[calcState.pageCount].timelineDeltaWeeks > 0 && (
                      <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2b2b2b]/5 text-[#2b2b2b]/70 font-medium">
                        +{PAGE_COUNTS[calcState.pageCount].timelineDeltaWeeks}w
                      </span>
                    )}
                  </div>
                </div>

                {/* Tactile Range Slider */}
                <div className="flex flex-col gap-2">
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="1"
                    value={pageIndex}
                    onChange={(e) => setCalcState({ ...calcState, pageCount: PAGE_KEYS[parseInt(e.target.value, 10)] })}
                    className="w-full accent-[#2b2b2b] h-1.5 bg-[#2b2b2b]/15 rounded-lg appearance-none cursor-pointer"
                    aria-label="Project Size Slider"
                  />
                  {/* Step Ticks */}
                  <div className="flex justify-between items-center text-[11px] font-mono text-[#2b2b2b]/60 pt-1">
                    {PAGE_KEYS.map((key, idx) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCalcState({ ...calcState, pageCount: key })}
                        className={`transition-colors hover:text-[#2b2b2b] cursor-pointer ${
                          pageIndex === idx ? 'font-semibold text-[#2b2b2b]' : ''
                        }`}
                      >
                        {PAGE_COUNTS[key].label}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="font-sans text-xs text-[#2b2b2b]/65 m-0 leading-normal">
                  {PAGE_COUNTS[calcState.pageCount].description}
                </p>
              </div>

              {/* Step 3: Motion & Interactive Effort (Segmented Scale Cards) */}
              <div className="flex flex-col gap-4 pt-4 border-t border-[#2b2b2b]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-[#fc4778] tabular-nums">03</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#2b2b2b]/70 font-semibold">
                      Motion & Interactive Effort
                    </span>
                  </div>
                  <span className="font-display text-sm font-semibold text-[#2b2b2b]">
                    {MOTION_EFFORTS[calcState.motionEffort].label}
                  </span>
                </div>

                {/* Option Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {EFFORT_KEYS.map((effortKey) => {
                    const isSelected = calcState.motionEffort === effortKey;
                    const effort = MOTION_EFFORTS[effortKey];
                    return (
                      <button
                        key={effortKey}
                        type="button"
                        onClick={() => setCalcState({ ...calcState, motionEffort: effortKey })}
                        className={`text-left p-4 rounded-[12px] border transition-all cursor-pointer flex flex-col gap-2 ${
                          isSelected
                            ? 'bg-[#fafafa] border-[#2b2b2b] shadow-xs'
                            : 'bg-transparent border-[#2b2b2b]/15 hover:border-[#2b2b2b]/35'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-mono text-xs font-semibold ${isSelected ? 'text-[#2b2b2b]' : 'text-[#2b2b2b]/70'}`}>
                            {effort.label}
                          </span>
                          <span className={`font-mono text-[10px] tabular-nums ${isSelected ? 'text-[#fc4778] font-semibold' : 'text-[#2b2b2b]/50'}`}>
                            {effortKey === 'standard' ? 'Included' : '+₹8k–₹18k'}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-[#2b2b2b]/65 m-0 leading-relaxed">
                          {effort.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Production Timeline (Selectable Option Cards matching Step 3) */}
              <div className="flex flex-col gap-4 pt-4 border-t border-[#2b2b2b]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-[#fc4778] tabular-nums">04</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#2b2b2b]/70 font-semibold">
                      Production Timeline
                    </span>
                  </div>
                  <span className="font-display text-sm font-semibold text-[#2b2b2b]">
                    {URGENCIES[calcState.urgency].label}
                  </span>
                </div>

                {/* Two Selectable Option Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option A — Standard Delivery */}
                  <button
                    type="button"
                    onClick={() => setCalcState({ ...calcState, urgency: 'standard' })}
                    className={`text-left p-4 rounded-[12px] border transition-all cursor-pointer flex flex-col gap-2 ${
                      calcState.urgency === 'standard'
                        ? 'bg-[#fafafa] border-[#2b2b2b] shadow-xs'
                        : 'bg-transparent border-[#2b2b2b]/15 hover:border-[#2b2b2b]/35'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-xs font-semibold ${calcState.urgency === 'standard' ? 'text-[#2b2b2b]' : 'text-[#2b2b2b]/70'}`}>
                        Standard Delivery
                      </span>
                      <span className={`font-mono text-[10px] tabular-nums ${calcState.urgency === 'standard' ? 'text-[#fc4778] font-semibold' : 'text-[#2b2b2b]/50'}`}>
                        No surcharge
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#2b2b2b]/65 m-0 leading-relaxed">
                      Balanced delivery with planned review cycles and proper testing.
                    </p>
                  </button>

                  {/* Option B — Rush / Priority Sprint */}
                  <button
                    type="button"
                    onClick={() => setCalcState({ ...calcState, urgency: 'rush' })}
                    className={`text-left p-4 rounded-[12px] border transition-all cursor-pointer flex flex-col gap-2 ${
                      calcState.urgency === 'rush'
                        ? 'bg-[#fafafa] border-[#2b2b2b] shadow-xs'
                        : 'bg-transparent border-[#2b2b2b]/15 hover:border-[#2b2b2b]/35'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-xs font-semibold ${calcState.urgency === 'rush' ? 'text-[#2b2b2b]' : 'text-[#2b2b2b]/70'}`}>
                        Rush / Priority Sprint
                      </span>
                      <span className={`font-mono text-[10px] tabular-nums ${calcState.urgency === 'rush' ? 'text-[#fc4778] font-semibold' : 'text-[#2b2b2b]/50'}`}>
                        +20% surcharge
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#2b2b2b]/65 m-0 leading-relaxed">
                      Priority scheduling with a compressed delivery window.
                    </p>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Floating Live Quote Summary (Suspended Instrument) */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="flex flex-col gap-8 p-6 sm:p-8 rounded-[20px] border border-[#2b2b2b]/15 bg-[#fafafa]/80 backdrop-blur-md">
                
                {/* Status Indicator */}
                <div className="flex items-center justify-between pb-4 border-b border-[#2b2b2b]/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#2b2b2b]/70 font-semibold">
                      Live Studio Calculation
                    </span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#2b2b2b]/50 tabular-nums font-medium">
                    Estimate Only
                  </span>
                </div>

                {/* Hero Numerals: Estimated Price & Timeline */}
                <div className="flex flex-col gap-6">
                  {/* Price */}
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#2b2b2b]/60 font-medium">
                      Estimated Investment
                    </span>
                    <div className="font-display font-medium text-[clamp(38px,3.8vw,56px)] text-[#2b2b2b] tracking-tight leading-none tabular-nums transition-all duration-300">
                      {getFormattedAnimatedPrice()}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#2b2b2b]/10">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#2b2b2b]/60 font-medium">
                        Production Velocity
                      </span>
                      <span className="font-display text-2xl font-medium text-[#2b2b2b] tracking-tight tabular-nums">
                        {calcResult.formattedTimeline}
                      </span>
                    </div>
                    <div className="text-right flex flex-col gap-0.5">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#2b2b2b]/50 font-medium">
                        Milestones
                      </span>
                      <span className="font-mono text-xs text-[#2b2b2b]/80 font-semibold tabular-nums">
                        50 / 25 / 25
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scope Breakdown Chips */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#2b2b2b]/5 text-[#2b2b2b]/75 font-medium">
                    {PROJECT_TYPES[calcState.projectType].label}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#2b2b2b]/5 text-[#2b2b2b]/75 font-medium">
                    {PAGE_COUNTS[calcState.pageCount].label}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#2b2b2b]/5 text-[#2b2b2b]/75 font-medium">
                    {MOTION_EFFORTS[calcState.motionEffort].label}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#2b2b2b]/5 text-[#2b2b2b]/75 font-medium">
                    {URGENCIES[calcState.urgency].label}
                  </span>
                </div>

                {/* Primary CTA Button */}
                <div className="flex flex-col gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleBookWithEstimate}
                    className="btn btn--solid w-full py-[14px] text-xs tracking-[0.14em] font-medium flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Start a conversation</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>

                  <p className="font-sans text-[11px] text-[#2b2b2b]/60 leading-normal text-center m-0">
                    Planning estimate for design & development. Excludes third-party fees (domain, hosting, APIs) and taxes. Binding quotes confirmed upon technical review.
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Recurring Retainer Plans (Ongoing Maintenance & Iteration) */}
        {activeTab === 'recurring' && (
          <div className="flex flex-col gap-6">
            <div className="p-4 rounded-[12px] bg-[#fafafa]/60 border border-[#2b2b2b]/10 max-w-2xl">
              <p className="font-sans text-xs text-[#2b2b2b]/70 m-0 leading-relaxed">
                <strong className="text-[#2b2b2b]">Ongoing Maintenance Model:</strong> Designed for post-launch upkeep, dependency updates, and incremental iteration. Ongoing maintenance is distinctly priced from one-time project builds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {RETAINERS.map((tier) => {
                const isPopular = tier.popular;
                return (
                  <div
                    key={tier.id}
                    className={`p-6 sm:p-8 rounded-[18px] border flex flex-col justify-between gap-6 transition-all ${
                      isPopular
                        ? 'bg-[#fafafa] border-[#2b2b2b] shadow-xs'
                        : 'bg-[#fafafa]/80 border-[#2b2b2b]/15 hover:border-[#2b2b2b]/35'
                    }`}
                  >
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#2b2b2b]/70 font-semibold tabular-nums">
                          {tier.name}
                        </span>
                        {isPopular && (
                          <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#fc4778]/15 text-[#fc4778] font-medium tabular-nums">
                            Recommended
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display text-3xl sm:text-4xl font-medium text-[#2b2b2b] tracking-tight tabular-nums">
                          {getRetainerDisplayPrice(tier.priceINR)}
                        </span>
                        <span className="font-mono text-xs text-[#2b2b2b]/55 font-medium tabular-nums">/month</span>
                      </div>

                      <p className="font-sans text-[14px] text-[#2b2b2b]/75 m-0 leading-normal">
                        {tier.hours} &mdash; <span className="font-medium text-[#2b2b2b]">{tier.sla}</span>
                      </p>

                      <div className="w-full h-[1px] bg-[#2b2b2b]/10 my-1" />

                      <ul className="list-none p-0 m-0 flex flex-col gap-2.5 font-sans text-xs text-[#2b2b2b]/85">
                        {tier.deliverables.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="text-[#fc4778] select-none font-bold text-xs mt-0.5">→</span>
                            <span className="leading-normal">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReserveRetainer(tier.id, tier.priceINR)}
                      className="btn btn--solid w-full py-[12px] text-xs tracking-[0.12em] font-medium cursor-pointer"
                    >
                      <span>Reserve Maintenance</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default PricingCalculator;
