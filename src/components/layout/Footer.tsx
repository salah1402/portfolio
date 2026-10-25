import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Clock } from '../ui/Clock';
import { BrandLogo } from '../ui/BrandLogo';

export interface FooterProps {
  onOpenLeadModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLeadModal }) => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  return (
    <footer
      className="relative w-full bg-[#181818] text-[#f1f1f1] border-t border-[#2b2b2b]/30 overflow-hidden mt-auto"
      role="contentinfo"
    >
      {/* Main Container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 sm:pt-20 pb-8 flex flex-col gap-12 sm:gap-16">
        
        {/* Top Header: Brand Mark & Monumental Closing CTA */}
        <div className="flex flex-col gap-8 max-w-5xl">
          <div className="flex items-center gap-3">
            <BrandLogo variant="dark-bg" size="footer-header" />
            <span className="font-display text-lg font-semibold tracking-[-0.02em] text-[#f1f1f1]">
              SALAH / Independent Digital Studio
            </span>
          </div>

          <h2 className="font-display font-medium text-[clamp(38px,7.2vw,116px)] tracking-[-0.045em] leading-[0.9] text-[#f1f1f1] m-0">
            Build your next project with us
          </h2>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenLeadModal}
              className="btn btn--solid bg-[#f1f1f1] text-[#181818] hover:bg-white hover:text-black py-[12px] px-[22px] text-xs tracking-[0.12em] font-medium cursor-pointer min-h-[44px]"
            >
              <span>Start a conversation</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <a
              href="mailto:salauddin142008@gmail.com"
              className="btn text-[#f1f1f1] border-[#f1f1f1]/25 hover:border-[#f1f1f1] py-[12px] px-[22px] text-xs tracking-[0.12em] font-medium min-h-[44px]"
            >
              salauddin142008@gmail.com
            </a>
          </div>
        </div>

        {/* 4-Column Directory Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 pt-8 border-t border-[#f1f1f1]/15">
          {/* Col 1: Elsewhere */}
          <div className="flex flex-col gap-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#f1f1f1]/55 font-medium tabular-nums m-0">
              Elsewhere
            </p>
            <div className="flex flex-col gap-2.5 font-sans text-[15px] text-[#f1f1f1]/80">
              <a
                href="https://www.linkedin.com/in/mohamed-salauddin-a-b124593b1"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 no-underline text-inherit"
              >
                <span>LinkedIn</span>
                <span className="font-mono text-xs text-[#f1f1f1]/40">↗</span>
              </a>
              <a
                href="https://github.com/salah1402"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 no-underline text-inherit"
              >
                <span>GitHub</span>
                <span className="font-mono text-xs text-[#f1f1f1]/40">↗</span>
              </a>
              <a
                href="https://wa.me/919790094500"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 no-underline text-inherit"
              >
                <span>WhatsApp</span>
                <span className="font-mono text-xs text-[#f1f1f1]/40">↗</span>
              </a>
            </div>
          </div>

          {/* Col 2: Studio */}
          <div className="flex flex-col gap-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#f1f1f1]/55 font-medium tabular-nums m-0">
              Studio
            </p>
            <div className="flex flex-col gap-2.5 font-sans text-[15px] text-[#f1f1f1]/80">
              <a href="/#work" className="hover:text-white hover:translate-x-1 transition-all no-underline text-inherit">
                Work
              </a>
              <a href="/#process" className="hover:text-white hover:translate-x-1 transition-all no-underline text-inherit">
                Process
              </a>
              <a href="/about" className="hover:text-white hover:translate-x-1 transition-all no-underline text-inherit">
                About
              </a>
              <a href="/#pricing" className="hover:text-white hover:translate-x-1 transition-all no-underline text-inherit">
                Pricing
              </a>
            </div>
          </div>

          {/* Col 3: Based in */}
          <div className="flex flex-col gap-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#f1f1f1]/55 font-medium tabular-nums m-0">
              Based in
            </p>
            <div className="flex flex-col gap-1.5 font-sans text-[15px] text-[#f1f1f1]/80">
              <span>Thanjavur, India</span>
              <div className="flex items-center gap-2 pt-1">
                <Clock className="w-3.5 h-3.5 text-[#fc4778]" showLocationPrefix={false} showStatusDot={false} />
              </div>
            </div>
          </div>

          {/* Col 4: Start here */}
          <div className="flex flex-col gap-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#f1f1f1]/55 font-medium tabular-nums m-0">
              Start here
            </p>
            <div className="flex flex-col gap-2.5 font-sans text-[15px] text-[#f1f1f1]/80">
              <button
                type="button"
                onClick={onOpenLeadModal}
                className="text-left hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0 text-inherit font-sans text-[15px]"
              >
                <span>Start a conversation</span>
                <span className="font-mono text-xs text-[#f1f1f1]/40">↗</span>
              </button>
              <a
                href="/contact"
                className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-1.5 no-underline text-inherit"
              >
                <span>Project inquiry form</span>
                <span className="font-mono text-xs text-[#f1f1f1]/40">↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Official Logo & Copyright + Back to Top */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-[#f1f1f1]/10 font-mono text-[10px] sm:text-[11px] tracking-[0.08em] sm:tracking-[0.14em] uppercase text-[#f1f1f1]/55 tabular-nums font-medium">
          <div className="flex items-center gap-2.5">
            <BrandLogo variant="dark-bg" size="copyright-bar" />
            <span className="leading-tight">&copy; {new Date().getFullYear()} Crafted by Mohamed Salauddin (Salah)</span>
          </div>
          <button
            type="button"
            onClick={scrollToTop}
            className="self-start sm:self-auto hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-inherit font-mono text-[10px] sm:text-[11px] tracking-[0.08em] sm:tracking-[0.14em] uppercase tabular-nums font-medium"
          >
            &uarr; Back to top
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
