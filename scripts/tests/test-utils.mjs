/**
 * Test Utilities and Assertion Engine for SALAH / Independent Digital Studio E2E Test Suite
 * Authoritative source: TEST_INFRA.md, PROJECT.md, ORIGINAL_REQUEST.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

// ============================================================================
// 1. Test Registry & State
// ============================================================================

export class TestRunnerContext {
  constructor() {
    this.results = {
      tier1: { name: 'Tier 1: Feature Coverage (24 Features)', tests: [], assertions: 0, passed: 0, failed: 0 },
      tier2: { name: 'Tier 2: Boundary & Corner Cases (24 Features)', tests: [], assertions: 0, passed: 0, failed: 0 },
      tier3: { name: 'Tier 3: Cross-Feature Interactions (24 Combinations)', tests: [], assertions: 0, passed: 0, failed: 0 },
      tier4: { name: 'Tier 4: Real-World Application Scenarios (12 Workflows)', tests: [], assertions: 0, passed: 0, failed: 0 },
    };
    this.currentTier = null;
    this.currentTest = null;
    this.startTime = 0;
  }

  setTier(tierKey) {
    if (!this.results[tierKey]) {
      throw new Error(`Unknown tier key: ${tierKey}`);
    }
    this.currentTier = this.results[tierKey];
  }

  startTest(name) {
    this.currentTest = {
      name,
      assertions: 0,
      passed: 0,
      failed: 0,
      errors: [],
      startTime: Date.now(),
      durationMs: 0
    };
    if (this.currentTier) {
      this.currentTier.tests.push(this.currentTest);
    }
  }

  endTest() {
    if (this.currentTest) {
      this.currentTest.durationMs = Date.now() - this.currentTest.startTime;
    }
    this.currentTest = null;
  }

  recordAssertion(passed, message, expected, actual) {
    if (this.currentTier) {
      this.currentTier.assertions++;
      if (passed) {
        this.currentTier.passed++;
      } else {
        this.currentTier.failed++;
      }
    }
    if (this.currentTest) {
      this.currentTest.assertions++;
      if (passed) {
        this.currentTest.passed++;
      } else {
        this.currentTest.failed++;
        this.currentTest.errors.push({
          message,
          expected,
          actual,
          stack: new Error().stack
        });
      }
    }
  }

  getSummary() {
    let totalAssertions = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalTests = 0;

    for (const key of Object.keys(this.results)) {
      const tier = this.results[key];
      totalAssertions += tier.assertions;
      totalPassed += tier.passed;
      totalFailed += tier.failed;
      totalTests += tier.tests.length;
    }

    return {
      totalTests,
      totalAssertions,
      totalPassed,
      totalFailed,
      tiers: this.results
    };
  }
}

export const ctx = new TestRunnerContext();

// ============================================================================
// 2. Assertion Functions
// ============================================================================

export function assert(condition, message = 'Assertion failed') {
  const passed = Boolean(condition);
  ctx.recordAssertion(passed, message, true, passed);
  if (!passed) {
    // We log but don't stop the runner so we capture full suite metrics
  }
  return passed;
}

export function assertEqual(actual, expected, message = 'Values are not strictly equal') {
  const passed = actual === expected;
  ctx.recordAssertion(passed, `${message} (Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)})`, expected, actual);
  return passed;
}

export function assertDeepEqual(actual, expected, message = 'Objects are not deeply equal') {
  const passed = JSON.stringify(actual) === JSON.stringify(expected);
  ctx.recordAssertion(passed, `${message} (Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)})`, expected, actual);
  return passed;
}

export function assertMatches(str, regex, message = 'String does not match regex') {
  const passed = typeof str === 'string' && regex.test(str);
  ctx.recordAssertion(passed, `${message} (Target: "${str}", Regex: ${regex})`, regex.toString(), str);
  return passed;
}

export function assertIncludes(haystack, needle, message = 'Target does not include expected item') {
  const passed = haystack != null && (
    Array.isArray(haystack) ? haystack.includes(needle) : String(haystack).includes(needle)
  );
  ctx.recordAssertion(passed, `${message} (Expected to find: ${JSON.stringify(needle)})`, needle, haystack);
  return passed;
}

export function assertGreaterThanOrEqual(actual, expected, message = 'Value is not >= expected') {
  const passed = typeof actual === 'number' && actual >= expected;
  ctx.recordAssertion(passed, `${message} (Expected: >= ${expected}, Actual: ${actual})`, `>= ${expected}`, actual);
  return passed;
}

export function assertLessThanOrEqual(actual, expected, message = 'Value is not <= expected') {
  const passed = typeof actual === 'number' && actual <= expected;
  ctx.recordAssertion(passed, `${message} (Expected: <= ${expected}, Actual: ${actual})`, `<= ${expected}`, actual);
  return passed;
}

export function testCase(name, fn) {
  ctx.startTest(name);
  try {
    fn();
  } catch (err) {
    assert(false, `Unhandled exception in test "${name}": ${err.message}`);
  } finally {
    ctx.endTest();
  }
}

// ============================================================================
// 3. File System & Code Inspection Helpers
// ============================================================================

export function getAbsPath(relPath) {
  return path.resolve(PROJECT_ROOT, relPath);
}

export function fileExists(relPath) {
  try {
    return fs.existsSync(getAbsPath(relPath));
  } catch {
    return false;
  }
}

export function readFile(relPath) {
  try {
    return fs.readFileSync(getAbsPath(relPath), 'utf8');
  } catch {
    return null;
  }
}

export function readJson(relPath) {
  try {
    const content = readFile(relPath);
    return content ? JSON.parse(content) : null;
  } catch {
    return null;
  }
}

export function findInFile(relPath, regex) {
  const content = readFile(relPath);
  if (!content) return false;
  return regex.test(content);
}

// ============================================================================
// 4. Authoritative Oracle Specifications (from ORIGINAL_REQUEST & spec_miner)
// ============================================================================

export const ORACLE = {
  // Theme Tokens
  tokens: {
    bg: '#f1f1f1',
    ink: '#1a1a1a',
    hairline: '#e2e2e2',
    hairlineRgba: 'rgba(43,43,43,0.14)',
    accent: '#fc4778',
    panel: '#fafafa',
    fonts: {
      display: 'Plus Jakarta Sans',
      sans: 'Inter',
      mono: 'IBM Plex Mono'
    }
  },

  // Calculator Configuration & Math
  calculator: {
    projectTypes: {
      landing: { id: 'landing', label: 'Landing Page', basePriceINR: 45000, baseTimelineWeeks: 1.5 },
      multipage: { id: 'multipage', label: 'Multi-Page Site', basePriceINR: 90000, baseTimelineWeeks: 3.0 },
      '3d-app': { id: '3d-app', label: '3D Web App', basePriceINR: 180000, baseTimelineWeeks: 5.0 }
    },
    pageCounts: {
      '1': { id: '1', priceMultiplier: 1.0, timelineDeltaWeeks: 0 },
      '3-5': { id: '3-5', priceMultiplier: 1.30, timelineDeltaWeeks: 1.0 },
      '6-10': { id: '6-10', priceMultiplier: 1.65, timelineDeltaWeeks: 2.0 },
      '10+': { id: '10+', priceMultiplier: 2.10, timelineDeltaWeeks: 3.5 }
    },
    motionEfforts: {
      standard: { id: 'standard', priceMultiplier: 1.0, timelineDeltaWeeks: 0 },
      creative: { id: 'creative', priceMultiplier: 1.35, timelineDeltaWeeks: 1.5 }
    },
    urgencies: {
      standard: { id: 'standard', priceMultiplier: 1.0, timelineMultiplier: 1.0 },
      rush: { id: 'rush', priceMultiplier: 1.25, timelineMultiplier: 0.70 }
    },
    rates: {
      INR: 1,
      USD: 1 / 85.0,
      EUR: 1 / 92.0
    }
  },

  // Retainers
  retainers: [
    { id: 'sprint', name: 'Bi-Weekly Sprint Retainer', priceINR: 28000, hours: '~15 hours / month', sla: '48-hour response SLA' },
    { id: 'studio-partner', name: 'Dedicated Studio Capacity', priceINR: 55000, hours: '~35 hours / month', sla: 'Priority 24-hour response SLA' },
    { id: 'enterprise-guild', name: 'Fractional Creative Tech Lead', priceINR: 95000, hours: '~65+ hours / month', sla: 'Same-day urgent triage (< 6 hours)' }
  ],

  // Form Validation Engine
  validateLeadForm(data) {
    const errors = {};
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Please provide your name (at least 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!data.email || !emailRegex.test(data.email.trim())) {
      errors.email = 'Please provide a valid work email address.';
    }
    if (data.companyUrl && data.companyUrl.trim().length > 0) {
      const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
      if (!urlPattern.test(data.companyUrl.trim())) {
        errors.companyUrl = 'Please provide a valid URL (e.g. company.com or https://company.com).';
      }
    }
    if (!data.scope) errors.scope = 'Please select your project scope.';
    if (!data.budget) errors.budget = 'Please select a budget bracket in INR.';
    if (!data.timeline) errors.timeline = 'Please indicate your expected timeline.';
    if (!data.message || data.message.trim().length < 10) {
      errors.message = 'Please provide a brief description of your project (min 10 characters).';
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Authoritative Calculator Math
  calculateProjectScope(state) {
    const pType = ORACLE.calculator.projectTypes[state.projectType] || ORACLE.calculator.projectTypes.multipage;
    const pCount = ORACLE.calculator.pageCounts[state.pageCount] || ORACLE.calculator.pageCounts['3-5'];
    const mEffort = ORACLE.calculator.motionEfforts[state.motionEffort] || ORACLE.calculator.motionEfforts.standard;
    const urg = ORACLE.calculator.urgencies[state.urgency] || ORACLE.calculator.urgencies.standard;

    const rawPriceINR = pType.basePriceINR * pCount.priceMultiplier * mEffort.priceMultiplier * urg.priceMultiplier;
    const priceINR = Math.round(rawPriceINR / 5000) * 5000;

    const basePlusDeltas = pType.baseTimelineWeeks + pCount.timelineDeltaWeeks + mEffort.timelineDeltaWeeks;
    const rawTimelineWeeks = basePlusDeltas * urg.timelineMultiplier;
    const timelineWeeks = Math.max(1.0, Math.round(rawTimelineWeeks * 2) / 2);

    let displayPrice = priceINR;
    let formattedPrice = '';

    if (state.currency === 'USD') {
      displayPrice = Math.round((priceINR / 85.0) / 50) * 50;
      formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(displayPrice);
    } else if (state.currency === 'EUR') {
      displayPrice = Math.round((priceINR / 92.0) / 50) * 50;
      formattedPrice = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(displayPrice);
    } else {
      displayPrice = priceINR;
      formattedPrice = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(displayPrice);
    }

    return {
      priceINR,
      displayPrice,
      formattedPrice,
      timelineWeeks,
      formattedTimeline: `${timelineWeeks} weeks`
    };
  },

  // Clock Formatting
  formatStudioClock(date = new Date()) {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    return `${formatter.format(date)} IST`;
  }
};
