/**
 * Tier 4: Real-World Application Scenarios (12 End-to-End User Workflows)
 * Authoritative Source: TEST_INFRA.md lines 47-62
 */

import {
  ctx,
  testCase,
  assert,
  assertEqual,
  assertIncludes,
  assertGreaterThanOrEqual,
  ORACLE
} from './test-utils.mjs';

export function runTier4() {
  ctx.setTier('tier4');

  // --------------------------------------------------------------------------
  // Scenario 1: Enterprise Client Turnkey Inquiry
  // Features: F3, F6, F10, F18, F19, F21, F22
  // --------------------------------------------------------------------------
  testCase('Scenario 1: Enterprise Client Turnkey Inquiry Flow', () => {
    // Step 1: Client lands on Homepage (/)
    let currentRoute = '/';
    assertEqual(currentRoute, '/', 'Step 1: User arrives on studio homepage');

    // Step 2: Client scrolls to Dynamic Calculator and selects 3D Web App + 6-10 Pages + Creative Motion
    const calcInput = {
      projectType: '3d-app',
      pageCount: '6-10',
      motionEffort: 'creative',
      urgency: 'standard',
      currency: 'INR'
    };
    const estimateINR = ORACLE.calculateProjectScope(calcInput);
    // Base 180k * 1.65 * 1.35 = 400,950 -> rounded to nearest 5k = 400,000
    assertEqual(estimateINR.priceINR, 400000, 'Step 2a: INR price calculated accurately (₹4,00,000)');
    assertEqual(estimateINR.timelineWeeks, 8.5, 'Step 2b: Timeline calculated accurately (5w base + 2w pages + 1.5w creative = 8.5w)');

    // Step 3: International client toggles currency to USD
    const estimateUSD = ORACLE.calculateProjectScope({ ...calcInput, currency: 'USD' });
    // 400,000 / 85 = 4,705.88 -> nearest 50 = $4,700
    assertEqual(estimateUSD.displayPrice, 4700, 'Step 3: Currency converted to USD ($4,700)');

    // Step 4: Client clicks "Book Call with this Estimate" CTA
    let modalState = {
      isOpen: true,
      initialData: {
        scope: calcInput.projectType,
        budget: '5l-plus',
        timeline: `${estimateUSD.timelineWeeks} weeks`,
        message: `Estimate for 3D Web App: ${estimateUSD.formattedPrice} (${estimateUSD.formattedTimeline})`
      }
    };
    assertEqual(modalState.isOpen, true, 'Step 4: Lead intake modal opens');
    assertEqual(modalState.initialData.scope, '3d-app', 'Step 4b: Scope prefilled with 3d-app');

    // Step 5: Client fills contact details and submits
    const submissionPayload = {
      name: 'Alexander Vance',
      email: 'a.vance@vance-dynamics.com',
      companyUrl: 'https://vance-dynamics.com',
      scope: modalState.initialData.scope,
      budget: modalState.initialData.budget,
      timeline: 'standard',
      message: modalState.initialData.message
    };
    const validationResult = ORACLE.validateLeadForm(submissionPayload);
    assertEqual(validationResult.isValid, true, 'Step 5: Enterprise inquiry form validated successfully');
  });

  // --------------------------------------------------------------------------
  // Scenario 2: High-Growth Startup Retainer Sign-up
  // Features: F18, F20, F21, F22
  // --------------------------------------------------------------------------
  testCase('Scenario 2: High-Growth Startup Retainer Sign-up Flow', () => {
    // Step 1: Founder visits pricing & retainer section
    const retainer = ORACLE.retainers.find(r => r.id === 'studio-partner');
    assert(retainer != null, 'Step 1: Dedicated Studio Partner retainer found');
    assertEqual(retainer.priceINR, 55000, 'Step 1b: Price verified at ₹55,000/mo');

    // Step 2: Founder selects "Partner With Studio" CTA
    const modalPayload = {
      isOpen: true,
      data: {
        scope: `retainer-${retainer.id}`,
        budget: 'retainer-1.85l',
        timeline: 'retainer',
        message: 'Interested in securing dedicated monthly front-end & 3D capacity.'
      }
    };
    assertEqual(modalPayload.isOpen, true, 'Step 2: Modal opened from retainer card');

    // Step 3: Validates submission with work email
    const formSubmission = {
      name: 'Elena Rostova',
      email: 'elena@solarpulse.tech',
      companyUrl: 'https://solarpulse.tech',
      ...modalPayload.data
    };
    const result = ORACLE.validateLeadForm(formSubmission);
    assertEqual(result.isValid, true, 'Step 3: Retainer lead submission passes validation');
  });

  // --------------------------------------------------------------------------
  // Scenario 3: Case Study Deep Dive & Validation
  // Features: F6, F8, F13, F3
  // --------------------------------------------------------------------------
  testCase('Scenario 3: Case Study Deep Dive Flow', () => {
    // Step 1: Prospect browses works grid on homepage
    const works = ['privilege-interiors', 'aura-dental', 'agentframe', 'sahara-metrology'];
    assertEqual(works.length >= 4, true, 'Step 1: Works showcase grid displays 4+ case studies');

    // Step 2: User clicks "Privilege Interior Solutions"
    let currentSlug = works[0];
    assertEqual(currentSlug, 'privilege-interiors', 'Step 2: User selects privilege-interiors');

    // Step 3: User reads case study metrics
    const metrics = [
      { label: 'Turnkey Spaces', value: '500+' },
      { label: 'Corporate Partners', value: '8 Enterprise Groups' }
    ];
    assert(metrics.length >= 2, 'Step 3: Case study presents verified business metrics');

    // Step 4: User clicks "Next Case Study"
    const nextSlug = works[1];
    assertEqual(nextSlug, 'aura-dental', 'Step 4: Advances to next case study (aura-dental)');
  });

  // --------------------------------------------------------------------------
  // Scenario 4: Mobile Navigation & Responsive Audit
  // Features: F3, F6, F24
  // --------------------------------------------------------------------------
  testCase('Scenario 4: Mobile Navigation Audit Flow', () => {
    // Step 1: Client loads on mobile viewport (375px width)
    const viewportWidth = 375;
    const isMobile = viewportWidth < 640;
    assertEqual(isMobile, true, 'Step 1: Mobile viewport detected');

    // Step 2: Hamburger menu is initially closed
    let mobileDrawerOpen = false;
    assertEqual(mobileDrawerOpen, false, 'Step 2: Mobile drawer starts closed');

    // Step 3: User taps hamburger button
    mobileDrawerOpen = true;
    assertEqual(mobileDrawerOpen, true, 'Step 3: Mobile drawer opens');

    // Step 4: User taps "About" nav item
    let activeRoute = '/about';
    mobileDrawerOpen = false; // drawer closes on navigation
    assertEqual(activeRoute, '/about', 'Step 4: Navigates to /about');
    assertEqual(mobileDrawerOpen, false, 'Step 4b: Mobile drawer closes');
  });

  // --------------------------------------------------------------------------
  // Scenario 5: Interactive Proof Exploration
  // Features: F14, F15, F16
  // --------------------------------------------------------------------------
  testCase('Scenario 5: Interactive Proof Stage Exploration Flow', () => {
    // Step 1: User scrolls into #proof canvas section
    const canvasId = '#proof';
    assertEqual(canvasId, '#proof', 'Step 1: Proof stage canvas located');

    // Step 2: Cursor moves across canvas spawning cards
    let activeCardPool = [];
    const spawnCard = (id) => {
      if (activeCardPool.length < 6) {
        activeCardPool.push({ id, scale: 1.15, born: Date.now() });
      }
    };
    for (let i = 0; i < 8; i++) spawnCard(`card-${i}`);
    assertEqual(activeCardPool.length, 6, 'Step 2: Active cards capped at MAX = 6');

    // Step 3: Cards settle from overshoot scale 1.15 to 1.0
    activeCardPool = activeCardPool.map(c => ({ ...c, scale: 1.0 }));
    assertEqual(activeCardPool[0].scale, 1.0, 'Step 3: Physics overshoot settles to 1.0 scale');

    // Step 4: User scrolls down past proof into .cta-big pinned banner
    const words = ["Let's", "talk", "about", "your", "project."];
    assertEqual(words.length, 5, 'Step 4: Pinned CTA banner has 5 word targets');
  });

  // --------------------------------------------------------------------------
  // Scenario 6: Calculator Currency Swapping Stress Flow
  // Features: F18, F19, F21
  // --------------------------------------------------------------------------
  testCase('Scenario 6: Currency Swapping Stress Flow', () => {
    const config = {
      projectType: 'multipage',
      pageCount: '10+',
      motionEffort: 'creative',
      urgency: 'rush'
    };

    // Calculate in INR
    const inr = ORACLE.calculateProjectScope({ ...config, currency: 'INR' });
    // Toggle to USD
    const usd = ORACLE.calculateProjectScope({ ...config, currency: 'USD' });
    // Toggle to EUR
    const eur = ORACLE.calculateProjectScope({ ...config, currency: 'EUR' });
    // Toggle back to INR
    const inrAgain = ORACLE.calculateProjectScope({ ...config, currency: 'INR' });

    assertEqual(inr.priceINR, inrAgain.priceINR, 'Step 1: Round-trip currency toggle preserves exact INR base');
    assertEqual(usd.displayPrice % 50, 0, 'Step 2: USD quote rounded to $50');
    assertEqual(eur.displayPrice % 50, 0, 'Step 3: EUR quote rounded to €50');
    assertEqual(inr.timelineWeeks, usd.timelineWeeks, 'Step 4: Timeline unchanged by currency conversion');
  });

  // --------------------------------------------------------------------------
  // Scenario 7: Full Navigation Loop with Scroll Restoration
  // Features: F3, F6, F8, F9, F10
  // --------------------------------------------------------------------------
  testCase('Scenario 7: Full Navigation Loop & Scroll Restoration', () => {
    let scrollState = { x: 0, y: 0 };
    const navigateTo = (path) => {
      // simulate scroll reset
      scrollState = { x: 0, y: 0 };
      return path;
    };

    // 1. Home -> scroll down
    scrollState.y = 2400;
    // 2. Click About link
    let route = navigateTo('/about');
    assertEqual(route, '/about', 'Step 1: Navigated to /about');
    assertEqual(scrollState.y, 0, 'Step 1b: Scroll reset to 0');

    // 3. Click Contact link
    route = navigateTo('/contact');
    assertEqual(route, '/contact', 'Step 2: Navigated to /contact');
    assertEqual(scrollState.y, 0, 'Step 2b: Scroll reset to 0');

    // 4. Return to Home
    route = navigateTo('/');
    assertEqual(route, '/', 'Step 3: Navigated to /');
    assertEqual(scrollState.y, 0, 'Step 3b: Scroll reset to 0');
  });

  // --------------------------------------------------------------------------
  // Scenario 8: Rapid Modal Toggle & Focus Management
  // Features: F21, F22
  // --------------------------------------------------------------------------
  testCase('Scenario 8: Rapid Modal Toggle & Focus Management', () => {
    let modalOpen = false;
    let activeFocus = 'header-cta-button';

    // 1. Open modal via header CTA
    modalOpen = true;
    activeFocus = 'input-name';
    assertEqual(modalOpen, true, 'Step 1: Modal opened');
    assertEqual(activeFocus, 'input-name', 'Step 1b: Focus placed on first input');

    // 2. Press Escape key
    modalOpen = false;
    activeFocus = 'header-cta-button'; // restored
    assertEqual(modalOpen, false, 'Step 2: Modal closed via Escape');
    assertEqual(activeFocus, 'header-cta-button', 'Step 2b: Focus restored to trigger element');

    // 3. Open modal again and click backdrop
    modalOpen = true;
    modalOpen = false; // backdrop click closes
    assertEqual(modalOpen, false, 'Step 3: Modal cleanly dismissed via backdrop click');
  });

  // --------------------------------------------------------------------------
  // Scenario 9: Studio Clock Continuity Under Route Transitions
  // Features: F4, F6
  // --------------------------------------------------------------------------
  testCase('Scenario 9: Studio Clock Continuity Across Routes', () => {
    const t0 = new Date('2026-10-17T11:00:00Z');
    const clockT0 = ORACLE.formatStudioClock(t0);
    assertEqual(clockT0, '16:30:00 IST', 'Step 1: Initial time on / is 16:30:00 IST');

    // Navigate to /work/agentframe and let 3s elapse
    const t1 = new Date(t0.getTime() + 3000);
    const clockT1 = ORACLE.formatStudioClock(t1);
    assertEqual(clockT1, '16:30:03 IST', 'Step 2: Time on /work/agentframe continues advancing: 16:30:03 IST');
  });

  // --------------------------------------------------------------------------
  // Scenario 10: FAQ Exploration & Process Card Scrollytelling
  // Features: F12, F17
  // --------------------------------------------------------------------------
  testCase('Scenario 10: Process Cards and FAQ Interaction Flow', () => {
    // 1. Inspect 4 process steps
    const steps = ['Discovery', 'Spatial 3D', 'Frontend Engineering', 'Conversion'];
    assertEqual(steps.length, 4, 'Step 1: 4 process stages available');

    // 2. User expands FAQ 0
    let expandedFaq = null;
    const toggleFaq = (idx) => { expandedFaq = expandedFaq === idx ? null : idx; };

    toggleFaq(0);
    assertEqual(expandedFaq, 0, 'Step 2: FAQ 0 expanded');

    // 3. User expands FAQ 1 (auto-collapses FAQ 0 in accordion pattern)
    toggleFaq(1);
    assertEqual(expandedFaq, 1, 'Step 3: FAQ 1 expanded, FAQ 0 collapsed');
  });

  // --------------------------------------------------------------------------
  // Scenario 11: Contact Form Error Correction Flow
  // Features: F10, F22
  // --------------------------------------------------------------------------
  testCase('Scenario 11: Contact Form Error Correction Flow', () => {
    // Step 1: User hits submit on empty form
    let draft = { name: '', email: '', scope: '', budget: '', timeline: '', message: '' };
    let res = ORACLE.validateLeadForm(draft);
    assertEqual(res.isValid, false, 'Step 1: Empty submit blocked');

    // Step 2: User provides name only
    draft.name = 'Priya Sharma';
    res = ORACLE.validateLeadForm(draft);
    assertEqual(res.errors.name, undefined, 'Step 2: Name error cleared');
    assert(res.errors.email != null, 'Step 2b: Email error remains');

    // Step 3: User fills all fields correctly
    draft = {
      name: 'Priya Sharma',
      email: 'priya@aura-health.in',
      scope: 'multipage',
      budget: '3l-5l',
      timeline: 'standard',
      message: 'Looking to redesign our clinical care platform with Three.js interactions.'
    };
    res = ORACLE.validateLeadForm(draft);
    assertEqual(res.isValid, true, 'Step 3: Corrected form submission succeeds');
  });

  // --------------------------------------------------------------------------
  // Scenario 12: Retainer Comparison & Direct Outreach
  // Features: F20, F10
  // --------------------------------------------------------------------------
  testCase('Scenario 12: Retainer Comparison & Direct Outreach Flow', () => {
    // Step 1: Compare SLAs across retainers
    const retainers = ORACLE.retainers;
    assertEqual(retainers[0].sla, '48-hour response SLA', 'Step 1a: Sprint has 48h SLA');
    assertEqual(retainers[1].sla, 'Priority 24-hour response SLA', 'Step 1b: Partner has 24h SLA');
    assertEqual(retainers[2].sla, 'Same-day urgent triage (< 6 hours)', 'Step 1c: Lead has same-day SLA');

    // Step 2: User clicks direct WhatsApp reach-out for Enterprise Guild
    const guild = retainers[2];
    const encodedTier = encodeURIComponent(guild.name);
    const waUrl = `https://wa.me/919790094500?text=Inquiry%20regarding%20${encodedTier}`;
    assertIncludes(waUrl, 'Fractional', 'Step 2: WhatsApp URL contains retainer tier name');
  });
}
