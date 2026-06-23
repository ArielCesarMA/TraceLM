"use strict";
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak,
} = require('docx');
const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const BLUE       = '1F5C99';
const LIGHT_BLUE = 'D6E8F7';
const TEAL       = '1A7A5E';
const LIGHT_TEAL = 'D4EDE7';
const GREEN      = '1A6B3C';
const LIGHT_GREEN= 'D4EDDA';
const AMBER_BG   = 'FFF8E6';
const AMBER_BDR  = 'D4860B';
const GRAY_HDR   = 'F2F2F2';
const MID_GRAY   = 'CCCCCC';
const DARK_TEXT  = '1A1A1A';
const WHITE      = 'FFFFFF';

const OUT = path.join(
  'C:\\Users\\Ariel Cesar Abaoag\\Documents\\PROJECT7\\TraceLM\\DOCUMENTATION\\RELEASE',
  'TraceLM_Release_Notes_v0.0.5.docx'
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const border = (c = MID_GRAY) => ({
  top:    { style: BorderStyle.SINGLE, size: 1, color: c },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: c },
  left:   { style: BorderStyle.SINGLE, size: 1, color: c },
  right:  { style: BorderStyle.SINGLE, size: 1, color: c },
});

const shade = (fill, type = ShadingType.CLEAR) => ({ type, fill, color: 'auto' });

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, bold: true, size: 36, color: BLUE, font: 'Arial' })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE } },
    children: [new TextRun({ text, bold: true, size: 28, color: BLUE, font: 'Arial' })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 60 },
    children: [new TextRun({ text, bold: true, size: 24, color: TEAL, font: 'Arial' })],
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 20, color: DARK_TEXT, font: 'Arial', ...opts })],
  });
}
function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 20, color: DARK_TEXT, font: 'Arial' })],
  });
}
function gap(before = 120) {
  return new Paragraph({ spacing: { before, after: 0 }, children: [new TextRun('')] });
}

function twoColTable(rows, leftW = 2200, rightW = 7000) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([label, value, labelBg, rowBg]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: leftW, type: WidthType.DXA },
            shading: shade(labelBg || GRAY_HDR),
            borders: border(),
            children: [new Paragraph({
              spacing: { before: 60, after: 60 },
              children: [new TextRun({ text: label, bold: true, size: 18, font: 'Arial', color: DARK_TEXT })],
            })],
          }),
          new TableCell({
            shading: shade(rowBg || WHITE),
            borders: border(),
            children: [new Paragraph({
              spacing: { before: 60, after: 60 },
              children: [new TextRun({ text: value, size: 18, font: 'Arial', color: DARK_TEXT })],
            })],
          }),
        ],
      })
    ),
  });
}

function sectionTable(headers, rows, headerBg = BLUE) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) =>
          new TableCell({
            shading: shade(headerBg),
            borders: border(headerBg),
            width: { size: Math.floor(9360 / headers.length), type: WidthType.DXA },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: h, bold: true, size: 18, color: WHITE, font: 'Arial' })],
            })],
          })
        ),
      }),
      ...rows.map((cells, ri) =>
        new TableRow({
          children: cells.map(cell =>
            new TableCell({
              shading: shade(ri % 2 === 0 ? WHITE : LIGHT_BLUE),
              borders: border(),
              children: [new Paragraph({
                spacing: { before: 60, after: 60 },
                children: [new TextRun({ text: cell, size: 18, font: 'Arial', color: DARK_TEXT })],
              })],
            })
          ),
        })
      ),
    ],
  });
}

function callout(text, bg = AMBER_BG, borderColor = AMBER_BDR) {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: {
      left: { style: BorderStyle.THICK, size: 12, color: borderColor },
    },
    shading: shade(bg),
    indent: { left: 200 },
    children: [new TextRun({ text, size: 20, font: 'Arial', color: DARK_TEXT, italics: true })],
  });
}

// ── Document ──────────────────────────────────────────────────────────────────
const doc = new Document({
  creator: 'TraceLM Engineering',
  title: 'TraceLM Release Notes v0.0.5',
  description: 'Technical Release Notes for TraceLM v0.0.5',
  styles: {
    default: {
      document: { run: { font: 'Arial', size: 20, color: DARK_TEXT } },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
      },
    },
    headers: {
      default: new Header({
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE } },
            rows: [new TableRow({
              children: [
                new TableCell({
                  borders: border(WHITE),
                  children: [new Paragraph({ children: [new TextRun({ text: 'TraceLM', bold: true, size: 24, color: BLUE, font: 'Arial' })] })],
                }),
                new TableCell({
                  borders: border(WHITE),
                  children: [new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [new TextRun({ text: 'Release Notes  |  v0.0.5  |  June 2026', size: 18, color: '888888', font: 'Arial' })],
                  })],
                }),
              ],
            })],
          }),
        ],
      }),
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 2, color: MID_GRAY } },
            spacing: { before: 80 },
            children: [
              new TextRun({ text: 'TraceLM v0.0.5  |  CONFIDENTIAL  |  Page ', size: 16, color: '888888', font: 'Arial' }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '888888', font: 'Arial' }),
              new TextRun({ text: ' of ', size: 16, color: '888888', font: 'Arial' }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: '888888', font: 'Arial' }),
            ],
          }),
        ],
      }),
    },
    children: [

      // ── Cover ──────────────────────────────────────────────────────────────
      new Paragraph({
        spacing: { before: 480, after: 80 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'TraceLM', bold: true, size: 72, color: BLUE, font: 'Arial' })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: 'Technical Release Notes', size: 36, color: TEAL, font: 'Arial' })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        shading: shade(BLUE),
        children: [new TextRun({ text: '  Version 0.0.5  |  June 2026  ', bold: true, size: 28, color: WHITE, font: 'Arial' })],
      }),
      gap(200),
      twoColTable([
        ['Release Version', 'v0.0.5'],
        ['Release Date',    'June 2026'],
        ['Release Type',    'Minor — UI Architecture + Functional Improvements + Quality Gates'],
        ['Prepared By',     'TraceLM Engineering'],
        ['Status',          'Released'],
        ['Repository',      'https://github.com/ArielCesarMA/TraceLM'],
        ['Git Tag',         'v0.0.5'],
        ['Artifact',        'tracelm-0.0.5.vsix'],
      ]),
      gap(),
      callout('This document covers all changes introduced in v0.0.5 including UI architecture decomposition, functional gap resolutions, prevention strategy implementation, and security hardening.', LIGHT_BLUE, BLUE),

      new Paragraph({ children: [new PageBreak()] }),

      // ── 1. Release Overview ────────────────────────────────────────────────
      h1('1. Release Overview'),
      body('TraceLM v0.0.5 is a significant improvement release covering three major workstreams: a full React webview UI decomposition (Phases 1–3), resolution of identified functional gaps, and implementation of a three-layer prevention strategy to harden the development pipeline against runtime prop-reference errors.'),
      gap(),

      h2('1.1 Release Scope Summary'),
      sectionTable(
        ['Workstream', 'Scope', 'Status'],
        [
          ['Phase 1 — UI Architecture',       'App.tsx decomposed into 6 tabs, 4 components, 1 hook',     '✓ Complete'],
          ['Phase 2 — UI Improvements',        'StepStepper, collapsible cards, automation priority cards', '✓ Complete'],
          ['Phase 3 — Productivity Polish',    'Layer filter, copy buttons, tab count badges',              '✓ Complete'],
          ['Functional Gap Fixes',             'Scenarios export, add/delete, staged files, export filter', '✓ Complete'],
          ['Prevention Strategy',              'ESLint, typecheck in build, 73 smoke tests, /TraceAudit',  '✓ Complete'],
          ['Security Hardening',               'crypto.randomBytes nonce, batch config clamping',           '✓ Complete'],
        ]
      ),

      new Paragraph({ children: [new PageBreak()] }),

      // ── 2. Phase 1 ────────────────────────────────────────────────────────
      h1('2. Phase 1 — UI Architecture Decomposition'),
      body('The monolithic App.tsx (1,115 lines) was rewritten as a thin router (~290 lines) with all logic delegated to dedicated modules. This improves maintainability, testability, and render performance via React memoization.'),
      gap(),

      h2('2.1 New File Structure'),
      sectionTable(
        ['File / Module', 'Responsibility'],
        [
          ['webview-ui/src/App.tsx',                      'Thin router — state, refs, stable callbacks only'],
          ['webview-ui/src/types.ts',                     'Shared TypeScript types and constants'],
          ['webview-ui/src/utils.ts',                     'downloadFile(), escapeCsvCell() pure utilities'],
          ['webview-ui/src/hooks/useTraceLMMessages.ts',  'All postMessage event handling extracted to hook'],
          ['webview-ui/src/tabs/SettingsTab.tsx',         'LLM, Jira, and Xray settings form'],
          ['webview-ui/src/tabs/RequirementsTab.tsx',     'Free text, file upload, Jira pull'],
          ['webview-ui/src/tabs/EnhancementTab.tsx',      'Requirement enhancement cards'],
          ['webview-ui/src/tabs/ScenariosTab.tsx',        'Test scenario generation and editing'],
          ['webview-ui/src/tabs/TestCasesTab.tsx',        'Test case generation, Gherkin view, Xray push'],
          ['webview-ui/src/tabs/AutomationTab.tsx',       'Automation candidate analysis'],
          ['webview-ui/src/components/CopyButton.tsx',    'Clipboard copy button with ✓ feedback'],
          ['webview-ui/src/components/StepStepper.tsx',   '4-step Generate All progress indicator'],
          ['webview-ui/src/components/ErrorBoundary.tsx', 'Per-tab React error boundary'],
          ['webview-ui/src/components/Tip.tsx',           'Inline tooltip helper component'],
        ]
      ),
      gap(),

      h2('2.2 Performance Techniques Applied'),
      bullet('React.memo() on all 6 tab components and 4 shared components — prevents unnecessary re-renders'),
      bullet('useCallback() with stable empty deps [] on all 22 action handlers via ref pattern'),
      bullet('useRef() per state value read inside stable callbacks — eliminates stale closure risk'),
      bullet('useMemo() for derived values: filteredTestCases, availableModels, enhancementTotal, activeStep, selectedStoryKeySet'),
      bullet('Set<string> for O(1) multi-select lookup replacing O(n) Array.includes()'),

      new Paragraph({ children: [new PageBreak()] }),

      // ── 3. Phase 2 ────────────────────────────────────────────────────────
      h1('3. Phase 2 — UI Improvements'),

      h2('3.1 StepStepper Component'),
      body('A 4-step horizontal progress indicator is displayed during Generate All Artifacts, giving users real-time feedback on which pipeline step is running.'),
      gap(),
      sectionTable(
        ['Step', 'Label', 'State Behaviour'],
        [
          ['1', 'Enhancement',  'Active (blue pulse) while enhancement generates; green ✓ when done'],
          ['2', 'Scenarios',    'Active while scenarios generate; green ✓ when done'],
          ['3', 'Test Cases',   'Active while test cases generate; green ✓ when done'],
          ['4', 'Automation',   'Active while automation analysis runs; all-green flash on completion'],
        ]
      ),
      gap(),
      callout('Completion state: when all 4 steps finish, the stepper shows all-green with a pop animation for 2 seconds before disappearing — confirming full pipeline success.', LIGHT_GREEN, TEAL),

      gap(),
      h2('3.2 Collapsible Enhancement Cards'),
      bullet('Each of the 6 enhancement categories (Missing Functional, Missing Non-Functional, Best Practices, Market Benchmark, Risks, Clarifying Questions) renders as an independent collapsible card'),
      bullet('Card header shows item count badge (N) when items exist'),
      bullet('All cards expand automatically when a new generation completes'),
      bullet('Keyboard accessible: Enter/Space toggles collapse state'),

      gap(),
      h2('3.3 Automation Priority Cards'),
      bullet('Each automation candidate renders as a styled card showing: Test Case ID, Priority badge (Automate First / Automate Second / Manual Deferred), ROI score, Feasibility score, and Layer'),
      bullet('Excluded candidates shown with dashed border (opacity 0.75) and red exclusion reason'),
      bullet('Cards grouped by layer (Unit / API / UI) with item counts'),

      new Paragraph({ children: [new PageBreak()] }),

      // ── 4. Phase 3 ────────────────────────────────────────────────────────
      h1('4. Phase 3 — Productivity Polish'),

      h2('4.1 Layer Filter Chips (Test Cases Tab)'),
      body('Users can filter the Test Cases view by layer (Unit, API, UI) using toggle chips. The filter affects the Gherkin view, structured table, and both export buttons.'),
      gap(),
      sectionTable(
        ['Feature', 'Detail'],
        [
          ['Filter chips',        'Unit (blue) / API (amber) / UI (purple) — toggle individually'],
          ['Guard',               'Minimum 1 layer always active — cannot deselect all'],
          ['Counter',             '"N of M shown" label appears when filter is narrowed'],
          ['Export respect',      'Export .feature and Export CSV export only the filtered subset'],
          ['Auto-reset',          'Filter resets to all-active when new test cases are generated'],
        ]
      ),

      gap(),
      h2('4.2 Copy-to-Clipboard Buttons'),
      bullet('Gherkin blocks in Test Cases tab — overlay copy button appears on hover'),
      bullet('Each item in Enhancement cards — per-item copy button on hover'),
      bullet('Uses navigator.clipboard.writeText(); shows ✓ for 1.5 seconds after copy'),
      bullet('Silently handles clipboard access restrictions in webview context'),

      gap(),
      h2('4.3 Tab Count Badges'),
      bullet('Enhancement tab — shows total item count across all 6 categories'),
      bullet('Scenarios tab — shows number of generated scenarios'),
      bullet('Test Cases tab — shows number of generated test cases'),
      bullet('Automation tab — shows number of candidate items'),
      bullet('Badge uses color-mix() for theme-aware background; hidden when count is 0'),

      new Paragraph({ children: [new PageBreak()] }),

      // ── 5. Functional Gaps ────────────────────────────────────────────────
      h1('5. Functional Gap Fixes'),
      body('Four functional gaps were identified and resolved in this release.'),
      gap(),

      h2('5.1 Scenarios Tab — Export'),
      bullet('Added Export JSON button: downloads all scenarios as a structured JSON file'),
      bullet('Added Export CSV button: downloads scenario table (ID, Title, Priority, Refs, Preconditions, Flow, Expected Outcome)'),
      bullet('Both buttons disabled when no scenarios exist'),

      gap(),
      h2('5.2 Scenarios Tab — Add / Delete Scenario'),
      bullet('Added Add Scenario button: inserts a blank scenario with auto-assigned ID (e.g. SCN-004) and Medium priority'),
      bullet('Each scenario card has a ✕ delete button (top-right); hover turns it red'),
      bullet('Both operations update state immediately; no page reload required'),

      gap(),
      h2('5.3 Requirements Tab — Staged File Visibility'),
      bullet('uploadDrafts prop was received by RequirementsTab but never rendered — files staged for upload were invisible to the user'),
      bullet('Fix: staged files now render as pill chips between the file picker and Parse button'),
      bullet('Parse Selected Files button is disabled until at least one file is staged'),
      bullet('Chips disappear and the parsed file list appears after parsing completes'),

      gap(),
      h2('5.4 Export Respects Active Layer Filter'),
      callout('Bug: Export .feature and Export CSV exported ALL test cases regardless of the active layer filter, inconsistent with what was visible on screen.', AMBER_BG, AMBER_BDR),
      gap(),
      bullet('Root cause: export functions in App.tsx read from testCasesRef.current (all cases); filteredTestCases was local state inside TestCasesTab'),
      bullet('Fix: both export functions moved into TestCasesTab where filteredTestCases is in scope — exports now always reflect the current filter'),

      new Paragraph({ children: [new PageBreak()] }),

      // ── 6. Prevention Strategy ────────────────────────────────────────────
      h1('6. Prevention Strategy'),
      body('Following the uploadDrafts runtime error (prop declared in type but missing from destructure, invisible to build because Vite uses esbuild transpile-only), three prevention layers were added.'),
      gap(),

      h2('6.1 Root Cause Analysis'),
      sectionTable(
        ['Factor', 'Detail'],
        [
          ['Why the bug existed',         'uploadDrafts declared in Props type but not destructured in function parameters'],
          ['Why TypeScript did not catch it', "Vite's build uses esbuild which strips types without type-checking — tsc never ran"],
          ['Why ESLint did not catch it', 'Undeclared variable reference is a TypeScript error, not an ESLint rule violation'],
          ['Why tests did not catch it',  'No render tests existed for RequirementsTab'],
        ]
      ),

      gap(),
      h2('6.2 Strategy 1 — ESLint: no-unused-vars'),
      bullet('@typescript-eslint/no-unused-vars added explicitly with vars: "all", args: "after-used"'),
      bullet('Catches the inverse: destructured props that are declared but never used in the body'),
      bullet('Prefix with _ to intentionally suppress (e.g. _index in callbacks)'),
      bullet('Test files get a relaxed warn variant'),

      gap(),
      h2('6.3 Strategy 2 — TypeScript in Every Build'),
      bullet('typecheck:all added to build:parallel in package.json'),
      bullet('tsc --noEmit runs on both extension (src/) and webview (webview-ui/src/) in parallel with the compile step'),
      bullet('Build fails immediately if TypeScript finds any type errors — no silent pass-through'),
      callout('With this gate in place, the original uploadDrafts bug would have produced: error TS2304: Cannot find name \'uploadDrafts\' — blocking the build entirely.', LIGHT_GREEN, TEAL),

      gap(),
      h2('6.4 Strategy 3 — Smoke Tests (React Testing Library)'),
      sectionTable(
        ['Test Suite', 'Tests', 'Key Assertions'],
        [
          ['SettingsTab',       '4', 'Renders, all buttons present, isBusy disables buttons, feedback renders'],
          ['RequirementsTab',   '6', 'Renders, uploadDrafts chips visible, parsed list shown, stepper on progress'],
          ['EnhancementTab',    '5', 'Renders, all 6 card headers, item count badge, feedback'],
          ['ScenariosTab',      '7', 'Renders, empty state, export disabled/enabled, add/delete callbacks'],
          ['TestCasesTab',      '6', 'Renders, empty state, export disabled, layer chips, gherkin, push preview'],
          ['AutomationTab',     '7', 'Renders, empty state, export disabled, summary, layer groups, priority badges'],
          ['StepStepper',       '5', 'Hidden at 0, labels, aria-label, all-done state, completed checkmarks'],
          ['CopyButton',        '3', 'Renders, clipboard.writeText called, ✓ indicator shown'],
          ['Extension (existing)', '30', 'JiraXrayService, BatchProcessor, PushHistoryStore, fingerprintUtil'],
          ['TOTAL',             '73', '13 test suites — extension (node) + webview (jsdom) projects'],
        ]
      ),

      gap(),
      h2('6.5 /TraceAudit On-Demand Skill'),
      bullet('Custom Claude Code skill registered at .claude/commands/TraceAudit.md'),
      bullet('Invoked by typing /TraceAudit in any Claude Code session inside this project'),
      bullet('Runs node scripts/audit-build.cjs and reports all 6 audit sections'),
      bullet('Removed from automatic build pipeline — now fully on-demand'),
      gap(),
      sectionTable(
        ['Section', 'What It Checks'],
        [
          ['1. Bundle Size',                  'JS vs 300 KB warn / 500 KB fail; CSS vs 50 KB warn'],
          ['2. Source Security Scan',         'innerHTML, eval(), document.write(), Math.random() nonce, credentials in console'],
          ['3. Dependency Vulnerabilities',   'npm audit --omit=dev --audit-level=critical on extension and webview'],
          ['4. Runtime Performance',          'useMemo / useCallback / memo() counts; Array.sort() frequency'],
          ['5. CSP / Nonce',                  'Content-Security-Policy header, nonce on script tags, crypto.randomBytes'],
          ['6. TypeScript Type-Check',        'tsc --noEmit on both extension and webview — independent of build pipeline'],
        ]
      ),

      new Paragraph({ children: [new PageBreak()] }),

      // ── 7. Security Hardening ─────────────────────────────────────────────
      h1('7. Security Hardening (TraceLMPanel.ts)'),

      h2('7.1 Cryptographic Nonce'),
      sectionTable(
        ['Item', 'Before', 'After'],
        [
          ['Nonce generation', "Math.random() loop — NOT cryptographically secure", "crypto.randomBytes(16).toString('hex') — CSPRNG"],
          ['Risk addressed',   'Predictable nonce could be guessed to bypass CSP', 'Unpredictable 128-bit nonce'],
        ]
      ),

      gap(),
      h2('7.2 Batch Config Runtime Clamping'),
      body('User-supplied Xray batch configuration values are now clamped at runtime before use, defending against misconfiguration or manipulation:'),
      gap(),
      sectionTable(
        ['Setting', 'Min', 'Max', 'Default'],
        [
          ['xrayBatchSize',      '1',  '100',    '10'],
          ['xrayBatchDelayMs',   '0',  '30,000', '1,000'],
          ['xrayMaxRetries',     '1',  '10',     '3'],
        ]
      ),

      new Paragraph({ children: [new PageBreak()] }),

      // ── 8. Build Pipeline ─────────────────────────────────────────────────
      h1('8. Build Pipeline Changes'),
      sectionTable(
        ['Script', 'Before v0.0.5', 'After v0.0.5'],
        [
          ['npm run build',          'build:parallel only',             'build:parallel (includes typecheck:all)'],
          ['npm run build:parallel', 'build:webview + build:extension', 'build:webview + build:extension + typecheck:all (parallel)'],
          ['npm run audit:build',    'Not available (was auto-run)',     'New explicit script — runs audit-build.cjs on demand'],
          ['npm test',               'Extension tests only (node)',      '73 tests across extension (node) + webview (jsdom) projects'],
        ]
      ),

      gap(),
      h2('8.1 Dependencies Added'),
      sectionTable(
        ['Package', 'Type', 'Purpose'],
        [
          ['jest-environment-jsdom',    'devDependency', 'jsdom test environment for React component tests'],
          ['@testing-library/react',    'devDependency', 'React Testing Library for smoke tests'],
          ['@testing-library/jest-dom', 'devDependency', 'Custom Jest matchers for DOM assertions'],
        ]
      ),

      new Paragraph({ children: [new PageBreak()] }),

      // ── 9. Known Limitations ──────────────────────────────────────────────
      h1('9. Known Limitations'),
      bullet('Test coverage threshold intentionally low (5–15%) — integration tests dominate; unit coverage will grow incrementally'),
      bullet('Jira/Xray live API validation is static shape-check only — live connection test planned for a future release'),
      bullet('PDF parsing depends on pdf-parse which has a known dev-only moderate vulnerability — no prod impact'),
      bullet('esbuild dev-server CORS vulnerability (GHSA-67mh-4wv8-2f99) is dev-only, no prod impact'),

      gap(),

      // ── 10. Artefacts ─────────────────────────────────────────────────────
      h1('10. Release Artefacts'),
      sectionTable(
        ['Artefact', 'Location', 'Description'],
        [
          ['tracelm-0.0.5.vsix',              'Project root',                           'VS Code extension package — install via Extensions: Install from VSIX'],
          ['TraceLM_Release_Notes_v0.0.5.docx', 'DOCUMENTATION/RELEASE/',              'This document'],
          ['TraceLM_Release_v0.0.5.pptx',     'DOCUMENTATION/RELEASE/',                'Executive summary presentation'],
          ['Git Tag',                          'github.com/ArielCesarMA/TraceLM tag v0.0.5', 'Source snapshot'],
        ]
      ),

      gap(200),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: '— End of Release Notes —', size: 18, italics: true, color: '888888', font: 'Arial' })],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, buf);
  console.log('✓ Word document written:', OUT);
}).catch(err => {
  console.error('✗ Failed:', err.message);
  process.exit(1);
});
