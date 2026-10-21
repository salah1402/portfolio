import React from 'react';
import { Link } from 'react-router-dom';
import { PROJECTS } from '../data/projects';

export const WorkGrid: React.FC = () => {
  return (
    <section id="work" className="py-24 border-t border-[#e2e2e2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="font-mono text-xs uppercase tracking-[0.14em] text-[#fc4778]">
              Flagship Portfolio
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-[#1a1a1a]">
              Selected works.
            </h2>
          </div>
          <span className="font-mono text-xs text-[#1a1a1a]/50 uppercase">
            3D Configurator · Editorial UI · Design Systems
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROJECTS.map((project) => (
            <Link
              key={project.slug}
              to={`/work/${project.slug}`}
              className="flex flex-col rounded-2xl border border-[#e2e2e2] bg-[#fafafa] overflow-hidden hover:border-[#1a1a1a]/40 transition-all group shadow-sm hover:shadow-md"
            >
              <div className="w-full h-64 overflow-hidden bg-[#ebebeb] relative">
                <img
                  src={project.coverImage}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                  <span className="px-3 py-1 rounded-full bg-[#fafafa]/90 backdrop-blur-md font-mono text-[10px] uppercase text-[#1a1a1a] shadow-sm">
                    {project.country}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#1a1a1a]/90 text-white font-mono text-[10px] uppercase shadow-sm">
                    {project.timeline}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 flex flex-col justify-between flex-grow gap-6">
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-xs text-[#fc4778] uppercase tracking-wider">
                    {project.client} · {project.role}
                  </span>
                  <h3 className="font-display text-2xl font-medium text-[#1a1a1a] group-hover:text-[#fc4778] transition-colors leading-snug">
                    {project.title}
                  </h3>
                  <p className="font-sans text-sm text-[#1a1a1a]/70 leading-relaxed mt-1">
                    {project.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#e2e2e2] flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="font-mono text-[10px] text-[#1a1a1a]/60 bg-[#fafafa] px-2 py-0.5 rounded border border-[#e2e2e2]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="font-mono text-xs text-[#1a1a1a] group-hover:translate-x-1 transition-transform">
                    View ↗
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
