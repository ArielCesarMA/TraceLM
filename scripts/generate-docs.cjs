const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, ExternalHyperlink, LevelFormat,
  TableOfContents
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
const AMBER_BG   = 'FFF8E6';
const AMBER_BDR  = 'D4860B';
const PAGE_W     = 9360;

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
    children: [new TextRun({ text, bold: true, size: 22, color: MED_TEXT, font: 'Arial' })],
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 40, after: 120 },
    children: [new TextRun({ text, size: 20, color: DARK_TEXT, font: 'Arial', ...opts })],
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: 'bullets', level },
    spacing: { before: 20, after: 20 },
    children: [new TextRun({ text, size: 20, color: DARK_TEXT, font: 'Arial' })],
  });
}

function numbered(text, level = 0) {
  return new Paragraph({
    numbering: { reference: 'numbers', level },
    spacing: { before: 20, after: 20 },
    children: [new TextRun({ text, size: 20, color: DARK_TEXT, font: 'Arial' })],
  });
}

function space(before = 80) {
  return new Paragraph({ spacing: { before, after: 0 }, children: [] });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function callout(text, bgColor = LIGHT_BLUE, borderColor = BLUE) {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: borderColor, space: 8 } },
    shading: { fill: bgColor, type: ShadingType.CLEAR },
    indent: { left: 240 },
    children: [new TextRun({ text, size: 19, color: DARK_TEXT, font: 'Arial', italics: true })],
  });
}

function hdrRow(cells, widths) {
  return new TableRow({
    tableHeader: true,
    children: cells.map((text, i) =>
      new TableCell({
        borders: cellBorder(MID_GRAY),
        width: { size: widths[i], type: WidthType.DXA },
        shading: { fill: BLUE, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({ text, bold: true, size: 18, color: WHITE, font: 'Arial' })],
        })],
      })
    ),
  });
}

function dataRow(cells, widths, shade = false) {
  return new TableRow({
    children: cells.map((text, i) =>
      new TableCell({
        borders: cellBorder(MID_GRAY),
        width: { size: widths[i], type: WidthType.DXA },
        shading: { fill: shade ? GRAY_HDR : WHITE, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({ text: text || '', size: 19, color: DARK_TEXT, font: 'Arial' })],
        })],
      })
    ),
  });
}

function table(headers, rows, widths) {
  const totalW = widths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      hdrRow(headers, widths),
      ...rows.map((r, i) => dataRow(r, widths, i % 2 === 0)),
    ],
  });
}

function badge(text, color = BLUE) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text: `  ${text}  `, size: 18, color: WHITE, font: 'Arial',
      bold: true, highlight: color === BLUE ? 'darkBlue' : 'green' })],
  });
}

function sectionLabel(text) {
  return new Paragraph({
    spacing: { before: 80, after: 40 },
    shading: { fill: LIGHT_TEAL, type: ShadingType.CLEAR },
    indent: { left: 120, right: 120 },
    children: [new TextRun({ text, bold: true, size: 19, color: TEAL, font: 'Arial' })],
  });
}

const children = [

  // ── COVER ──────────────────────────────────────────────────────────────
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1440, after: 240 },
    children: [new TextRun({ text: 'TraceLM', bold: true, size: 64, color: BLUE, font: 'Arial' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 120 },
    children: [new TextRun({ text: 'Product & Technical Documentation Package', size: 28, color: MED_TEXT, font: 'Arial' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
    children: [new TextRun({ text: 'Version 0.0.4  ·  June 2026  ·  Confidential', size: 20, color: MED_TEXT, font: 'Arial', italics: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text: 'VS Code Extension  ·  TypeScript  ·  React 18  ·  LLM-Powered  ·  Jira / Xray', size: 19, color: TEAL, font: 'Arial' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 1440 },
    children: [new ExternalHyperlink({
      link: 'https://github.com/ArielCesarMA/TraceLM',
      children: [new TextRun({ text: 'github.com/ArielCesarMA/TraceLM', size: 19, color: BLUE, font: 'Arial', underline: {} })],
    })],
  }),
  pageBreak(),

  // ── TABLE OF CONTENTS ──────────────────────────────────────────────────
  h1('Table of Contents'),
  new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-3' }),
  pageBreak(),

  // ── 1. EXECUTIVE SUMMARY ───────────────────────────────────────────────
  h1('1. Executive Summary'),
  para('TraceLM is a VS Code extension that automates the end-to-end test generation and Jira/Xray management workflow. It bridges the gap between requirements documentation and executable test cases by applying large language models (LLMs) to transform unstructured requirements into structured, traceable, and Xray-ready test assets — without leaving the development environment.'),

  h2('1.1 Business Problem'),
  para('QA teams spend significant effort manually writing test scenarios, test cases, and automation assessments from requirements documents. This process is slow, inconsistent, and lacks traceability to source requirements. TraceLM eliminates this bottleneck by generating an entire test artifact suite from raw requirements in a single workflow.'),

  h2('1.2 Business Value'),
  table(
    ['Value Dimension', 'Description'],
    [
      ['Faster delivery',    'Requirement-to-Xray in one session with no context switching between tools'],
      ['Full traceability',  'Every test case is linked to a requirement ID and scenario ID'],
      ['Deduplication',      'SHA-256 fingerprinting prevents re-pushing identical test cases across sessions'],
      ['Provider agnostic',  'OpenAI, Anthropic, and Google Gemini supported interchangeably'],
      ['Export flexibility', '.feature (Gherkin), CSV (test cases), CSV (automation), JSON (automation)'],
    ],
    [2800, 6560]
  ),

  h2('1.3 Target Users'),
  table(
    ['Role', 'Primary Use'],
    [
      ['QA Engineers',            'Generate, refine, and push test cases to Xray'],
      ['Business Analysts',       'Review enhancement output and clarifying questions for stakeholders'],
      ['Tech Leads / Architects', 'Review automation analysis — feasibility, ROI, and layer strategy'],
      ['Project Managers',        'Track test coverage from requirements through to Xray'],
      ['Support Teams',           'Diagnose push failures via push history and validation error messages'],
    ],
    [2800, 6560]
  ),

  h2('1.4 Key Metrics'),
  table(
    ['Metric', 'Value'],
    [
      ['Current version',    '0.0.4'],
      ['LLM providers',      '3 (OpenAI, Anthropic, Gemini)'],
      ['Export formats',     '4 (.feature, CSV test cases, CSV automation, JSON automation)'],
      ['Workflow steps',     '9 (Configure → Requirements → Enhance → Scenarios → Test Cases → Automation → Preview → Push → Export)'],
      ['Supported doc types','4 (.txt, .md, .docx, .pdf)'],
      ['Min VS Code',        '1.90+'],
      ['Min Node.js',        '20+'],
    ],
    [3200, 6160]
  ),
  pageBreak(),

  // ── 2. PRODUCT CAPABILITIES ────────────────────────────────────────────
  h1('2. Product Capabilities'),

  h2('2.1 End-to-End Workflow'),
  para('Steps 1–5 can be triggered individually or all at once via the "Generate All Artifacts" button, which chains each step sequentially using response-driven refs to guarantee fresh data flows between stages.'),
  space(),
  table(
    ['Step', 'Name', 'Description'],
    [
      ['1', 'Requirements',           'Ingest requirements via free text, file upload, or Jira pull'],
      ['2', 'Requirement Enhancement','LLM analysis across six quality dimensions'],
      ['3', 'Test Scenarios',         'Structured scenarios with requirement traceability'],
      ['4', 'Test Cases',             'Executable test cases with Gherkin and layer assignment'],
      ['5', 'Automation Analysis',    'Six-step A–F assessment with feasibility and ROI scores'],
      ['6', 'Preview & Validate',     'Validation errors, duplicates, and ready-to-push counts shown'],
      ['7', 'Xray Push',              'Batch push with rate-limit handling and retry support'],
      ['8', 'Retry Failed',           'Re-run only failed cases without duplicating successes'],
      ['9', 'Export',                 'Download Gherkin, CSV, or JSON artifacts'],
    ],
    [600, 2400, 6360]
  ),

  h2('2.2 Requirements Ingestion (Tab 1)'),
  para('Four input modes are supported:'),
  bullet('Free text — paste BRD, SRS, user stories, or any requirements prose directly'),
  bullet('File upload — .txt, .md, .docx, .pdf files parsed and combined automatically'),
  bullet('Jira pull — fetch by single issue key, comma-separated keys, or all children of an epic'),
  bullet('Story picker — search and multi-select stories from the configured Jira project'),
  space(80),
  para('A review checkbox must be confirmed before downstream generation is enabled. This ensures requirements have been reviewed before artifacts are created.'),

  h2('2.3 Requirement Enhancement (Tab 2)'),
  para('LLM analysis of raw requirements against six quality dimensions:'),
  table(
    ['Dimension', 'Description'],
    [
      ['Missing functional requirements',     'Identifies gaps in stated functional behavior'],
      ['Missing non-functional requirements', 'Performance, scalability, security, accessibility gaps'],
      ['Best practice recommendations',       'Industry-standard improvements to the requirements'],
      ['Market / competitor benchmarks',      'Competitor or market standard expectations'],
      ['Risk identification',                 'Potential issues introduced by the requirements as written'],
      ['Clarifying questions',                'Ambiguities requiring stakeholder input before proceeding'],
    ],
    [3200, 6160]
  ),

  h2('2.4 Test Scenario Generation (Tab 3)'),
  para('Each scenario includes:'),
  bullet('ID and title'),
  bullet('Priority (High / Medium / Low)'),
  bullet('Requirement references — traceability to source requirements'),
  bullet('Preconditions'),
  bullet('Step-by-step flow'),
  bullet('Expected outcome'),

  h2('2.5 Test Case Generation (Tab 4)'),
  para('Each test case includes:'),
  bullet('ID, title, and linked scenario ID'),
  bullet('Gherkin syntax (BDD Feature/Scenario format)'),
  bullet('Preconditions, numbered steps, expected result'),
  bullet('Test data'),
  bullet('Layer assignment — Unit, API, or UI'),
  bullet('Priority — High, Medium, or Low'),

  h2('2.6 Automation Analysis (Tab 4)'),
  para('A six-step (A–F) automation architecture assessment is run per test case:'),
  table(
    ['Step', 'Activity', 'Output'],
    [
      ['A', 'Review',     'Requirements and scenario coverage assessment'],
      ['B', 'Prioritize', 'Identify high-value automation candidates'],
      ['C', 'Exclude',    'Flag poor candidates with explicit exclusion rationale'],
      ['D', 'Evaluate',   'Feasibility score 1–5 per test case'],
      ['E', 'Calculate',  'ROI score 1–10 per test case'],
      ['F', 'Categorize', 'Layer (Unit/API/UI) and recommended execution order'],
    ],
    [600, 2000, 6760]
  ),

  h3('2.6.1 Feasibility Score (1–5)'),
  para('The Feasibility score answers: "How practical and realistic is it to actually automate this test case right now?" It measures technical difficulty and implementation readiness, independent of business value.'),
  space(60),
  table(
    ['Score', 'Rating', 'Meaning'],
    [
      ['1', 'Not feasible',    'Automation is impractical or impossible with current tools and setup'],
      ['2', 'Low',             'Significant barriers exist — complex UI, third-party dependencies, or flaky test data'],
      ['3', 'Moderate',        'Automatable but requires notable effort, setup, or tooling investment'],
      ['4', 'High',            'Straightforward to automate with existing tools and test infrastructure'],
      ['5', 'Fully feasible',  'Can be automated immediately with minimal effort'],
    ],
    [900, 1800, 6660]
  ),
  space(60),
  para('Factors the AI considers when assigning the Feasibility score:'),
  bullet('Test layer — Unit tests score 4–5 (predictable, isolated); UI tests score 1–3 (environment-dependent, brittle)'),
  bullet('External dependencies — Tests requiring third-party systems, live APIs, or hardware score lower'),
  bullet('Data complexity — Tests needing specific database states or dynamic test data score lower'),
  bullet('Step clarity — Vague or ambiguous steps make automation harder, reducing the score'),
  bullet('Precondition complexity — Many preconditions that are hard to set up programmatically lower feasibility'),
  bullet('Environment stability — Tests tied to unstable UI elements or frequently changing screens score lower'),

  h3('2.6.2 ROI Score (1–10)'),
  para('The ROI score answers: "How much value does automating this test case return relative to the effort it takes to build and maintain it?" It measures business return, not technical difficulty.'),
  space(60),
  table(
    ['Score', 'Rating', 'Meaning'],
    [
      ['1–3',  'Low ROI',     'Costly to automate, rarely catches bugs, or runs infrequently — not a priority'],
      ['4–6',  'Medium ROI',  'Worth automating eventually but not urgent'],
      ['7–9',  'High ROI',    'Strong return — should be in the automation backlog soon'],
      ['10',   'Maximum ROI', 'Automate this first — highest return with no question'],
    ],
    [900, 1800, 6660]
  ),
  space(60),
  para('Factors the AI considers when assigning the ROI score:'),
  bullet('Execution frequency — a test that runs every build is worth more than one that runs monthly'),
  bullet('Bug detection history — tests covering historically unstable or high-risk areas score higher'),
  bullet('Manual effort saved — complex multi-step tests that are painful to run manually score higher'),
  bullet('Maintenance cost — UI tests that break on every design change score lower than stable API or unit tests'),
  bullet('Requirement criticality — tests covering core business logic or high-risk flows score higher'),
  bullet('Layer — Unit and API tests typically score higher than UI tests because they are cheaper to maintain'),

  h3('2.6.3 How Feasibility and ROI Combine'),
  para('Feasibility asks "Can we automate it?" and ROI asks "Should we automate it?" Both scores are needed to produce a reliable priority recommendation. Neither score alone is sufficient.'),
  space(60),
  table(
    ['Feasibility', 'ROI', 'Priority Recommendation', 'Rationale'],
    [
      ['5 (Fully feasible)', '9 (High)',    'Automate First',    'Easy to build and high return — the ideal automation candidate'],
      ['2 (Low)',            '9 (High)',    'Automate Second',   'Valuable but needs groundwork — worth the investment once infrastructure is ready'],
      ['5 (Fully feasible)', '2 (Low)',     'Manual / Deferred', 'Easy to build but not worth the investment — run manually'],
      ['1 (Not feasible)',   '2 (Low)',     'Manual / Deferred', 'Hard to build and low value — do not automate'],
      ['3 (Moderate)',       '7 (High)',    'Automate Second',   'Good value but requires effort — plan for next automation sprint'],
    ],
    [2000, 1400, 2200, 3760]
  ),
  space(60),
  callout('Think of it this way — ROI tells you if the trip is worth taking; Feasibility tells you if the road is paved. You need both to make a sound automation investment decision.'),

  h3('2.6.4 Understanding "Automate Second"'),
  para('"Automate Second" means: this test case is valuable to automate — but something is blocking you from doing it right now. The ROI score is high, indicating strong business return, but the Feasibility score is low, meaning real technical barriers are preventing automation today.'),
  space(60),
  para('Common reasons for low Feasibility despite high ROI:'),
  bullet('The test depends on a third-party service with no sandbox or mock environment available'),
  bullet('It requires complex database states that are difficult to set up reliably in a test harness'),
  bullet('It is a UI test tied to unstable or frequently redesigned screens — selectors break constantly'),
  bullet('The test steps are too vague or environment-dependent to script without significant rework'),
  space(80),
  para('Recommended actions when a test case is flagged "Automate Second":'),
  table(
    ['Action', 'Detail'],
    [
      ['Do not skip it',               'A high ROI score means this is worth solving — it is not a "never automate" case'],
      ['Identify and fix the blocker', 'Invest in the infrastructure: build a test data factory, set up stub/mock services, or stabilize UI selectors'],
      ['Keep running it manually',     'Do not leave a high-value test unexecuted while waiting for the blocker to be resolved'],
      ['Promote it next sprint',       'Once the blocker is cleared, this case moves to top priority — Automate First'],
    ],
    [2800, 6560]
  ),
  space(60),
  para('"Automate Second" vs. "Automate First" — the key difference:'),
  table(
    ['',                  'Automate First',                      'Automate Second'],
    [
      ['ROI',             'High',                                'High'],
      ['Feasibility',     'High (4–5)',                          'Low (1–2)'],
      ['Blocker',         'None — ready to build now',           'Yes — technical barrier must be resolved first'],
      ['Immediate action','Add to current automation sprint',    'Fix the blocker, then add to the next sprint'],
      ['Risk of skipping','Missed efficiency gain',              'High-value test left unautomated or run manually indefinitely'],
    ],
    [2200, 3580, 3580]
  ),
  space(60),
  callout('In plain language: the system is telling you — "This one is worth the effort. Deal with what is in the way, then come back to it." It is your high-priority backlog item, not a throwaway.'),

  h2('2.7 Xray Push Lifecycle'),
  numbered('Preview — validates each case, shows counts for valid, validation-error, and duplicate'),
  numbered('Fingerprint check — SHA-256 hash of (scenarioId + title + steps) vs. push history'),
  numbered('Batch push — configurable batch size, inter-batch delay, and retry count'),
  numbered('Rate-limit handling — exponential backoff (base 1200ms + jitter) on 429/503 responses'),
  numbered('Retry failed — re-run only failed cases without re-pushing successes'),
  space(),
  callout('Push history is persisted in VS Code globalState and survives panel disposal and VS Code restarts. Up to 5,000 records are retained, trimmed by recency.'),

  h2('2.8 Export Formats'),
  table(
    ['Format', 'Content', 'Target Audience'],
    [
      ['.feature file',        'Gherkin BDD scenarios for all test cases',                'Automation engineers, CI pipelines'],
      ['CSV (test cases)',     'All test case fields including Detailed Steps and Test Data', 'Test managers, spreadsheet users'],
      ['CSV (automation)',     'Feasibility, ROI, layer, and priority per case',           'Tech leads, automation planners'],
      ['JSON (automation)',    'Full automation analysis object',                           'Tool integrations, audits'],
    ],
    [2200, 4400, 2760]
  ),
  pageBreak(),

  // ── 3. TECHNICAL ARCHITECTURE ──────────────────────────────────────────
  h1('3. Technical Architecture'),

  h2('3.1 Two-Process Design'),
  para('TraceLM follows the standard VS Code extension architecture. A Node.js extension host has access to the VS Code API and performs all privileged operations. A sandboxed React webview renders the UI. The two processes communicate exclusively via the VS Code postMessage protocol.'),

  h2('3.2 Extension Host (src/)'),
  table(
    ['Module', 'File', 'Responsibility'],
    [
      ['Entry point',     'extension.ts',                       'Registers the tracelm.open command; minimal entry point'],
      ['Orchestrator',    'panels/TraceLMPanel.ts',             'Central hub — manages webview lifecycle, routes all postMessage calls, holds in-memory caches'],
      ['LLM layer',       'services/llm/',                      'LLMProvider interface + OpenAI, Anthropic, Gemini implementations; LLMService dispatcher'],
      ['Jira/Xray layer', 'services/jira/',                     'JiraXrayService (REST client), BatchProcessor (rate-limit and retry logic)'],
      ['Document layer',  'services/document/DocumentParser.ts','Parse .txt, .md, .docx (mammoth), .pdf (pdf-parse) to plain text'],
      ['Storage layer',   'services/storage/PushHistoryStore.ts','Fingerprint dedup persisted in VS Code globalState'],
      ['Fingerprinting',  'utils/fingerprintUtil.ts',           'SHA-256 deterministic hash over normalized (scenarioId + title + steps)'],
      ['Prompts',         'prompts/',                           'Four LLM system prompt files loaded at runtime via fs.readFileSync'],
      ['Types',           'types/index.ts',                     'Shared TypeScript types for settings, artifacts, and message payloads'],
    ],
    [1800, 3200, 4360]
  ),

  h2('3.3 React Webview (webview-ui/)'),
  table(
    ['File', 'Responsibility'],
    [
      ['src/App.tsx',    'Single-component UI (~45KB) — all state, message handlers, tab routing, and form controls'],
      ['src/styles.css', 'VS Code CSS variable–based theming that auto-adapts to light, dark, and high-contrast themes'],
      ['index.html',     'Webview HTML shell with Content Security Policy meta tag'],
    ],
    [2800, 6560]
  ),

  h2('3.4 Message Protocol'),
  para('All inter-process communication is typed and command-keyed. The webview sends a command string with a payload object. The extension host routes by command name, executes the relevant service, and posts a response command back.'),
  space(),
  table(
    ['Category', 'Command (Web → Host)', 'Response (Host → Web)'],
    [
      ['Settings',      'settings:load, settings:save, settings:testLlm, settings:testJira', 'settings:loaded, settings:saved, settings:testResult'],
      ['Requirements',  'requirements:parseFiles, requirements:pullJira, requirements:searchStories, requirements:enhance', 'requirements:filesParsed, requirements:jiraPulled, requirements:storiesResult, requirements:enhanced, requirements:error'],
      ['Scenarios',     'scenarios:generate',                'scenarios:generated'],
      ['Test Cases',    'testCases:generate',                'testCases:generated'],
      ['Automation',    'automation:analyze',                'automation:analyzed'],
      ['Xray Push',     'xray:previewPush, xray:pushTestCases, xray:clearPushHistory', 'xray:previewResult, xray:pushProgress, xray:pushed, xray:historyCleared'],
    ],
    [1400, 3800, 4160]
  ),

  h2('3.5 In-Memory Caching'),
  table(
    ['Cache', 'Key', 'Max Size', 'Eviction'],
    [
      ['Jira pull cache',    'Hash of URL + project + query', 'Panel lifetime',  'Panel dispose'],
      ['LLM response cache', 'Hash of provider + model + prompt', '30 entries', 'FIFO'],
    ],
    [2200, 3600, 1800, 1760]
  ),

  h2('3.6 Build System'),
  table(
    ['Target', 'Tool', 'Output'],
    [
      ['Extension host', 'esbuild 0.23', 'dist/extension.js (CommonJS, Node platform)'],
      ['React webview',  'Vite 5.3',     'webview-ui/dist/assets/index.js + index.css'],
      ['Parallel build', 'npm-run-all',  'Both targets built concurrently via npm run build'],
    ],
    [2000, 2200, 5160]
  ),
  pageBreak(),

  // ── 4. INTEGRATIONS ────────────────────────────────────────────────────
  h1('4. Integrations'),

  h2('4.1 LLM Providers'),
  table(
    ['Provider', 'Endpoint', 'Auth Method', 'Default Model', 'Max Tokens'],
    [
      ['OpenAI',    'api.openai.com/v1/chat/completions',                        'Bearer token (Authorization header)',    'gpt-4o',                   'Provider default'],
      ['Anthropic', 'api.anthropic.com/v1/messages',                             'x-api-key header + anthropic-version',  'claude-3-5-sonnet-latest', '2,000 (fixed)'],
      ['Gemini',    'generativelanguage.googleapis.com/v1beta/models/{m}:generateContent', 'Query param key',           'gemini-2.5-flash',         'Provider default'],
    ],
    [1200, 3000, 2400, 1600, 1160]
  ),
  space(60),
  para('All providers use temperature 0.2 for deterministic output. Gemini adds transient retry logic (3 attempts, exponential backoff base 1200ms + jitter) and automatic fallback to an available model on 429 / 503 / 5xx failures. Audio and TTS models are automatically filtered from the Gemini model list.'),

  h2('4.2 Jira Cloud API'),
  table(
    ['Operation', 'Endpoint', 'Method', 'Auth'],
    [
      ['Get single issue',   '/rest/api/3/issue/{key}?fields=summary,description', 'GET',  'HTTP Basic (email:token)'],
      ['Get multiple issues','POST /rest/api/3/search (JQL: key in (...))',         'POST', 'HTTP Basic (email:token)'],
      ['Get epic children',  '/rest/api/3/search (JQL: Epic Link / parent)',        'POST', 'HTTP Basic (email:token)'],
      ['Search stories',     '/rest/api/3/search (JQL: issuetype = Story)',         'POST', 'HTTP Basic (email:token)'],
    ],
    [2400, 3600, 800, 2560]
  ),
  space(60),
  para('Rich-text descriptions in Atlassian Document Format (ADF) are walked recursively to extract plain text before passing to the LLM.'),

  h2('4.3 Xray Cloud API'),
  table(
    ['Operation', 'Endpoint', 'Method', 'Auth'],
    [
      ['Authenticate',       'xray.cloud.getxray.app/api/v2/authenticate',       'POST', 'client_id + client_secret → Bearer token'],
      ['Bulk push test cases','xray.cloud.getxray.app/api/v2/import/test/bulk',  'POST', 'Bearer token (per session)'],
    ],
    [2000, 3800, 800, 2760]
  ),
  space(60),
  callout('Xray uses OAuth 2.0 client credentials. The Bearer token is obtained fresh per push session and never persisted to storage.'),

  h2('4.4 LLM Prompt Architecture'),
  table(
    ['Prompt File', 'LLM Role', 'Input', 'Output Shape'],
    [
      ['requirement-enhancement.txt', 'Senior QA strategist',   'Raw requirements text',                      'JSON: 6 arrays (gaps, NFRs, best practices, benchmarks, risks, questions)'],
      ['scenario-generation.txt',     'Expert test analyst',     'Requirements + enhancement JSON',            'JSON array of ScenarioItem objects'],
      ['test-case-generation.txt',    'QA engineer',             'Scenarios JSON array',                       'JSON array of TestCaseItem objects with Gherkin'],
      ['automation-analysis.txt',     'Automation architect',    'Requirements + scenarios + test cases',      'JSON: summary, recommendedOrder[], items[]'],
    ],
    [2400, 2000, 2400, 2560]
  ),
  space(60),
  para('All prompts are loaded at runtime from the prompts/ directory. The validate:prompts npm script checks prompt file syntax on every CI run.'),
  pageBreak(),

  // ── 5. DATA MODEL ──────────────────────────────────────────────────────
  h1('5. Data Model'),

  h2('5.1 Core Types'),
  sectionLabel('Settings'),
  table(
    ['Field', 'Storage', 'Type', 'Description'],
    [
      ['llmProvider',      'Workspace config',  'string',  'OpenAI | Anthropic | Gemini'],
      ['llmModel',         'Workspace config',  'string',  'Provider-specific model identifier'],
      ['jiraUrl',          'Workspace config',  'string',  'Jira Cloud base URL'],
      ['jiraProjectKey',   'Workspace config',  'string',  'Default Jira project key'],
      ['jiraEmail',        'Workspace config',  'string',  'Jira account email'],
      ['xrayBatchSize',    'Workspace config',  'number',  'Test cases per push batch (1–100)'],
      ['xrayBatchDelayMs', 'Workspace config',  'number',  'Delay between batches in ms (0–30000)'],
      ['xrayMaxRetries',   'Workspace config',  'number',  'Max retries on rate limit (1–10)'],
      ['llmApiKey',        'SecretStorage',     'string',  'LLM provider API key'],
      ['jiraApiToken',     'SecretStorage',     'string',  'Jira API token'],
      ['xrayClientId',     'SecretStorage',     'string',  'Xray OAuth client ID'],
      ['xrayClientSecret', 'SecretStorage',     'string',  'Xray OAuth client secret'],
    ],
    [2200, 1800, 1200, 4160]
  ),

  space(120),
  sectionLabel('Artifact Types'),
  table(
    ['Type', 'Key Fields'],
    [
      ['RequirementEnhancement', 'missingFunctional[], missingNonFunctional[], bestPractices[], marketBenchmark[], risks[], clarifyingQuestions[]'],
      ['ScenarioItem',           'id, title, priority (High/Medium/Low), requirementRefs[], preconditions[], flow[], expectedOutcome'],
      ['TestCaseItem',           'id, title, scenarioId, gherkin, preconditions[], steps[], expectedResult, testData, layer (Unit/API/UI), priority'],
      ['AutomationCandidateItem','testCaseId, candidate (bool), exclusionReason, feasibility (1–5), roiScore (1–10), layer, priority, notes'],
      ['AutomationAnalysis',     'summary (narrative), recommendedOrder[] (layer sequence), items[] (AutomationCandidateItem)'],
    ],
    [2800, 6560]
  ),

  h2('5.2 Persistence'),
  table(
    ['Store', 'Mechanism', 'Key', 'Max Records', 'Trimming'],
    [
      ['Push history', 'VS Code globalState', 'tracelm.xrayPushHistory', '5,000', 'Oldest pushedAt timestamp removed first'],
    ],
    [1600, 2200, 2800, 1400, 1360]
  ),
  space(60),
  para('Each push record stores: fingerprint (SHA-256), Xray test case key (e.g. PROJ-T-1), browse URL, and ISO 8601 timestamp. Records survive panel disposal and VS Code restarts.'),

  h2('5.3 Fingerprint Algorithm'),
  para('A deterministic SHA-256 hash is computed over the normalized concatenation of scenarioId + title + steps[]. Normalization applies trim() and lowercase() before hashing. Any change to these three fields produces a different fingerprint, allowing the same test case to be pushed again if its content changes.'),
  pageBreak(),

  // ── 6. CONFIGURATION ───────────────────────────────────────────────────
  h1('6. Configuration Reference'),

  h2('6.1 VS Code Settings'),
  table(
    ['Setting Key', 'Type', 'Default', 'Range / Values'],
    [
      ['tracelm.llmProvider',      'string', 'OpenAI', 'OpenAI | Anthropic | Gemini'],
      ['tracelm.llmModel',         'string', '""',     'Provider-specific model name'],
      ['tracelm.jiraUrl',          'string', '""',     'https://your-domain.atlassian.net'],
      ['tracelm.jiraProjectKey',   'string', '""',     'e.g. PROJ'],
      ['tracelm.jiraEmail',        'string', '""',     'Jira account email address'],
      ['tracelm.xrayBatchSize',    'number', '10',     '1 – 100'],
      ['tracelm.xrayBatchDelayMs', 'number', '1000',   '0 – 30000 ms'],
      ['tracelm.xrayMaxRetries',   'number', '3',      '1 – 10'],
    ],
    [3000, 900, 1200, 4260]
  ),
  space(60),
  callout('API keys and tokens are never stored in workspace configuration. They are written exclusively to VS Code SecretStorage (OS-native keychain / credential store).', AMBER_BG, AMBER_BDR),

  h2('6.2 Supported LLM Models'),
  table(
    ['Provider', 'Available Models'],
    [
      ['OpenAI',    'gpt-4o, gpt-4.1, gpt-4.1-mini, gpt-4o-mini'],
      ['Anthropic', 'claude-3-5-sonnet-latest, claude-3-5-haiku-latest, claude-3-opus-latest'],
      ['Gemini',    'gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash, gemini-2.0-flash-001, gemini-2.0-flash-lite, gemini-2.0-flash-lite-001'],
    ],
    [1800, 7560]
  ),
  pageBreak(),

  // ── 7. SECURITY CONTROLS ───────────────────────────────────────────────
  h1('7. Security Controls'),

  h2('7.1 Credential Management'),
  table(
    ['Control', 'Mechanism', 'Scope'],
    [
      ['API key storage',      'VS Code SecretStorage (OS-native keychain)', 'LLM API key, Jira API token, Xray client ID + secret'],
      ['Config storage',       'VS Code workspace configuration',            'Non-secret defaults only (provider, model name, URL, batch tuning)'],
      ['No committed secrets', '.gitignore excludes .env and secret files',  'Repository and CI/CD'],
    ],
    [2200, 4000, 3160]
  ),

  h2('7.2 Authentication'),
  table(
    ['Service', 'Method', 'Notes'],
    [
      ['Jira Cloud',  'HTTP Basic Auth (email:apiToken, Base64 encoded)', 'Token retrieved from SecretStorage per request'],
      ['Xray Cloud',  'OAuth 2.0 client credentials (client_id + secret → Bearer token)', 'Token obtained fresh per push session, never persisted'],
      ['OpenAI',      'Bearer token in Authorization header',             'Key from SecretStorage'],
      ['Anthropic',   'x-api-key header + anthropic-version header',      'Key from SecretStorage'],
      ['Gemini',      'API key as query parameter',                        'Key from SecretStorage'],
    ],
    [1600, 4200, 3560]
  ),

  h2('7.3 Webview Content Security Policy'),
  para('The webview HTML applies the following CSP:'),
  bullet("default-src 'none' — blocks all resource loading by default"),
  bullet('img-src {cspSource} https: — allows images from VS Code and HTTPS'),
  bullet('style-src {cspSource} — allows stylesheets from the extension only'),
  bullet("script-src 'nonce-{random}' — scripts require a per-load random nonce; blocks inline scripts and eval"),

  h2('7.4 Input Validation'),
  table(
    ['Validation Point', 'Checks Applied'],
    [
      ['Test case pre-push',   'Required fields: id, title, scenarioId, steps (non-empty), expectedResult, priority'],
      ['Jira URL',             'HTTPS regex check before any Jira API call'],
      ['File uploads',         'MIME type and file extension verification before parsing'],
      ['Batch configuration',  'Min/max constraints enforced: batchSize (1–100), delayMs (0–30000), maxRetries (1–10)'],
    ],
    [2800, 6560]
  ),

  h2('7.5 Audit and Logging'),
  bullet('Push history persisted with ISO timestamps for each successful push'),
  bullet('Validation errors reported to UI per test case before push'),
  bullet('Rate-limit retry attempts shown in real-time progress messages'),
  bullet('No credentials or PII appear in any progress, error, or history message'),
  bullet('Dependency security audit (npm audit --omit=dev --audit-level=high) runs on every CI build and release'),
  pageBreak(),

  // ── 8. CI/CD PIPELINE ─────────────────────────────────────────────────
  h1('8. CI/CD Pipeline'),

  h2('8.1 CI Workflow — All PRs and Pushes to Main'),
  table(
    ['Step', 'Command', 'Description'],
    [
      ['1', 'npm ci && npm ci --prefix webview-ui', 'Install dependencies with lockfile enforcement'],
      ['2', 'node scripts/validate-prompts.cjs',    'Verify all four LLM prompt files are valid'],
      ['3', 'eslint ... --max-warnings=0',           'Lint extension and webview source; zero warnings allowed'],
      ['4', 'tsc --noEmit (both targets)',           'TypeScript strict type check for extension and webview'],
      ['5', 'npm run build (parallel)',              'esbuild (extension) + Vite (webview) in parallel'],
    ],
    [600, 3200, 5560]
  ),
  space(60),
  para('Main branch additionally runs: npm audit (security) and jest --coverage (test suite with coverage thresholds).'),

  h2('8.2 Release Workflow — Tag Push Matching v*'),
  table(
    ['Step', 'Action', 'Description'],
    [
      ['1',  'Verify tag = package version', 'scripts/verify-release-version.cjs confirms tag matches package.json version'],
      ['2',  'Full CI suite',                'All CI steps re-run: lint, typecheck, build'],
      ['3',  'Security audit',               'npm audit --omit=dev --audit-level=high'],
      ['4',  'Test with coverage',           'jest --coverage must pass all thresholds'],
      ['5',  'Package VSIX',                 '@vscode/vsce package generates the installable extension file'],
      ['6',  'Generate changelog',           'conventional-changelog creates CHANGELOG.md entries'],
      ['7',  'Publish GitHub release',       'GitHub release created with VSIX attached as release asset'],
    ],
    [500, 2400, 6460]
  ),

  h2('8.3 Branch Protection (main)'),
  bullet('Direct pushes to main are blocked — all changes require a pull request'),
  bullet('The build-test status check must pass before merge is permitted'),
  bullet('Husky pre-commit hook runs lint-staged: ESLint + TypeScript typecheck on staged files'),

  h2('8.4 Versioning'),
  para('Releases follow semantic versioning (SemVer). Version bumps are managed via standard-version. Commit messages follow the Conventional Commits specification, which drives automated changelog generation.'),
  pageBreak(),

  // ── 9. OPERATIONAL GUIDANCE ────────────────────────────────────────────
  h1('9. Operational Guidance'),

  h2('9.1 Prerequisites'),
  table(
    ['Requirement', 'Minimum Version / Detail'],
    [
      ['Node.js',             '20+'],
      ['VS Code',             '1.90+'],
      ['LLM API key',         'One of: OpenAI, Anthropic, or Google Gemini'],
      ['Jira Cloud account',  'API token required (not password)'],
      ['Xray Cloud',          'Client ID and Client Secret from Xray Cloud settings'],
    ],
    [2800, 6560]
  ),

  h2('9.2 First-Time Setup'),
  numbered('Install the .vsix in VS Code — Extensions → "..." menu → Install from VSIX'),
  numbered('Open Command Palette (Ctrl+Shift+P) → TraceLM: Open'),
  numbered('Go to Settings tab — enter LLM provider, model name, and API key; click Test Connection'),
  numbered('Enter Jira URL (https://your-domain.atlassian.net), email, and API token'),
  numbered('Enter Xray Client ID and Client Secret'),
  numbered('Adjust batch size and retry settings if needed (defaults: batch 10, delay 1000ms, retries 3)'),
  numbered('Go to Requirements tab — paste or upload requirements and confirm the review checkbox'),

  h2('9.3 Development Setup'),
  numbered('Clone the repository: git clone https://github.com/ArielCesarMA/TraceLM.git'),
  numbered('Install all dependencies: npm install && npm install --prefix webview-ui'),
  numbered('Open the project in VS Code'),
  numbered('Press F5 to launch the Extension Development Host with TraceLM loaded'),
  numbered('Open Command Palette → TraceLM: Open to launch the panel'),
  space(60),
  para('File changes to src/ or webview-ui/src/ are reflected after pressing F5 to restart the development host. No push/pull is needed when editing locally.'),

  h2('9.4 Known Limitations (v0.0.4)'),
  callout('These limitations are known and planned for future releases. They do not affect the core workflow.', AMBER_BG, AMBER_BDR),
  space(60),
  table(
    ['Limitation', 'Detail', 'Planned'],
    [
      ['Streaming not implemented',         'All LLM calls are completion-based; no token-by-token streaming to UI',         'Future phase'],
      ['Shape-only Jira/Xray validation',   'Settings test validates field shapes only; live API ping not implemented',       'Phase 6'],
      ['Fixed prompt templates',            'LLM prompt files are not user-customizable from within the extension',          'Future phase'],
      ['No requirement versioning',         'No diff or history between generation runs',                                     'Future phase'],
      ['No RBAC',                           'All VS Code users with the extension have identical permissions',                'Future phase'],
    ],
    [2800, 4400, 2160]
  ),

  h2('9.5 Troubleshooting'),
  table(
    ['Symptom', 'Likely Cause', 'Resolution'],
    [
      ['Generation returns empty or malformed output', 'LLM model too small or context truncated',          'Switch to a larger model (gpt-4o, gemini-2.5-flash, claude-3-5-sonnet-latest)'],
      ['Xray push fails with 429',                     'Rate limit exceeded on Xray Cloud',                 'Increase xrayBatchDelayMs or reduce xrayBatchSize in Settings'],
      ['Duplicate cases not detected',                 'Push history cleared, or test case fields changed', 'Fingerprint is sensitive to changes in scenarioId, title, or steps — any change allows re-push'],
      ['Jira pull returns no results',                 'Wrong project key or insufficient permissions',     'Verify project key and confirm account has Browse Project permission in Jira'],
      ['Gemini model not found (404)',                 'Model unavailable for the API key tier',            'Extension auto-falls back to an available model; check the Settings test output for the list'],
      ['Extension does not load',                      'VS Code version too old',                           'Upgrade to VS Code 1.90 or newer'],
    ],
    [2400, 2800, 4160]
  ),

  h2('9.6 Support'),
  para('Report bugs and feature requests at:'),
  new Paragraph({
    spacing: { before: 40, after: 120 },
    children: [new ExternalHyperlink({
      link: 'https://github.com/ArielCesarMA/TraceLM/issues',
      children: [new TextRun({ text: 'https://github.com/ArielCesarMA/TraceLM/issues', size: 20, color: BLUE, font: 'Arial', underline: {} })],
    })],
  }),
  pageBreak(),

  // ── APPENDIX ───────────────────────────────────────────────────────────
  h1('Appendix — Message Command Reference'),
  para('Complete list of all postMessage commands between the extension host and React webview.'),
  space(60),
  table(
    ['Command', 'Direction', 'Key Payload Fields'],
    [
      ['ping / pong',                  'Bidirectional',  'Connectivity check, no payload'],
      ['settings:load',                'Web → Host',     '—'],
      ['settings:loaded',              'Host → Web',     'Full Settings object'],
      ['settings:save',                'Web → Host',     'Full Settings object'],
      ['settings:saved',               'Host → Web',     '—'],
      ['settings:testLlm',             'Web → Host',     'Settings object (uses 15s timeout)'],
      ['settings:testJira',            'Web → Host',     'Settings object (shape validation)'],
      ['settings:testResult',          'Host → Web',     '{ target, ok, message }'],
      ['requirements:parseFiles',      'Web → Host',     '{ files: UploadedFilePayload[] as JSON }'],
      ['requirements:filesParsed',     'Host → Web',     '{ combinedText, files: JSON }'],
      ['requirements:searchStories',   'Web → Host',     '{ query }'],
      ['requirements:storiesResult',   'Host → Web',     '{ stories: JSON }'],
      ['requirements:pullJira',        'Web → Host',     'mode + mode-specific fields (key, keys, epicKey, storyKeys)'],
      ['requirements:jiraPulled',      'Host → Web',     '{ issues: JSON, combinedText }'],
      ['requirements:enhance',         'Web → Host',     '{ requirements }'],
      ['requirements:enhanced',        'Host → Web',     '{ enhancement: JSON }'],
      ['requirements:error',           'Host → Web',     '{ message }'],
      ['scenarios:generate',           'Web → Host',     '{ requirements, enhancement: JSON }'],
      ['scenarios:generated',          'Host → Web',     '{ scenarios: JSON }'],
      ['testCases:generate',           'Web → Host',     '{ scenarios: JSON }'],
      ['testCases:generated',          'Host → Web',     '{ testCases: JSON }'],
      ['automation:analyze',           'Web → Host',     '{ requirements, enhancement, scenarios, testCases }'],
      ['automation:analyzed',          'Host → Web',     '{ analysis: JSON }'],
      ['xray:previewPush',             'Web → Host',     '{ testCases: JSON }'],
      ['xray:previewResult',           'Host → Web',     '{ preview: XrayPushPreview JSON }'],
      ['xray:pushTestCases',           'Web → Host',     '{ testCases: JSON, retryOnlyIds: string }'],
      ['xray:pushProgress',            'Host → Web',     '{ message, batchIndex, totalBatches, status }'],
      ['xray:pushed',                  'Host → Web',     '{ pushed: XrayPushItemStatus[] JSON }'],
      ['xray:clearPushHistory',        'Web → Host',     '{}'],
      ['xray:historyCleared',          'Host → Web',     '{ message }'],
    ],
    [2800, 1600, 4960]
  ),

  space(240),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 0 },
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: MID_GRAY, space: 4 } },
    children: [new TextRun({ text: 'TraceLM v0.0.4  ·  ArielCesarMA  ·  github.com/ArielCesarMA/TraceLM  ·  Generated June 2026', size: 16, color: MED_TEXT, font: 'Arial', italics: true })],
  }),
];

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Arial', size: 20, color: DARK_TEXT } },
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: 'Arial', color: BLUE },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial', color: BLUE },
        paragraph: { spacing: { before: 280, after: 80 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 22, bold: true, font: 'Arial', color: MED_TEXT },
        paragraph: { spacing: { before: 200, after: 60 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: 'numbers',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE, space: 4 } },
          children: [
            new TextRun({ text: 'TraceLM — Product & Technical Documentation', size: 18, color: MED_TEXT, font: 'Arial' }),
          ],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: MID_GRAY, space: 4 } },
          children: [
            new TextRun({ text: 'Confidential  ·  Version 0.0.4  ·  June 2026', size: 16, color: MED_TEXT, font: 'Arial' }),
            new TextRun({ text: '     Page ', size: 16, color: MED_TEXT, font: 'Arial' }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MED_TEXT, font: 'Arial' }),
            new TextRun({ text: ' of ', size: 16, color: MED_TEXT, font: 'Arial' }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: MED_TEXT, font: 'Arial' }),
          ],
        })],
      }),
    },
    children,
  }],
});

const outPath = path.join(__dirname, '..', 'TraceLM_Documentation_v0.0.4.docx');
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log('Written:', outPath);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
