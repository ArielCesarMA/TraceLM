"use strict";
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, Footer
} = require('docx');
const fs = require('fs');
const path = require('path');

const BLUE       = '1F5C99';
const LIGHT_BLUE = 'D6E8F7';
const TEAL       = '1A7A5E';
const LIGHT_TEAL = 'D4EDE7';
const GRAY_HDR   = 'F2F2F2';
const MID_GRAY   = 'CCCCCC';
const DARK_TEXT  = '1A1A1A';
const MED_TEXT   = '444444';
const WHITE      = 'FFFFFF';
const GREEN_BG   = 'E8F5E9';
const AMBER_BG   = 'FFF8E6';
const RED_BG     = 'FDECEA';

const OUT = path.join(
  'C:\\Users\\Ariel Cesar Abaoag\\Documents\\PROJECT7\\TraceLM\\DOCUMENTATION',
  'TraceLM_UI_Reassessment_v1.0.docx'
);

const cellBorder = (color = MID_GRAY) => ({
  top:    { style: BorderStyle.SINGLE, size: 1, color },
  bottom: { style: BorderStyle.SINGLE, size: 1, color },
  left:   { style: BorderStyle.SINGLE, size: 1, color },
  right:  { style: BorderStyle.SINGLE, size: 1, color },
});

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, bold: true, size: 32, color: BLUE, font: 'Arial' })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE, space: 1 } },
    children: [new TextRun({ text, bold: true, size: 26, color: BLUE, font: 'Arial' })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 60 },
    children: [new TextRun({ text, bold: true, size: 22, color: TEAL, font: 'Arial' })],
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

function note(label, text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    indent: { left: 360 },
    border: { left: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 4 } },
    children: [
      new TextRun({ text: label + ' ', bold: true, size: 20, color: BLUE, font: 'Arial' }),
      new TextRun({ text, size: 20, color: MED_TEXT, font: 'Arial' }),
    ],
  });
}

function divider() {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: MID_GRAY } },
    children: [],
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function coverTitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 52, color: WHITE, font: 'Arial' })],
  });
}

function coverSub(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 24, color: 'C8D8F0', font: 'Arial' })],
  });
}

function headerCell(text, bg = BLUE) {
  return new TableCell({
    shading: { type: ShadingType.SOLID, color: bg },
    borders: cellBorder(bg),
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, size: 18, color: WHITE, font: 'Arial' })],
    })],
  });
}

function dataCell(text, bg = WHITE, align = AlignmentType.LEFT, color = DARK_TEXT) {
  return new TableCell({
    shading: { type: ShadingType.SOLID, color: bg },
    borders: cellBorder(MID_GRAY),
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text, size: 18, color, font: 'Arial' })],
    })],
  });
}

function priorityCell(text, bg, color) {
  return new TableCell({
    shading: { type: ShadingType.SOLID, color: bg },
    borders: cellBorder(MID_GRAY),
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, size: 18, color, font: 'Arial' })],
    })],
  });
}

// ── COVER ─────────────────────────────────────────────────────────────────────
const coverSection = {
  properties: {
    page: {
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
      shading: { type: ShadingType.SOLID, color: '1F5C99' },
    },
  },
  children: [
    new Paragraph({ spacing: { before: 1800, after: 0 }, children: [] }),
    coverTitle('TraceLM UI Re-Assessment'),
    coverSub('Technical Recommendations Document'),
    coverSub('Version 1.0  |  June 2026'),
    coverSub('Prepared by: Senior Developer Review'),
    new Paragraph({ spacing: { before: 2400, after: 0 }, children: [] }),
  ],
};

// ── BODY ──────────────────────────────────────────────────────────────────────
const bodyChildren = [

  // 1. EXECUTIVE SUMMARY
  h1('1. Executive Summary'),
  body('TraceLM is a VS Code extension that transforms raw software requirements into structured, traceable, automation-ready Xray test assets using AI-powered LLMs. The current user interface is functional and delivers its core workflow — however a technical review has identified architectural and user-experience improvements that will reduce long-term maintenance cost, improve developer productivity, and enhance the overall polish of the tool.'),
  body('This document presents a prioritized set of UI improvements across three phases: architecture refactoring, user-experience enhancements, and productivity polish. The recommendations are sequenced to deliver maximum impact with manageable risk.'),

  divider(),

  // 2. CURRENT STATE ASSESSMENT
  h1('2. Current State Assessment'),

  h2('2.1 Architecture Overview'),
  body('The TraceLM webview UI is built with React 18 and TypeScript, compiled by Vite 5, and communicates with the VS Code Extension Host exclusively via postMessage. The webview has no access to Node.js or VS Code APIs directly.'),
  note('Key File:', 'webview-ui/src/App.tsx — 1,036 lines, ~45KB, single component'),

  h2('2.2 Identified Pain Points'),

  h3('2.2.1 Single Monolithic Component'),
  body('All six tab sections, the postMessage router, 20+ useState declarations, and all business logic live in one file. This creates:'),
  bullet('High cognitive load when navigating or modifying any feature'),
  bullet('Risk of accidental state mutation across unrelated tabs'),
  bullet('Slow TypeScript compilation feedback on every edit'),
  bullet('Difficult unit testing — the entire component must be mounted to test any one part'),

  h3('2.2.2 No Error Boundaries'),
  body('A single unhandled JavaScript exception in any tab component will crash the entire webview panel. VS Code will show a blank white panel with no recovery path except closing and reopening the TraceLM command. An Error Boundary wrapper around each tab prevents this.'),

  h3('2.2.3 Raw HTML Form Elements'),
  body('All inputs, buttons, dropdowns, and textareas are native HTML elements styled with custom CSS. This means:'),
  bullet('Theme consistency (light / dark / high-contrast) must be maintained manually via VS Code CSS variables'),
  bullet('Any VS Code theme update may require CSS updates to match'),
  bullet('The @vscode/webview-ui-toolkit is the official first-party solution that handles all of this automatically'),

  h3('2.2.4 Generation Progress — Text Only'),
  body('The "Generate All" four-step pipeline communicates progress via a plain text string ("Test Scenarios (2/4)...") placed inline next to the trigger button. There is no visual distinction between steps completed, step in progress, and steps pending. Users have no way to confirm the app is working during long LLM calls.'),

  h3('2.2.5 Xray Push Preview — Unformatted List'),
  body('The Preview Push result renders as a plain unordered list with Unicode symbols (✓, ⊘, ✗). There is no color differentiation between valid, duplicate, and error states, and validation error messages lack actionable guidance.'),

  h3('2.2.6 Empty States'),
  body('Three tabs show a short plain-text message when no data has been generated ("No scenarios generated yet."). There is no instruction on what to do next, which creates confusion for first-time users.'),

  h3('2.2.7 Automation Candidates — Low Information Density'),
  body('The Automation Candidates tab renders each item as a single pipe-delimited text line: "TC-001 | Automate First | ROI 7 | Feasibility 4". This format omits the test case title, has no visual priority differentiation, and provides no context on exclusion reasons for non-candidate items.'),

  divider(),

  // 3. RECOMMENDATIONS
  h1('3. Recommendations'),

  h2('3.1 Phase 1 — Architecture Refactoring'),
  body('Phase 1 establishes the foundation. All subsequent improvements are significantly easier to implement once App.tsx is decomposed into focused modules.', { bold: true }),

  h3('3.1.1 Decompose App.tsx into Tab Components'),
  body('Split the single 1,036-line file into six tab components and one custom message hook:'),
  bullet('webview-ui/src/tabs/SettingsTab.tsx'),
  bullet('webview-ui/src/tabs/RequirementsTab.tsx'),
  bullet('webview-ui/src/tabs/EnhancementTab.tsx'),
  bullet('webview-ui/src/tabs/ScenariosTab.tsx'),
  bullet('webview-ui/src/tabs/TestCasesTab.tsx'),
  bullet('webview-ui/src/tabs/AutomationTab.tsx'),
  bullet('webview-ui/src/hooks/useTraceLMMessages.ts — postMessage router as a custom hook'),
  bullet('webview-ui/src/App.tsx — reduced to tab router and shared state only'),
  body('Estimated effort: 1.5 days. No functional changes, pure structural reorganization.'),

  h3('3.1.2 Add React Error Boundaries'),
  body('Wrap each tab render in an ErrorBoundary component. When a tab throws, show a minimal fallback UI ("Something went wrong in this tab. Reload to recover.") instead of crashing the entire panel.'),
  body('Estimated effort: 0.5 days.'),

  h3('3.1.3 Adopt @vscode/webview-ui-toolkit'),
  body('Install the official Microsoft VS Code webview UI toolkit and replace raw HTML form elements with toolkit components:'),
  bullet('<vscode-button> replaces <button>'),
  bullet('<vscode-text-field> replaces <input type="text"> and <input type="password">'),
  bullet('<vscode-dropdown> replaces <select>'),
  bullet('<vscode-text-area> replaces <textarea>'),
  bullet('<vscode-checkbox> replaces <input type="checkbox">'),
  body('The toolkit automatically inherits the user\'s active VS Code theme — light, dark, and high-contrast — without any custom CSS. This eliminates the need to maintain CSS variables for form elements.'),
  body('Estimated effort: 1–2 days.'),

  h2('3.2 Phase 2 — User Experience Improvements'),
  body('Phase 2 targets the highest-impact user-facing changes. These should follow Phase 1 but can be partially started in parallel if resources allow.', { bold: true }),

  h3('3.2.1 Visual Step Progress Indicator'),
  body('Replace the plain text progress label with a horizontal stepper component showing all four steps: (1) Requirement Enhancement, (2) Test Scenarios, (3) Test Cases, (4) Automation Analysis. Each step displays one of three states:'),
  bullet('Pending — grey, unfilled'),
  bullet('In Progress — blue, animated pulse'),
  bullet('Completed — teal checkmark'),
  body('Estimated effort: 0.5 days.'),

  h3('3.2.2 Color-Coded Xray Push Preview'),
  body('Replace the unordered list with a styled table where each row has a left border color indicating its status:'),
  bullet('Green left border — Valid, ready to push'),
  bullet('Amber left border — Duplicate, will be skipped'),
  bullet('Red left border — Validation error, with inline fix hint'),
  body('For validation errors, show the specific missing field inline (e.g. "Missing: expectedResult") so users can fix the test case before pushing rather than discovering the error post-push.'),
  body('Estimated effort: 0.5 days.'),

  h3('3.2.3 Collapsible Enhancement Cards'),
  body('The Requirement Enhancement tab shows six category cards simultaneously. Add a collapse/expand toggle to each card header so users can minimize categories they have already reviewed. Persist collapse state in local component state (not session storage — it resets on Generate, which is the desired behavior).'),
  body('Estimated effort: 0.5 days.'),

  h3('3.2.4 Actionable Empty States'),
  body('Replace the three plain-text "No X generated yet" messages with structured empty-state blocks containing:'),
  bullet('A descriptive title ("No Test Scenarios Yet")'),
  bullet('A one-line instruction ("Click Generate Scenarios above to start.")'),
  bullet('An optional secondary note for dependency ("Tip: You can use enhancement output to improve scenario quality.")'),
  body('Estimated effort: 0.5 days.'),

  h3('3.2.5 Automation Candidate Cards'),
  body('Replace pipe-delimited text lines in the Automation Candidates tab with small cards per item showing:'),
  bullet('Test case title (not just ID)'),
  bullet('Priority badge with color: Green = Automate First, Amber = Automate Second, Grey = Manual/Deferred'),
  bullet('ROI score and Feasibility score as compact inline labels'),
  bullet('Exclusion reason displayed when candidate = false'),
  body('Estimated effort: 1 day.'),

  h2('3.3 Phase 3 — Productivity Polish'),
  body('Phase 3 improvements are lower-risk enhancements that can be added incrementally without affecting core workflow.', { bold: true }),

  h3('3.3.1 Copy-to-Clipboard Buttons'),
  body('Add a small copy icon button next to each Gherkin <pre> block and each enhancement list item. On click, copy the content to the clipboard and briefly show "Copied!" confirmation.'),
  body('Estimated effort: 0.5 days.'),

  h3('3.3.2 Item Count Badges on Tab Buttons'),
  body('Display a small numeric badge on each tab button when the corresponding data is non-empty — for example "Test Cases (12)". This gives users at-a-glance status of what has been generated without switching tabs.'),
  body('Estimated effort: 0.5 days.'),

  h3('3.3.3 Test Case Table Layer Filter'),
  body('Add three filter chip toggles above the Structured Cases table (Unit, API, UI) that hide rows not matching the selected layers. Chips are multi-selectable; all layers shown by default.'),
  body('Estimated effort: 0.5 days.'),

  h3('3.3.4 Settings Visual Grouping'),
  body('Visually separate the twelve Settings fields into three distinct sections with subtle background differentiation:'),
  bullet('Section A: LLM Configuration — Provider, Model, API Key'),
  bullet('Section B: Jira Configuration — URL, Project Key, Email, API Token, Xray credentials'),
  bullet('Section C: Xray Push Controls — Batch Size, Delay, Max Retries'),
  body('Estimated effort: 0.25 days (CSS-only change).'),

  divider(),

  // 4. IMPLEMENTATION PLAN
  h1('4. Implementation Plan'),

  h2('4.1 Phase Summary'),

  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          headerCell('Phase'),
          headerCell('Items'),
          headerCell('Estimated Effort'),
          headerCell('Risk'),
        ],
      }),
      new TableRow({ children: [
        dataCell('Phase 1', GREEN_BG, AlignmentType.CENTER),
        dataCell('Decompose App.tsx · Error Boundary · webview-ui-toolkit'),
        dataCell('3–4 days', WHITE, AlignmentType.CENTER),
        priorityCell('Low', GREEN_BG, '1A6B30'),
      ]}),
      new TableRow({ children: [
        dataCell('Phase 2', AMBER_BG, AlignmentType.CENTER),
        dataCell('Step progress · Push preview · Collapsible cards · Empty states · Automation cards'),
        dataCell('2–3 days', WHITE, AlignmentType.CENTER),
        priorityCell('Low', GREEN_BG, '1A6B30'),
      ]}),
      new TableRow({ children: [
        dataCell('Phase 3', LIGHT_BLUE, AlignmentType.CENTER),
        dataCell('Copy buttons · Tab badges · Layer filter · Settings grouping'),
        dataCell('1–2 days', WHITE, AlignmentType.CENTER),
        priorityCell('Very Low', GREEN_BG, '1A6B30'),
      ]}),
    ],
  }),

  new Paragraph({ spacing: { before: 120, after: 60 }, children: [] }),

  h2('4.2 Quick Wins (No Phase 1 Required)'),
  body('The following items can be implemented immediately without waiting for the App.tsx decomposition:'),
  bullet('Settings visual grouping — CSS-only, zero functional risk'),
  bullet('Actionable empty states — isolated paragraph replacements, 10–15 lines per tab'),
  bullet('Xray Push Preview color-coded rows — isolated to one section of testCases tab'),

  h2('4.3 Dependencies'),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          headerCell('Item'),
          headerCell('Depends On'),
          headerCell('New Package Required'),
        ],
      }),
      new TableRow({ children: [
        dataCell('webview-ui-toolkit'),
        dataCell('Phase 1.1 (decomposed components)'),
        dataCell('@vscode/webview-ui-toolkit'),
      ]}),
      new TableRow({ children: [
        dataCell('Error Boundaries'),
        dataCell('None — can be added any time'),
        dataCell('None'),
      ]}),
      new TableRow({ children: [
        dataCell('Step Progress Stepper'),
        dataCell('Phase 1.1 recommended first'),
        dataCell('None'),
      ]}),
      new TableRow({ children: [
        dataCell('All Phase 3 items'),
        dataCell('Phase 1 strongly recommended first'),
        dataCell('None'),
      ]}),
    ],
  }),

  divider(),

  // 5. RISK ASSESSMENT
  h1('5. Risk Assessment'),

  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          headerCell('Risk'),
          headerCell('Likelihood'),
          headerCell('Impact'),
          headerCell('Mitigation'),
        ],
      }),
      new TableRow({ children: [
        dataCell('Phase 1 refactor introduces regression'),
        priorityCell('Low', AMBER_BG, '7A4A00'),
        priorityCell('Medium', AMBER_BG, '7A4A00'),
        dataCell('Run existing build and typecheck pipeline after each file split; no logic changes in Phase 1'),
      ]}),
      new TableRow({ children: [
        dataCell('webview-ui-toolkit visual differences from current styling'),
        priorityCell('Low', AMBER_BG, '7A4A00'),
        priorityCell('Low', GREEN_BG, '1A6B30'),
        dataCell('Toolkit inherits VS Code theme natively; spot-check light and dark themes after adoption'),
      ]}),
      new TableRow({ children: [
        dataCell('Increased bundle size from toolkit'),
        priorityCell('Low', GREEN_BG, '1A6B30'),
        priorityCell('Low', GREEN_BG, '1A6B30'),
        dataCell('Toolkit is tree-shakeable; only used components are bundled'),
      ]}),
    ],
  }),

  divider(),

  // 6. SUCCESS METRICS
  h1('6. Success Metrics'),
  body('After implementation, success will be measured against the following criteria:'),
  bullet('App.tsx reduced from 1,036 lines to under 200 lines (tab router + shared state only)'),
  bullet('Zero full-panel crashes due to single-tab JS errors (Error Boundary coverage)'),
  bullet('All form elements visually consistent across VS Code light, dark, and high-contrast themes'),
  bullet('Generate All workflow shows a visual stepper with real-time step completion status'),
  bullet('Xray Push Preview differentiates valid / duplicate / error rows at a glance'),
  bullet('All empty states include a clear action instruction'),

  divider(),

  // 7. GLOSSARY
  h1('7. Glossary'),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: [ headerCell('Term'), headerCell('Definition') ] }),
      new TableRow({ children: [ dataCell('Error Boundary', GRAY_HDR), dataCell('A React component that catches JavaScript errors in its child tree and displays a fallback UI instead of crashing') ] }),
      new TableRow({ children: [ dataCell('postMessage', GRAY_HDR), dataCell('The communication protocol between the VS Code Extension Host and the webview panel — the only allowed data channel') ] }),
      new TableRow({ children: [ dataCell('webview-ui-toolkit', GRAY_HDR), dataCell('Official Microsoft library providing VS Code-themed UI components for webview panels') ] }),
      new TableRow({ children: [ dataCell('Gherkin', GRAY_HDR), dataCell('Given/When/Then structured test syntax used by Cucumber and Xray for BDD test cases') ] }),
      new TableRow({ children: [ dataCell('Xray', GRAY_HDR), dataCell('Atlassian Jira plugin for test management; TraceLM pushes generated test cases via Xray Cloud REST API') ] }),
      new TableRow({ children: [ dataCell('Deduplication', GRAY_HDR), dataCell('SHA-256 fingerprint comparison that prevents the same test case from being pushed to Xray more than once') ] }),
    ],
  }),

  new Paragraph({ spacing: { before: 200 }, children: [] }),
  body('— End of Document —', { color: MID_GRAY, italics: true }),
];

// ── ASSEMBLE ──────────────────────────────────────────────────────────────────
const doc = new Document({
  creator: 'TraceLM',
  title: 'TraceLM UI Re-Assessment Technical Document',
  description: 'Prioritized UI improvement recommendations for the TraceLM VS Code extension',
  styles: {
    paragraphStyles: [
      {
        id: 'Normal',
        name: 'Normal',
        run: { font: 'Arial', size: 20 },
      },
    ],
  },
  sections: [
    coverSection,
    {
      properties: {
        page: {
          margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'TraceLM UI Re-Assessment  |  Confidential  |  Page ', size: 16, color: MED_TEXT, font: 'Arial' }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MED_TEXT, font: 'Arial' }),
                new TextRun({ text: ' of ', size: 16, color: MED_TEXT, font: 'Arial' }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: MED_TEXT, font: 'Arial' }),
              ],
            }),
          ],
        }),
      },
      children: bodyChildren,
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(OUT, buffer);
  console.log('Generated:', OUT);
});
