import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CASE_STUDIES } from '../../data/projects';
import { InfiniteMenu, InfiniteMenuItem } from '../ui/InfiniteMenu';

/**
 * Selected Works Showcase & 3D Interactive Stage (#work)
 * Thinkingods Bone Aesthetic Portfolio Showcase featuring:
 * 1. Editorial header with category counter `Selected work (06)`, headline `Recent projects.`,
 *    and interactive drag hint `Drag 3D sphere to explore · 360°`.
 * 2. 3D WebGL2 Infinite Menu sphere stage dynamically populated from all 6 client case studies.
 * 3. Responsive container layout with grid-cols-1 md:grid-cols-2 support.
 */
export const SelectedWorks: React.FC = () => {
  const navigate = useNavigate();

  // Dynamic 3D Infinite Menu items mapped from all 6 case studies
  const menuItems: InfiniteMenuItem[] = useMemo(
    () =>
      CASE_STUDIES.map((project) => ({
        image: project.coverImage,
        title: project.title,
        description: project.description,
        category: project.category,
        link: `/work/${project.slug}`,
        slug: project.slug,
        client: project.client,
        year: project.year,
      })),
    []
  );

  return (
    <section id="work" className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-10 border-b border-[#2b2b2b]/10 bg-[#f1f1f1]">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-12 sm:gap-16">
        {/* Editorial Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
          <div className="max-w-2xl flex flex-col gap-3">
            <h2 className="font-display font-medium text-[clamp(32px,4.4vw,72px)] tracking-[-0.04em] leading-[0.94] text-[#2b2b2b] m-0">
              Recent projects.
            </h2>
          </div>

          {/* Interactive Drag Hint */}
          <div
            aria-label="Drag 3D sphere to explore 360 degrees"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#2b2b2b]/[0.04] border border-[#2b2b2b]/10 text-[#2b2b2b]/70 font-mono text-[11px] uppercase tracking-[0.12em] self-start sm:self-end select-none backdrop-blur-sm shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fc4778] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#fc4778]" />
            </span>
            <svg
              className="w-3.5 h-3.5 text-[#2b2b2b]/70 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            <span>Drag 3D sphere to explore · 360°</span>
          </div>
        </div>

        {/* 3D Infinite Menu Sphere Stage */}
        <div className="relative w-full h-[520px] sm:h-[600px] lg:h-[680px] rounded-[20px] sm:rounded-[24px] overflow-hidden border border-[#2b2b2b]/10 bg-[#ebebeb]/40 shadow-[inset_0_1px_4px_rgba(0,0,0,0.03)]">
          <InfiniteMenu
            items={menuItems}
            scale={1}
            theme="light"
            accentColor="#fc4778"
            onItemClick={(item) => navigate(item.link)}
          />
        </div>
      </div>
    </section>
  );
};

export default SelectedWorks;
