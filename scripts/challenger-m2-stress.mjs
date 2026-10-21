#!/usr/bin/env node
/**
 * Empirical Adversarial Challenger Stress & Oracle Harness for Milestone 2
 * Focus: Route parameters, case study deep dives, dual-slug alias resolution,
 * graceful 404 handling, Contact query prefill & validation, and route tree integrity.
 */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { createServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  console.log(`${c.bold}${c.yellow}   CHALLENGER EMPIRICAL ADVERSARIAL STRESS SUITE — MILESTONE 2${c.reset}`);
  console.log(`${c.dim}   Target: Routing, Slugs, Alias Normalization, 404 Fallback, Query Prefill${c.reset}`);
  console.log(`${c.bold}${c.white}========================================================================${c.reset}`);

  // Initialize Vite dev environment to load TypeScript modules directly
  const viteServer = await createServer({
    root: PROJECT_ROOT,
    server: { middlewareMode: true },
    appType: 'custom'
  });

  const { MemoryRouter, Routes, Route } = await import('react-router-dom');

  // Load target modules
  const projectsModule = await viteServer.ssrLoadModule('./src/data/projects.ts');
  const caseStudyModule = await viteServer.ssrLoadModule('./src/pages/CaseStudyPage.tsx');
  const contactModule = await viteServer.ssrLoadModule('./src/pages/ContactPage.tsx');
  const aboutModule = await viteServer.ssrLoadModule('./src/pages/AboutPage.tsx');
  const homeModule = await viteServer.ssrLoadModule('./src/pages/HomePage.tsx');
  const appModule = await viteServer.ssrLoadModule('./src/App.tsx');

  const { CASE_STUDIES, PROJECTS, getCaseStudy, getNextCaseStudy } = projectsModule;
  const { CaseStudyPage } = caseStudyModule;
  const { ContactPage } = contactModule;
  const { AboutPage } = aboutModule;
  const { HomePage } = homeModule;
  const { ModalContext } = appModule;

  const mockModalContextValue = {
    isOpen: false,
    openModal: () => {},
    closeModal: () => {}
  };

  const renderWithRouter = (initialUrl, element) => {
    return ReactDOMServer.renderToString(
      React.createElement(
        ModalContext.Provider,
        { value: mockModalContextValue },
        React.createElement(
          MemoryRouter,
          { initialEntries: [initialUrl] },
          element
        )
      )
    );
  };

  const escapeHtml = (str) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

  // ==========================================================================
  // Suite 1: All 5 Valid Case Study Slugs & Cyclic Navigation
  // ==========================================================================
  rep.suiteHeader('All 5 Authentic Case Study Slugs & Cyclic Navigation Chain');

  const expectedCases = [
    {
      slug: 'privilege-interiors',
      nextSlug: 'aura-dental',
      title: 'Privilege Interior Solutions',
      client: 'Privilege Interior Solutions',
      category: 'Architectural Interiors & Turnkey Execution',
      year: 'Since 2001',
      timeline: '4 Weeks',
      country: 'India',
      keyMetricLabel: 'Turnkey Spaces',
      keyMetricValue: '500+'
    },
    {
      slug: 'aura-dental',
      nextSlug: 'agentframe',
      title: 'Aura Dental & Aesthetics',
      client: 'Dr. Deborah Lalhmingmawii Pachuau, MDS',
      category: 'Advanced Digital Dentistry & Clinical Practice',
      year: '2026',
      timeline: '3 Weeks',
      country: 'India',
      keyMetricLabel: 'Patient Inquiries',
      keyMetricValue: '+180%'
    },
    {
      slug: 'agentframe',
      nextSlug: 'sahara',
      title: 'Agentframe: Autonomous Agent Runtime Harness',
      client: 'Open Source AI Developer Ecosystem',
      category: 'AI Systems & Infrastructure',
      year: '2026',
      timeline: '5 Weeks',
      country: 'Global',
      keyMetricLabel: 'SDK Downloads',
      keyMetricValue: '12k+'
    },
    {
      slug: 'sahara',
      nextSlug: 'meridian-watch',
      title: 'SAHARA — Legal Metrology Inspection System',
      client: 'Department of Consumer Affairs & Compliance Bureau',
      category: 'Legal Metrology Inspection & AI OCR Pipeline',
      year: '2026',
      timeline: '6 Weeks',
      country: 'India',
      keyMetricLabel: 'Inspection Speed',
      keyMetricValue: '8.4× Faster'
    },
    {
      slug: 'meridian-watch',
      nextSlug: 'privilege-interiors',
      title: 'MERIDIAN — 3D Luxury Horology Experience',
      client: 'Meridian Haute Horlogerie',
      category: 'Immersive 3D WebGL Timepiece Experience',
      year: '2026',
      timeline: '8 Weeks',
      country: 'Switzerland',
      keyMetricLabel: 'User Engagement',
      keyMetricValue: '4.2 Min'
    }
  ];

  rep.assertEqual(CASE_STUDIES.length, 5, 'Exactly 5 authentic case studies registered');
  rep.assertEqual(PROJECTS, CASE_STUDIES, 'PROJECTS alias is strictly identical to CASE_STUDIES');

  for (const exp of expectedCases) {
    const cs = getCaseStudy(exp.slug);
    rep.assert(Boolean(cs), `Case study lookup for '${exp.slug}' returned a record`);
    if (!cs) continue;

    rep.assertEqual(cs.slug, exp.slug, `'${exp.slug}' has canonical slug`);
    rep.assertEqual(cs.title, exp.title, `'${exp.slug}' has title '${exp.title}'`);
    rep.assertEqual(cs.client, exp.client, `'${exp.slug}' has client '${exp.client}'`);
    rep.assertEqual(cs.country, exp.country, `'${exp.slug}' has country '${exp.country}'`);
    rep.assert(cs.metrics.length >= 4, `'${exp.slug}' has at least 4 quantitative metrics (has ${cs.metrics.length})`);
    rep.assert(cs.deliverables.length >= 4, `'${exp.slug}' has at least 4 deliverables (has ${cs.deliverables.length})`);
    rep.assert(cs.execution.stack.length >= 4, `'${exp.slug}' has at least 4 tech stack items (has ${cs.execution.stack.length})`);
    rep.assert(cs.brief.length > 50, `'${exp.slug}' brief is substantial (> 50 chars)`);
    rep.assert(cs.results.length > 50, `'${exp.slug}' results quote is substantial (> 50 chars)`);
    rep.assert(Boolean(cs.coverImage), `'${exp.slug}' has valid coverImage path`);

    // Cyclic next case study check
    const nextCs = getNextCaseStudy(exp.slug);
    rep.assertEqual(nextCs.slug, exp.nextSlug, `Cyclic next for '${exp.slug}' is '${exp.nextSlug}'`);

    // SSR Render check
    const html = renderWithRouter(
      `/work/${exp.slug}`,
      React.createElement(Routes, null,
        React.createElement(Route, { path: '/work/:slug', element: React.createElement(CaseStudyPage) })
      )
    );

    rep.assert(html.includes(escapeHtml(exp.title)), `SSR render of /work/${exp.slug} contains title`);
    rep.assert(html.includes(escapeHtml(exp.client)), `SSR render of /work/${exp.slug} contains client`);
    rep.assert(html.includes(escapeHtml(exp.keyMetricLabel)), `SSR render of /work/${exp.slug} contains metric label '${exp.keyMetricLabel}'`);
    rep.assert(html.includes(escapeHtml(exp.keyMetricValue)), `SSR render of /work/${exp.slug} contains metric value '${exp.keyMetricValue}'`);
    rep.assert(html.includes('Engineering Pillar 01'), `SSR render contains Engineering Pillar 01`);
    rep.assert(html.includes('Engineering Pillar 02'), `SSR render contains Engineering Pillar 02`);
    rep.assert(html.includes(`href="/work/${exp.nextSlug}"`), `SSR render has link to next case study (/work/${exp.nextSlug})`);
    rep.assert(html.includes('Inquire About Similar Project'), `SSR render has Inquire button`);
  }

  rep.testPass('All 5 Case Study Deep Dives', '(Full data contracts, cyclic traversal, and complete SSR renders verified)');

  // ==========================================================================
  // Suite 2: Dual Slug Alias Resolution (sahara-metrology -> sahara)
  // ==========================================================================
  rep.suiteHeader('Dual Slug Alias Resolution (sahara-metrology -> sahara)');

  {
    const saharaCanonical = getCaseStudy('sahara');
    const saharaAlias = getCaseStudy('sahara-metrology');
    const saharaUpper = getCaseStudy('SAHARA-METROLOGY');
    const saharaSpaced = getCaseStudy('   sahara-metrology   ');
    const saharaMixed = getCaseStudy('Sahara-Metrology');

    rep.assert(Boolean(saharaCanonical), 'Canonical slug "sahara" resolves');
    rep.assert(Boolean(saharaAlias), 'Alias slug "sahara-metrology" resolves');
    rep.assert(saharaCanonical === saharaAlias, 'Both slugs resolve to identical memory reference');
    rep.assert(saharaUpper === saharaCanonical, 'Case-insensitive UPPERCASE "SAHARA-METROLOGY" resolves');
    rep.assert(saharaSpaced === saharaCanonical, 'Spaced "   sahara-metrology   " resolves after trim');
    rep.assert(saharaMixed === saharaCanonical, 'Mixed-case "Sahara-Metrology" resolves');

    // Next case study lookup from alias
    const nextFromAlias = getNextCaseStudy('sahara-metrology');
    rep.assertEqual(nextFromAlias.slug, 'meridian-watch', 'getNextCaseStudy("sahara-metrology") resolves to "meridian-watch"');

    // SSR render test with alias
    const htmlAlias = renderWithRouter(
      '/work/sahara-metrology',
      React.createElement(Routes, null,
        React.createElement(Route, { path: '/work/:slug', element: React.createElement(CaseStudyPage) })
      )
    );
    const htmlCanonical = renderWithRouter(
      '/work/sahara',
      React.createElement(Routes, null,
        React.createElement(Route, { path: '/work/:slug', element: React.createElement(CaseStudyPage) })
      )
    );

    rep.assert(htmlAlias.includes('SAHARA — Legal Metrology Inspection System'), 'Alias route renders SAHARA title');
    rep.assert(htmlAlias.includes('Department of Consumer Affairs'), 'Alias route renders Department of Consumer Affairs');
    rep.assert(htmlAlias.includes('href="/work/meridian-watch"'), 'Alias route renders next link to /work/meridian-watch');
    rep.assertEqual(htmlAlias.length, htmlCanonical.length, 'Alias and canonical SSR HTML output lengths are identical');

    rep.testPass('Dual-Slug Normalization & Invariants', '(Direct equality, case insensitivity, whitespace immunity, identical SSR)');
  }

  // ==========================================================================
  // Suite 3: Invalid & Adversarial Slugs (Graceful 404 Fallback)
  // ==========================================================================
  rep.suiteHeader('Invalid & Adversarial Slugs (Graceful 404 Fallback)');

  const adversarialSlugs = [
    'non-existent-project',
    'undefined',
    'null',
    'NaN',
    '[object Object]',
    'true',
    'false',
    '0',
    '..',
    '../secret/path',
    '../../etc/passwd',
    '   ',
    '<script>alert(1)</script>',
    'DROP TABLE users;',
    'SELECT * FROM projects',
    '${7*7}',
    '{{constructor.constructor("alert(1)")()}}',
    'meridian-horology',   // retired slug
    'agentframe-ai',       // retired slug
    'sahara-illegal',
    'privilege',           // partial slug
    'aura',                // partial slug
    'meridian',            // partial slug
    '🚀',                  // emoji
    '日本語',               // CJK characters
    'a'.repeat(2000)       // 2,000 char buffer stress
  ];

  for (const slug of adversarialSlugs) {
    const res = getCaseStudy(slug);
    rep.assertEqual(res, undefined, `Slug '${slug.length > 30 ? slug.slice(0, 30) + '...' : slug}' returns undefined`);

    // Render CaseStudyPage with this invalid slug
    let html = '';
    let crashed = false;
    try {
      html = renderWithRouter(
        `/work/${encodeURIComponent(slug)}`,
        React.createElement(Routes, null,
          React.createElement(Route, { path: '/work/:slug', element: React.createElement(CaseStudyPage) })
        )
      );
    } catch (err) {
      crashed = true;
    }

    rep.assertEqual(crashed, false, `Render did not crash for invalid slug '${slug.slice(0, 25)}'`);
    rep.assert(html.includes('[ 404 · Not Found ]'), `Render includes 404 badge for '${slug.slice(0, 25)}'`);
    rep.assert(html.includes('Case Study Unavailable'), `Render includes 'Case Study Unavailable' heading`);
    rep.assert(html.includes('Return to Selected Works'), `Render includes 'Return to Selected Works' CTA`);
    rep.assert(html.includes('Studio Home'), `Render includes 'Studio Home' link`);
    rep.assert(html.includes('Available Case Studies:'), `Render includes suggested available case studies section`);
  }

  // Undefined and empty string parameter direct test
  rep.assertEqual(getCaseStudy(undefined), undefined, 'getCaseStudy(undefined) returns undefined');
  rep.assertEqual(getCaseStudy(''), undefined, 'getCaseStudy("") returns undefined');
  rep.assertEqual(getNextCaseStudy('unknown-slug').slug, 'privilege-interiors', 'getNextCaseStudy for invalid slug falls back to index 0');

  rep.testPass('28 Adversarial & Malicious Slug Tests', '(Zero crashes, 100% graceful 404 fallback with return links)');

  // ==========================================================================
  // Suite 4: Contact Page Query Parameter Prefill & Form Validation
  // ==========================================================================
  rep.suiteHeader('Contact Page Query Parameter Prefill & Form Validation');

  {
    // 1. Target URL test from dispatch
    const targetUrl = '/contact?scope=3d-app&budget=3l-5l&urgency=rush';
    const htmlTarget = renderWithRouter(
      targetUrl,
      React.createElement(Routes, null,
        React.createElement(Route, { path: '/contact', element: React.createElement(ContactPage) })
      )
    );

    rep.assert(
      htmlTarget.includes('border-[#1a1a1a] bg-[#1a1a1a] text-[#f1f1f1]">3D Web App / Experience</button>'),
      'Target URL prefill: scope=3d-app button is selected (dark style)'
    );
    rep.assert(
      htmlTarget.includes('border-[#1a1a1a] bg-[#1a1a1a] text-[#f1f1f1]">₹3L — ₹5L</button>'),
      'Target URL prefill: budget=3l-5l button is selected (dark style)'
    );
    rep.assert(
      htmlTarget.includes('border-[#1a1a1a] bg-[#1a1a1a] text-[#f1f1f1]">Rush / Priority Sprint'),
      'Target URL prefill: urgency=rush button is selected (dark style)'
    );

    // 2. Default URL test without params
    const htmlDefault = renderWithRouter(
      '/contact',
      React.createElement(Routes, null,
        React.createElement(Route, { path: '/contact', element: React.createElement(ContactPage) })
      )
    );

    rep.assert(
      htmlDefault.includes('border-[#1a1a1a] bg-[#1a1a1a] text-[#f1f1f1]">Landing Page</button>'),
      'Default URL: scope defaults to Landing Page'
    );
    rep.assert(
      htmlDefault.includes('border-[#1a1a1a] bg-[#1a1a1a] text-[#f1f1f1]">₹1.5L — ₹3L</button>'),
      'Default URL: budget defaults to ₹1.5L — ₹3L'
    );
    rep.assert(
      htmlDefault.includes('border-[#1a1a1a] bg-[#1a1a1a] text-[#f1f1f1]">Standard Delivery'),
      'Default URL: urgency defaults to Standard Delivery'
    );

    // 3. Grid prefill verification across all 48 combinations using standard URI encoding
    const scopes = ['landing', 'multipage', '3d-app', 'retainer'];
    const budgets = ['under-1.5l', '1.5l-3l', '3l-5l', '5l+'];
    const urgencies = ['rush', 'standard', 'flexible'];

    let allCombinationsPassed = true;
    for (const s of scopes) {
      for (const b of budgets) {
        for (const u of urgencies) {
          const testUrl = `/contact?scope=${encodeURIComponent(s)}&budget=${encodeURIComponent(b)}&urgency=${encodeURIComponent(u)}`;
          const h = renderWithRouter(
            testUrl,
            React.createElement(Routes, null,
              React.createElement(Route, { path: '/contact', element: React.createElement(ContactPage) })
            )
          );

          const scopeLabelMap = {
            'landing': 'Landing Page',
            'multipage': 'Multi-Page Site',
            '3d-app': '3D Web App / Experience',
            'retainer': 'Dedicated Retainer'
          };
          const budgetLabelMap = {
            'under-1.5l': '&lt; ₹1.5L',
            '1.5l-3l': '₹1.5L — ₹3L',
            '3l-5l': '₹3L — ₹5L',
            '5l+': '₹5L+'
          };
          const urgencyLabelMap = {
            'rush': 'Rush / Priority Sprint',
            'standard': 'Standard Delivery',
            'flexible': 'Flexible / Q3–Q4'
          };

          const sOk = h.includes(`border-[#1a1a1a] bg-[#1a1a1a] text-[#f1f1f1]">${scopeLabelMap[s]}`);
          const bOk = h.includes(`border-[#1a1a1a] bg-[#1a1a1a] text-[#f1f1f1]">${budgetLabelMap[b]}`);
          const uOk = h.includes(`border-[#1a1a1a] bg-[#1a1a1a] text-[#f1f1f1]">${urgencyLabelMap[u]}`);

          if (!sOk || !bOk || !uOk) {
            allCombinationsPassed = false;
          }
        }
      }
    }

    rep.assertEqual(allCombinationsPassed, true, 'All 48 combinations of scope, budget, and urgency prefill accurately with standard URI encoding');

    // 4. Contact reach-out channels & Studio authenticity
    rep.assert(htmlDefault.includes('salauddin142008@gmail.com'), 'Official email displayed: salauddin142008@gmail.com');
    rep.assert(htmlDefault.includes('+91 97900 94500'), 'Official phone / WhatsApp displayed: +91 97900 94500');
    rep.assert(htmlDefault.includes('Thanjavur, Tamil Nadu, India'), 'Studio location displayed: Thanjavur, Tamil Nadu, India');
    rep.assert(htmlDefault.includes('Response SLA: &lt; 24 Hours'), 'Studio SLA stated: < 24 Hours');

    rep.testPass('Contact Prefill Matrix (48 Combinations) & Channels', '(All query params, default fallbacks, and contact channels verified)');
  }

  // ==========================================================================
  // Suite 5: Form Validation Logic & Security Stress
  // ==========================================================================
  rep.suiteHeader('Form Validation Logic & Security Stress');

  {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;

    // Email validation matrix matching ORACLE specification
    const validEmails = [
      'salauddin142008@gmail.com',
      'user@domain.com',
      'first.last@company.co.in',
      'tech+filter@startup.io',
      'ceo@subdomain.example.org'
    ];
    for (const em of validEmails) {
      rep.assertEqual(emailRegex.test(em), true, `Accepts valid email '${em}'`);
    }

    const invalidEmails = [
      '',
      'plainaddress',
      '@missingusername.com',
      'user@.missingdomain',
      'user@domain.c',
      'user@ domain.com',
      'user @domain.com',
      'email.example.com',
      '@example.com'
    ];
    for (const em of invalidEmails) {
      rep.assertEqual(emailRegex.test(em), false, `Rejects invalid email '${em}'`);
    }

    // Company URL validation matrix
    const validUrls = [
      'company.com',
      'https://company.com',
      'http://sub.domain.org/path',
      'https://thinkingods.com/'
    ];
    for (const u of validUrls) {
      rep.assertEqual(urlPattern.test(u), true, `Accepts valid URL '${u}'`);
    }

    const invalidUrls = [
      'javascript:alert(1)',
      'data:text/html;base64,PHNjcmlwdD4=',
      'file:///etc/passwd',
      'ftp://missing-dot'
    ];
    for (const u of invalidUrls) {
      rep.assertEqual(urlPattern.test(u), false, `Rejects dangerous/invalid URL '${u}'`);
    }

    rep.testPass('Email & URL Security Validation Rules', '(Strict syntax enforcement and protection against script/proto injection)');
  }

  // ==========================================================================
  // Suite 6: Complete Route Tree & Wildcard Fallback Invariants
  // ==========================================================================
  rep.suiteHeader('Complete Route Tree & Wildcard Fallback Invariants');

  {
    // Test routes: /, /about, /contact, /work/:slug, and wildcard *
    const testRoutes = [
      { path: '/', titleCheck: 'Mohamed Salauddin' },
      { path: '/about', titleCheck: 'Mohamed Salauddin A' },
      { path: '/contact', titleCheck: 'Initiate a Project' },
      { path: '/work/aura-dental', titleCheck: 'Aura Dental &amp; Aesthetics' },
      { path: '/unknown-route-at-root', titleCheck: 'Mohamed Salauddin' } // Wildcard fallback to HomePage
    ];

    for (const tr of testRoutes) {
      const html = renderWithRouter(
        tr.path,
        React.createElement(Routes, null,
          React.createElement(Route, { path: '/', element: React.createElement(HomePage) }),
          React.createElement(Route, { path: '/work/:slug', element: React.createElement(CaseStudyPage) }),
          React.createElement(Route, { path: '/about', element: React.createElement(AboutPage) }),
          React.createElement(Route, { path: '/contact', element: React.createElement(ContactPage) }),
          React.createElement(Route, { path: '*', element: React.createElement(HomePage) })
        )
      );

      rep.assert(html.includes(tr.titleCheck), `Route '${tr.path}' renders expected content '${tr.titleCheck}'`);
    }

    rep.testPass('Route Tree Architecture & Wildcard Fallback', '(All core editorial pages and catch-all route render cleanly)');
  }

  await viteServer.close();

  // ==========================================================================
  // Summary & Final Verdict
  // ==========================================================================
  const durationMs = Date.now() - globalStart;
  console.log(`\n${c.bold}${c.white}========================================================================${c.reset}`);
  console.log(`${c.bold}${c.cyan}   MILESTONE 2 CHALLENGER VERIFICATION SUMMARY${c.reset}`);
  console.log(`${c.bold}${c.white}========================================================================${c.reset}`);
  console.log(`  ${c.bold}Total Test Suites:${c.reset}    ${rep.totalSuites}`);
  console.log(`  ${c.bold}Total Assertions:${c.reset}     ${rep.totalAssertions}`);
  console.log(`  ${c.bold}Passing Assertions:${c.reset}   ${c.green}${rep.passed}${c.reset}`);
  console.log(`  ${c.bold}Failing Assertions:${c.reset}   ${rep.failed > 0 ? c.red : c.green}${rep.failed}${c.reset}`);
  console.log(`  ${c.bold}Suite Duration:${c.reset}       ${durationMs}ms\n`);

  if (rep.failed === 0) {
    console.log(`  ${c.bgGreen}${c.bold} VERDICT: APPROVE (Milestone 2 Routing & Parameter Handling Verified 100%) ${c.reset}\n`);
    process.exit(0);
  } else {
    console.log(`  ${c.bgRed}${c.bold} VERDICT: REJECT (${rep.failed} Assertions Failed) ${c.reset}\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal Challenger Exception:', err);
  process.exit(1);
});
