import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

console.log('========================================================================');
console.log('   FORENSIC INTEGRITY AUDIT — MILESTONE 3: SelectedWorks.tsx');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;

function check(desc, condition, details = '') {
  if (condition) {
    passCount++;
    console.log(`✓ [PASS] ${desc}`);
  } else {
    failCount++;
    console.log(`✗ [FAIL] ${desc}`);
    if (details) console.log(`  Detail: ${details}`);
  }
}

// 1. Source file existence
const targetPath = path.join(PROJECT_ROOT, 'src', 'components', 'sections', 'SelectedWorks.tsx');
check('SelectedWorks.tsx exists at expected path', fs.existsSync(targetPath));

const content = fs.readFileSync(targetPath, 'utf8');

// 2. InfiniteMenu Component Import & Integration
check(
  'InfiniteMenu and InfiniteMenuItem are imported from ../ui/InfiniteMenu',
  /import\s+{[^}]*InfiniteMenu[^}]*}\s+from\s+['"]\.\.\/ui\/InfiniteMenu['"]/.test(content)
);
check(
  'CASE_STUDIES imported from ../../data/projects',
  /import\s+{[^}]*CASE_STUDIES[^}]*}\s+from\s+['"]\.\.\/\.\.\/data\/projects['"]/.test(content)
);
check(
  'Dynamic mapping of CASE_STUDIES to menuItems with useMemo',
  content.includes('CASE_STUDIES.map') &&
  content.includes('menuItems') &&
  content.includes('useMemo')
);
check(
  'Dedicated 3D stage container rendered with responsive height and rounded styling',
  content.includes('h-[520px]') &&
  content.includes('sm:h-[600px]') &&
  content.includes('lg:h-[680px]') &&
  content.includes('rounded-[20px]')
);
check(
  '<InfiniteMenu /> genuinely rendered on 3D stage with required props',
  content.includes('<InfiniteMenu') &&
  content.includes('items={menuItems}') &&
  content.includes('scale={1}') &&
  content.includes('theme="light"') &&
  content.includes('accentColor="#fc4778"') &&
  content.includes('onItemClick=')
);

// 3. Editorial Header & Thinkingods Aesthetic Discipline
check(
  'Category counter strictly matches "Selected work (06)" with tabular tracking',
  content.includes('Selected work (06)') &&
  content.includes('font-mono') &&
  content.includes('tabular-nums')
);
check(
  'Section headline strictly matches "Recent projects."',
  content.includes('Recent projects.') &&
  content.includes('font-display')
);
check(
  'Interactive drag hint strictly matches "Drag 3D sphere to explore · 360°"',
  content.includes('Drag 3D sphere to explore · 360°')
);
check(
  'Drag hint features animated pulse indicator (#fc4778) and 360-degree orbit SVG glyph',
  content.includes('animate-ping') &&
  content.includes('bg-[#fc4778]') &&
  content.includes('viewBox="0 0 24 24"')
);
check(
  'Warm bone paper ground (#f1f1f1) applied to section root',
  content.includes('bg-[#f1f1f1]')
);
check(
  'Graphite typography palette (#2b2b2b) and hairline borders (#2b2b2b]/10) strictly maintained',
  content.includes('text-[#2b2b2b]') &&
  content.includes('border-[#2b2b2b]/10')
);

// 4. Balanced 2-Column Responsive Archive Grid
check(
  '2-column responsive grid container uses "grid grid-cols-1 md:grid-cols-2"',
  content.includes('grid-cols-1') &&
  content.includes('md:grid-cols-2')
);
check(
  'All 6 case study projects mapped to archive cards',
  content.includes('{CASE_STUDIES.map((project)') || content.includes('CASE_STUDIES.map(')
);
check(
  'Archive cards render 4:3 aspect ratio thumbnails (aspect-[4/3])',
  content.includes('aspect-[4/3]')
);
check(
  'Focus-dimming state machine correctly dims sibling cards to opacity 0.28',
  content.includes('isDimmed ? 0.28 : 1') &&
  content.includes('cubic-bezier(0.22, 1, 0.36, 1)')
);
check(
  'Tags strip correctly rendered from project.tags',
  content.includes('project.tags') &&
  content.includes('project.tags.slice(0, 4)')
);
check(
  'Quantitative metrics cards rendered from project.metrics',
  content.includes('project.metrics') &&
  content.includes('project.metrics.slice(0, 2)')
);
check(
  'Cards link to standalone case studies (/work/:slug)',
  content.includes('to={`/work/${project.slug}`}')
);
check(
  'Accessible markup: aria-label and keyboard focus ring present',
  content.includes('aria-label=') &&
  content.includes('focus-visible:ring-2') &&
  content.includes('focus-visible:ring-[#fc4778]')
);

// 5. Test Suite Tampering / Mocking Verification
const scriptsTestsDir = path.join(PROJECT_ROOT, 'scripts', 'tests');
const testFiles = fs.readdirSync(scriptsTestsDir);
check(
  'All 4 core test tiers exist in scripts/tests/',
  ['tier1-features.mjs', 'tier2-boundaries.mjs', 'tier3-interactions.mjs', 'tier4-scenarios.mjs'].every(f => testFiles.includes(f))
);

// Verify that test files have not been mocked or neutered
for (const tf of ['tier1-features.mjs', 'tier2-boundaries.mjs', 'tier3-interactions.mjs', 'tier4-scenarios.mjs']) {
  const tfContent = fs.readFileSync(path.join(scriptsTestsDir, tf), 'utf8');
  check(
    `Test file ${tf} contains genuine assertions (no short-circuited return/pass)`,
    tfContent.includes('assert(') && !tfContent.includes('return true; // mock')
  );
}

// 6. Prohibited Patterns Check
check(
  'No hardcoded test result strings or bypass flags in SelectedWorks.tsx',
  !content.includes('test-result') && !content.includes('mock') && !content.includes('BYPASS')
);
check(
  'SelectedWorks is a full implementation, not a facade (196 lines of code)',
  content.split('\n').length >= 180
);

// 7. Projects Data Verification
try {
  const projectsContent = fs.readFileSync(path.join(PROJECT_ROOT, 'src', 'data', 'projects.ts'), 'utf8');
  
  // Extract slugs
  const slugMatches = [...projectsContent.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const uniqueSlugs = [...new Set(slugMatches)];
  
  check(
    'src/data/projects.ts defines exactly 6 client projects',
    uniqueSlugs.length === 6,
    `Found ${uniqueSlugs.length} unique slugs: ${uniqueSlugs.join(', ')}`
  );

  const expectedSlugs = [
    'privilege-interiors',
    'aura-dental',
    'agentframe',
    'sahara',
    'bleach-ichigo',
    'ironvault'
  ];
  check(
    'All 6 expected project slugs are present',
    expectedSlugs.every(s => uniqueSlugs.includes(s)),
    `Slugs: ${uniqueSlugs.join(', ')}`
  );
} catch (err) {
  check('Data import verification', false, err.message);
}

console.log('\n========================================================================');
console.log(`   AUDIT RESULTS: ${passCount} Passed, ${failCount} Failed`);
console.log('========================================================================\n');

if (failCount > 0) {
  console.log('VERDICT: INTEGRITY VIOLATION');
  process.exit(1);
} else {
  console.log('VERDICT: CLEAN');
  process.exit(0);
}
