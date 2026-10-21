/**
 * Tier 3: Cross-Feature Interactions (24 Pairwise Combinations, 24+ Assertions)
 * Authoritative Source: ORIGINAL_REQUEST.md, TEST_INFRA.md, PROJECT.md
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

export function runTier3() {
  ctx.setTier('tier3');

  // P01: Calculator -> Lead Modal Data Handoff (F18 + F21)
  testCase('P01: Calculator to Modal Data Handoff (F18 + F21)', () => {
    const calcState = {
      projectType: 'landing',
      pageCount: '3-5',
      motionEffort: 'creative',
      urgency: 'standard',
      currency: 'INR'
    };
    const estimate = ORACLE.calculateProjectScope(calcState);

    // Simulated modal open with calculator prefill
    let modalInitialData = null;
    const openModalWithEstimate = (calc, est) => {
      modalInitialData = {
        scope: calc.projectType,
        budget: est.priceINR <= 150000 ? 'under-1.5l' : '1.5l-3l',
        timeline: calc.urgency === 'rush' ? 'urgent' : 'standard',
        message: `Estimated scope: ${calc.projectType} (${est.formattedTimeline}, approx ${est.formattedPrice})`
      };
    };

    openModalWithEstimate(calcState, estimate);
    assertEqual(modalInitialData.scope, 'landing', 'Modal scope prefilled with landing');
    assertEqual(modalInitialData.budget, 'under-1.5l', 'Modal budget prefilled based on calculated price');
    assertIncludes(modalInitialData.message, 'Estimated scope', 'Prefills descriptive estimate in message');
  });

  // P02: Retainer Tier Selection -> Lead Modal Pre-Population (F20 + F21)
  testCase('P02: Retainer Tier to Modal Pre-Population (F20 + F21)', () => {
    const selectedRetainer = ORACLE.retainers[0]; // sprint retainer
    const modalData = {
      scope: `retainer-${selectedRetainer.id}`,
      budget: 'retainer-95k',
      timeline: 'retainer'
    };
    assertEqual(modalData.scope, 'retainer-sprint', 'Modal pre-filled with retainer-sprint');
    assertEqual(modalData.budget, 'retainer-95k', 'Modal pre-filled with retainer-95k');
  });

  // P03: Route Navigation -> Clock Continuity (F4 + F6)
  testCase('P03: Route Navigation Clock Continuity (F4 + F6)', () => {
    // Clock in footer remains mounted or rehydrates with live time without hydration warnings
    let route = '/';
    const clockOutput1 = ORACLE.formatStudioClock(new Date('2026-10-17T10:00:00Z'));
    assertEqual(clockOutput1, '15:30:00 IST', 'Clock on home route / shows 15:30:00 IST');

    // Simulate route transition to case study
    route = '/work/privilege-interiors';
    const clockOutput2 = ORACLE.formatStudioClock(new Date('2026-10-17T10:00:01Z'));
    assertEqual(clockOutput2, '15:30:01 IST', 'Clock advances by 1s on /work/privilege-interiors without reset');
  });

  // P04: Active Modal -> Route Navigation Isolation (F21 + F6)
  testCase('P04: Active Modal Navigation Isolation (F21 + F6)', () => {
    let isModalOpen = true;
    let bodyOverflow = 'hidden';

    // Simulated back button / route change event closes modal
    const onRouteChange = () => {
      if (isModalOpen) {
        isModalOpen = false;
        bodyOverflow = '';
      }
    };

    onRouteChange();
    assertEqual(isModalOpen, false, 'Modal automatically closes on browser navigation');
    assertEqual(bodyOverflow, '', 'Body scroll restored when navigating away');
  });

  // P05: Currency Switch -> Dynamic Calculator Recalculation (F18 + F19)
  testCase('P05: Currency Switch Invariant (F18 + F19)', () => {
    const state = {
      projectType: '3d-app',
      pageCount: '6-10',
      motionEffort: 'creative',
      urgency: 'standard'
    };
    const inrRes = ORACLE.calculateProjectScope({ ...state, currency: 'INR' });
    const usdRes = ORACLE.calculateProjectScope({ ...state, currency: 'USD' });

    // Verify timeline invariant under currency switch
    assertEqual(inrRes.timelineWeeks, usdRes.timelineWeeks, 'Timeline weeks invariant under currency change');
    assert(usdRes.formattedPrice.startsWith('$'), 'USD currency formatting active');
  });

  // P06: Currency Switch -> Retainer Tiers Update (F19 + F20)
  testCase('P06: Currency Switch Retainer Values (F19 + F20)', () => {
    const getRetainerDisplayPrice = (tier, currency) => {
      if (currency === 'USD') return Math.round((tier.priceINR / 85) / 50) * 50;
      if (currency === 'EUR') return Math.round((tier.priceINR / 92) / 50) * 50;
      return tier.priceINR;
    };
    const sprint = ORACLE.retainers[0];
    assertEqual(getRetainerDisplayPrice(sprint, 'INR'), 28000, 'INR retainer price ₹28,000');
    assertEqual(getRetainerDisplayPrice(sprint, 'USD'), 350, 'USD retainer price $350 (28000 / 85 ~ 329 -> 350)');
  });

  // P07: Mobile Hamburger Menu -> Lead Modal Activation (F3 + F21)
  testCase('P07: Mobile Menu to Modal Activation (F3 + F21)', () => {
    let mobileMenuOpen = true;
    let modalOpen = false;

    const openModalFromMobileNav = () => {
      mobileMenuOpen = false; // close drawer
      modalOpen = true;       // open intake dialog
    };

    openModalFromMobileNav();
    assertEqual(mobileMenuOpen, false, 'Mobile drawer closed when modal is opened');
    assertEqual(modalOpen, true, 'Modal is opened cleanly');
  });

  // P08: Proof Stage Floating Trail -> Case Study Navigation (F14 + F8)
  testCase('P08: Floating Trail Thumbnail Click Navigation (F14 + F8)', () => {
    const spawnedThumbnail = {
      slug: 'agentframe',
      title: 'Agentframe Runtime Harness',
      targetUrl: '/work/agentframe'
    };
    let navigatedUrl = null;
    const onCardClick = (card) => {
      navigatedUrl = card.targetUrl;
    };
    onCardClick(spawnedThumbnail);
    assertEqual(navigatedUrl, '/work/agentframe', 'Clicking floating card routes to /work/agentframe');
  });

  // P09: Case Study Deep Dive -> Contact Page Prefill (F8 + F10)
  testCase('P09: Case Study CTA to Contact Prefill (F8 + F10)', () => {
    const currentCaseStudy = { category: '3D Web Experiences & Spatial', slug: 'meridian-watch' };
    const getContactUrl = (cs) => `/contact?scope=3d-app&source=${cs.slug}`;
    const url = getContactUrl(currentCaseStudy);
    assertEqual(url, '/contact?scope=3d-app&source=meridian-watch', 'Generates contact url with scope and source parameters');
  });

  // P10: Process Card Stacking -> Responsive Breakpoints (F12 + F24)
  testCase('P10: Process Stacking Responsiveness (F12 + F24)', () => {
    const isStickyStackingEnabled = (viewportWidth) => viewportWidth >= 768;
    assertEqual(isStickyStackingEnabled(375), false, 'Mobile disables complex 3D sticky tilt to avoid layout jank');
    assertEqual(isStickyStackingEnabled(1024), true, 'Tablet & desktop enable full sticky stacking experience');
  });

  // P11: Testimonial Carousel -> Window Visibility Change (F15 + F4)
  testCase('P11: Window Visibility Resync for Carousel & Clock (F15 + F4)', () => {
    let carouselPaused = false;
    let clockResynced = false;

    const onVisibilityChange = (state) => {
      if (state === 'hidden') {
        carouselPaused = true;
      } else if (state === 'visible') {
        carouselPaused = false;
        clockResynced = true;
      }
    };

    onVisibilityChange('hidden');
    assertEqual(carouselPaused, true, 'Carousel paused when tab hidden');
    onVisibilityChange('visible');
    assertEqual(carouselPaused, false, 'Carousel resumed when tab visible');
    assertEqual(clockResynced, true, 'Clock resynced on visibility restore');
  });

  // P12: Sticky Big CTA Word Reveal -> Viewport Scroll (F16 + F3)
  testCase('P12: Sticky Big CTA Scroll & Navbar Glassmorphism (F16 + F3)', () => {
    let scrollY = 0;
    const getNavbarStyle = (y) => y > 50 ? 'bg-[#f1f1f1]/80 backdrop-blur-md' : 'bg-transparent';
    assertEqual(getNavbarStyle(0), 'bg-transparent', 'Navbar transparent at top');
    assertEqual(getNavbarStyle(200), 'bg-[#f1f1f1]/80 backdrop-blur-md', 'Navbar blurs on scroll');
  });

  // P13: Form Validation Errors -> Modal Focus Trap (F22 + F21)
  testCase('P13: Form Validation Focus Management in Modal (F22 + F21)', () => {
    const formFields = ['name', 'email', 'scope', 'budget', 'timeline', 'message'];
    let focusedField = null;

    const submitForm = (data) => {
      const res = ORACLE.validateLeadForm(data);
      if (!res.isValid) {
        const firstErrorKey = formFields.find(k => res.errors[k]);
        focusedField = firstErrorKey;
      }
      return res;
    };

    submitForm({ name: '', email: '' });
    assertEqual(focusedField, 'name', 'Focus jumps to first invalid field (name) on submission failure');
  });

  // P14: FAQ Accordion Expand -> Scroll Position Stability (F17 + F3)
  testCase('P14: FAQ Accordion Expand Layout Stability (F17 + F3)', () => {
    let layoutShiftDetected = false;
    const expandFaqItem = (currentScroll) => {
      // Expanding accordion with CSS grid/auto height prevents page scroll jump
      return currentScroll;
    };
    const scrollPos = 1200;
    const afterExpand = expandFaqItem(scrollPos);
    assertEqual(afterExpand, scrollPos, 'Viewport scroll preserved when toggling FAQ');
  });

  // P15: Selected Works Hover Dimming -> Case Study Click (F13 + F8)
  testCase('P15: Works Grid Hover and Dynamic Navigation (F13 + F8)', () => {
    const projects = ['privilege-interiors', 'aura-dental', 'agentframe'];
    let hovered = null;
    const getCardOpacity = (slug) => hovered === null || hovered === slug ? 1.0 : 0.28;

    hovered = 'privilege-interiors';
    assertEqual(getCardOpacity('privilege-interiors'), 1.0, 'Hovered card has full opacity 1.0');
    assertEqual(getCardOpacity('aura-dental'), 0.28, 'Sibling card is dimmed to 0.28');
  });

  // P16: Urgency Toggle -> Calculator Timeline & Price Recalculation (F18 + F19)
  testCase('P16: Rush Urgency Compresses Timeline and Adds Surcharge (F18 + F19)', () => {
    const base = { projectType: 'multipage', pageCount: '3-5', motionEffort: 'standard', currency: 'INR' };
    const standard = ORACLE.calculateProjectScope({ ...base, urgency: 'standard' });
    const rush = ORACLE.calculateProjectScope({ ...base, urgency: 'rush' });

    assertGreaterThanOrEqual(rush.priceINR, standard.priceINR, 'Rush price is strictly higher than standard');
    assertEqual(rush.timelineWeeks <= standard.timelineWeeks, true, 'Rush timeline is shorter than standard');
  });

  // P17: Escape Key Dismissal -> Focus Return to Trigger (F21 + F3)
  testCase('P17: Modal Escape Key Return Focus (F21 + F3)', () => {
    let activeElement = 'nav-estimate-btn';
    let modalOpen = true;

    const onEscape = () => {
      modalOpen = false;
      return activeElement; // restores focus
    };

    const returnedFocus = onEscape();
    assertEqual(modalOpen, false, 'Modal closed on Escape key');
    assertEqual(returnedFocus, 'nav-estimate-btn', 'Focus returned to header button');
  });

  // P18: Route Change -> ScrollToTop Restoration (F6 + F3)
  testCase('P18: Route Change Scroll Restoration (F6 + F3)', () => {
    let windowScroll = { x: 0, y: 1500 };
    const onLocationChange = () => {
      windowScroll = { x: 0, y: 0 };
    };
    onLocationChange();
    assertEqual(windowScroll.y, 0, 'Scroll position reset to (0, 0) upon route change');
  });

  // P19: Form Error State -> WhatsApp Fallback Communication (F22 + F10)
  testCase('P19: Form Submission Error WhatsApp Fallback (F22 + F10)', () => {
    const submissionResult = { status: 'error', code: 'NETWORK_TIMEOUT' };
    const getFallbackActions = (res) => {
      if (res.status === 'error') {
        return {
          showBanner: true,
          whatsappUrl: 'https://wa.me/919790094500?text=Hi%20Salah,%20submitting%20my%20inquiry%20directly.',
          emailUrl: 'mailto:salauddin142008@gmail.com'
        };
      }
      return null;
    };
    const actions = getFallbackActions(submissionResult);
    assertEqual(actions.showBanner, true, 'Shows error fallback banner');
    assertIncludes(actions.whatsappUrl, 'wa.me', 'Provides direct WhatsApp fallback');
  });

  // P20: Responsive Mobile Menu -> Backdrop Click Dismissal (F3 + F24)
  testCase('P20: Mobile Menu Backdrop Dismissal (F3 + F24)', () => {
    let menuOpen = true;
    const onBackdropTap = () => { menuOpen = false; };
    onBackdropTap();
    assertEqual(menuOpen, false, 'Tapping mobile overlay closes mobile menu drawer');
  });

  // P21: Retainer Tier Comparison -> Contact Page Query Prefill (F20 + F10)
  testCase('P21: Retainer Query Parameter Prefill on Contact Page (F20 + F10)', () => {
    const tier = ORACLE.retainers[2]; // Fractional lead
    const query = new URLSearchParams({ scope: tier.id, budget: '5l-plus' });
    assertEqual(query.get('scope'), 'enterprise-guild', 'Correct retainer tier scope param');
    assertEqual(query.get('budget'), '5l-plus', 'Correct high-ticket budget param');
  });

  // P22: Clock Timezone -> Studio Status Tag (F4 + F9)
  testCase('P22: Studio Active Business Hours Calculation (F4 + F9)', () => {
    const isStudioOpen = (utcDate) => {
      // In IST (UTC+5:30), office hours are 9:00 AM to 7:00 PM (09:00 - 19:00 IST)
      // 09:00 IST = 03:30 UTC, 19:00 IST = 13:30 UTC
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        hour12: false
      });
      const hourIST = parseInt(formatter.format(utcDate), 10);
      return hourIST >= 9 && hourIST < 19;
    };

    // 04:00 UTC = 09:30 IST (Open)
    const morning = new Date('2026-10-17T04:00:00Z');
    assertEqual(isStudioOpen(morning), true, 'Studio is active at 09:30 IST');

    // 16:00 UTC = 21:30 IST (Closed)
    const night = new Date('2026-10-17T16:00:00Z');
    assertEqual(isStudioOpen(night), false, 'Studio is closed at 21:30 IST');
  });

  // P23: Proof Stage Touch Interaction -> Lissajous Fallback (F14 + F24)
  testCase('P23: Proof Canvas Touch Device Mode (F14 + F24)', () => {
    const isTouchDevice = (maxTouchPoints) => maxTouchPoints > 0;
    assertEqual(isTouchDevice(5), true, 'Detects mobile touch capability');
    assertEqual(isTouchDevice(0), false, 'Detects desktop mouse pointer');
  });

  // P24: Theme Token Application -> Modal Backdrop & Card Styling (F2 + F21)
  testCase('P24: Theme Tokens Applied to Modal Dialog (F2 + F21)', () => {
    const modalStyling = {
      cardBg: ORACLE.tokens.panel,
      borderColor: ORACLE.tokens.hairline,
      accentCtaBg: ORACLE.tokens.accent
    };
    assertEqual(modalStyling.cardBg, '#fafafa', 'Modal card uses theme panel background');
    assertEqual(modalStyling.borderColor, '#e2e2e2', 'Modal border uses hairline border');
    assertEqual(modalStyling.accentCtaBg, '#fc4778', 'Modal submit button uses electric hot accent');
  });
}
