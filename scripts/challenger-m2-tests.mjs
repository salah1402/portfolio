#!/usr/bin/env node
/**
 * Empirical Adversarial Challenger Test Suite for Milestone 2
 * Targets: Build, Bundle, TypeScript Strict Compilation, Test Runner, and Vite Preview HTTP Server
 *
 * Checks:
 * 1. TypeScript Strict Compilation (`tsc --noEmit`, `tsc -b`)
 * 2. Production Build Bundle Integrity & Size Analysis (`dist/`)
 * 3. E2E Test Runner Verification (`node scripts/test-runner.mjs`)
 * 4. Live Vite Preview Server HTTP Responses (`vite preview`) across required routes:
 *    `/`, `/about`, `/contact`, `/work/privilege-interiors`, and static chunks
 * 5. Data Model & Algorithmic Invariants (Projects, Dual-slug, Cyclic next, Pricing Oracle 48-grid)
 * 6. Editorial Page Structure & Route Tree Static AST & SSR Invariants
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { spawn, execSync } from 'node:child_process';
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
  magenta: '\x1b[35m'
};

class ChallengerSuite {
  constructor() {
    this.totalSuites = 0;
    this.totalAssertions = 0;
    this.passed = 0;
    this.failed = 0;
    this.currentSuiteName = '';
    this.failures = [];
    this.startTime = Date.now();
  }

  suite(name) {
    this.totalSuites++;
    this.currentSuiteName = name;
    console.log(`\n${c.cyan}▶ Suite ${this.totalSuites}: ${name}${c.reset}`);
    console.log('-'.repeat(72));
  }

  assert(condition, message, detail = '') {
    this.totalAssertions++;
    if (condition) {
      this.passed++;
      console.log(`  ${c.green}✓ [PASS]${c.reset} ${message}`);
      return true;
    } else {
      this.failed++;
      this.failures.push({ suite: this.currentSuiteName, message, detail });
      console.log(`  ${c.red}✗ [FAIL]${c.reset} ${message}`);
      if (detail) {
        console.log(`    ${c.dim}${detail}${c.reset}`);
      }
      return false;
    }
  }

  async fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = http.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error(`Timeout fetching ${url}`));
      });
      req.end();
    });
  }

  async waitForServer(url, timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const res = await this.fetch(url);
        if (res.statusCode >= 200 && res.statusCode < 500) {
          return true;
        }
      } catch {
        // Retry after short delay
      }
      await new Promise(r => setTimeout(r, 200));
    }
    return false;
  }
}

async function run() {
  const runner = new ChallengerSuite();
  console.log('='.repeat(72));
  console.log('   CHALLENGER M2: EMPIRICAL VERIFICATION & STRESS HARNESS');
  console.log(`   Target: ${PROJECT_ROOT}`);
  console.log('='.repeat(72));

  // =========================================================================
  // SUITE 1: TypeScript Compilation with Strict Flags
  // =========================================================================
  runner.suite('TypeScript Compilation with Strict Flags');
  try {
    const tscOutput = execSync('npx tsc --noEmit', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    runner.assert(true, 'tsc --noEmit passes cleanly with exit code 0');
  } catch (err) {
    runner.assert(false, 'tsc --noEmit failed', err.stdout || err.stderr || err.message);
  }

  try {
    const tscBuildOutput = execSync('npx tsc -b', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    runner.assert(true, 'tsc -b build mode passes cleanly with exit code 0');
  } catch (err) {
    runner.assert(false, 'tsc -b failed', err.stdout || err.stderr || err.message);
  }

  try {
    const extraStrictOutput = execSync(
      'npx tsc -p tsconfig.app.json --noEmit --noImplicitAny --strictNullChecks --strictFunctionTypes --strictBindCallApply --strictPropertyInitialization --noImplicitThis --alwaysStrict',
      { cwd: PROJECT_ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    runner.assert(true, 'tsc with extra strictness flags passes cleanly with exit code 0');
  } catch (err) {
    runner.assert(false, 'tsc extra strictness failed', err.stdout || err.stderr || err.message);
  }

  // =========================================================================
  // SUITE 2: Production Build & Bundle Inspection
  // =========================================================================
  runner.suite('Production Build & Bundle Inspection');
  const distPath = path.join(PROJECT_ROOT, 'dist');
  const distIndexPath = path.join(distPath, 'index.html');
  const assetsPath = path.join(distPath, 'assets');

  runner.assert(fs.existsSync(distIndexPath), 'dist/index.html exists');
  const indexHtmlContent = fs.existsSync(distIndexPath) ? fs.readFileSync(distIndexPath, 'utf8') : '';
  runner.assert(indexHtmlContent.includes('<div id="root">'), 'dist/index.html contains root mount container <div id="root">');
  runner.assert(indexHtmlContent.includes('<script type="module"'), 'dist/index.html contains module entry script tag');
  runner.assert(indexHtmlContent.length > 500 && indexHtmlContent.length < 50000, `dist/index.html size is reasonable (${indexHtmlContent.length} bytes)`);

  const assetFiles = fs.existsSync(assetsPath) ? fs.readdirSync(assetsPath) : [];
  const jsBundle = assetFiles.find(f => f.startsWith('index-') && f.endsWith('.js'));
  const cssBundle = assetFiles.find(f => f.startsWith('index-') && f.endsWith('.css'));

  runner.assert(Boolean(jsBundle), `Production JS bundle generated (${jsBundle})`);
  runner.assert(Boolean(cssBundle), `Production CSS bundle generated (${cssBundle})`);

  let jsSize = 0;
  if (jsBundle) {
    jsSize = fs.statSync(path.join(assetsPath, jsBundle)).size;
    runner.assert(jsSize > 50000, `JS bundle has substantive code content (${Math.round(jsSize / 1024)} kB)`);
    runner.assert(jsSize < 600000, `JS bundle is well within performance budget (< 600 kB, actual ${Math.round(jsSize / 1024)} kB)`);
  }

  let cssSize = 0;
  if (cssBundle) {
    cssSize = fs.statSync(path.join(assetsPath, cssBundle)).size;
    runner.assert(cssSize > 10000, `CSS bundle contains compiled Tailwind styles (${Math.round(cssSize / 1024)} kB)`);
    runner.assert(cssSize < 100000, `CSS bundle is optimized (< 100 kB, actual ${Math.round(cssSize / 1024)} kB)`);
  }

  const requiredPublicAssets = [
    'privilege-logo.webp',
    'agentframe-logo.svg',
    'portrait-cutout.webp',
    'clinic-preview.webp',
    'privilege-interior.jpg'
  ];
  for (const asset of requiredPublicAssets) {
    runner.assert(assetFiles.includes(asset), `dist/assets contains public asset: ${asset}`);
  }

  // =========================================================================
  // SUITE 3: Automated Test Runner Verification
  // =========================================================================
  runner.suite('Automated Test Runner Verification (Tiers 1-4)');
  try {
    const rawOutput = execSync('node scripts/test-runner.mjs', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const cleanOutput = rawOutput.replace(/\x1b\[[0-9;]*m/g, '');
    runner.assert(cleanOutput.includes('ALL ASSERTIONS PASSED (100% SUCCESS)'), 'Test runner reports 100% SUCCESS');
    runner.assert(/Total Test Suites:\s+84/.test(cleanOutput), 'Test runner ran exactly 84 test suites');
    runner.assert(/Total Assertions:\s+417/.test(cleanOutput), 'Test runner verified exactly 417 assertions');
    runner.assert(/Failing Assertions:\s+0/.test(cleanOutput), 'Test runner reports 0 failing assertions');
  } catch (err) {
    runner.assert(false, 'test-runner.mjs execution failed', err.stdout || err.stderr || err.message);
  }

  // =========================================================================
  // SUITE 4: Live Preview Server HTTP Responses (`vite preview`)
  // =========================================================================
  runner.suite('Live Preview Server HTTP Verification (Vite Preview on :4192)');
  const PREVIEW_PORT = 4192;
  const PREVIEW_BASE = `http://localhost:${PREVIEW_PORT}`;

  let previewProcess = null;
  try {
    previewProcess = spawn('npx', ['vite', 'preview', '--port', String(PREVIEW_PORT), '--strictPort'], {
      cwd: PROJECT_ROOT,
      shell: true,
      stdio: 'pipe'
    });

    let previewStderr = '';
    previewProcess.stderr.on('data', d => { previewStderr += d.toString(); });

    const serverReady = await runner.waitForServer(PREVIEW_BASE, 10000);
    runner.assert(serverReady, `Vite preview server successfully listening on ${PREVIEW_BASE}`);

    if (serverReady) {
      // 1. Root route `/`
      const resRoot = await runner.fetch(`${PREVIEW_BASE}/`);
      runner.assert(resRoot.statusCode === 200, 'GET / returns HTTP 200');
      runner.assert(resRoot.headers['content-type']?.includes('text/html'), 'GET / returns Content-Type text/html');
      runner.assert(resRoot.body.includes('<div id="root">'), 'GET / HTML contains <div id="root">');
      runner.assert(resRoot.body.includes(jsBundle), `GET / HTML references production JS bundle ${jsBundle}`);

      // 2. About route `/about`
      const resAbout = await runner.fetch(`${PREVIEW_BASE}/about`);
      runner.assert(resAbout.statusCode === 200, 'GET /about returns HTTP 200 (SPA client route fallback)');
      runner.assert(resAbout.headers['content-type']?.includes('text/html'), 'GET /about returns Content-Type text/html');
      runner.assert(resAbout.body.includes('<div id="root">'), 'GET /about HTML contains <div id="root">');

      // 3. Contact route `/contact`
      const resContact = await runner.fetch(`${PREVIEW_BASE}/contact`);
      runner.assert(resContact.statusCode === 200, 'GET /contact returns HTTP 200 (SPA client route fallback)');
      runner.assert(resContact.headers['content-type']?.includes('text/html'), 'GET /contact returns Content-Type text/html');
      runner.assert(resContact.body.includes('<div id="root">'), 'GET /contact HTML contains <div id="root">');

      // 4. Case Study `/work/privilege-interiors`
      const resPrivilege = await runner.fetch(`${PREVIEW_BASE}/work/privilege-interiors`);
      runner.assert(resPrivilege.statusCode === 200, 'GET /work/privilege-interiors returns HTTP 200 (SPA fallback)');
      runner.assert(resPrivilege.headers['content-type']?.includes('text/html'), 'GET /work/privilege-interiors returns Content-Type text/html');
      runner.assert(resPrivilege.body.includes('<div id="root">'), 'GET /work/privilege-interiors HTML contains <div id="root">');

      // 5. Additional Case Studies: `/work/aura-dental`, `/work/agentframe`, `/work/sahara`, `/work/sahara-metrology`, `/work/meridian-watch`
      for (const slug of ['aura-dental', 'agentframe', 'sahara', 'sahara-metrology', 'meridian-watch']) {
        const resCase = await runner.fetch(`${PREVIEW_BASE}/work/${slug}`);
        runner.assert(resCase.statusCode === 200, `GET /work/${slug} returns HTTP 200`);
      }

      // 6. Static JS Chunk fetch
      if (jsBundle) {
        const resJs = await runner.fetch(`${PREVIEW_BASE}/assets/${jsBundle}`);
        runner.assert(resJs.statusCode === 200, `GET /assets/${jsBundle} returns HTTP 200`);
        runner.assert(resJs.headers['content-type']?.includes('javascript'), `GET /assets/${jsBundle} Content-Type is JavaScript`);
        runner.assert(resJs.body.length > 50000, `GET /assets/${jsBundle} served substantive body (${resJs.body.length} bytes)`);
      }

      // 7. Static CSS Chunk fetch
      if (cssBundle) {
        const resCss = await runner.fetch(`${PREVIEW_BASE}/assets/${cssBundle}`);
        runner.assert(resCss.statusCode === 200, `GET /assets/${cssBundle} returns HTTP 200`);
        runner.assert(resCss.headers['content-type']?.includes('css'), `GET /assets/${cssBundle} Content-Type is CSS`);
      }

      // 8. Static public asset fetch
      const resFavicon = await runner.fetch(`${PREVIEW_BASE}/favicon.svg`);
      runner.assert(resFavicon.statusCode === 200, 'GET /favicon.svg returns HTTP 200');
    }
  } catch (err) {
    runner.assert(false, 'Vite preview test failed with exception', err.message);
  } finally {
    if (previewProcess) {
      if (process.platform === 'win32') {
        try {
          execSync(`taskkill /pid ${previewProcess.pid} /T /F`, { stdio: 'ignore' });
        } catch {}
      } else {
        previewProcess.kill('SIGTERM');
      }
    }
  }

  // =========================================================================
  // Initialize Vite SSR Environment for In-Memory Module Loading
  // =========================================================================
  const viteServer = await createServer({
    root: PROJECT_ROOT,
    server: { middlewareMode: true },
    appType: 'custom'
  });

  // =========================================================================
  // SUITE 5: Data Model Invariants & Dual-Slug Adversarial Checks
  // =========================================================================
  runner.suite('Data Model & Dual-Slug Resolution Invariants');
  const projectsModule = await viteServer.ssrLoadModule('./src/data/projects.ts');
  const { CASE_STUDIES, getCaseStudy, getNextCaseStudy } = projectsModule;

  runner.assert(Array.isArray(CASE_STUDIES), 'CASE_STUDIES is an array');
  runner.assert(CASE_STUDIES.length === 5, `CASE_STUDIES contains exactly 5 authentic case studies (got ${CASE_STUDIES.length})`);

  const expectedSlugs = ['privilege-interiors', 'aura-dental', 'agentframe', 'sahara', 'meridian-watch'];
  const actualSlugs = CASE_STUDIES.map(c => c.slug);
  runner.assert(
    JSON.stringify(actualSlugs) === JSON.stringify(expectedSlugs),
    `Case study slugs match expected canonical order: ${expectedSlugs.join(', ')}`
  );

  // Dual-slug check: 'sahara' and 'sahara-metrology'
  const saharaDirect = getCaseStudy('sahara');
  const saharaAlias = getCaseStudy('sahara-metrology');
  runner.assert(Boolean(saharaDirect), "getCaseStudy('sahara') returns case study");
  runner.assert(Boolean(saharaAlias), "getCaseStudy('sahara-metrology') returns case study");
  runner.assert(saharaDirect?.slug === 'sahara', "sahara canonical slug is 'sahara'");
  runner.assert(saharaAlias?.slug === 'sahara', "sahara-metrology resolves to canonical slug 'sahara'");
  runner.assert(saharaDirect === saharaAlias, 'Both slugs resolve to identical memory reference');

  // Edge cases: trailing whitespace, uppercase, unknown slug
  const trimmed = getCaseStudy('  sahara  ');
  runner.assert(Boolean(trimmed), 'getCaseStudy handles surrounding whitespace');
  const upper = getCaseStudy('SAHARA');
  runner.assert(Boolean(upper), 'getCaseStudy handles uppercase slug');
  const unknown = getCaseStudy('non-existent-project-xyz');
  runner.assert(unknown === undefined, 'getCaseStudy gracefully returns undefined for non-existent slug');

  // Cyclic traversal check: getNextCaseStudy
  for (let i = 0; i < expectedSlugs.length; i++) {
    const cur = expectedSlugs[i];
    const nxtExpected = expectedSlugs[(i + 1) % expectedSlugs.length];
    const nextStudy = getNextCaseStudy(cur);
    runner.assert(
      nextStudy?.slug === nxtExpected,
      `getNextCaseStudy('${cur}') correctly cycles to '${nxtExpected}' (got '${nextStudy?.slug}')`
    );
  }
  const aliasNext = getNextCaseStudy('sahara-metrology');
  runner.assert(aliasNext?.slug === 'meridian-watch', "getNextCaseStudy('sahara-metrology') correctly transitions to 'meridian-watch'");

  // All 5 studies have required fields and structural metrics
  for (const cs of CASE_STUDIES) {
    runner.assert(cs.title && cs.title.length > 0, `${cs.slug}: title is present ("${cs.title}")`);
    runner.assert(cs.client && cs.client.length > 0, `${cs.slug}: client is present ("${cs.client}")`);
    runner.assert(cs.category && cs.category.length > 0, `${cs.slug}: category is present ("${cs.category}")`);
    runner.assert(cs.year && cs.year.length > 0, `${cs.slug}: year is present ("${cs.year}")`);
    runner.assert(cs.role && cs.role.length > 0, `${cs.slug}: role is present ("${cs.role}")`);
    runner.assert(cs.brief && cs.brief.length > 20, `${cs.slug}: brief has depth (>20 chars)`);
    runner.assert(cs.execution?.architecture?.length > 20, `${cs.slug}: execution.architecture has depth`);
    runner.assert(cs.execution?.threeDAndMotion?.length > 20, `${cs.slug}: execution.threeDAndMotion has depth`);
    runner.assert(Array.isArray(cs.execution?.stack) && cs.execution.stack.length >= 3, `${cs.slug}: execution.stack has >= 3 tech items`);
    runner.assert(Array.isArray(cs.metrics) && cs.metrics.length >= 3, `${cs.slug}: metrics contains >= 3 items`);
    runner.assert(cs.results && cs.results.length > 10, `${cs.slug}: results summary is present`);
    runner.assert(cs.coverImage && cs.coverImage.length > 0, `${cs.slug}: coverImage path is populated`);
  }

  // =========================================================================
  // SUITE 6: Pricing Engine 48-Combination Mathematical Oracle Grid
  // =========================================================================
  runner.suite('Pricing Engine 48-Combination Mathematical Oracle Grid');
  const pricingModule = await viteServer.ssrLoadModule('./src/data/pricing.ts');
  const { calculateProjectScope, RETAINERS } = pricingModule;
  const testUtilsModule = await import('./tests/test-utils.mjs');
  const { ORACLE } = testUtilsModule;

  runner.assert(typeof calculateProjectScope === 'function', 'calculateProjectScope is exported function');
  runner.assert(Array.isArray(RETAINERS) && RETAINERS.length === 3, 'RETAINERS exports exactly 3 tiers');

  const types = ['landing', 'multipage', '3d-app'];
  const pages = ['1', '3-5', '6-10', '10+'];
  const efforts = ['standard', 'creative'];
  const urgencies = ['standard', 'rush'];
  const currencies = ['INR', 'USD', 'EUR'];

  let discrepancies = 0;
  for (const projectType of types) {
    for (const pageCount of pages) {
      for (const motionEffort of efforts) {
        for (const urgency of urgencies) {
          for (const currency of currencies) {
            const inputState = { projectType, pageCount, motionEffort, urgency, currency };
            const actual = calculateProjectScope(inputState);
            const expected = ORACLE.calculateProjectScope(inputState);

            if (actual.priceINR !== expected.priceINR ||
                actual.displayPrice !== expected.displayPrice ||
                actual.timelineWeeks !== expected.timelineWeeks) {
              discrepancies++;
              runner.assert(
                false,
                `Discrepancy at ${JSON.stringify(inputState)}`,
                `Expected INR ${expected.priceINR}, got ${actual.priceINR}; Expected timeline ${expected.timelineWeeks}, got ${actual.timelineWeeks}`
              );
            }
          }
        }
      }
    }
  }

  runner.assert(
    discrepancies === 0,
    `Full 48-permutation mathematical grid matches oracle across all 3 currencies (144 checks, ${discrepancies} mismatches)`
  );

  const retainerIds = RETAINERS.map(r => r.id);
  runner.assert(retainerIds.includes('sprint'), "Retainers includes 'sprint' (₹95,000)");
  runner.assert(retainerIds.includes('studio-partner'), "Retainers includes 'studio-partner' (₹1,85,000)");
  runner.assert(retainerIds.includes('enterprise-guild'), "Retainers includes 'enterprise-guild' (₹3,20,000)");

  // Testimonials and FAQs dataset validation
  const testimonialsModule = await viteServer.ssrLoadModule('./src/data/testimonials.ts');
  const faqsModule = await viteServer.ssrLoadModule('./src/data/faqs.ts');

  runner.assert(Array.isArray(testimonialsModule.TESTIMONIALS) && testimonialsModule.TESTIMONIALS.length === 4, 'TESTIMONIALS contains 4 client reviews');
  runner.assert(Array.isArray(faqsModule.FAQS) && faqsModule.FAQS.length === 8, 'FAQS contains 8 studio FAQs');

  // =========================================================================
  // SUITE 7: Editorial Page Source Code & Route Tree Structure
  // =========================================================================
  runner.suite('Editorial Page Source Code & Route Tree Structure');
  const appTsx = fs.readFileSync(path.join(PROJECT_ROOT, 'src', 'App.tsx'), 'utf8');
  runner.assert(appTsx.includes('path="/"') && appTsx.includes('element={<HomePage'), 'App.tsx defines route for / (HomePage)');
  runner.assert(appTsx.includes('path="/work/:slug"') && appTsx.includes('element={<CaseStudyPage'), 'App.tsx defines route for /work/:slug (CaseStudyPage)');
  runner.assert(appTsx.includes('path="/about"') && appTsx.includes('element={<AboutPage'), 'App.tsx defines route for /about (AboutPage)');
  runner.assert(appTsx.includes('path="/contact"') && appTsx.includes('element={<ContactPage'), 'App.tsx defines route for /contact (ContactPage)');
  runner.assert(appTsx.includes('<ScrollToTop />') || appTsx.includes('<ScrollToTop'), 'App.tsx contains <ScrollToTop /> scroll restoration');

  const aboutTsx = fs.readFileSync(path.join(PROJECT_ROOT, 'src', 'pages', 'AboutPage.tsx'), 'utf8');
  runner.assert(aboutTsx.includes('Mohamed Salauddin') || aboutTsx.includes('Salah'), 'AboutPage mentions founder Mohamed Salauddin A (Salah)');
  runner.assert(aboutTsx.includes('Thanjavur'), 'AboutPage spotlights Thanjavur studio location');
  runner.assert(aboutTsx.includes('Clock') || aboutTsx.includes('IST'), 'AboutPage contains live studio clock');

  const contactTsx = fs.readFileSync(path.join(PROJECT_ROOT, 'src', 'pages', 'ContactPage.tsx'), 'utf8');
  runner.assert(contactTsx.includes('salauddin142008@gmail.com'), 'ContactPage contains direct email salauddin142008@gmail.com');
  runner.assert(contactTsx.includes('97900') && contactTsx.includes('94500'), 'ContactPage contains WhatsApp/Phone +91 97900 94500');

  const caseStudyTsx = fs.readFileSync(path.join(PROJECT_ROOT, 'src', 'pages', 'CaseStudyPage.tsx'), 'utf8');
  runner.assert(caseStudyTsx.includes('getCaseStudy'), 'CaseStudyPage utilizes getCaseStudy helper');
  runner.assert(caseStudyTsx.includes('getNextCaseStudy'), 'CaseStudyPage utilizes getNextCaseStudy helper');
  runner.assert(caseStudyTsx.includes('Project Not Found') || caseStudyTsx.includes('not found') || caseStudyTsx.includes('404'), 'CaseStudyPage contains fallback for unknown slugs');

  await viteServer.close();

  // =========================================================================
  // SUMMARY & VERDICT
  // =========================================================================
  const duration = Date.now() - runner.startTime;
  console.log('\n' + '='.repeat(72));
  console.log('   CHALLENGER M2 EXECUTION SUMMARY');
  console.log('='.repeat(72));
  console.log(`  Total Suites:      ${runner.totalSuites}`);
  console.log(`  Total Assertions:   ${runner.totalAssertions}`);
  console.log(`  Passing Assertions: ${c.green}${runner.passed}${c.reset}`);
  console.log(`  Failing Assertions: ${runner.failed > 0 ? c.red : c.green}${runner.failed}${c.reset}`);
  console.log(`  Execution Time:     ${duration}ms`);
  console.log('='.repeat(72));

  if (runner.failed === 0) {
    console.log(`\n  ${c.green}${c.bold}VERDICT: APPROVE (All empirical adversarial challenges passed 100%)${c.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n  ${c.red}${c.bold}VERDICT: REJECT (${runner.failed} assertions failed)${c.reset}\n`);
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal challenger harness error:', err);
  process.exit(1);
});
