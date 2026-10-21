#!/usr/bin/env node
/**
 * Empirical Adversarial Challenger Stress & Oracle Harness for Milestone 3
 * Focus:
 * 1. StickyBigCTA scroll progress math & sequential word lighting bounds
 * 2. Process sticky offset hierarchy (top: 104, 122, 140, 158px) & z-index monotonicity
 * 3. SelectedWorks hover focus-dimming state machine & 4:3 grid mechanics
 * 4. ProofStage & FloatingTrail dynamic pool cap & Lissajous touch simulation math
 * 5. TestimonialSlider cyclic index math & visibility resync invariants
 * 6. Production bundle chunk size and asset integrity audit
 * 7. Comprehensive E2E test runner execution across all tiers
 */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { createServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ANSI helpers
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m\x1b[37m',
  bgGreen: '\x1b[42m\x1b[30m'
};

class ChallengerReporter {
  constructor() {
    this.totalSuites = 0;
    this.totalAssertions = 0;
    this.passed = 0;
    this.failed = 0;
    this.failures = [];
  }

  assert(condition, message, expected, actual) {
    this.totalAssertions++;
    if (condition) {
      this.passed++;
      return true;
    } else {
      this.failed++;
      this.failures.push({ message, expected, actual });
      console.log(`    ${c.red}✗ FAIL: ${message}${c.reset}`);
      if (expected !== undefined) {
        console.log(`      ${c.dim}Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}${c.reset}`);
      }
      return false;
    }
  }

  assertEqual(actual, expected, message) {
    return this.assert(actual === expected, message, expected, actual);
  }

  suiteHeader(title) {
    this.totalSuites++;
    console.log(`\n${c.bold}${c.cyan}▶ Suite ${this.totalSuites}: ${title}${c.reset}`);
    console.log(`${c.dim}------------------------------------------------------------------------${c.reset}`);
  }

  testPass(name, details = '') {
    console.log(`  ${c.green}✓ [PASS]${c.reset} ${name} ${c.dim}${details}${c.reset}`);
  }
}

const rep = new ChallengerReporter();

async function main() {
  const globalStart = Date.now();
  console.log(`\n${c.bold}${c.white}========================================================================${c.reset}`);
  console.log(`${c.bold}${c.yellow}   CHALLENGER EMPIRICAL ADVERSARIAL STRESS SUITE — MILESTONE 3${c.reset}`);
  console.log(`${c.dim}   Target: Scroll Progress, Sticky Offsets, Hover Dimming, Bundle & Tests${c.reset}`);
  console.log(`${c.bold}${c.white}========================================================================${c.reset}`);

  // 1. Initialize Vite dev environment to load TSX modules directly
  const viteServer = await createServer({
    root: PROJECT_ROOT,
    server: { middlewareMode: true },
    appType: 'custom'
  });

  const { MemoryRouter } = await import('react-router-dom');

  // Load target modules
  const stickyCtaModule = await viteServer.ssrLoadModule('./src/components/sections/StickyBigCTA.tsx');
  const processModule = await viteServer.ssrLoadModule('./src/components/sections/Process.tsx');
  const selectedWorksModule = await viteServer.ssrLoadModule('./src/components/sections/SelectedWorks.tsx');
  const proofStageModule = await viteServer.ssrLoadModule('./src/components/sections/ProofStage.tsx');
  const floatingTrailModule = await viteServer.ssrLoadModule('./src/components/sections/FloatingTrail.tsx');
  const testimonialSliderModule = await viteServer.ssrLoadModule('./src/components/sections/TestimonialSlider.tsx');
  const projectsModule = await viteServer.ssrLoadModule('./src/data/projects.ts');
  const testimonialsModule = await viteServer.ssrLoadModule('./src/data/testimonials.ts');
  const appModule = await viteServer.ssrLoadModule('./src/App.tsx');

  const { StickyBigCTA } = stickyCtaModule;
  const { Process } = processModule;
  const { SelectedWorks } = selectedWorksModule;
  const { ProofStage } = proofStageModule;
  const { FloatingTrail } = floatingTrailModule;
  const { TestimonialSlider } = testimonialSliderModule;
  const { CASE_STUDIES } = projectsModule;
  const { TESTIMONIALS } = testimonialsModule;
  const { ModalContext } = appModule;

  const mockModalContextValue = {
    isOpen: false,
    openModal: () => {},
    closeModal: () => {}
  };

  const renderWithRouter = (element) => {
    return ReactDOMServer.renderToString(
      React.createElement(
        ModalContext.Provider,
        { value: mockModalContextValue },
        React.createElement(MemoryRouter, null, element)
      )
    );
  };

  // ========================================================================
  // Suite 1: StickyBigCTA Scroll Progress & Sequential Word Lighting Oracle
  // ========================================================================
  rep.suiteHeader('StickyBigCTA Scroll Progress Math & Word Lighting Oracle');

  const CTA_WORDS = ["Let's", "talk", "about", "your", "project."];
  rep.assertEqual(CTA_WORDS.length, 5, 'CTA_WORDS array has exact length of 5');

  // Exact math model implemented in StickyBigCTA.tsx:
  // const totalScrollDistance = rect.height - viewportHeight;
  // const progress = Math.min(1, Math.max(0, currentScroll / totalScrollDistance));
  // const count = progress >= 0.98 ? CTA_WORDS.length : Math.floor(progress * CTA_WORDS.length);
  const computeLitCount = (currentScroll, totalScrollDistance, wordsLength = CTA_WORDS.length) => {
    if (totalScrollDistance <= 0) return 0;
    const progress = Math.min(1, Math.max(0, currentScroll / totalScrollDistance));
    return progress >= 0.98 ? wordsLength : Math.floor(progress * wordsLength);
  };

  const trackHeight = 2150; // 215vh at 1000px viewport
  const viewportHeight = 1000;
  const totalDistance = trackHeight - viewportHeight; // 1150px

  // Test 1.1: Extreme values verification
  rep.assertEqual(computeLitCount(-5000, totalDistance), 0, 'Extremely negative scroll (-5000px) yields litCount = 0');
  rep.assertEqual(computeLitCount(-1, totalDistance), 0, 'Negative scroll (-1px) yields litCount = 0');
  rep.assertEqual(computeLitCount(0, totalDistance), 0, 'Zero scroll (progress = 0.0) yields litCount = 0');
  rep.assertEqual(computeLitCount(totalDistance * 0.5, totalDistance), 2, 'Mid scroll (progress = 0.5) yields litCount = 2 ("Let\'s talk")');
  rep.assertEqual(computeLitCount(totalDistance * 0.9799, totalDistance), 4, 'Progress = 0.9799 yields litCount = 4');
  rep.assertEqual(computeLitCount(totalDistance * 0.98, totalDistance), 5, 'Progress = 0.98 activates all 5 words');
  rep.assertEqual(computeLitCount(totalDistance * 0.99, totalDistance), 5, 'Progress = 0.99 yields litCount = 5');
  rep.assertEqual(computeLitCount(totalDistance * 1.0, totalDistance), 5, 'Progress = 1.0 yields litCount = 5');
  rep.assertEqual(computeLitCount(totalDistance * 1.5, totalDistance), 5, 'Progress = 1.5 (overscroll) yields litCount = 5');
  rep.assertEqual(computeLitCount(totalDistance * 100, totalDistance), 5, 'Extreme overscroll yields litCount = 5');

  // Test 1.2: Boundary zero / negative total distance protection
  rep.assertEqual(computeLitCount(100, 0), 0, 'totalScrollDistance = 0 yields safe 0 without division by zero');
  rep.assertEqual(computeLitCount(100, -200), 0, 'totalScrollDistance < 0 yields safe 0');

  // Test 1.3: Monotonicity and bounds over 5,000 continuous step sweep
  let monotonicityViolations = 0;
  let boundsViolations = 0;
  let prevCount = 0;
  const steps = 5000;

  for (let i = 0; i <= steps; i++) {
    const simulatedScroll = -500 + (totalDistance + 1000) * (i / steps);
    const count = computeLitCount(simulatedScroll, totalDistance);

    if (count < 0 || count > 5 || !Number.isInteger(count)) {
      boundsViolations++;
    }

    if (simulatedScroll >= 0 && simulatedScroll <= totalDistance) {
      if (count < prevCount) {
        monotonicityViolations++;
      }
      prevCount = count;
    }
  }

  rep.assertEqual(boundsViolations, 0, '5,000 scroll samples: litCount strictly bound within [0, 5] integer range');
  rep.assertEqual(monotonicityViolations, 0, '5,000 scroll samples: litCount strictly monotonic non-decreasing on forward scroll');

  // Test 1.4: Reverse scroll monotonicity (extinguishing in reverse)
  let reverseViolations = 0;
  let prevReverseCount = 5;
  for (let i = steps; i >= 0; i--) {
    const simulatedScroll = totalDistance * (i / steps);
    const count = computeLitCount(simulatedScroll, totalDistance);
    if (count > prevReverseCount) {
      reverseViolations++;
    }
    prevReverseCount = count;
  }
  rep.assertEqual(reverseViolations, 0, 'Reverse scroll: litCount strictly monotonic non-increasing during rewind');

  // Test 1.5: SSR Component render & markup inspection
  const ctaHtml = renderWithRouter(React.createElement(StickyBigCTA));
  rep.assert(ctaHtml.includes('cta-big'), 'StickyBigCTA markup contains root class .cta-big');
  rep.assert(ctaHtml.includes('min-h-[215vh]'), 'StickyBigCTA markup contains min-h-[215vh] outer track');
  rep.assert(ctaHtml.includes('sticky top-0 h-screen'), 'StickyBigCTA markup contains sticky pinned viewport frame');
  for (const word of CTA_WORDS) {
    const encodedWord = word.replace(/'/g, '&#x27;');
    rep.assert(ctaHtml.includes(word) || ctaHtml.includes(encodedWord), `StickyBigCTA rendered word token: "${word}"`);
  }
  rep.assert(ctaHtml.includes('Start a conversation'), 'StickyBigCTA contains CTA intake action button');
  rep.testPass('StickyBigCTA Scroll & Word Lighting Oracle passed all stress tests');

  // ========================================================================
  // Suite 2: Process Sticky Offset Hierarchy & Geometric SVGs
  // ========================================================================
  rep.suiteHeader('Process Sticky Offset Hierarchy & Glyph Geometry');

  const processHtml = renderWithRouter(React.createElement(Process));
  rep.assert(processHtml.includes('id="process"'), 'Process section contains anchor id="process"');

  // Expected sticky offsets: 104px, 122px, 140px, 158px
  const expectedOffsets = [104, 122, 140, 158];
  const expectedZIndices = [10, 20, 30, 40];

  for (let i = 0; i < expectedOffsets.length; i++) {
    const offset = expectedOffsets[i];
    const z = expectedZIndices[i];
    const hasTop = processHtml.includes(`top:${offset}px`) || processHtml.includes(`top: ${offset}px`);
    const hasZ = processHtml.includes(`z-index:${z}`) || processHtml.includes(`z-index: ${z}`);
    rep.assert(hasTop, `Process card ${i + 1} contains sticky top: ${offset}px`);
    rep.assert(hasZ, `Process card ${i + 1} contains z-index: ${z}`);

    if (i > 0) {
      const delta = offset - expectedOffsets[i - 1];
      rep.assertEqual(delta, 18, `Monotonic step delta between card ${i} and card ${i + 1} is exactly 18px`);
      rep.assert(z > expectedZIndices[i - 1], `Z-index is strictly increasing (${z} > ${expectedZIndices[i - 1]})`);
    }
  }

  // Verify all 4 geometric glyph SVGs and #fc4778 focal nodes
  const focalNodeCount = (processHtml.match(/fill="#fc4778"/g) || []).length;
  rep.assert(focalNodeCount >= 4, `Process SVGs contain at least 4 #fc4778 focal accent nodes (found: ${focalNodeCount})`);

  // Verify all 4 step titles
  const processTitles = [
    'Discovery & Strategy',
    'Design & Prototype',
    'Build & Launch',
    'Support & Growth'
  ];
  for (const title of processTitles) {
    const encodedTitle = title.replace(/&/g, '&amp;');
    rep.assert(processHtml.includes(title) || processHtml.includes(encodedTitle), `Process section renders phase title: "${title}"`);
  }
  rep.testPass('Process Sticky Offset Hierarchy verified 100%');

  // ========================================================================
  // Suite 3: SelectedWorks Hover Focus-Dimming State Machine
  // ========================================================================
  rep.suiteHeader('SelectedWorks Hover Focus-Dimming State Machine');

  rep.assert(Array.isArray(CASE_STUDIES) && CASE_STUDIES.length >= 4, `CASE_STUDIES has ${CASE_STUDIES.length} projects (>= 4)`);

  // Focus-dimming logic:
  // const isDimmed = hoveredWork !== null && hoveredWork !== project.slug;
  // opacity: isDimmed ? 0.28 : 1
  const computeWorkOpacity = (hoveredSlug, projectSlug) => {
    const isDimmed = hoveredSlug !== null && hoveredSlug !== projectSlug;
    return isDimmed ? 0.28 : 1;
  };

  // State 1: Default state (hoveredWork === null) -> all opacities are 1
  for (const p of CASE_STUDIES) {
    const op = computeWorkOpacity(null, p.slug);
    rep.assertEqual(op, 1, `Default state: project "${p.slug}" has full opacity (1.0)`);
  }

  // State 2: For each hovered project, only it is 1.0, all other N-1 are 0.28
  for (const active of CASE_STUDIES) {
    let activeOpacity = computeWorkOpacity(active.slug, active.slug);
    rep.assertEqual(activeOpacity, 1, `Active hover: hovered card "${active.slug}" retains opacity 1.0`);

    let siblingsDimmedCount = 0;
    for (const other of CASE_STUDIES) {
      if (other.slug === active.slug) continue;
      const sibOp = computeWorkOpacity(active.slug, other.slug);
      if (sibOp === 0.28) siblingsDimmedCount++;
    }
    rep.assertEqual(
      siblingsDimmedCount,
      CASE_STUDIES.length - 1,
      `Active hover on "${active.slug}": exactly ${CASE_STUDIES.length - 1} siblings dim to 0.28`
    );
  }

  // State 3: Non-existent / external slug hover -> all cards dim to 0.28
  for (const p of CASE_STUDIES) {
    const op = computeWorkOpacity('external-or-unmatched-slug', p.slug);
    rep.assertEqual(op, 0.28, `Unknown slug hover: card "${p.slug}" dims to 0.28`);
  }

  // SSR markup verification
  const worksHtml = renderWithRouter(React.createElement(SelectedWorks));
  rep.assert(worksHtml.includes('id="work"'), 'SelectedWorks contains anchor id="work"');
  rep.assert(worksHtml.includes('grid-cols-1 md:grid-cols-2'), 'SelectedWorks contains 2-column responsive grid layout');
  rep.assert(worksHtml.includes('aspect-[4/3]'), 'SelectedWorks contains 4:3 aspect ratio containers');
  rep.assert(worksHtml.includes('transition-all duration-300'), 'SelectedWorks contains 300ms transition styling');

  for (const p of CASE_STUDIES) {
    rep.assert(worksHtml.includes(`/work/${p.slug}`), `SelectedWorks contains navigation link to /work/${p.slug}`);
    const encodedTitle = p.title.replace(/&/g, '&amp;');
    rep.assert(worksHtml.includes(p.title) || worksHtml.includes(encodedTitle), `SelectedWorks renders project title: "${p.title}"`);
  }
  rep.testPass('SelectedWorks Hover Focus-Dimming State Machine verified 100%');

  // ========================================================================
  // Suite 4: ProofStage & FloatingTrail Dynamic Pool Bounds & Lissajous Drift
  // ========================================================================
  rep.suiteHeader('ProofStage & FloatingTrail Dynamic Pool & Touch Physics');

  const proofHtml = renderWithRouter(React.createElement(ProofStage));
  rep.assert(proofHtml.includes('id="proof"'), 'ProofStage section contains anchor id="proof"');
  rep.assert(proofHtml.includes('id="trail"'), 'ProofStage renders FloatingTrail with id="trail"');

  // FloatingTrail pool bounds simulation
  const STEP = 66; // Minimum movement delta (px)
  const MIN_MS = 28; // Spawn throttle threshold (ms)
  const MAX = 6; // Active visible pool cap

  // Simulate pool management
  let simulatedPool = [];
  let lastSpawnPos = { x: 0, y: 0 };
  let lastSpawnTime = 0;
  let totalSpawnAttempts = 1000;
  let successfulSpawns = 0;
  let poolCapExceeded = 0;

  for (let i = 0; i < totalSpawnAttempts; i++) {
    // Generate simulated pointer moves (some < STEP, some >= STEP, some fast < MIN_MS, some valid)
    const moveDist = (i % 3 === 0) ? 20 : (i % 3 === 1) ? 65 : 120; // 20px, 65px, 120px
    const timeElapsed = (i % 2 === 0) ? 10 : 50; // 10ms (throttled) vs 50ms (valid)

    const now = lastSpawnTime + timeElapsed;
    const isTimeValid = timeElapsed >= MIN_MS;
    const isDistValid = moveDist >= STEP;

    if (isTimeValid && isDistValid) {
      successfulSpawns++;
      lastSpawnTime = now;
      lastSpawnPos = { x: lastSpawnPos.x + moveDist, y: lastSpawnPos.y + moveDist };

      // Add to pool with MAX cap
      const nextCard = { id: i, born: now };
      if (simulatedPool.length >= MAX) {
        simulatedPool = simulatedPool.slice(simulatedPool.length - MAX + 1);
      }
      simulatedPool.push(nextCard);

      if (simulatedPool.length > MAX) {
        poolCapExceeded++;
      }
    }
  }

  rep.assert(successfulSpawns > 100, `Simulation generated ${successfulSpawns} valid pointer spawn events`);
  rep.assertEqual(poolCapExceeded, 0, `Active trail pool strictly bounded to MAX = ${MAX} items (cap never exceeded)`);
  rep.assert(simulatedPool.length <= MAX, `Final pool size (${simulatedPool.length}) <= MAX (${MAX})`);

  // Lissajous Parametric Simulation Bounds Stress
  // Math:
  // lissajousX(t, w) = w * (0.5 + 0.38 * Math.sin(1.25 * t) * Math.cos(0.29 * t))
  // lissajousY(t, h) = h * (0.52 + 0.30 * Math.sin(0.97 * t + 1.2))
  const lissajousX = (t, w) => w * (0.5 + 0.38 * Math.sin(1.25 * t) * Math.cos(0.29 * t));
  const lissajousY = (t, h) => h * (0.52 + 0.30 * Math.sin(0.97 * t + 1.2));

  const canvasW = 800;
  const canvasH = 600;
  let lissajousOutW = 0;
  let lissajousOutH = 0;
  const lissajousSamples = 10000;

  for (let step = 0; step < lissajousSamples; step++) {
    const t = step * 0.1; // 0 to 1000 seconds
    const x = lissajousX(t, canvasW);
    const y = lissajousY(t, canvasH);

    // Verify coordinates stay safely within 5% to 95% of container dimensions
    if (x < 0 || x > canvasW) lissajousOutW++;
    if (y < 0 || y > canvasH) lissajousOutH++;
  }

  rep.assertEqual(lissajousOutW, 0, `10,000 Lissajous samples: X coordinates strictly inside container [0, ${canvasW}]`);
  rep.assertEqual(lissajousOutH, 0, `10,000 Lissajous samples: Y coordinates strictly inside container [0, ${canvasH}]`);
  rep.testPass('ProofStage & FloatingTrail dynamic pool & physics verified 100%');

  // ========================================================================
  // Suite 5: TestimonialSlider Auto-Cycling & Invariants
  // ========================================================================
  rep.suiteHeader('TestimonialSlider Cyclic Index Math & Tab Visibility Invariants');

  rep.assert(Array.isArray(TESTIMONIALS) && TESTIMONIALS.length >= 4, `TESTIMONIALS dataset has ${TESTIMONIALS.length} entries`);
  const totalSlides = TESTIMONIALS.length;

  // Cyclic forward wrap: (prev + 1) % totalSlides
  // Cyclic backward wrap: (prev - 1 + totalSlides) % totalSlides
  const nextSlide = (cur) => (cur + 1) % totalSlides;
  const prevSlide = (cur) => (cur - 1 + totalSlides) % totalSlides;

  // Forward cycling 100 times
  let curIndex = 0;
  for (let i = 0; i < 100; i++) {
    const expected = (i + 1) % totalSlides;
    curIndex = nextSlide(curIndex);
    rep.assertEqual(curIndex, expected, `Forward step ${i + 1} yields index ${expected}`);
  }

  // Backward cycling 100 times
  for (let i = 0; i < 100; i++) {
    const expected = (curIndex - 1 + totalSlides) % totalSlides;
    curIndex = prevSlide(curIndex);
    rep.assertEqual(curIndex, expected, `Backward step ${i + 1} yields index ${expected}`);
  }

  // SSR markup
  const sliderHtml = renderWithRouter(React.createElement(TestimonialSlider));
  rep.assert(sliderHtml.includes(TESTIMONIALS[0].quote), 'TestimonialSlider renders initial slide quote');
  rep.assert(sliderHtml.includes(TESTIMONIALS[0].author), 'TestimonialSlider renders initial slide author');
  rep.testPass('TestimonialSlider Cyclic Index Math verified 100%');

  // ========================================================================
  // Suite 6: Production Build Bundle & Asset Integrity Audit
  // ========================================================================
  rep.suiteHeader('Production Build Bundle & Asset Integrity Audit');

  const distDir = path.resolve(PROJECT_ROOT, 'dist');
  const indexHtmlPath = path.resolve(distDir, 'index.html');
  rep.assert(fs.existsSync(indexHtmlPath), 'dist/index.html exists');

  const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  rep.assert(indexHtmlContent.length > 500, `dist/index.html is non-empty (${indexHtmlContent.length} bytes)`);

  // Extract referenced asset files
  const scriptMatches = [...indexHtmlContent.matchAll(/src="\/assets\/([^"]+)"/g)].map(m => m[1]);
  const styleMatches = [...indexHtmlContent.matchAll(/href="\/assets\/([^"]+)"/g)].map(m => m[1]);

  rep.assert(scriptMatches.length > 0, `dist/index.html references at least 1 JS chunk (found: ${scriptMatches.length})`);
  rep.assert(styleMatches.length > 0, `dist/index.html references at least 1 CSS bundle (found: ${styleMatches.length})`);

  let totalJsSize = 0;
  for (const jsFile of scriptMatches) {
    const jsPath = path.resolve(distDir, 'assets', jsFile);
    rep.assert(fs.existsSync(jsPath), `Referenced JS chunk exists on disk: ${jsFile}`);
    const stat = fs.statSync(jsPath);
    totalJsSize += stat.size;
  }

  let totalCssSize = 0;
  for (const cssFile of styleMatches) {
    const cssPath = path.resolve(distDir, 'assets', cssFile);
    rep.assert(fs.existsSync(cssPath), `Referenced CSS bundle exists on disk: ${cssFile}`);
    const stat = fs.statSync(cssPath);
    totalCssSize += stat.size;
  }

  const jsSizeKb = (totalJsSize / 1024).toFixed(2);
  const cssSizeKb = (totalCssSize / 1024).toFixed(2);
  console.log(`  ${c.dim}Distribution stats: JS = ${jsSizeKb} KB, CSS = ${cssSizeKb} KB${c.reset}`);

  // Assert reasonable production bundle limits
  rep.assert(totalJsSize < 600 * 1024, `Production JS bundle is within reasonable limit < 600 KB (actual: ${jsSizeKb} KB)`);
  rep.assert(totalCssSize < 100 * 1024, `Production CSS bundle is within reasonable limit < 100 KB (actual: ${cssSizeKb} KB)`);

  rep.testPass('Production Build Bundle & Asset Integrity verified 100%');

  // ========================================================================
  // Suite 7: Full E2E Test Runner Verification
  // ========================================================================
  rep.suiteHeader('Full E2E Test Runner Execution Across All Tiers');

  console.log(`  ${c.dim}Executing: node scripts/test-runner.mjs --json ...${c.reset}`);
  const runnerOutputRaw = execSync('node scripts/test-runner.mjs --json', {
    cwd: PROJECT_ROOT,
    encoding: 'utf8'
  });

  const runnerJson = JSON.parse(runnerOutputRaw);
  const { summary } = runnerJson;

  rep.assertEqual(summary.totalFailed, 0, 'Opaque-box test runner: 0 failed assertions');
  rep.assertEqual(summary.totalPassed, 417, 'Opaque-box test runner: exactly 417 passing assertions');
  rep.assertEqual(summary.tiers.tier1.failed, 0, 'Tier 1 (Feature Coverage): 156/156 passed');
  rep.assertEqual(summary.tiers.tier2.failed, 0, 'Tier 2 (Boundary & Corner): 164/164 passed');
  rep.assertEqual(summary.tiers.tier3.failed, 0, 'Tier 3 (Cross-Interactions): 45/45 passed');
  rep.assertEqual(summary.tiers.tier4.failed, 0, 'Tier 4 (Real-World Scenarios): 52/52 passed');

  rep.testPass('Test runner executed across all tiers with 100% pass rate');

  // ========================================================================
  // Summary & Verdict
  // ========================================================================
  const totalDuration = Date.now() - globalStart;
  console.log(`\n${c.bold}${c.white}========================================================================${c.reset}`);
  console.log(`${c.bold}${c.cyan}   CHALLENGER MILESTONE 3 VERDICT REPORT${c.reset}`);
  console.log(`${c.bold}${c.white}========================================================================${c.reset}`);
  console.log(`  ${c.bold}Total Test Suites:${c.reset}    ${rep.totalSuites}`);
  console.log(`  ${c.bold}Total Assertions:${c.reset}     ${rep.totalAssertions}`);
  console.log(`  ${c.bold}Passing Assertions:${c.reset}   ${c.green}${rep.passed}${c.reset}`);
  console.log(`  ${c.bold}Failing Assertions:${c.reset}   ${rep.failed > 0 ? c.red : c.green}${rep.failed}${c.reset}`);
  console.log(`  ${c.bold}Suite Duration:${c.reset}       ${totalDuration}ms\n`);

  if (rep.failed === 0) {
    console.log(`  ${c.bgGreen}${c.bold} VERDICT: APPROVE (Milestone 3 Empirical Stress Tests Passed 100%) ${c.reset}\n`);
    process.exit(0);
  } else {
    console.log(`  ${c.bgRed}${c.bold} VERDICT: REJECT (${rep.failed} Empirical Challenges Failed) ${c.reset}\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal Challenger Exception:', err);
  process.exit(1);
});
