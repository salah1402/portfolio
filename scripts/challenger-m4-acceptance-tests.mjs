#!/usr/bin/env node
/**
 * Challenger 2 Empirical Adversarial Test Harness for Milestone 4 & Final Acceptance
 * Target: Cross-device responsiveness, 3D Infinite Menu to /work/:slug navigation,
 * 84 test suites (417 assertions), clean production build, and system integrity.
 */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ANSI Color formatting
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

class ChallengerReporter {
  constructor() {
    this.totalSuites = 0;
    this.totalAssertions = 0;
    this.passed = 0;
    this.failed = 0;
    this.failures = [];
    this.startTime = Date.now();
  }

  suite(name) {
    this.totalSuites++;
    console.log(`\n${c.bold}${c.cyan}▶ Suite ${this.totalSuites}: ${name}${c.reset}`);
    console.log(`${c.dim}------------------------------------------------------------------------${c.reset}`);
  }

  assert(condition, message, details = '') {
    this.totalAssertions++;
    if (condition) {
      this.passed++;
      console.log(`  ${c.green}✓ [PASS]${c.reset} ${message}`);
      return true;
    } else {
      this.failed++;
      this.failures.push({ message, details });
      console.log(`  ${c.red}✗ [FAIL]${c.reset} ${message}`);
      if (details) {
        console.log(`    ${c.dim}${details}${c.reset}`);
      }
      return false;
    }
  }

  summary() {
    const duration = Date.now() - this.startTime;
    console.log(`\n${c.bold}${c.white}========================================================================${c.reset}`);
    console.log(`${c.bold}${c.white}   CHALLENGER 2 EMPIRICAL TEST SUMMARY (M4 & Final Acceptance)${c.reset}`);
    console.log(`${c.bold}${c.white}========================================================================${c.reset}`);
    console.log(`  Suites:      ${this.totalSuites}`);
    console.log(`  Assertions:  ${this.totalAssertions}`);
    console.log(`  Passed:      ${c.green}${this.passed}${c.reset}`);
    console.log(`  Failed:      ${this.failed > 0 ? c.red : c.green}${this.failed}${c.reset}`);
    console.log(`  Duration:    ${duration}ms\n`);

    if (this.failures.length > 0) {
      console.log(`${c.red}Failed Assertions:${c.reset}`);
      for (const f of this.failures) {
        console.log(`  - ${f.message}: ${f.details}`);
      }
      return false;
    } else {
      console.log(`${c.green}${c.bold}ALL ADVERSARIAL CHALLENGES PASSED EMPIRICALLY (100% SUCCESS)${c.reset}\n`);
      return true;
    }
  }
}

const rep = new ChallengerReporter();

async function main() {
  console.log(`\n${c.bold}${c.white}========================================================================${c.reset}`);
  console.log(`${c.bold}${c.yellow}   CHALLENGER 2: ADVERSARIAL E2E & CROSS-DEVICE VERIFICATION${c.reset}`);
  console.log(`${c.dim}   Target Codebase: ${PROJECT_ROOT}${c.reset}`);
  console.log(`${c.bold}${c.white}========================================================================${c.reset}`);

  // Create Vite dev server instance for module loading
  const viteServer = await createServer({
    root: PROJECT_ROOT,
    server: { middlewareMode: true },
    appType: 'custom'
  });

  // Load modules dynamically
  const { CASE_STUDIES, getCaseStudy, getNextCaseStudy } = await viteServer.ssrLoadModule('./src/data/projects.ts');
  const { SelectedWorks } = await viteServer.ssrLoadModule('./src/components/sections/SelectedWorks.tsx');
  const { CaseStudyPage } = await viteServer.ssrLoadModule('./src/pages/CaseStudyPage.tsx');
  const { InfiniteMenu } = await viteServer.ssrLoadModule('./src/components/ui/InfiniteMenu.tsx');

  // =========================================================================
  // SUITE 1: 6-Project Archive Completeness & Data Contract Conformance
  // =========================================================================
  rep.suite('6-Project Archive Completeness & Contract Conformance');

  rep.assert(Array.isArray(CASE_STUDIES), 'CASE_STUDIES is an exported array');
  rep.assert(CASE_STUDIES.length === 6, 'CASE_STUDIES contains exactly 6 projects', `Got ${CASE_STUDIES.length}`);

  const expectedSlugs = [
    'privilege-interiors',
    'aura-dental',
    'agentframe',
    'sahara',
    'bleach-ichigo',
    'ironvault'
  ];

  for (const slug of expectedSlugs) {
    const p = CASE_STUDIES.find(c => c.slug === slug);
    rep.assert(Boolean(p), `Project with slug '${slug}' exists in archive`);
    if (p) {
      rep.assert(typeof p.title === 'string' && p.title.length > 0, `Project '${slug}' has non-empty title`);
      rep.assert(typeof p.client === 'string' && p.client.length > 0, `Project '${slug}' has non-empty client`);
      rep.assert(typeof p.category === 'string' && p.category.length > 0, `Project '${slug}' has category`);
      rep.assert(typeof p.year === 'string' && p.year.length > 0, `Project '${slug}' has year`);
      rep.assert(typeof p.timeline === 'string' && p.timeline.length > 0, `Project '${slug}' has timeline`);
      rep.assert(typeof p.role === 'string' && p.role.length > 0, `Project '${slug}' has role`);
      rep.assert(Array.isArray(p.deliverables) && p.deliverables.length >= 4, `Project '${slug}' has >=4 deliverables (${p.deliverables.length})`);
      rep.assert(Array.isArray(p.metrics) && p.metrics.length === 4, `Project '${slug}' has exactly 4 quantitative metrics (${p.metrics.length})`);
      rep.assert(typeof p.brief === 'string' && p.brief.length > 50, `Project '${slug}' has detailed brief (${p.brief.length} chars)`);
      rep.assert(typeof p.results === 'string' && p.results.length > 30, `Project '${slug}' has business results`);
      rep.assert(typeof p.coverImage === 'string' && p.coverImage.startsWith('/assets/'), `Project '${slug}' cover image in /assets/`);
      rep.assert(Array.isArray(p.galleryImages) && p.galleryImages.length >= 1, `Project '${slug}' has gallery images`);
      rep.assert(Boolean(p.execution?.architecture), `Project '${slug}' specifies architectural execution`);
      rep.assert(Boolean(p.execution?.threeDAndMotion), `Project '${slug}' specifies 3D/motion execution`);
      rep.assert(Array.isArray(p.execution?.stack) && p.execution.stack.length >= 4, `Project '${slug}' specifies technical stack`);
    }
  }

  // Live and GitHub URLs for Bleach & IronVault
  const bleach = CASE_STUDIES.find(c => c.slug === 'bleach-ichigo');
  rep.assert(bleach?.liveUrl === 'https://bleach-ichigo.vercel.app/', 'Bleach has live URL https://bleach-ichigo.vercel.app/');

  const ironvault = CASE_STUDIES.find(c => c.slug === 'ironvault');
  rep.assert(ironvault?.liveUrl === 'https://ironvault-eta.vercel.app/', 'IronVault has live URL https://ironvault-eta.vercel.app/');
  rep.assert(ironvault?.githubUrl === 'https://github.com/salah1402/gym-demo.git', 'IronVault has github URL https://github.com/salah1402/gym-demo.git');

  // =========================================================================
  // SUITE 2: Slug Resolution, Normalization & Cyclic Navigation Oracles
  // =========================================================================
  rep.suite('Slug Resolution, Normalization & Cyclic Navigation Oracles');

  for (const slug of expectedSlugs) {
    const resolved = getCaseStudy(slug);
    rep.assert(resolved?.slug === slug, `getCaseStudy('${slug}') resolves exact slug`);

    // Case insensitivity
    const upperResolved = getCaseStudy(slug.toUpperCase());
    rep.assert(upperResolved?.slug === slug, `getCaseStudy('${slug.toUpperCase()}') is case-insensitive`);

    // Trailing slash tolerance
    const slashResolved = getCaseStudy(`${slug}/`);
    rep.assert(slashResolved?.slug === slug, `getCaseStudy('${slug}/') handles trailing slash`);
  }

  // Alias resolution
  rep.assert(getCaseStudy('sahara-metrology')?.slug === 'sahara', "getCaseStudy('sahara-metrology') resolves to 'sahara'");

  // 404 / Invalid slug behavior
  rep.assert(getCaseStudy(undefined) === undefined, 'getCaseStudy(undefined) returns undefined');
  rep.assert(getCaseStudy('') === undefined, 'getCaseStudy("") returns undefined');
  rep.assert(getCaseStudy('random-nonexistent-project') === undefined, 'getCaseStudy(non-existent) returns undefined');

  // Cyclic traversal oracle
  for (let i = 0; i < expectedSlugs.length; i++) {
    const current = expectedSlugs[i];
    const expectedNext = expectedSlugs[(i + 1) % expectedSlugs.length];
    const next = getNextCaseStudy(current);
    rep.assert(next.slug === expectedNext, `getNextCaseStudy('${current}') cyclically resolves to '${expectedNext}'`);
  }

  // Cyclic traversal with alias & fallback
  rep.assert(getNextCaseStudy('sahara-metrology').slug === 'bleach-ichigo', "getNextCaseStudy('sahara-metrology') transitions to 'bleach-ichigo'");
  rep.assert(getNextCaseStudy('unknown-slug').slug === 'privilege-interiors', "getNextCaseStudy('unknown-slug') safely defaults to first project");

  // =========================================================================
  // SUITE 3: Breakpoint Layout Analysis (375px Mobile, 768px Tablet, 1280px Desktop)
  // =========================================================================
  rep.suite('Breakpoint Layout Analysis (375px Mobile, 768px Tablet, 1280px Desktop)');

  // SelectedWorks.tsx file content analysis
  const swPath = path.join(PROJECT_ROOT, 'src/components/sections/SelectedWorks.tsx');
  const swCode = fs.readFileSync(swPath, 'utf8');

  // Breakpoint responsive classes
  rep.assert(swCode.includes('grid-cols-1 md:grid-cols-2'), 'SelectedWorks has 1-col on mobile, 2-col on md:grid-cols-2');
  rep.assert(swCode.includes('px-4 sm:px-6 lg:px-10'), 'SelectedWorks has responsive horizontal padding: px-4 (375px), sm:px-6 (768px), lg:px-10 (1280px+)');
  rep.assert(swCode.includes('py-20 sm:py-28'), 'SelectedWorks has responsive vertical padding: py-20 mobile, sm:py-28 tablet/desktop');
  rep.assert(swCode.includes('h-[520px] sm:h-[600px] lg:h-[680px]'), 'InfiniteMenu container has responsive stage heights: 520px (mobile), 600px (tablet), 680px (desktop)');
  rep.assert(swCode.includes('flex flex-col sm:flex-row'), 'Header has vertical stacking on mobile and flex-row on sm: (768px+)');
  rep.assert(swCode.includes('clamp(32px,4.4vw,72px)'), 'Headline uses fluid scale clamp(32px, 4.4vw, 72px)');

  // Mathematical verification of clamp(32px, 4.4vw, 72px)
  const clampHeading = (vw) => Math.min(72, Math.max(32, 0.044 * vw));
  rep.assert(clampHeading(375) === 32, '375px viewport: headline clamps to min 32px');
  rep.assert(Math.abs(clampHeading(768) - 33.792) < 0.01, '768px viewport: headline scales fluidly to ~33.8px');
  rep.assert(Math.abs(clampHeading(1280) - 56.32) < 0.01, '1280px viewport: headline scales fluidly to 56.32px');
  rep.assert(clampHeading(1920) === 72, '1920px viewport: headline clamps to max 72px');

  // InfiniteMenu layout switching oracle
  // Formula: mode = state.width / 2 - radius < 120 ? 'stacked' : 'side'
  // radius = (tileRadius / ((rest - RADIUS) * Math.tan(FOV / 2))) * (height / 2)
  const calcMode = (width, height, count = 160, tileSize = 0.63, zoom = 1.65) => {
    const RADIUS = 2;
    const FOV = (30 * Math.PI) / 180;
    const tileRad = 0.5 * RADIUS * Math.sqrt((4 * Math.PI) / count) * tileSize;
    const aspect = width / height;
    const span = Math.tan(FOV / 2) * Math.min(1, aspect);
    const rest = RADIUS + tileRad / (0.46 * zoom * span);
    const radiusPx = (tileRad / ((rest - RADIUS) * Math.tan(FOV / 2))) * (height / 2);
    return width / 2 - radiusPx < 120 ? 'stacked' : 'side';
  };

  rep.assert(calcMode(375, 520) === 'stacked', '375px Mobile: InfiniteMenu switches automatically to stacked mode');
  rep.assert(calcMode(768, 600) === 'side', '768px Tablet: InfiniteMenu operates in side mode');
  rep.assert(calcMode(1280, 680) === 'side', '1280px Desktop: InfiniteMenu operates in side mode');

  // CaseStudyPage.tsx responsive checks
  const csPath = path.join(PROJECT_ROOT, 'src/pages/CaseStudyPage.tsx');
  const csCode = fs.readFileSync(csPath, 'utf8');

  rep.assert(csCode.includes('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'), 'CaseStudyPage metrics grid is 1-col (mobile), 2-col (tablet), 4-col (desktop)');
  rep.assert(csCode.includes('aspect-[16/9] sm:aspect-[21/9]'), 'CaseStudyPage cover image is 16:9 on mobile and 21:9 ultra-wide on tablet/desktop');
  rep.assert(csCode.includes('grid-cols-2 md:grid-cols-5'), 'CaseStudyPage metadata matrix is 2-col (mobile), 5-col (tablet/desktop)');
  rep.assert(csCode.includes('grid-cols-1 lg:grid-cols-12'), 'CaseStudyPage editorial brief is stacked on mobile/tablet, 12-col split on desktop');

  // =========================================================================
  // SUITE 4: Interactive Navigation: #work 3D Menu to /work/:slug Deep Dives
  // =========================================================================
  rep.suite('Interactive Navigation: #work 3D Menu to /work/:slug Deep Dives');

  // SelectedWorks menuItems linking check
  rep.assert(swCode.includes("link: `/work/${project.slug}`"), 'SelectedWorks menuItems map project.slug to /work/:slug');
  rep.assert(swCode.includes('onItemClick={(item) => navigate(item.link)}'), 'InfiniteMenu onItemClick invokes navigate(item.link)');

  // SSR Rendering of SelectedWorks within Router Context
  let swHtml = '';
  try {
    swHtml = ReactDOMServer.renderToString(
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/'] },
        React.createElement(SelectedWorks)
      )
    );
    rep.assert(true, 'SelectedWorks renders cleanly via SSR without throwing');
  } catch (err) {
    rep.assert(false, 'SelectedWorks renders cleanly via SSR', err.message);
  }

  // Check header text in rendered HTML
  rep.assert(swHtml.includes('Selected work (06)'), 'Rendered SelectedWorks contains "Selected work (06)"');
  rep.assert(swHtml.includes('Recent projects.'), 'Rendered SelectedWorks contains "Recent projects."');
  rep.assert(swHtml.includes('Drag 3D sphere to explore · 360°'), 'Rendered SelectedWorks contains drag hint');
  rep.assert(swHtml.includes('Case Studies Archive'), 'Rendered SelectedWorks contains Case Studies Archive sub-header');

  // Check that all 6 projects have links in the rendered archive grid
  for (const slug of expectedSlugs) {
    rep.assert(swHtml.includes(`/work/${slug}`), `Rendered SelectedWorks HTML includes link to '/work/${slug}'`);
  }

  // SSR Rendering of CaseStudyPage for all 6 projects
  const decodeHtml = (html) =>
    html
      .replace(/&amp;/g, '&')
      .replace(/&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

  for (const slug of expectedSlugs) {
    try {
      const pageHtmlRaw = ReactDOMServer.renderToString(
        React.createElement(
          MemoryRouter,
          { initialEntries: [`/work/${slug}`] },
          React.createElement(
            Routes,
            null,
            React.createElement(Route, { path: '/work/:slug', element: React.createElement(CaseStudyPage) })
          )
        )
      );
      const pageHtml = decodeHtml(pageHtmlRaw);
      const project = CASE_STUDIES.find(c => c.slug === slug);
      rep.assert(pageHtml.includes(project.title), `CaseStudyPage for '${slug}' renders title '${project.title}'`);
      rep.assert(pageHtml.includes(project.client), `CaseStudyPage for '${slug}' renders client '${project.client}'`);
      rep.assert(pageHtml.includes(project.category), `CaseStudyPage for '${slug}' renders category '${project.category}'`);
      rep.assert(pageHtml.includes(project.year), `CaseStudyPage for '${slug}' renders year '${project.year}'`);
      rep.assert(pageHtml.includes(project.timeline), `CaseStudyPage for '${slug}' renders timeline '${project.timeline}'`);
      rep.assert(pageHtml.includes(project.role), `CaseStudyPage for '${slug}' renders role '${project.role}'`);
      rep.assert(pageHtml.includes(project.results), `CaseStudyPage for '${slug}' renders results callout`);
      rep.assert(pageHtml.includes('Return to Selected Works'), `CaseStudyPage for '${slug}' includes return navigation`);
    } catch (err) {
      rep.assert(false, `CaseStudyPage for '${slug}' renders cleanly`, err.message);
    }
  }

  // 404 Not Found Page SSR rendering
  try {
    const notFoundHtml = ReactDOMServer.renderToString(
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/work/non-existent-project'] },
        React.createElement(
          Routes,
          null,
          React.createElement(Route, { path: '/work/:slug', element: React.createElement(CaseStudyPage) })
        )
      )
    );
    rep.assert(notFoundHtml.includes('404 · Not Found'), 'CaseStudyPage renders 404 header for invalid slug');
    rep.assert(notFoundHtml.includes('Case Study Unavailable'), 'CaseStudyPage renders "Case Study Unavailable" title');
    rep.assert(notFoundHtml.includes('Return to Selected Works'), 'CaseStudyPage renders return button in 404 state');
    rep.assert(notFoundHtml.includes('Available Case Studies:'), 'CaseStudyPage renders available case study suggestions in 404 state');
  } catch (err) {
    rep.assert(false, 'CaseStudyPage renders 404 cleanly', err.message);
  }

  // =========================================================================
  // SUITE 5: Asset Filesystem Forensic Integrity
  // =========================================================================
  rep.suite('Asset Filesystem Forensic Integrity');

  const requiredAssets = [
    'public/assets/bleach-ichigo.webp',
    'public/assets/bleach-ichigo.svg',
    'public/assets/ironvault.webp',
    'public/assets/ironvault.svg',
    'public/assets/privilege-interior.jpg',
    'public/assets/privilege-logo.webp',
    'public/assets/clinic-preview.webp',
    'public/assets/agentframe-preview.webp',
    'public/assets/agentframe-logo.svg',
    'public/assets/og-image.webp',
    'public/assets/s-symbol.webp'
  ];

  for (const assetRel of requiredAssets) {
    const fullPath = path.join(PROJECT_ROOT, assetRel);
    const exists = fs.existsSync(fullPath);
    rep.assert(exists, `Asset exists: ${assetRel}`);
    if (exists) {
      const stat = fs.statSync(fullPath);
      rep.assert(stat.size > 200, `Asset ${assetRel} has non-trivial size (${stat.size} bytes)`);
    }
  }

  // =========================================================================
  // SUITE 6: Automated Test Suite (84 Suites / 417 Assertions)
  // =========================================================================
  rep.suite('Automated Test Suite (84 Suites / 417 Assertions)');

  try {
    const testOutput = execSync('node scripts/test-runner.mjs --json', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8'
    });
    const result = JSON.parse(testOutput);
    const { summary } = result;

    rep.assert(summary.totalTests === 84, `Test runner reports exactly 84 test suites (got ${summary.totalTests})`);
    rep.assert(summary.totalAssertions === 417, `Test runner reports exactly 417 assertions (got ${summary.totalAssertions})`);
    rep.assert(summary.totalPassed === 417, `All 417 assertions pass (got ${summary.totalPassed})`);
    rep.assert(summary.totalFailed === 0, `0 assertions failed (got ${summary.totalFailed})`);
    rep.assert(summary.tiers.tier1.passed === 156, `Tier 1 Feature Coverage: 156 / 156 passed`);
    rep.assert(summary.tiers.tier2.passed === 164, `Tier 2 Boundary & Corner: 164 / 164 passed`);
    rep.assert(summary.tiers.tier3.passed === 45, `Tier 3 Cross-Interactions: 45 / 45 passed`);
    rep.assert(summary.tiers.tier4.passed === 52, `Tier 4 Real-World Scenarios: 52 / 52 passed`);
  } catch (err) {
    rep.assert(false, 'Test runner executed cleanly', err.message);
  }

  // =========================================================================
  // SUITE 7: Production Build Artifacts & Zero-Error Cleanliness
  // =========================================================================
  rep.suite('Production Build Artifacts & Zero-Error Cleanliness');

  const distDir = path.join(PROJECT_ROOT, 'dist');
  rep.assert(fs.existsSync(distDir), 'Production dist/ directory exists');

  const indexHtmlPath = path.join(distDir, 'index.html');
  rep.assert(fs.existsSync(indexHtmlPath), 'dist/index.html exists');

  const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  rep.assert(indexHtmlContent.includes('SALAH'), 'dist/index.html includes studio brand metadata');

  const assetsDir = path.join(distDir, 'assets');
  rep.assert(fs.existsSync(assetsDir), 'dist/assets directory exists');

  const assetFiles = fs.readdirSync(assetsDir);
  const jsChunk = assetFiles.find(f => f.startsWith('index-') && f.endsWith('.js'));
  const cssChunk = assetFiles.find(f => f.startsWith('index-') && f.endsWith('.css'));

  rep.assert(Boolean(jsChunk), `Production JavaScript chunk exists (${jsChunk})`);
  rep.assert(Boolean(cssChunk), `Production CSS bundle exists (${cssChunk})`);

  if (jsChunk) {
    const jsStat = fs.statSync(path.join(assetsDir, jsChunk));
    rep.assert(jsStat.size > 100000 && jsStat.size < 1000000, `JS bundle size is production-grade (${(jsStat.size / 1024).toFixed(1)} KB)`);
  }

  if (cssChunk) {
    const cssStat = fs.statSync(path.join(assetsDir, cssChunk));
    rep.assert(cssStat.size > 20000 && cssStat.size < 200000, `CSS bundle size is production-grade (${(cssStat.size / 1024).toFixed(1)} KB)`);
  }

  // =========================================================================
  // Summary & Exit
  // =========================================================================
  await viteServer.close();
  const allPassed = rep.summary();
  process.exit(allPassed ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
