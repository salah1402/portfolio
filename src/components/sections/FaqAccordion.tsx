import React, { useState } from 'react';
import { FAQS } from '../../data/faqs';

/**
 * FAQ Accordion Component (#faq) matching thinkingods.com
 * Features:
 * - Clean section headline: "Questions, answered."
 * - Minimalist hairline dividers (rgba(43,43,43,0.14))
 * - Single-expand state management
 * - Animated plus-to-minus line morph icon
 * - Accessible ARIA attributes
 */
export const FaqAccordion: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-10 border-b border-[#2b2b2b]/10">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#2b2b2b]/65 font-medium tabular-nums m-0">
            FAQ
          </p>
          <h2 className="font-display font-medium text-[clamp(32px,4.4vw,72px)] tracking-[-0.04em] leading-[0.94] text-[#2b2b2b] m-0">
            Questions, answered.
          </h2>
          <p className="font-sans text-[15px] text-[#2b2b2b]/75 m-0 leading-relaxed max-w-[40ch] text-pretty">
            Need something not covered here? Send a message through the contact form and we will reply within one business day.
          </p>
        </div>

        {/* Right Column: Accordion Items List */}
        <div className="lg:col-span-8 flex flex-col divide-y divide-[#2b2b2b]/10 border-y border-[#2b2b2b]/10">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div key={faq.id} className="py-4 sm:py-6">
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className="w-full min-h-[48px] py-2 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fc4778] rounded-sm group cursor-pointer"
                >
                  <span className="font-display font-medium text-[clamp(18px,1.8vw,26px)] tracking-[-0.025em] text-[#2b2b2b] group-hover:text-[#fc4778] transition-colors pr-6">
                    {faq.question}
                  </span>

                  {/* Plus / Minus Line Morph Glyph */}
                  <div className="relative w-5 h-5 flex-shrink-0 flex items-center justify-center">
                    <span className="absolute w-4 h-[1.5px] bg-[#2b2b2b] transition-transform duration-300" />
                    <span
                      className={`absolute w-[1.5px] h-4 bg-[#2b2b2b] transition-all duration-300 ${
                        isOpen ? 'rotate-90 opacity-0' : 'opacity-100'
                      }`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    role="region"
                    aria-labelledby={`faq-question-${faq.id}`}
                    className="pt-3 pb-2 font-sans text-[clamp(14.5px,1.05vw,16.5px)] text-[#2b2b2b]/75 leading-relaxed max-w-[64ch] text-pretty animate-in fade-in duration-200"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqAccordion;
