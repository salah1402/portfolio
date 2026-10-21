#!/usr/bin/env node
/**
 * Empirical Adversarial Challenger Test Suite for Milestone 1
 * Targets: src/data/projects.ts, src/types/index.ts, public/assets/
 *
 * Verifies:
 * 1. Data Model Completeness & TypeScript Schema Strictness
 * 2. Physical File Assets Verification on Disk (WebP/SVG)
 * 3. Live URLs & GitHub URLs Format & Protocol Strictness
 * 4. Adversarial Input Stress Testing for getCaseStudy()
 * 5. Adversarial Input Stress Testing for getNextCaseStudy()
 * 6. Cyclic Traversal Invariant & High-Iteration Stress Loop
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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
    this.startTime = Date.now();
  }

  suite(name) {
    this.totalSuites++;
    console.log(`\n${c.bold}${c.cyan}▶ Suite ${this.totalSuites}: ${name}${c.reset}`);
    console.log(`${c.dim}------------------------------------------------------------------------${c.reset}`);
  }

  assert(condition, message, details = {}) {
    this.totalAssertions++;
    if (condition) {
      this.passed++;
      console.log(`  ${c.green}✓ [PASS]${c.reset} ${message}`);
      return true;
    } else {
      this.failed++;
      this.failures.push({ message, details });
      console.log(`  ${c.red}✗ [FAIL]${c.reset} ${message}`);
      if (details.expected !== undefined || details.actual !== undefined) {
        console.log(`    ${c.dim}Expected: ${JSON.stringify(details.expected)}, Actual: ${JSON.stringify(details.actual)}${c.reset}`);
      }
      return false;
    }
  }

  assertEqual(actual, expected, message) {
    return this.assert(actual === expected, message, { expected, actual });
  }

  assertDeepEqual(actual, expected, message) {
    const isEq = JSON.stringify(actual) === JSON.stringify(expected);
    return this.assert(isEq, message, { expected, actual });
  }
}

const rep = new ChallengerReporter();

async function main() {
  console.log(`\n${c.bold}${c.white}========================================================================${c.reset}`);
  console.log(`${c.bold}${c.yellow}   CHALLENGER 2: EMPIRICAL ADVERSARIAL VERIFICATION (MILESTONE 1)${c.reset}`);
  console.log(`${c.dim}   Target: src/data/projects.ts, src/types/index.ts, public/assets/${c.reset}`);
  console.log(`${c.bold}${c.white}========================================================================${c.reset}`);

  // 1. Initialize Vite SSR environment to load TypeScript modules directly
  const viteServer = await createServer({
    root: PROJECT_ROOT,
    server: { middlewareMode: true },
    appType: 'custom'
  });

  const projectsModule = await viteServer.ssrLoadModule('./src/data/projects.ts');
  const { CASE_STUDIES, PROJECTS, getCaseStudy, getNextCaseStudy } = projectsModule;

  // ==========================================================================
  // Suite 1: Data Model & Schema Completeness
  // ==========================================================================
  rep.suite('Data Model & Schema Completeness (src/data/projects.ts)');

  rep.assert(Array.isArray(CASE_STUDIES), 'CASE_STUDIES is exported as an Array');
  rep.assertEqual(CASE_STUDIES.length, 6, 'CASE_STUDIES contains exactly 6 project entries');
  rep.assert(PROJECTS === CASE_STUDIES, 'PROJECTS is an identical alias reference to CASE_STUDIES');

  const expectedSlugs = [
    'privilege-interiors',
    'aura-dental',
    'agentframe',
    'sahara',
    'bleach-ichigo',
    'ironvault'
  ];

  const actualSlugs = CASE_STUDIES.map(p => p.slug);
  rep.assertDeepEqual(actualSlugs, expectedSlugs, 'All 6 project slugs match exact required archive order');

  // Verify uniqueness of slugs
  const uniqueSlugs = new Set(actualSlugs);
  rep.assertEqual(uniqueSlugs.size, 6, 'All project slugs are strictly unique');

  // Validate strict field constraints for each project
  for (const project of CASE_STUDIES) {
    const pSlug = project.slug;

    rep.assert(typeof project.title === 'string' && project.title.trim().length > 0, `[${pSlug}] title is non-empty string`);
    rep.assert(typeof project.client === 'string' && project.client.trim().length > 0, `[${pSlug}] client is non-empty string`);
    rep.assert(typeof project.category === 'string' && project.category.trim().length > 0, `[${pSlug}] category is non-empty string`);
    rep.assert(typeof project.year === 'string' && project.year.trim().length > 0, `[${pSlug}] year is non-empty string`);
    rep.assert(typeof project.timeline === 'string' && project.timeline.trim().length > 0, `[${pSlug}] timeline is non-empty string`);
    rep.assert(typeof project.role === 'string' && project.role.trim().length > 0, `[${pSlug}] role is non-empty string`);

    // Deliverables
    rep.assert(Array.isArray(project.deliverables) && project.deliverables.length >= 3, `[${pSlug}] deliverables has >= 3 items (found ${project.deliverables?.length})`);
    for (const d of project.deliverables || []) {
      rep.assert(typeof d === 'string' && d.trim().length > 0, `[${pSlug}] deliverable item is valid text`);
    }

    // Metrics
    rep.assert(Array.isArray(project.metrics) && project.metrics.length >= 3, `[${pSlug}] metrics has >= 3 items (found ${project.metrics?.length})`);
    for (const m of project.metrics || []) {
      rep.assert(typeof m.label === 'string' && m.label.length > 0, `[${pSlug}] metric label is non-empty`);
      rep.assert(typeof m.value === 'string' && m.value.length > 0, `[${pSlug}] metric value is non-empty`);
      rep.assert(typeof m.description === 'string' && m.description.length > 0, `[${pSlug}] metric description is non-empty`);
    }

    // Brief, Execution, Results
    rep.assert(typeof project.brief === 'string' && project.brief.trim().length >= 50, `[${pSlug}] brief is comprehensive (>= 50 chars, actual ${project.brief?.length})`);
    rep.assert(typeof project.execution === 'object' && project.execution !== null, `[${pSlug}] execution is an object`);
    rep.assert(typeof project.execution?.architecture === 'string' && project.execution.architecture.trim().length >= 30, `[${pSlug}] execution.architecture is comprehensive`);
    rep.assert(typeof project.execution?.threeDAndMotion === 'string' && project.execution.threeDAndMotion.trim().length >= 30, `[${pSlug}] execution.threeDAndMotion is comprehensive`);
    rep.assert(Array.isArray(project.execution?.stack) && project.execution.stack.length >= 3, `[${pSlug}] execution.stack has >= 3 technologies`);

    rep.assert(typeof project.results === 'string' && project.results.trim().length >= 30, `[${pSlug}] results is comprehensive (>= 30 chars)`);

    // ExtendedCaseStudy fields
    rep.assert(typeof project.country === 'string' && project.country.length > 0, `[${pSlug}] country is non-empty string`);
    rep.assert(Array.isArray(project.tags) && project.tags.length >= 2, `[${pSlug}] tags has >= 2 items`);
    rep.assert(typeof project.description === 'string' && project.description.length >= 20, `[${pSlug}] description is non-empty`);
    rep.assert(typeof project.subtitle === 'string' && project.subtitle.length >= 20, `[${pSlug}] subtitle is non-empty`);
  }

  // ==========================================================================
  // Suite 2: Physical Asset Verification on Disk
  // ==========================================================================
  rep.suite('Physical Asset Verification in public/assets/');

  const publicDir = path.join(PROJECT_ROOT, 'public');

  for (const project of CASE_STUDIES) {
    const pSlug = project.slug;

    // Cover image check
    rep.assert(typeof project.coverImage === 'string' && project.coverImage.startsWith('/assets/'), `[${pSlug}] coverImage starts with /assets/`);
    const coverPath = path.join(publicDir, project.coverImage.replace(/^\//, ''));
    const coverExists = fs.existsSync(coverPath);
    rep.assert(coverExists, `[${pSlug}] coverImage exists on disk at ${coverPath}`);
    if (coverExists) {
      const stats = fs.statSync(coverPath);
      rep.assert(stats.size > 0, `[${pSlug}] coverImage is non-empty (${stats.size} bytes)`);
    }

    // Gallery images check
    rep.assert(Array.isArray(project.galleryImages) && project.galleryImages.length >= 1, `[${pSlug}] galleryImages has >= 1 item`);
    for (const gImg of project.galleryImages || []) {
      rep.assert(typeof gImg === 'string' && gImg.startsWith('/assets/'), `[${pSlug}] galleryImage starts with /assets/: ${gImg}`);
      const gPath = path.join(publicDir, gImg.replace(/^\//, ''));
      const gExists = fs.existsSync(gPath);
      rep.assert(gExists, `[${pSlug}] galleryImage exists on disk: ${gImg}`);
      if (gExists) {
        const stats = fs.statSync(gPath);
        rep.assert(stats.size > 0, `[${pSlug}] galleryImage is non-empty (${stats.size} bytes)`);
      }
    }
  }

  // Explicit check for bleach-ichigo and ironvault assets per milestone spec
  const bleachWebp = path.join(publicDir, 'assets', 'bleach-ichigo.webp');
  const bleachSvg = path.join(publicDir, 'assets', 'bleach-ichigo.svg');
  const ironvaultWebp = path.join(publicDir, 'assets', 'ironvault.webp');
  const ironvaultSvg = path.join(publicDir, 'assets', 'ironvault.svg');

  rep.assert(fs.existsSync(bleachWebp) && fs.statSync(bleachWebp).size > 10000, `bleach-ichigo.webp exists and exceeds 10KB (${fs.existsSync(bleachWebp) ? fs.statSync(bleachWebp).size : 0} bytes)`);
  rep.assert(fs.existsSync(bleachSvg) && fs.statSync(bleachSvg).size > 1000, `bleach-ichigo.svg fallback exists and exceeds 1KB (${fs.existsSync(bleachSvg) ? fs.statSync(bleachSvg).size : 0} bytes)`);
  rep.assert(fs.existsSync(ironvaultWebp) && fs.statSync(ironvaultWebp).size > 10000, `ironvault.webp exists and exceeds 10KB (${fs.existsSync(ironvaultWebp) ? fs.statSync(ironvaultWebp).size : 0} bytes)`);
  rep.assert(fs.existsSync(ironvaultSvg) && fs.statSync(ironvaultSvg).size > 1000, `ironvault.svg fallback exists and exceeds 1KB (${fs.existsSync(ironvaultSvg) ? fs.statSync(ironvaultSvg).size : 0} bytes)`);

  // ==========================================================================
  // Suite 3: Live URLs & GitHub URLs Protocol & Formatting
  // ==========================================================================
  rep.suite('Live URLs & Repository Protocol Strictness');

  const bleachProject = CASE_STUDIES.find(p => p.slug === 'bleach-ichigo');
  const ironvaultProject = CASE_STUDIES.find(p => p.slug === 'ironvault');

  rep.assert(bleachProject?.liveUrl === 'https://bleach-ichigo.vercel.app/', `bleach-ichigo liveUrl is exact: https://bleach-ichigo.vercel.app/`);
  rep.assert(ironvaultProject?.liveUrl === 'https://ironvault-eta.vercel.app/', `ironvault liveUrl is exact: https://ironvault-eta.vercel.app/`);
  rep.assert(ironvaultProject?.githubUrl === 'https://github.com/salah1402/gym-demo.git', `ironvault githubUrl is exact: https://github.com/salah1402/gym-demo.git`);

  // Check all URLs across all projects
  for (const project of CASE_STUDIES) {
    if (project.liveUrl) {
      let parsed = null;
      let valid = false;
      try {
        parsed = new URL(project.liveUrl);
        valid = parsed.protocol === 'https:';
      } catch {
        valid = false;
      }
      rep.assert(valid, `[${project.slug}] liveUrl "${project.liveUrl}" is a valid secure HTTPS URL`);
      rep.assert(parsed && parsed.hostname.length > 3, `[${project.slug}] liveUrl hostname is valid: ${parsed?.hostname}`);
    }

    if (project.githubUrl) {
      let parsed = null;
      let valid = false;
      try {
        parsed = new URL(project.githubUrl);
        valid = parsed.protocol === 'https:';
      } catch {
        valid = false;
      }
      rep.assert(valid, `[${project.slug}] githubUrl "${project.githubUrl}" is a valid secure HTTPS URL`);
    }
  }

  // ==========================================================================
  // Suite 4: Adversarial Input Stress Testing for getCaseStudy()
  // ==========================================================================
  rep.suite('Adversarial Input Stress Testing: getCaseStudy()');

  // 1. Exact valid slugs
  for (const slug of expectedSlugs) {
    const res = getCaseStudy(slug);
    rep.assert(res !== undefined && res.slug === slug, `getCaseStudy('${slug}') resolves exact project`);
  }

  // 2. Alias resolution
  const saharaAlias = getCaseStudy('sahara-metrology');
  rep.assert(saharaAlias !== undefined && saharaAlias.slug === 'sahara', `getCaseStudy('sahara-metrology') resolves to 'sahara'`);

  // 3. Trailing slashes
  rep.assertEqual(getCaseStudy('bleach-ichigo/')?.slug, 'bleach-ichigo', `getCaseStudy('bleach-ichigo/') handles single trailing slash`);
  rep.assertEqual(getCaseStudy('ironvault///')?.slug, 'ironvault', `getCaseStudy('ironvault///') handles multiple trailing slashes`);
  rep.assertEqual(getCaseStudy('sahara-metrology///')?.slug, 'sahara', `getCaseStudy('sahara-metrology///') handles alias with trailing slashes`);

  // 4. Case sensitivity invariance
  rep.assertEqual(getCaseStudy('Bleach-Ichigo')?.slug, 'bleach-ichigo', `getCaseStudy('Bleach-Ichigo') handles TitleCase`);
  rep.assertEqual(getCaseStudy('IRONVAULT')?.slug, 'ironvault', `getCaseStudy('IRONVAULT') handles UPPERCASE`);
  rep.assertEqual(getCaseStudy('aUrA-dEnTaL')?.slug, 'aura-dental', `getCaseStudy('aUrA-dEnTaL') handles mixed case`);
  rep.assertEqual(getCaseStudy('SAHARA-METROLOGY')?.slug, 'sahara', `getCaseStudy('SAHARA-METROLOGY') handles uppercase alias`);

  // 5. Surrounding whitespace & escape characters
  rep.assertEqual(getCaseStudy('  bleach-ichigo  ')?.slug, 'bleach-ichigo', `getCaseStudy('  bleach-ichigo  ') trims leading/trailing spaces`);
  rep.assertEqual(getCaseStudy('\t\nironvault\r\n')?.slug, 'ironvault', `getCaseStudy handles newlines and tabs`);
  rep.assertEqual(getCaseStudy('  BLEACH-ICHIGO/  ')?.slug, 'bleach-ichigo', `getCaseStudy handles combined whitespace, uppercase, trailing slash`);

  // 6. Falsy & Empty Inputs
  rep.assertEqual(getCaseStudy(undefined), undefined, `getCaseStudy(undefined) returns undefined without throwing`);
  rep.assertEqual(getCaseStudy(null), undefined, `getCaseStudy(null) returns undefined without throwing`);
  rep.assertEqual(getCaseStudy(''), undefined, `getCaseStudy('') returns undefined`);
  rep.assertEqual(getCaseStudy('   '), undefined, `getCaseStudy('   ') returns undefined`);
  rep.assertEqual(getCaseStudy('/'), undefined, `getCaseStudy('/') returns undefined`);
  rep.assertEqual(getCaseStudy('///'), undefined, `getCaseStudy('///') returns undefined`);

  // 7. Non-existent & near-miss slugs
  const nearMisses = [
    'bleach',
    'ichigo',
    'iron',
    'vault',
    'privilege',
    'aura',
    'agent',
    'unknown-project',
    '404-slug',
    'sahara-metrology-v2'
  ];
  for (const nm of nearMisses) {
    rep.assertEqual(getCaseStudy(nm), undefined, `getCaseStudy('${nm}') returns undefined for non-existent slug`);
  }

  // 8. Security & Injection Probes
  const maliciousInputs = [
    '<script>alert(1)</script>',
    '"><img src=x onerror=alert(1)>',
    '../../../../etc/passwd',
    '..\\..\\windows\\system32',
    'bleach-ichigo\' OR \'1\'=\'1',
    'constructor',
    '__proto__',
    'prototype',
    'toString',
    'valueOf',
    'hasOwnProperty',
    '${process.exit(1)}',
    'eval("console.log(1)")',
    '\x00bleach-ichigo',
    'bleach\x00ichigo'
  ];

  for (const mal of maliciousInputs) {
    const res = getCaseStudy(mal);
    rep.assertEqual(res, undefined, `getCaseStudy("${mal}") safely returns undefined without injection or pollution`);
  }

  // 9. ReDoS / Long String Performance Probe
  const startLong = Date.now();
  const longInput = 'a'.repeat(100000);
  const longResult = getCaseStudy(longInput);
  const durationLong = Date.now() - startLong;
  rep.assertEqual(longResult, undefined, `getCaseStudy handles 100,000-char string safely`);
  rep.assert(durationLong < 50, `100k-char query evaluates in <50ms (actual: ${durationLong}ms)`);

  // ==========================================================================
  // Suite 5: Adversarial Input Stress Testing for getNextCaseStudy()
  // ==========================================================================
  rep.suite('Adversarial Input Stress Testing: getNextCaseStudy()');

  // 1. Sequential cyclic transitions across all 6 projects
  const cyclicPairs = [
    ['privilege-interiors', 'aura-dental'],
    ['aura-dental', 'agentframe'],
    ['agentframe', 'sahara'],
    ['sahara', 'bleach-ichigo'],
    ['bleach-ichigo', 'ironvault'],
    ['ironvault', 'privilege-interiors'] // Wrap-around check
  ];

  for (const [curr, next] of cyclicPairs) {
    const res = getNextCaseStudy(curr);
    rep.assertEqual(res?.slug, next, `getNextCaseStudy('${curr}') rotates to '${next}'`);
  }

  // 2. Alias resolution in getNextCaseStudy
  rep.assertEqual(getNextCaseStudy('sahara-metrology')?.slug, 'bleach-ichigo', `getNextCaseStudy('sahara-metrology') correctly yields 'bleach-ichigo'`);

  // 3. Normalization (case, whitespace, trailing slash) in getNextCaseStudy
  rep.assertEqual(getNextCaseStudy('BLEACH-ICHIGO')?.slug, 'ironvault', `getNextCaseStudy('BLEACH-ICHIGO') handles uppercase`);
  rep.assertEqual(getNextCaseStudy('ironvault/')?.slug, 'privilege-interiors', `getNextCaseStudy('ironvault/') handles trailing slash`);
  rep.assertEqual(getNextCaseStudy('  agentframe  ')?.slug, 'sahara', `getNextCaseStudy('  agentframe  ') handles whitespace`);
  rep.assertEqual(getNextCaseStudy('SAHARA-METROLOGY///')?.slug, 'bleach-ichigo', `getNextCaseStudy handles combined uppercase, alias, slashes`);

  // 4. Fallback behavior for invalid, unknown, or adversarial inputs
  const fallbackInputs = [
    '',
    '   ',
    undefined,
    null,
    'unknown-slug',
    'random-non-existent-id',
    '__proto__',
    'constructor',
    '<script>alert(1)</script>',
    '../../../'
  ];

  for (const fb of fallbackInputs) {
    const res = getNextCaseStudy(fb);
    rep.assertEqual(res?.slug, 'privilege-interiors', `getNextCaseStudy(${JSON.stringify(fb)}) safely falls back to index 0 ('privilege-interiors')`);
  }

  // ==========================================================================
  // Suite 6: Cyclic Traversal Invariants & High-Iteration Stress Loop
  // ==========================================================================
  rep.suite('Cyclic Traversal Invariants & High-Iteration Stress Loop');

  // Verify full cycle period = 6
  let currentSlug = 'privilege-interiors';
  for (let step = 1; step <= 6; step++) {
    currentSlug = getNextCaseStudy(currentSlug).slug;
  }
  rep.assertEqual(currentSlug, 'privilege-interiors', 'Full 6-step traversal returns precisely to starting project');

  // Verify 120,000 continuous iterations stress loop (zero drift, zero degradation)
  const STRESS_HOPS = 120000;
  const loopStart = Date.now();
  let cursor = 'privilege-interiors';

  for (let i = 0; i < STRESS_HOPS; i++) {
    cursor = getNextCaseStudy(cursor).slug;
  }
  const loopDuration = Date.now() - loopStart;

  rep.assertEqual(cursor, 'privilege-interiors', `120,000 hops returned to origin ('privilege-interiors' with 0 drift)`);
  rep.assert(loopDuration < 500, `120,000 cyclic traversals completed in <500ms (actual: ${loopDuration}ms)`);

  await viteServer.close();

  // ==========================================================================
  // Summary & Structured Verdict
  // ==========================================================================
  const totalDuration = Date.now() - rep.startTime;
  console.log(`\n${c.bold}${c.white}========================================================================${c.reset}`);
  console.log(`${c.bold}${c.cyan}   CHALLENGER 2 EMPIRICAL TEST HARNESS EXECUTION SUMMARY${c.reset}`);
  console.log(`${c.bold}${c.white}========================================================================${c.reset}`);
  console.log(`  ${c.bold}Total Test Suites:${c.reset}    ${rep.totalSuites}`);
  console.log(`  ${c.bold}Total Assertions:${c.reset}     ${rep.totalAssertions}`);
  console.log(`  ${c.bold}Passing Assertions:${c.reset}   ${c.green}${rep.passed}${c.reset}`);
  console.log(`  ${c.bold}Failing Assertions:${c.reset}   ${rep.failed > 0 ? c.red : c.green}${rep.failed}${c.reset}`);
  console.log(`  ${c.bold}Total Duration:${c.reset}       ${totalDuration}ms\n`);

  if (rep.failed === 0) {
    console.log(`  ${c.bgGreen}${c.bold} VERDICT: APPROVE (100% EMPIRICAL CHALLENGES PASSED) ${c.reset}\n`);
    process.exit(0);
  } else {
    console.log(`  ${c.bgRed}${c.bold} VERDICT: REQUEST_CHANGES (${rep.failed} ASSERTIONS FAILED) ${c.reset}\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal Test Exception:', err);
  process.exit(1);
});
