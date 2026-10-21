import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

export interface NavbarProps {
  onOpenLeadModal?: () => void;
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  isAnchor?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/#work', isAnchor: true },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

/**
 * Editorial Digital Studio Header for SALAH Studio
 *
 * Design Architecture:
 * - Clean light neutral (#f1f1f1) surface with fine hairline divider (border-[#1a1a1a]/10)
 * - Official geometric circular S-monogram + SALAH wordmark + studio descriptor
 * - Refined text-based navigation links with generous spacing (no generic outlined button boxes)
 * - Restrained 1.5px hairline underline active indicator in #1a1a1a with #fc4778 pink hover expansion
 * - Architectural solid graphite CTA ("Start a conversation ↗") with diagonal arrow hover animation
 * - Integrated "EN" language indicator
 * - Accessible, responsive mobile drawer with typographic destinations & studio base metadata
 */
export const Navbar: React.FC<NavbarProps> = ({
  onOpenLeadModal,
  className = '',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const activeHref =
    location.pathname === '/' && location.hash === '#work'
      ? '/#work'
      : location.pathname;

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    if (item.isAnchor && location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('work');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-[#f1f1f1] border-b border-[#1a1a1a]/10 transition-colors duration-200 ${className}`}
      role="banner"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-[54px] sm:h-[58px] flex items-center justify-between">
        {/* Brand Area (Left) */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fc4778] rounded-sm py-1"
          aria-label="SALAH — Independent Digital Studio Home"
        >
          <BrandLogo
            variant="light-bg"
            size="navbar"
            className="group-hover:opacity-85 transition-opacity"
          />
          <div className="flex items-center gap-2.5">
            <span className="font-display text-base sm:text-[17px] font-semibold tracking-[-0.02em] text-[#1a1a1a]">
              SALAH
            </span>
            <span className="hidden sm:inline-block text-[#1a1a1a]/25 font-mono text-xs select-none">
              /
            </span>
            <span className="hidden lg:inline-block font-mono text-[10.5px] tracking-[0.14em] uppercase text-[#1a1a1a]/60 font-medium tabular-nums whitespace-nowrap">
              Independent Digital Studio · Thanjavur
            </span>
          </div>
        </Link>

        {/* Navigation & Actions (Center / Right) */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {/* Editorial Text-Based Navigation */}
          <nav className="flex items-center gap-6 lg:gap-8" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/'
                  ? activeHref === '/'
                  : activeHref === item.href;

              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`group relative py-2 font-mono text-[11px] uppercase tracking-[0.14em] font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-[#1a1a1a]'
                      : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{item.label}</span>
                  {/* Refined Hairline Underline Indicator */}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[1.5px] transition-all duration-200 ease-out origin-left ${
                      isActive
                        ? 'bg-[#1a1a1a] scale-x-100 opacity-100'
                        : 'bg-[#fc4778] scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                    }`}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {/* Primary High-Ticket CTA */}
            <button
              type="button"
              onClick={onOpenLeadModal}
              className="group relative inline-flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#2b2b2b] text-[#f5f5f5] px-4 py-2 text-[10.5px] font-mono uppercase tracking-[0.12em] font-medium rounded-[3px] border border-[#1a1a1a] transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fc4778]"
            >
              <span>Start a conversation</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#f5f5f5]/80 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
            </button>

            {/* Language Selector */}
            <div className="flex items-center pl-3 border-l border-[#1a1a1a]/15 text-[11px] font-mono tracking-widest text-[#1a1a1a]/40 select-none tabular-nums">
              <span className="text-[#1a1a1a] font-semibold">EN</span>
            </div>
          </div>
        </div>

        {/* Mobile Header Controls */}
        <div className="flex items-center gap-2.5 md:hidden">
          <button
            type="button"
            onClick={onOpenLeadModal}
            className="group inline-flex items-center gap-1.5 bg-[#1a1a1a] hover:bg-[#2b2b2b] text-[#f5f5f5] px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider font-medium rounded-[3px] transition-colors"
          >
            <span>Start</span>
            <ArrowUpRight className="w-3 h-3 text-[#f5f5f5]/80" />
          </button>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-sm text-[#1a1a1a] hover:bg-[#1a1a1a]/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fc4778]"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[54px] sm:top-[58px] z-50 bg-[#f1f1f1] flex flex-col justify-between p-6 md:hidden animate-in fade-in slide-in-from-top-4 duration-200 border-t border-[#1a1a1a]/10">
          <div className="flex flex-col gap-4 pt-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#1a1a1a]/40 pb-2 border-b border-[#1a1a1a]/10">
              Navigation
            </span>
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/'
                  ? activeHref === '/'
                  : activeHref === item.href;

              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`font-display text-2xl font-normal py-2.5 transition-colors flex items-center justify-between border-b border-[#1a1a1a]/5 ${
                    isActive ? 'text-[#1a1a1a] font-medium' : 'text-[#1a1a1a]/70 hover:text-[#fc4778]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" aria-hidden="true" />
                    )}
                    <span>{item.label}</span>
                  </div>
                  <span className="font-mono text-xs text-[#1a1a1a]/40">↗</span>
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 pb-8">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenLeadModal?.();
              }}
              className="group flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#2b2b2b] text-[#f5f5f5] w-full py-4 text-xs font-mono uppercase tracking-[0.14em] font-medium rounded-[3px] transition-colors"
            >
              <span>Start a conversation</span>
              <ArrowUpRight className="w-4 h-4 text-[#f5f5f5]/80 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <div className="flex items-center justify-between font-mono text-[10px] text-[#1a1a1a]/50 uppercase tracking-widest pt-2">
              <span>Thanjavur, India</span>
              <span>Available for Commissions</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
