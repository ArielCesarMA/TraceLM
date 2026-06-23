"use strict";
const pptx = require('pptxgenjs');
const path = require('path');
const fs   = require('fs');

const OUT = path.join(
  'C:\\Users\\Ariel Cesar Abaoag\\Documents\\PROJECT7\\TraceLM\\DOCUMENTATION\\RELEASE',
  'TraceLM_Release_v0.0.5_Executive_Summary.pptx'
);

// ── Palette ───────────────────────────────────────────────────────────────────
const NAVY   = '1B2A4A';
const TEAL   = '028090';
const ICE    = 'E4EEF8';
const WHITE  = 'FFFFFF';
const AMBER  = 'E67E22';
const GREEN  = '27AE60';
const GRAY   = 'F4F6F8';
const MID    = 'BDC3C7';
const DARK   = '2C3E50';
const LTEAL  = 'E0F4F6';
const LGREEN = 'E8F8EE';
const LAMBER = 'FEF3E2';

const prs = new pptx();
prs.layout = 'LAYOUT_WIDE'; // 13.33" x 7.5"

// ── Helpers ───────────────────────────────────────────────────────────────────
const W = 13.33;
const H = 7.5;

function addSlide(titleText, subtitleText) {
  const slide = prs.addSlide();

  // Navy top bar
  slide.addShape(prs.ShapeType.rect, {
    x: 0, y: 0, w: W, h: 0.6,
    fill: { color: NAVY },
    line: { color: NAVY },
  });

  // Accent stripe
  slide.addShape(prs.ShapeType.rect, {
    x: 0, y: 0.6, w: W, h: 0.06,
    fill: { color: TEAL },
    line: { color: TEAL },
  });

  // Title
  slide.addText(titleText, {
    x: 0.35, y: 0.08, w: W - 1.4, h: 0.44,
    fontSize: 20, bold: true, color: WHITE,
    fontFace: 'Arial', valign: 'middle',
  });

  // Version chip
  slide.addShape(prs.ShapeType.roundRect, {
    x: W - 1.1, y: 0.1, w: 0.75, h: 0.4,
    fill: { color: TEAL },
    line: { color: TEAL },
    rectRadius: 0.06,
  });
  slide.addText('v0.0.5', {
    x: W - 1.1, y: 0.1, w: 0.75, h: 0.4,
    fontSize: 10, bold: true, color: WHITE, fontFace: 'Arial',
    align: 'center', valign: 'middle',
  });

  // Subtitle bar
  if (subtitleText) {
    slide.addShape(prs.ShapeType.rect, {
      x: 0, y: 0.66, w: W, h: 0.42,
      fill: { color: ICE },
      line: { color: ICE },
    });
    slide.addText(subtitleText, {
      x: 0.35, y: 0.66, w: W - 0.7, h: 0.42,
      fontSize: 12, color: NAVY, fontFace: 'Arial',
      bold: false, valign: 'middle',
    });
  }

  // Footer
  slide.addShape(prs.ShapeType.rect, {
    x: 0, y: H - 0.3, w: W, h: 0.3,
    fill: { color: GRAY },
    line: { color: MID },
  });
  slide.addText('TraceLM v0.0.5  |  CONFIDENTIAL  |  June 2026', {
    x: 0, y: H - 0.3, w: W, h: 0.3,
    fontSize: 9, color: '888888', fontFace: 'Arial',
    align: 'center', valign: 'middle',
  });

  return slide;
}

function statCard(slide, x, y, w, h, value, label, color) {
  slide.addShape(prs.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: WHITE },
    line: { color: color, pt: 2 },
    shadow: { type: 'outer', blur: 6, offset: 2, angle: 45, color: 'AAAAAA', opacity: 0.3 },
    rectRadius: 0.1,
  });
  // Accent top strip
  slide.addShape(prs.ShapeType.rect, {
    x, y, w, h: 0.06,
    fill: { color: color },
    line: { color: color },
  });
  slide.addText(value, {
    x, y: y + 0.1, w, h: h * 0.5,
    fontSize: 28, bold: true, color, fontFace: 'Arial',
    align: 'center', valign: 'middle',
  });
  slide.addText(label, {
    x, y: y + h * 0.55, w, h: h * 0.38,
    fontSize: 10, color: DARK, fontFace: 'Arial',
    align: 'center', valign: 'top',
  });
}

function chip(slide, x, y, text, bg, tc) {
  const tw = text.length * 0.085 + 0.25;
  slide.addShape(prs.ShapeType.roundRect, {
    x, y, w: tw, h: 0.28,
    fill: { color: bg },
    line: { color: tc },
    rectRadius: 0.14,
  });
  slide.addText(text, {
    x, y, w: tw, h: 0.28,
    fontSize: 9, bold: true, color: tc, fontFace: 'Arial',
    align: 'center', valign: 'middle',
  });
  return tw + 0.08;
}

function bulletList(slide, x, y, w, items, color = DARK, size = 11) {
  items.forEach((item, i) => {
    slide.addShape(prs.ShapeType.ellipse, {
      x: x, y: y + i * 0.28 + 0.07, w: 0.08, h: 0.08,
      fill: { color: TEAL }, line: { color: TEAL },
    });
    slide.addText(item, {
      x: x + 0.14, y: y + i * 0.28, w: w - 0.14, h: 0.28,
      fontSize: size, color, fontFace: 'Arial', valign: 'middle',
    });
  });
}

function sectionHeader(slide, x, y, w, text, bg = NAVY) {
  slide.addShape(prs.ShapeType.rect, {
    x, y, w, h: 0.3,
    fill: { color: bg }, line: { color: bg },
  });
  slide.addText(text, {
    x, y, w, h: 0.3,
    fontSize: 11, bold: true, color: WHITE, fontFace: 'Arial',
    align: 'center', valign: 'middle',
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Cover
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = prs.addSlide();

  // Background gradient (two rects)
  slide.addShape(prs.ShapeType.rect, {
    x: 0, y: 0, w: W, h: H,
    fill: { color: NAVY }, line: { color: NAVY },
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0, y: 0, w: W * 0.42, h: H,
    fill: { color: '152238' }, line: { color: '152238' },
  });

  // Teal accent bar
  slide.addShape(prs.ShapeType.rect, {
    x: 0, y: H - 0.8, w: W * 0.42, h: 0.06,
    fill: { color: TEAL }, line: { color: TEAL },
  });

  // TraceLM wordmark
  slide.addText('TraceLM', {
    x: 0.5, y: 1.6, w: 4.5, h: 1.1,
    fontSize: 60, bold: true, color: WHITE, fontFace: 'Arial',
  });

  // Subtitle
  slide.addText('Technical Release Update', {
    x: 0.5, y: 2.7, w: 4.5, h: 0.55,
    fontSize: 22, color: TEAL, fontFace: 'Arial',
  });

  // Version badge
  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.5, y: 3.4, w: 1.4, h: 0.5,
    fill: { color: TEAL }, line: { color: TEAL }, rectRadius: 0.1,
  });
  slide.addText('v0.0.5', {
    x: 0.5, y: 3.4, w: 1.4, h: 0.5,
    fontSize: 18, bold: true, color: WHITE, fontFace: 'Arial',
    align: 'center', valign: 'middle',
  });

  slide.addText('June 2026', {
    x: 0.5, y: 4.1, w: 4.5, h: 0.4,
    fontSize: 16, color: ICE, fontFace: 'Arial',
  });

  // Right panel — audience + topic chips
  slide.addText('Prepared For', {
    x: 5.2, y: 1.7, w: 7.6, h: 0.35,
    fontSize: 11, color: ICE, fontFace: 'Arial', bold: true,
  });

  const audience = ['Director', 'Operations Manager', 'Head of Delivery'];
  audience.forEach((a, i) => {
    slide.addShape(prs.ShapeType.roundRect, {
      x: 5.2, y: 2.15 + i * 0.5, w: 3.4, h: 0.38,
      fill: { color: TEAL, transparency: 70 }, line: { color: TEAL },
      rectRadius: 0.08,
    });
    slide.addText(a, {
      x: 5.2, y: 2.15 + i * 0.5, w: 3.4, h: 0.38,
      fontSize: 13, color: WHITE, fontFace: 'Arial', bold: true,
      align: 'center', valign: 'middle',
    });
  });

  slide.addText('What\'s Covered', {
    x: 5.2, y: 3.55, w: 7.6, h: 0.35,
    fontSize: 11, color: ICE, fontFace: 'Arial', bold: true,
  });

  const topics = ['UI Architecture Overhaul', 'Functional Improvements', 'Quality & Prevention Gates', 'Security Hardening'];
  topics.forEach((t, i) => {
    slide.addText('✦  ' + t, {
      x: 5.2, y: 4.0 + i * 0.36, w: 7.6, h: 0.36,
      fontSize: 13, color: ICE, fontFace: 'Arial', valign: 'middle',
    });
  });

  // Footer
  slide.addShape(prs.ShapeType.rect, {
    x: 0, y: H - 0.32, w: W, h: 0.32,
    fill: { color: '0D1B2E' }, line: { color: '0D1B2E' },
  });
  slide.addText('CONFIDENTIAL  |  TraceLM Engineering  |  June 2026', {
    x: 0, y: H - 0.32, w: W, h: 0.32,
    fontSize: 9, color: '888888', fontFace: 'Arial', align: 'center', valign: 'middle',
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — Release at a Glance (Stats Dashboard)
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide('Release at a Glance', 'Key metrics and outcomes delivered in TraceLM v0.0.5');

  const TOP = 1.2;
  statCard(slide, 0.3,  TOP, 2.3, 1.5, '6',      'New Tab Modules\n(from 1 monolith)',       TEAL);
  statCard(slide, 2.8,  TOP, 2.3, 1.5, '73',     'Automated Tests\n(13 test suites)',         GREEN);
  statCard(slide, 5.3,  TOP, 2.3, 1.5, '4',      'Functional Gaps\nResolved',                 AMBER);
  statCard(slide, 7.8,  TOP, 2.3, 1.5, '3',      'Prevention\nStrategies Added',              NAVY);
  statCard(slide, 10.3, TOP, 2.7, 1.5, '178 KB', 'JS Bundle Size\n(-22 KB from prior build)', TEAL);

  const MID_Y = 3.0;

  // Workstream status table
  sectionHeader(slide, 0.3, MID_Y, 7.5, 'Workstream Status');

  const rows = [
    ['Phase 1 — UI Architecture',    'App.tsx → 6 tabs, 4 components, 1 hook',          GREEN,  '✓ Complete'],
    ['Phase 2 — UI Improvements',    'StepStepper, collapsible cards, priority cards',   GREEN,  '✓ Complete'],
    ['Phase 3 — Productivity Polish','Layer filter, copy buttons, tab badges',           GREEN,  '✓ Complete'],
    ['Functional Gap Fixes',         'Scenarios, staged files, export filter, add/delete',GREEN, '✓ Complete'],
    ['Prevention Strategy',          'ESLint + TypeCheck in build + 73 smoke tests',     GREEN,  '✓ Complete'],
    ['Security Hardening',           'Crypto nonce + batch config clamping',             GREEN,  '✓ Complete'],
  ];

  rows.forEach(([label, detail, color, status], i) => {
    const rowY = MID_Y + 0.3 + i * 0.46;
    const bg = i % 2 === 0 ? WHITE : GRAY;
    slide.addShape(prs.ShapeType.rect, { x: 0.3, y: rowY, w: 7.5, h: 0.46, fill: { color: bg }, line: { color: MID } });
    slide.addShape(prs.ShapeType.rect, { x: 7.8, y: rowY, w: 7.5 - 7.8 + 0.3, h: 0.46, fill: { color: bg }, line: { color: MID } });

    slide.addText(label, { x: 0.4, y: rowY, w: 2.8, h: 0.46, fontSize: 10, bold: true, color: DARK, fontFace: 'Arial', valign: 'middle' });
    slide.addText(detail, { x: 3.2, y: rowY, w: 4.4, h: 0.46, fontSize: 10, color: DARK, fontFace: 'Arial', valign: 'middle' });

    // Status chip
    slide.addShape(prs.ShapeType.roundRect, { x: 7.9, y: rowY + 0.1, w: 1.4, h: 0.26, fill: { color: color }, line: { color: color }, rectRadius: 0.06 });
    slide.addText(status, { x: 7.9, y: rowY + 0.1, w: 1.4, h: 0.26, fontSize: 9, bold: true, color: WHITE, fontFace: 'Arial', align: 'center', valign: 'middle' });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — UI Architecture Overhaul
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide('UI Architecture Overhaul', 'Phase 1–3: From monolithic 1,115-line component to a clean, modular architecture');

  const TOP = 1.3;
  const COL_W = (W - 0.6) / 3;

  // Phase cards
  const phases = [
    {
      title: 'Phase 1 — Decomposition',
      color: TEAL,
      bg: LTEAL,
      items: [
        'App.tsx: 1,115 → 290 lines',
        '6 tab components (memo)',
        '4 shared components (memo)',
        '1 message hook (extracted)',
        'Shared types.ts + utils.ts',
        '22 stable callbacks via ref pattern',
      ],
    },
    {
      title: 'Phase 2 — UI Improvements',
      color: NAVY,
      bg: ICE,
      items: [
        'StepStepper: 4-step pipeline indicator',
        'All-green completion flash (2s)',
        'Collapsible enhancement cards',
        'Card count badges',
        'Automation priority cards (ROI)',
        'Excluded candidates (dashed style)',
      ],
    },
    {
      title: 'Phase 3 — Productivity',
      color: AMBER,
      bg: LAMBER,
      items: [
        'Layer filter chips (Unit/API/UI)',
        'Filter guard: min 1 layer active',
        'Export always respects filter',
        'Clipboard copy on Gherkin blocks',
        'Copy on enhancement card items',
        'Tab count badges (auto-hide at 0)',
      ],
    },
  ];

  phases.forEach((p, i) => {
    const x = 0.3 + i * COL_W;
    slide.addShape(prs.ShapeType.roundRect, {
      x, y: TOP, w: COL_W - 0.15, h: H - TOP - 0.6,
      fill: { color: p.bg }, line: { color: p.color, pt: 2 }, rectRadius: 0.1,
    });
    slide.addShape(prs.ShapeType.rect, {
      x, y: TOP, w: COL_W - 0.15, h: 0.38,
      fill: { color: p.color }, line: { color: p.color },
    });
    slide.addText(p.title, {
      x, y: TOP, w: COL_W - 0.15, h: 0.38,
      fontSize: 11, bold: true, color: WHITE, fontFace: 'Arial',
      align: 'center', valign: 'middle',
    });
    p.items.forEach((item, j) => {
      slide.addShape(prs.ShapeType.ellipse, {
        x: x + 0.18, y: TOP + 0.5 + j * 0.42 + 0.1, w: 0.1, h: 0.1,
        fill: { color: p.color }, line: { color: p.color },
      });
      slide.addText(item, {
        x: x + 0.32, y: TOP + 0.5 + j * 0.42, w: COL_W - 0.55, h: 0.42,
        fontSize: 11, color: DARK, fontFace: 'Arial', valign: 'middle',
      });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — Functional Improvements
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide('Functional Improvements', 'Four gaps identified and resolved — every feature now works as intended');

  const TOP = 1.15;
  const gaps = [
    {
      num: '01',
      title: 'Export Respects Layer Filter',
      what: 'Export .feature and CSV now export only the visible test cases — not everything.',
      why:  'Users filtered to "Unit" only but their export contained all 47 test cases.',
      color: TEAL,
    },
    {
      num: '02',
      title: 'Staged File Visibility',
      what: 'Files selected for upload are now shown as chips before parsing begins.',
      why:  '"Parse Selected Files" button was enabled with nothing visible — confusing UX.',
      color: NAVY,
    },
    {
      num: '03',
      title: 'Scenarios: Add & Delete',
      what: 'Users can add a blank scenario or delete an existing one directly in the UI.',
      why:  'Test scenarios required regeneration to add a new entry — no manual option.',
      color: AMBER,
    },
    {
      num: '04',
      title: 'Scenarios: JSON & CSV Export',
      what: 'Export all test scenarios as structured JSON or tabular CSV with one click.',
      why:  'Scenarios had no export path — data was stuck inside the extension.',
      color: GREEN,
    },
  ];

  const cardW = (W - 0.6) / 2 - 0.1;
  const cardH = (H - TOP - 0.5) / 2 - 0.1;

  gaps.forEach((g, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.3 + col * (cardW + 0.2);
    const y = TOP + row * (cardH + 0.15);

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: cardW, h: cardH,
      fill: { color: WHITE }, line: { color: g.color, pt: 2 }, rectRadius: 0.1,
      shadow: { type: 'outer', blur: 5, offset: 2, angle: 45, color: 'AAAAAA', opacity: 0.25 },
    });
    // Number circle
    slide.addShape(prs.ShapeType.ellipse, {
      x: x + 0.15, y: y + 0.12, w: 0.55, h: 0.55,
      fill: { color: g.color }, line: { color: g.color },
    });
    slide.addText(g.num, {
      x: x + 0.15, y: y + 0.12, w: 0.55, h: 0.55,
      fontSize: 14, bold: true, color: WHITE, fontFace: 'Arial',
      align: 'center', valign: 'middle',
    });
    slide.addText(g.title, {
      x: x + 0.8, y: y + 0.15, w: cardW - 0.95, h: 0.5,
      fontSize: 12, bold: true, color: g.color, fontFace: 'Arial', valign: 'middle',
    });
    slide.addText('What changed:', {
      x: x + 0.2, y: y + 0.7, w: cardW - 0.35, h: 0.24,
      fontSize: 9, bold: true, color: TEAL, fontFace: 'Arial',
    });
    slide.addText(g.what, {
      x: x + 0.2, y: y + 0.9, w: cardW - 0.35, h: 0.5,
      fontSize: 10, color: DARK, fontFace: 'Arial',
    });
    slide.addText('Why it matters:', {
      x: x + 0.2, y: y + 1.38, w: cardW - 0.35, h: 0.24,
      fontSize: 9, bold: true, color: AMBER, fontFace: 'Arial',
    });
    slide.addText(g.why, {
      x: x + 0.2, y: y + 1.58, w: cardW - 0.35, h: 0.55,
      fontSize: 10, color: DARK, fontFace: 'Arial',
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — Quality & Prevention
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide('Quality & Prevention Strategy', 'Three-layer defence added after a runtime prop-reference bug reached production');

  const TOP = 1.15;

  // Incident callout box
  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.3, y: TOP, w: W - 0.6, h: 0.75,
    fill: { color: LAMBER }, line: { color: AMBER, pt: 2 }, rectRadius: 0.1,
  });
  slide.addText('⚠  Root Cause (uploadDrafts runtime error)', {
    x: 0.55, y: TOP + 0.04, w: W - 1.0, h: 0.28,
    fontSize: 11, bold: true, color: AMBER, fontFace: 'Arial', valign: 'middle',
  });
  slide.addText('Prop declared in TypeScript type but missing from destructure. Vite uses esbuild (transpile-only) — tsc never ran, ESLint had no rule for it, no render tests existed. Bug reached runtime silently.', {
    x: 0.55, y: TOP + 0.34, w: W - 1.0, h: 0.38,
    fontSize: 10, color: DARK, fontFace: 'Arial', valign: 'middle',
  });

  const layers = [
    {
      num: '1',
      title: 'ESLint: no-unused-vars',
      color: TEAL,
      points: [
        'Catches props declared in type but not used in body',
        'Configured: vars: "all", args: "after-used"',
        'Fails build on violation (not just warning)',
      ],
    },
    {
      num: '2',
      title: 'TypeScript in Every Build',
      color: NAVY,
      points: [
        'tsc --noEmit added to build:parallel pipeline',
        'Runs on both extension + webview on every npm run build',
        'uploadDrafts bug: would block build with TS2304',
      ],
    },
    {
      num: '3',
      title: '73 Smoke Tests',
      color: GREEN,
      points: [
        '8 suites for React components (jsdom environment)',
        'RequirementsTab test: exercises uploadDrafts prop',
        '5 existing extension suites (Jest, node environment)',
      ],
    },
  ];

  const cardW = (W - 0.6) / 3 - 0.1;
  const cardTop = TOP + 0.85;
  const cardH = H - cardTop - 0.4;

  layers.forEach((l, i) => {
    const x = 0.3 + i * (cardW + 0.15);
    slide.addShape(prs.ShapeType.roundRect, {
      x, y: cardTop, w: cardW, h: cardH,
      fill: { color: WHITE }, line: { color: l.color, pt: 2 }, rectRadius: 0.1,
    });
    slide.addShape(prs.ShapeType.rect, {
      x, y: cardTop, w: cardW, h: 0.4,
      fill: { color: l.color }, line: { color: l.color },
    });
    slide.addText(`Layer ${l.num}`, {
      x, y: cardTop, w: cardW, h: 0.18,
      fontSize: 8, bold: false, color: WHITE, fontFace: 'Arial', align: 'center', valign: 'middle',
    });
    slide.addText(l.title, {
      x, y: cardTop + 0.18, w: cardW, h: 0.22,
      fontSize: 11, bold: true, color: WHITE, fontFace: 'Arial', align: 'center', valign: 'middle',
    });
    l.points.forEach((pt, j) => {
      slide.addShape(prs.ShapeType.ellipse, {
        x: x + 0.18, y: cardTop + 0.55 + j * 0.55 + 0.12, w: 0.1, h: 0.1,
        fill: { color: l.color }, line: { color: l.color },
      });
      slide.addText(pt, {
        x: x + 0.32, y: cardTop + 0.55 + j * 0.55, w: cardW - 0.45, h: 0.55,
        fontSize: 10, color: DARK, fontFace: 'Arial', valign: 'middle',
      });
    });

    // Badge
    const badge = l.num === '1' ? 'Zero violations' : l.num === '2' ? 'Every build' : '73 tests pass';
    slide.addShape(prs.ShapeType.roundRect, {
      x: x + 0.18, y: cardTop + cardH - 0.48, w: cardW - 0.36, h: 0.3,
      fill: { color: LGREEN }, line: { color: GREEN }, rectRadius: 0.06,
    });
    slide.addText('✓  ' + badge, {
      x: x + 0.18, y: cardTop + cardH - 0.48, w: cardW - 0.36, h: 0.3,
      fontSize: 9, bold: true, color: GREEN, fontFace: 'Arial', align: 'center', valign: 'middle',
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — Security & Technical Hardening
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide('Security & Technical Hardening', 'Cryptographic nonce upgrade and runtime input clamping');

  const TOP = 1.2;

  // Left: nonce fix
  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.3, y: TOP, w: 6.0, h: H - TOP - 0.5,
    fill: { color: WHITE }, line: { color: NAVY, pt: 2 }, rectRadius: 0.1,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0.3, y: TOP, w: 6.0, h: 0.38,
    fill: { color: NAVY }, line: { color: NAVY },
  });
  slide.addText('Cryptographic Nonce Upgrade', {
    x: 0.3, y: TOP, w: 6.0, h: 0.38,
    fontSize: 13, bold: true, color: WHITE, fontFace: 'Arial', align: 'center', valign: 'middle',
  });

  slide.addText('Before', {
    x: 0.5, y: TOP + 0.5, w: 5.6, h: 0.3,
    fontSize: 10, bold: true, color: AMBER, fontFace: 'Arial',
  });
  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.5, y: TOP + 0.8, w: 5.6, h: 0.7,
    fill: { color: LAMBER }, line: { color: AMBER }, rectRadius: 0.06,
  });
  slide.addText("Math.random().toString(36).substr(2,16)\n→ Not cryptographically secure (PRNG)", {
    x: 0.6, y: TOP + 0.82, w: 5.4, h: 0.66,
    fontSize: 10, color: DARK, fontFace: 'Courier New', valign: 'middle',
  });

  slide.addText('After', {
    x: 0.5, y: TOP + 1.6, w: 5.6, h: 0.3,
    fontSize: 10, bold: true, color: GREEN, fontFace: 'Arial',
  });
  slide.addShape(prs.ShapeType.roundRect, {
    x: 0.5, y: TOP + 1.9, w: 5.6, h: 0.7,
    fill: { color: LGREEN }, line: { color: GREEN }, rectRadius: 0.06,
  });
  slide.addText("crypto.randomBytes(16).toString('hex')\n→ 128-bit CSPRNG — unpredictable nonce", {
    x: 0.6, y: TOP + 1.92, w: 5.4, h: 0.66,
    fontSize: 10, color: DARK, fontFace: 'Courier New', valign: 'middle',
  });

  slide.addText('Risk addressed: a predictable nonce could be guessed to bypass the Content Security Policy, enabling script injection in the webview.', {
    x: 0.5, y: TOP + 2.75, w: 5.6, h: 0.8,
    fontSize: 10, color: DARK, fontFace: 'Arial', italic: true,
  });

  // Right: batch config clamping
  slide.addShape(prs.ShapeType.roundRect, {
    x: 6.7, y: TOP, w: 6.35, h: H - TOP - 0.5,
    fill: { color: WHITE }, line: { color: TEAL, pt: 2 }, rectRadius: 0.1,
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 6.7, y: TOP, w: 6.35, h: 0.38,
    fill: { color: TEAL }, line: { color: TEAL },
  });
  slide.addText('Batch Config Runtime Clamping', {
    x: 6.7, y: TOP, w: 6.35, h: 0.38,
    fontSize: 13, bold: true, color: WHITE, fontFace: 'Arial', align: 'center', valign: 'middle',
  });
  slide.addText('User-supplied Xray batch settings are now validated and clamped at runtime before use, preventing accidental or crafted misconfiguration.', {
    x: 6.9, y: TOP + 0.48, w: 5.9, h: 0.65,
    fontSize: 10, color: DARK, fontFace: 'Arial', valign: 'middle',
  });

  // Table header
  sectionHeader(slide, 6.9, TOP + 1.2, 1.5, 'Setting', '555555');
  sectionHeader(slide, 8.4, TOP + 1.2, 1.0, 'Min', '555555');
  sectionHeader(slide, 9.4, TOP + 1.2, 1.0, 'Max', '555555');
  sectionHeader(slide, 10.4, TOP + 1.2, 1.0, 'Default', '555555');

  const rows = [
    ['xrayBatchSize', '1', '100', '10'],
    ['xrayBatchDelayMs', '0 ms', '30,000 ms', '1,000 ms'],
    ['xrayMaxRetries', '1', '10', '3'],
  ];
  rows.forEach(([s, mn, mx, def], i) => {
    const rowY = TOP + 1.5 + i * 0.48;
    const bg = i % 2 === 0 ? WHITE : GRAY;
    [[6.9, 1.5, s, true], [8.4, 1.0, mn, false], [9.4, 1.0, mx, false], [10.4, 1.0, def, false]].forEach(([x, w, text, bold]) => {
      slide.addShape(prs.ShapeType.rect, { x, y: rowY, w, h: 0.46, fill: { color: bg }, line: { color: MID } });
      slide.addText(text, { x: x + 0.08, y: rowY, w: w - 0.16, h: 0.46, fontSize: 10, bold: !!bold, color: DARK, fontFace: bold ? 'Courier New' : 'Arial', valign: 'middle' });
    });
  });

  slide.addShape(prs.ShapeType.roundRect, {
    x: 6.9, y: TOP + 3.08, w: 5.7, h: 0.36,
    fill: { color: LGREEN }, line: { color: GREEN }, rectRadius: 0.06,
  });
  slide.addText('✓  Invalid values are silently corrected at runtime — no crashes, no unexpected API calls', {
    x: 6.9, y: TOP + 3.08, w: 5.7, h: 0.36,
    fontSize: 9, bold: true, color: GREEN, fontFace: 'Arial', align: 'center', valign: 'middle',
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — What This Means for the Business
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide('What This Means for the Business', 'Outcomes aligned to delivery quality, team velocity, and operational confidence');

  const TOP = 1.15;

  const cards = [
    {
      icon: '🚀',
      title: 'Faster Delivery Cycles',
      color: TEAL,
      bg: LTEAL,
      points: [
        'Modular codebase: features added in isolation without risking regressions',
        '73 automated tests catch breaks before they reach QA',
        'TypeScript build gate prevents silent prop bugs from reaching users',
      ],
    },
    {
      icon: '🎯',
      title: 'Accurate Test Exports',
      color: NAVY,
      bg: ICE,
      points: [
        'Export now reflects exactly what the user sees — no hidden extras',
        'Staged file chips confirm files before parsing begins',
        'Scenarios can be added, deleted, and exported without regeneration',
      ],
    },
    {
      icon: '🔒',
      title: 'Security Confidence',
      color: GREEN,
      bg: LGREEN,
      points: [
        'Cryptographic nonce eliminates CSP bypass risk',
        'Batch config clamping prevents out-of-bounds API calls',
        '/TraceAudit skill gives on-demand security + type checks',
      ],
    },
    {
      icon: '📊',
      title: 'Operational Visibility',
      color: AMBER,
      bg: LAMBER,
      points: [
        'StepStepper shows real-time pipeline progress (4 steps)',
        'Tab count badges surface data volume at a glance',
        'Layer filter lets teams focus on the test tier that matters',
      ],
    },
  ];

  const cardW = (W - 0.6) / 2 - 0.1;
  const cardH = (H - TOP - 0.4) / 2 - 0.1;

  cards.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.3 + col * (cardW + 0.2);
    const y = TOP + row * (cardH + 0.15);

    slide.addShape(prs.ShapeType.roundRect, {
      x, y, w: cardW, h: cardH,
      fill: { color: c.bg }, line: { color: c.color, pt: 2 }, rectRadius: 0.1,
    });
    slide.addText(c.icon + '  ' + c.title, {
      x: x + 0.15, y: y + 0.1, w: cardW - 0.3, h: 0.42,
      fontSize: 13, bold: true, color: c.color, fontFace: 'Arial', valign: 'middle',
    });
    c.points.forEach((pt, j) => {
      slide.addShape(prs.ShapeType.ellipse, {
        x: x + 0.22, y: y + 0.63 + j * 0.52 + 0.1, w: 0.1, h: 0.1,
        fill: { color: c.color }, line: { color: c.color },
      });
      slide.addText(pt, {
        x: x + 0.37, y: y + 0.63 + j * 0.52, w: cardW - 0.55, h: 0.52,
        fontSize: 10.5, color: DARK, fontFace: 'Arial', valign: 'middle',
      });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 8 — Next Steps
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = addSlide('Next Steps & Roadmap', 'Recommended priorities following the v0.0.5 release');

  const TOP = 1.15;

  const items = [
    {
      priority: 'Immediate',
      color: GREEN,
      bg: LGREEN,
      actions: [
        'Install tracelm-0.0.5.vsix via Extensions → Install from VSIX',
        'Validate against a live Jira/Xray project to confirm end-to-end push flow',
        'Run /TraceAudit after installation to baseline security posture',
      ],
    },
    {
      priority: 'Short-term (v0.0.6)',
      color: TEAL,
      bg: LTEAL,
      actions: [
        'Live Jira connection test button (validates credentials in real time)',
        'Increase test coverage to 40%+ with integration-level tests',
        'Add Xray test-run push (push test execution results, not just definitions)',
      ],
    },
    {
      priority: 'Medium-term',
      color: NAVY,
      bg: ICE,
      actions: [
        'PDF parsing upgrade (replace pdf-parse to resolve dev vulnerability)',
        'Multi-project Jira support (switch project key from a dropdown)',
        'AI-assisted scenario editing (in-place LLM rewrite of a single scenario)',
      ],
    },
  ];

  const cardW = (W - 0.6) / 3 - 0.12;

  items.forEach((item, i) => {
    const x = 0.3 + i * (cardW + 0.18);
    const cardH = H - TOP - 0.42;
    slide.addShape(prs.ShapeType.roundRect, {
      x, y: TOP, w: cardW, h: cardH,
      fill: { color: item.bg }, line: { color: item.color, pt: 2 }, rectRadius: 0.1,
    });
    slide.addShape(prs.ShapeType.rect, {
      x, y: TOP, w: cardW, h: 0.38,
      fill: { color: item.color }, line: { color: item.color },
    });
    slide.addText(item.priority, {
      x, y: TOP, w: cardW, h: 0.38,
      fontSize: 12, bold: true, color: WHITE, fontFace: 'Arial', align: 'center', valign: 'middle',
    });
    item.actions.forEach((action, j) => {
      const itemY = TOP + 0.5 + j * 1.2;
      slide.addShape(prs.ShapeType.roundRect, {
        x: x + 0.15, y: itemY, w: cardW - 0.3, h: 1.1,
        fill: { color: WHITE }, line: { color: item.color, pt: 1 }, rectRadius: 0.06,
      });
      slide.addText(action, {
        x: x + 0.22, y: itemY + 0.08, w: cardW - 0.44, h: 0.95,
        fontSize: 10.5, color: DARK, fontFace: 'Arial', valign: 'middle',
      });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 9 — Closing
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = prs.addSlide();

  slide.addShape(prs.ShapeType.rect, {
    x: 0, y: 0, w: W, h: H,
    fill: { color: NAVY }, line: { color: NAVY },
  });
  slide.addShape(prs.ShapeType.rect, {
    x: 0, y: H / 2 - 0.03, w: W, h: 0.06,
    fill: { color: TEAL }, line: { color: TEAL },
  });

  slide.addText('TraceLM v0.0.5', {
    x: 1.5, y: 1.4, w: W - 3, h: 1.0,
    fontSize: 48, bold: true, color: WHITE, fontFace: 'Arial', align: 'center',
  });
  slide.addText('Released & Ready', {
    x: 1.5, y: 2.5, w: W - 3, h: 0.55,
    fontSize: 24, color: TEAL, fontFace: 'Arial', align: 'center',
  });

  // Stats row
  const stats = [
    ['73', 'Tests Passing'],
    ['6', 'New Modules'],
    ['4', 'Gaps Fixed'],
    ['3', 'Prevention Layers'],
  ];
  stats.forEach(([val, label], i) => {
    const x = 1.0 + i * 2.9;
    slide.addText(val, {
      x, y: 4.0, w: 2.5, h: 0.7,
      fontSize: 36, bold: true, color: TEAL, fontFace: 'Arial', align: 'center',
    });
    slide.addText(label, {
      x, y: 4.7, w: 2.5, h: 0.38,
      fontSize: 11, color: ICE, fontFace: 'Arial', align: 'center',
    });
  });

  slide.addText('Questions?', {
    x: 0, y: 5.5, w: W, h: 0.55,
    fontSize: 18, color: '888888', fontFace: 'Arial', align: 'center', italic: true,
  });

  slide.addShape(prs.ShapeType.rect, {
    x: 0, y: H - 0.32, w: W, h: 0.32,
    fill: { color: '0D1B2E' }, line: { color: '0D1B2E' },
  });
  slide.addText('CONFIDENTIAL  |  TraceLM Engineering  |  June 2026', {
    x: 0, y: H - 0.32, w: W, h: 0.32,
    fontSize: 9, color: '888888', fontFace: 'Arial', align: 'center', valign: 'middle',
  });
}

// ── Write ─────────────────────────────────────────────────────────────────────
fs.mkdirSync(path.dirname(OUT), { recursive: true });
prs.writeFile({ fileName: OUT })
  .then(() => console.log('✓ PowerPoint written:', OUT))
  .catch(err => { console.error('✗ Failed:', err.message); process.exit(1); });
