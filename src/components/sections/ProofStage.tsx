import React from 'react';
import { Link } from 'react-router-dom';
import { FloatingTrail } from './FloatingTrail';
import { TestimonialSlider } from './TestimonialSlider';

/**
 * Proof Stage (#proof) matching thinkingods.com
 * Features:
 * - Dual-column layout:
 *   1. Left: Cursor-driven floating thumbnail trail (#trail) with "See for yourself"
 *   2. Right: Deep graphite quote panel with rotating client testimonials
 * - Bottom: High-velocity delivery proof cards with turnaround chips
 */
export const ProofStage: React.FC = () => {
  return (
    <section id="proof" className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-10 border-b border-[#2b2b2b]/10">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-10 sm:gap-14">
        {/* Stage Header */}
        <div className="max-w-3xl flex flex-col gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#2b2b2b]/65 font-medium tabular-nums">
            Proof of impact
          </p>
          <h2 className="font-display font-medium text-[clamp(32px,4.4vw,72px)] tracking-[-0.04em] leading-[0.94] text-[#2b2b2b] m-0">
            Validated by founders.
          </h2>
        </div>

        {/* Dual Canvas Layout: Left Cursor Trail, Right Testimonials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          <div className="flex">
            <FloatingTrail />
          </div>

          <div className="flex">
            <TestimonialSlider />
          </div>
        </div>

        {/* Latest Delivery Strip matching Thinking Gods */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 mt-4 items-stretch">
          <div className="md:col-span-4 p-6 sm:p-8 rounded-[16px] bg-[#fafafa] border border-[#2b2b2b]/15 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h3 className="font-display font-medium text-xl sm:text-2xl text-[#2b2b2b] m-0 tracking-[-0.02em]">
                Latest delivery
              </h3>
              <p className="font-sans text-[15px] text-[#2b2b2b]/75 m-0">
                New projects typically start within 2 weeks.
              </p>
            </div>
            <Link to="/contact" className="btn btn--solid self-start text-[11px] tracking-[0.12em] font-medium">
              Request a quote
            </Link>
          </div>

          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/work/aura-dental"
              className="p-6 rounded-[16px] bg-[#fafafa] border border-[#2b2b2b]/15 flex flex-col justify-between gap-6 hover:bg-white hover:-translate-y-1 transition-all no-underline text-inherit"
            >
              <p className="font-sans text-[15px] text-[#2b2b2b]/85 m-0 leading-snug">
                Clinical luxury dentistry and CEREC 3D chairside CAD/CAM restoration showcase.
              </p>
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[#2b2b2b]/65 font-medium tabular-nums">
                <span className="px-2 py-1 rounded bg-[#2b2b2b]/5">India</span>
                <span className="px-2 py-1 rounded bg-[#2b2b2b]/5">3 weeks</span>
              </div>
            </Link>

            <Link
              to="/work/privilege-interiors"
              className="p-6 rounded-[16px] bg-[#fafafa] border border-[#2b2b2b]/15 flex flex-col justify-between gap-6 hover:bg-white hover:-translate-y-1 transition-all no-underline text-inherit"
            >
              <p className="font-sans text-[15px] text-[#2b2b2b]/85 m-0 leading-snug">
                Spatial architectural portfolio lifting digital consultation calls 210%.
              </p>
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[#2b2b2b]/65 font-medium tabular-nums">
                <span className="px-2 py-1 rounded bg-[#2b2b2b]/5">India</span>
                <span className="px-2 py-1 rounded bg-[#2b2b2b]/5">4 weeks</span>
              </div>
            </Link>

            <Link
              to="/work/agentframe"
              className="p-6 rounded-[16px] bg-[#fafafa] border border-[#2b2b2b]/15 flex flex-col justify-between gap-6 hover:bg-white hover:-translate-y-1 transition-all no-underline text-inherit"
            >
              <p className="font-sans text-[15px] text-[#2b2b2b]/85 m-0 leading-snug">
                Engineering developer harness with durable context memory checkpoints.
              </p>
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[#2b2b2b]/65 font-medium tabular-nums">
                <span className="px-2 py-1 rounded bg-[#2b2b2b]/5">Global</span>
                <span className="px-2 py-1 rounded bg-[#2b2b2b]/5">5 weeks</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProofStage;
