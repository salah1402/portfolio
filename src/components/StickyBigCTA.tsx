import React from 'react';

interface StickyBigCTAProps {
  onOpenLeadModal: () => void;
}

export const StickyBigCTA: React.FC<StickyBigCTAProps> = ({ onOpenLeadModal }) => {
  return (
    <section className="py-28 sm:py-36 border-t border-[#e2e2e2] bg-[#f1f1f1] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <div className="max-w-5xl flex flex-col items-center gap-8">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#fc4778]">
          Ready to Elevate Your Digital Flagship?
        </span>

        <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[#1a1a1a] leading-[0.92]">
          Let’s talk about your next project.
        </h2>

        <p className="font-sans text-lg sm:text-xl text-[#1a1a1a]/70 max-w-xl">
          Taking select design &amp; 3D engineering commissions for this quarter. Let’s build something extraordinary together.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={onOpenLeadModal}
            className="px-8 py-4 rounded-full bg-[#1a1a1a] text-[#f1f1f1] font-mono text-xs uppercase tracking-[0.14em] hover:bg-[#fc4778] hover:text-[#1a1a1a] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Start a conversation →
          </button>
        </div>
      </div>
    </section>
  );
};
