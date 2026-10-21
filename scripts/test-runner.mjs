#!/usr/bin/env node
/**
 * Automated Opaque-Box E2E Test Runner for SALAH / Independent Digital Studio
 * Project: freelance-studio
 * Specification: TEST_INFRA.md, PROJECT.md, ORIGINAL_REQUEST.md
 *
 * Usage:
 *   node scripts/test-runner.mjs
 *   node scripts/test-runner.mjs --tier=1
 *   node scripts/test-runner.mjs --json
 */

import { ctx, PROJECT_ROOT } from './tests/test-utils.mjs';
import { runTier1 } from './tests/tier1-features.mjs';
import { runTier2 } from './tests/tier2-boundaries.mjs';
import { runTier3 } from './tests/tier3-interactions.mjs';
import { runTier4 } from './tests/tier4-scenarios.mjs';

// ANSI Color Helpers
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m\x1b[30m',
  bgRed: '\x1b[41m\x1b[37m'
};

const args = process.argv.slice(2);
const isJsonOutput = args.includes('--json');
const selectedTier = args.find(a => a.startsWith('--tier='))?.split('=')[1];

async function main() {
  const globalStart = Date.now();

  if (!isJsonOutput) {
    console.log(`\n${c.bold}${c.cyan}========================================================================${c.reset}`);
    console.log(`${c.bold}${c.white}   SALAH / Independent Digital Studio — Automated E2E Test Suite${c.reset}`);
    console.log(`${c.dim}   Target Workspace: ${PROJECT_ROOT}${c.reset}`);
    console.log(`${c.bold}${c.cyan}========================================================================${c.reset}\n`);
  }

  // Execute selected or all tiers
  if (!selectedTier || selectedTier === '1') runTier1();
  if (!selectedTier || selectedTier === '2') runTier2();
  if (!selectedTier || selectedTier === '3') runTier3();
  if (!selectedTier || selectedTier === '4') runTier4();

  const durationMs = Date.now() - globalStart;
  const summary = ctx.getSummary();

  if (isJsonOutput) {
    console.log(JSON.stringify({ durationMs, summary }, null, 2));
    process.exit(summary.totalFailed > 0 ? 1 : 0);
  }

  // Render Tier Breakdown
  const tierKeys = Object.keys(summary.tiers);
  for (const key of tierKeys) {
    const tier = summary.tiers[key];
    if (tier.tests.length === 0) continue;

    console.log(`\n${c.bold}${c.yellow}▶ ${tier.name}${c.reset}`);
    console.log(`${c.dim}------------------------------------------------------------------------${c.reset}`);

    for (const t of tier.tests) {
      const statusIcon = t.failed === 0 ? `${c.green}✓${c.reset}` : `${c.red}✗${c.reset}`;
      const statusText = t.failed === 0 ? `${c.green}PASS${c.reset}` : `${c.red}FAIL (${t.failed}/${t.assertions})${c.reset}`;
      console.log(`  ${statusIcon} [${statusText}] ${t.name} ${c.dim}(${t.assertions} assertions, ${t.durationMs}ms)${c.reset}`);

      if (t.errors.length > 0) {
        for (const err of t.errors) {
          console.log(`      ${c.red}↳ Assertion Failure: ${err.message}${c.reset}`);
        }
      }
    }
  }

  // Render Final Statistics Box
  console.log(`\n${c.bold}${c.cyan}========================================================================${c.reset}`);
  console.log(`${c.bold}${c.white}   E2E Test Execution Summary${c.reset}`);
  console.log(`${c.bold}${c.cyan}========================================================================${c.reset}`);

  console.log(`  ${c.bold}Total Test Suites:${c.reset}    ${summary.totalTests}`);
  console.log(`  ${c.bold}Total Assertions:${c.reset}     ${summary.totalAssertions}`);
  console.log(`  ${c.bold}Passing Assertions:${c.reset}   ${c.green}${summary.totalPassed}${c.reset}`);
  console.log(`  ${c.bold}Failing Assertions:${c.reset}   ${summary.totalFailed > 0 ? c.red : c.green}${summary.totalFailed}${c.reset}`);
  console.log(`  ${c.bold}Suite Duration:${c.reset}       ${durationMs}ms\n`);

  console.log(`  ${c.bold}Tier 1 (Feature Coverage):${c.reset}       ${summary.tiers.tier1.passed} / ${summary.tiers.tier1.assertions} passed`);
  console.log(`  ${c.bold}Tier 2 (Boundary & Corner):${c.reset}      ${summary.tiers.tier2.passed} / ${summary.tiers.tier2.assertions} passed`);
  console.log(`  ${c.bold}Tier 3 (Cross-Interactions):${c.reset}     ${summary.tiers.tier3.passed} / ${summary.tiers.tier3.assertions} passed`);
  console.log(`  ${c.bold}Tier 4 (Real-World Scenarios):${c.reset}   ${summary.tiers.tier4.passed} / ${summary.tiers.tier4.assertions} passed`);
  console.log(`${c.bold}${c.cyan}========================================================================${c.reset}`);

  if (summary.totalFailed === 0) {
    console.log(`\n  ${c.bgGreen}${c.bold} ALL ASSERTIONS PASSED (100% SUCCESS) ${c.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n  ${c.bgRed}${c.bold} ${summary.totalFailed} ASSERTIONS FAILED ${c.reset}\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal Test Runner Exception:', err);
  process.exit(1);
});
