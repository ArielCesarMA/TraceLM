"use strict";
const pptxgen = require("pptxgenjs");
const path = require("path");

// ── PALETTE ──────────────────────────────────────────────────────────────────
const NAVY    = "1B2A4A";
const NAVY2   = "243556";
const BLUE    = "1F5C99";
const BLUE2   = "2E6DB4";
const TEAL    = "1A7A5E";
const TEAL2   = "24A87E";
const ICE     = "E4EEF8";
const WHITE   = "FFFFFF";
const DARK    = "1A1A2E";
const MED     = "4A5568";
const LIGHT   = "F4F7FB";
const AMBER   = "D4860B";
const AMBER_L = "FFF8E6";
const GREEN   = "27AE60";
const GREEN_L = "E8F5E9";
const RED     = "C0392B";
const RED_L   = "FDECEA";
const GRAY    = "8A99A8";
const LGRAY   = "D0DAE8";

const OUT = path.join(
  "C:\\Users\\Ariel Cesar Abaoag\\Documents\\PROJECT7\\TraceLM\\DOCUMENTATION",
  "TraceLM_UI_Improvement_Proposal.pptx"
);

const mkShadow = () => ({ type: "outer", color: "000000", blur: 10, offset: 3, angle: 45, opacity: 0.12 });

function bg(slide, color) {
  slide.addShape("rect", { x: 0, y: 0, w: "100%", h: "100%", fill: { color }, line: { color } });
}

function accentBar(slide, color = TEAL, h = 0.06) {
  slide.addShape("rect", { x: 0, y: 7.45 - h, w: "100%", h, fill: { color }, line: { color } });
}

function slideHeader(slide, tag, title, sub) {
  // left accent strip
  slide.addShape("rect", { x: 0, y: 0, w: 0.12, h: "100%", fill: { color: TEAL }, line: { color: TEAL } });
  // tag pill
  slide.addShape("roundRect", { x: 0.28, y: 0.22, w: 1.5, h: 0.28, fill: { color: TEAL2 }, line: { color: TEAL2 }, rectRadius: 0.08 });
  slide.addText(tag.toUpperCase(), { x: 0.28, y: 0.22, w: 1.5, h: 0.28, fontSize: 8, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle", charSpacing: 1.5 });
  slide.addText(title, { x: 0.28, y: 0.55, w: 9.4, h: 0.55, fontSize: 26, fontFace: "Arial", bold: true, color: NAVY, align: "left", valign: "middle" });
  if (sub) slide.addText(sub, { x: 0.28, y: 1.08, w: 9.4, h: 0.3, fontSize: 12, fontFace: "Arial", color: MED, align: "left", valign: "top" });
}

function card(slide, x, y, w, h, bg_color, lineColor) {
  slide.addShape("roundRect", { x, y, w, h, fill: { color: bg_color }, line: { color: lineColor || LGRAY }, rectRadius: 0.12, shadow: mkShadow() });
}

function pill(slide, x, y, label, bg_color, fg) {
  slide.addShape("roundRect", { x, y, w: 1.5, h: 0.26, fill: { color: bg_color }, line: { color: bg_color }, rectRadius: 0.12 });
  slide.addText(label, { x, y, w: 1.5, h: 0.26, fontSize: 9, fontFace: "Arial", bold: true, color: fg, align: "center", valign: "middle" });
}

function dotBullet(slide, x, y, text, dotColor, fontSize) {
  slide.addShape("ellipse", { x: x, y: y + 0.06, w: 0.1, h: 0.1, fill: { color: dotColor }, line: { color: dotColor } });
  slide.addText(text, { x: x + 0.18, y, w: 9.1 - x, h: 0.3, fontSize: fontSize || 11, fontFace: "Arial", color: DARK, valign: "middle" });
}

function footerLine(slide, label) {
  accentBar(slide, TEAL);
  slide.addText(label || "TraceLM  |  UI Improvement Proposal  |  Confidential", {
    x: 0.2, y: 7.3, w: 9.6, h: 0.22, fontSize: 8, fontFace: "Arial", color: GRAY, align: "left"
  });
}

// ─────────────────────────────────────────────────────────────────────────────
const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author  = "TraceLM";
pptx.company = "TraceLM";
pptx.title   = "TraceLM UI Improvement Proposal";

// ── SLIDE 1: COVER ────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bg(s, NAVY);
  // diagonal accent
  s.addShape("rect", { x: 0, y: 0, w: 0.5, h: "100%", fill: { color: TEAL }, line: { color: TEAL } });
  s.addShape("rect", { x: 0.5, y: 0, w: 0.12, h: "100%", fill: { color: TEAL2 }, line: { color: TEAL2 } });
  // title block
  s.addText("TraceLM", { x: 0.9, y: 1.4, w: 9.1, h: 0.7, fontSize: 48, fontFace: "Arial", bold: true, color: WHITE, align: "left" });
  s.addText("UI Improvement Proposal", { x: 0.9, y: 2.1, w: 9.1, h: 0.55, fontSize: 30, fontFace: "Arial", bold: false, color: TEAL2, align: "left" });
  s.addText("Modernize · Stabilize · Elevate", { x: 0.9, y: 2.72, w: 9.1, h: 0.35, fontSize: 16, fontFace: "Arial", color: "8AAFC8", align: "left", charSpacing: 2 });
  // divider
  s.addShape("rect", { x: 0.9, y: 3.18, w: 4.0, h: 0.04, fill: { color: TEAL2 }, line: { color: TEAL2 } });
  // meta
  s.addText("Version 1.0  |  June 2026\nPrepared for: TraceLM Development Team", {
    x: 0.9, y: 3.38, w: 9.1, h: 0.7, fontSize: 13, fontFace: "Arial", color: "8AAFC8", align: "left"
  });
  // tag
  s.addShape("roundRect", { x: 0.9, y: 4.3, w: 2.2, h: 0.35, fill: { color: TEAL }, line: { color: TEAL }, rectRadius: 0.1 });
  s.addText("TECHNICAL PROPOSAL", { x: 0.9, y: 4.3, w: 2.2, h: 0.35, fontSize: 10, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle", charSpacing: 1.5 });
}

// ── SLIDE 2: AGENDA ────────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bg(s, LIGHT);
  slideHeader(s, "Overview", "What We Will Cover", "Six focused topics from current state to implementation roadmap");

  const items = [
    ["01", "Current State Assessment",    "Where TraceLM UI stands today"],
    ["02", "Identified Pain Points",       "Architecture and UX gaps"],
    ["03", "Phase 1 — Architecture",       "Decompose · Error Boundary · UI Toolkit"],
    ["04", "Phase 2 — User Experience",   "Progress · Preview · Empty States · Automation"],
    ["05", "Phase 3 — Productivity",       "Copy · Badges · Filter · Settings"],
    ["06", "Implementation Roadmap",       "Sequenced plan, effort, and quick wins"],
  ];

  items.forEach(([num, title, sub], i) => {
    const col = i < 3 ? 0 : 1;
    const row = i % 3;
    const x = col === 0 ? 0.28 : 5.05;
    const y = 1.55 + row * 1.72;
    card(s, x, y, 4.6, 1.55, WHITE, LGRAY);
    s.addShape("roundRect", { x: x + 0.16, y: y + 0.18, w: 0.52, h: 0.52, fill: { color: BLUE }, line: { color: BLUE }, rectRadius: 0.1 });
    s.addText(num, { x: x + 0.16, y: y + 0.18, w: 0.52, h: 0.52, fontSize: 16, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle" });
    s.addText(title, { x: x + 0.82, y: y + 0.18, w: 3.6, h: 0.3, fontSize: 13, fontFace: "Arial", bold: true, color: NAVY, align: "left", valign: "middle" });
    s.addText(sub,   { x: x + 0.82, y: y + 0.5,  w: 3.6, h: 0.4, fontSize: 10, fontFace: "Arial", color: MED, align: "left", valign: "top" });
  });

  footerLine(s);
}

// ── SLIDE 3: CURRENT STATE ─────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bg(s, LIGHT);
  slideHeader(s, "Current State", "TraceLM UI Today", "A functional but monolithic interface built for speed-to-market");

  const stats = [
    ["1,036", "Lines in App.tsx",     "Single React component", BLUE, ICE],
    ["6",     "Tabs managed",         "All in one file",        TEAL, "D4EDE7"],
    ["20+",   "useState hooks",       "Flat, co-mingled state", AMBER, AMBER_L],
    ["0",     "Error Boundaries",     "Full crash on any error",RED, RED_L],
  ];

  stats.forEach(([val, label, sub, fg, bg_c], i) => {
    const x = 0.28 + i * 2.42;
    card(s, x, 1.5, 2.24, 1.65, bg_c, LGRAY);
    s.addText(val,   { x, y: 1.62, w: 2.24, h: 0.72, fontSize: 38, fontFace: "Cambria", bold: true, color: fg, align: "center" });
    s.addText(label, { x, y: 2.32, w: 2.24, h: 0.28, fontSize: 11, fontFace: "Arial", bold: true, color: fg, align: "center" });
    s.addText(sub,   { x, y: 2.60, w: 2.24, h: 0.28, fontSize: 9,  fontFace: "Arial", color: MED, align: "center" });
  });

  // pain point list
  card(s, 0.28, 3.35, 9.44, 3.7, WHITE, LGRAY);
  s.addText("Key Pain Points Identified", { x: 0.55, y: 3.5, w: 9.0, h: 0.35, fontSize: 14, fontFace: "Arial", bold: true, color: NAVY });

  const points = [
    ["Monolithic Architecture",  "1,036-line App.tsx handles six tabs, routing, state, and all business logic — high maintenance burden"],
    ["No Error Boundaries",      "Any unhandled JS exception crashes the entire panel; no recovery without reopening the extension"],
    ["Raw HTML Form Elements",   "Custom CSS required for every VS Code theme; risk of visual drift on theme updates"],
    ["Text-Only Progress",       "Generate All shows '(2/4)...' string; no visual step status or in-progress indicator"],
    ["Plain-Text Xray Preview",  "Push preview is an unstyled list with Unicode symbols; no color, no actionable error hints"],
    ["Low-Info Automation View", "Automation items render as pipe-delimited text; no title, no visual priority, no context"],
  ];

  points.forEach(([title, desc], i) => {
    const col = i < 3 ? 0 : 1;
    const row = i % 3;
    const x = col === 0 ? 0.45 : 5.15;
    const y = 3.98 + row * 0.82;
    dotBullet(s, x, y, "", RED, 9);
    s.addText(title + ": ", { x: x + 0.18, y, w: 4.35, h: 0.28, fontSize: 10, fontFace: "Arial", bold: true, color: DARK, valign: "middle" });
    s.addText(desc, { x: x + 0.18, y: y + 0.24, w: 4.3, h: 0.28, fontSize: 8.5, fontFace: "Arial", color: MED, valign: "top" });
  });

  footerLine(s);
}

// ── SLIDE 4: PHASE 1 ─────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bg(s, LIGHT);
  slideHeader(s, "Phase 1 — Architecture", "Foundation First", "Restructure before feature work — everything else becomes easier once this is in place");

  const cols = [
    {
      num: "1.1", title: "Decompose App.tsx", effort: "1.5 days", color: BLUE, bg_c: ICE,
      items: [
        "SettingsTab.tsx",
        "RequirementsTab.tsx",
        "EnhancementTab.tsx",
        "ScenariosTab.tsx",
        "TestCasesTab.tsx",
        "AutomationTab.tsx",
        "useTraceLMMessages.ts hook",
        "App.tsx → tab router only",
      ],
      note: "Pure structural split. Zero logic changes."
    },
    {
      num: "1.2", title: "React Error Boundary", effort: "0.5 days", color: TEAL, bg_c: "D4EDE7",
      items: [
        "Wrap each tab in ErrorBoundary",
        "Show fallback UI on tab crash",
        "Other tabs remain functional",
        "~20 lines of new code total",
      ],
      note: "Eliminates full-panel crash risk."
    },
    {
      num: "1.3", title: "webview-ui-toolkit", effort: "1–2 days", color: AMBER, bg_c: AMBER_L,
      items: [
        "vscode-button replaces <button>",
        "vscode-text-field replaces <input>",
        "vscode-dropdown replaces <select>",
        "vscode-text-area replaces <textarea>",
        "vscode-checkbox replaces <input cb>",
        "Automatic theme inheritance",
        "No more custom CSS for forms",
      ],
      note: "Light, dark, high-contrast — automatic."
    },
  ];

  cols.forEach(({ num, title, effort, color, bg_c, items, note }, i) => {
    const x = 0.28 + i * 3.22;
    card(s, x, 1.52, 3.0, 5.55, WHITE, LGRAY);
    // header band
    s.addShape("roundRect", { x, y: 1.52, w: 3.0, h: 0.7, fill: { color: bg_c }, line: { color: LGRAY }, rectRadius: 0.12 });
    s.addShape("roundRect", { x: x + 0.14, y: 1.62, w: 0.42, h: 0.42, fill: { color }, line: { color }, rectRadius: 0.08 });
    s.addText(num, { x: x + 0.14, y: 1.62, w: 0.42, h: 0.42, fontSize: 11, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle" });
    s.addText(title, { x: x + 0.62, y: 1.64, w: 2.22, h: 0.38, fontSize: 12, fontFace: "Arial", bold: true, color: NAVY, valign: "middle" });
    // effort pill
    s.addShape("roundRect", { x: x + 0.14, y: 2.28, w: 1.4, h: 0.24, fill: { color }, line: { color }, rectRadius: 0.1 });
    s.addText(effort, { x: x + 0.14, y: 2.28, w: 1.4, h: 0.24, fontSize: 8.5, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle" });
    // items
    items.forEach((item, j) => {
      s.addText("• " + item, { x: x + 0.18, y: 2.65 + j * 0.32, w: 2.66, h: 0.28, fontSize: 9.5, fontFace: "Arial", color: DARK, valign: "top" });
    });
    // note
    s.addShape("rect", { x, y: 6.65, w: 3.0, h: 0.42, fill: { color: bg_c }, line: { color: LGRAY } });
    s.addText(note, { x: x + 0.14, y: 6.68, w: 2.72, h: 0.36, fontSize: 8.5, fontFace: "Arial", color: color, valign: "middle", italic: true });
  });

  footerLine(s);
}

// ── SLIDE 5: PHASE 2 ─────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bg(s, LIGHT);
  slideHeader(s, "Phase 2 — User Experience", "High-Impact UX Improvements", "Visible, user-facing changes that reduce confusion and improve daily workflow");

  const items = [
    { num: "2.1", title: "Visual Step Progress", desc: "Replace '(2/4)...' text with a horizontal stepper showing Pending / In Progress / Completed state for all 4 generation steps.", effort: "0.5 d", color: BLUE },
    { num: "2.2", title: "Color-Coded Push Preview", desc: "Green = valid, Amber = duplicate, Red = validation error with inline fix hint. Replaces unstyled bullet list.", effort: "0.5 d", color: TEAL },
    { num: "2.3", title: "Collapsible Enhancement Cards", desc: "Add collapse/expand toggle to each of the 6 enhancement category cards. Users hide reviewed sections to reduce scroll.", effort: "0.5 d", color: BLUE },
    { num: "2.4", title: "Actionable Empty States", desc: "Replace 'No X generated yet.' plain text with structured blocks showing title + instruction + dependency tip.", effort: "0.5 d", color: TEAL },
    { num: "2.5", title: "Automation Candidate Cards", desc: "Replace pipe-delimited text lines with cards showing: title, priority badge (color-coded), ROI, Feasibility, exclusion reason.", effort: "1.0 d", color: BLUE },
  ];

  items.forEach(({ num, title, desc, effort, color }, i) => {
    const col = i < 3 ? 0 : 1;
    const row = i < 3 ? i : i - 3;
    const x = col === 0 ? 0.28 : 5.05;
    const y = col === 0 ? 1.52 + row * 1.78 : 1.52 + row * 2.68;
    const h = col === 0 ? 1.62 : 2.52;
    card(s, x, y, 4.6, h, WHITE, LGRAY);
    s.addShape("roundRect", { x: x + 0.14, y: y + 0.16, w: 0.44, h: 0.36, fill: { color }, line: { color }, rectRadius: 0.08 });
    s.addText(num,   { x: x + 0.14, y: y + 0.16, w: 0.44, h: 0.36, fontSize: 11, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle" });
    s.addText(title, { x: x + 0.66, y: y + 0.18, w: 3.78, h: 0.32, fontSize: 12, fontFace: "Arial", bold: true, color: NAVY, valign: "middle" });
    s.addShape("roundRect", { x: x + 0.66, y: y + 0.54, w: 0.9, h: 0.22, fill: { color }, line: { color }, rectRadius: 0.08 });
    s.addText(effort + " effort", { x: x + 0.66, y: y + 0.54, w: 0.9, h: 0.22, fontSize: 8, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle" });
    s.addText(desc, { x: x + 0.18, y: y + 0.86, w: 4.24, h: h - 1.0, fontSize: 10, fontFace: "Arial", color: MED, valign: "top" });
  });

  footerLine(s);
}

// ── SLIDE 6: PHASE 3 ─────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bg(s, LIGHT);
  slideHeader(s, "Phase 3 — Productivity", "Incremental Polish", "Low-risk enhancements that improve power-user efficiency without structural changes");

  const items = [
    { num: "3.1", title: "Copy-to-Clipboard Buttons", desc: "Copy icon on each Gherkin block and enhancement list item. Brief 'Copied!' confirmation. Eliminates select-all manual copy.", effort: "0.5 d" },
    { num: "3.2", title: "Tab Count Badges", desc: "Numeric badge on each tab button when data exists: 'Test Cases (12)'. At-a-glance status without switching tabs.", effort: "0.5 d" },
    { num: "3.3", title: "Test Case Layer Filter", desc: "Three chip toggles (Unit / API / UI) above the Structured Cases table. Multi-select, all layers shown by default.", effort: "0.5 d" },
    { num: "3.4", title: "Settings Visual Grouping", desc: "Visually separate 12 fields into: LLM Configuration · Jira Configuration · Xray Push Controls. CSS-only change.", effort: "0.25 d" },
  ];

  items.forEach(({ num, title, desc, effort }, i) => {
    const x = i < 2 ? 0.28 : 5.05;
    const y = i % 2 === 0 ? 1.52 : 4.5;
    card(s, x, y, 4.6, 2.62, WHITE, LGRAY);
    s.addShape("roundRect", { x: x + 0.14, y: y + 0.18, w: 0.44, h: 0.44, fill: { color: BLUE }, line: { color: BLUE }, rectRadius: 0.1 });
    s.addText(num,   { x: x + 0.14, y: y + 0.18, w: 0.44, h: 0.44, fontSize: 13, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle" });
    s.addText(title, { x: x + 0.66, y: y + 0.18, w: 3.78, h: 0.44, fontSize: 13, fontFace: "Arial", bold: true, color: NAVY, valign: "middle" });
    s.addShape("roundRect", { x: x + 0.14, y: y + 0.72, w: 1.1, h: 0.24, fill: { color: BLUE }, line: { color: BLUE }, rectRadius: 0.1 });
    s.addText(effort + " effort", { x: x + 0.14, y: y + 0.72, w: 1.1, h: 0.24, fontSize: 8.5, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle" });
    s.addText(desc, { x: x + 0.18, y: y + 1.08, w: 4.24, h: 1.4, fontSize: 11, fontFace: "Arial", color: MED, valign: "top" });
  });

  footerLine(s);
}

// ── SLIDE 7: QUICK WINS ───────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bg(s, LIGHT);
  slideHeader(s, "Quick Wins", "Start Here — Zero Dependencies", "Three items deliverable immediately, before Phase 1 architecture work begins");

  const wins = [
    {
      icon: "⚡", title: "Settings Visual Grouping", effort: "~30 min", risk: "Zero",
      desc: "CSS-only change. Group 12 settings fields into three named sections with subtle background differentiation. No logic, no new components.",
      impact: "Immediate visual improvement visible on first launch after rebuild."
    },
    {
      icon: "📋", title: "Actionable Empty States", effort: "~1 hour", risk: "Very Low",
      desc: "Replace three plain 'No X yet.' paragraphs with structured empty-state blocks. Isolated paragraph-level changes, 10–15 lines per tab.",
      impact: "First-time users immediately see what to do next in each empty tab."
    },
    {
      icon: "🔴", title: "Color-Coded Push Preview", effort: "~2 hours", risk: "Low",
      desc: "Isolated to the xrayPushPreview render block in testCases tab. Replace <ul> with a styled table using CSS left-border colors per status.",
      impact: "Users see push readiness at a glance before committing the push action."
    },
  ];

  wins.forEach(({ icon, title, effort, risk, desc, impact }, i) => {
    const y = 1.52 + i * 1.88;
    card(s, 0.28, y, 9.44, 1.72, WHITE, LGRAY);
    // icon circle
    s.addShape("ellipse", { x: 0.44, y: y + 0.52, w: 0.72, h: 0.72, fill: { color: GREEN_L }, line: { color: GREEN } });
    s.addText(icon, { x: 0.44, y: y + 0.52, w: 0.72, h: 0.72, fontSize: 22, align: "center", valign: "middle" });
    // title
    s.addText(title, { x: 1.3, y: y + 0.2, w: 5.5, h: 0.36, fontSize: 14, fontFace: "Arial", bold: true, color: NAVY, valign: "middle" });
    s.addText(desc,  { x: 1.3, y: y + 0.58, w: 5.5, h: 0.52, fontSize: 10, fontFace: "Arial", color: MED, valign: "top" });
    s.addText("Impact: " + impact, { x: 1.3, y: y + 1.12, w: 5.5, h: 0.36, fontSize: 9.5, fontFace: "Arial", color: TEAL, valign: "top", italic: true });
    // effort + risk pills
    s.addShape("roundRect", { x: 7.0, y: y + 0.36, w: 1.3, h: 0.26, fill: { color: GREEN }, line: { color: GREEN }, rectRadius: 0.1 });
    s.addText(effort, { x: 7.0, y: y + 0.36, w: 1.3, h: 0.26, fontSize: 9, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle" });
    s.addShape("roundRect", { x: 7.0, y: y + 0.72, w: 1.3, h: 0.26, fill: { color: GREEN_L }, line: { color: GREEN }, rectRadius: 0.1 });
    s.addText("Risk: " + risk, { x: 7.0, y: y + 0.72, w: 1.3, h: 0.26, fontSize: 9, fontFace: "Arial", bold: true, color: GREEN, align: "center", valign: "middle" });
  });

  footerLine(s);
}

// ── SLIDE 8: IMPLEMENTATION ROADMAP ───────────────────────────────────────────
{
  const s = pptx.addSlide();
  bg(s, LIGHT);
  slideHeader(s, "Roadmap", "Implementation Plan", "Three phases sequenced for minimum risk and maximum incremental value");

  // Phase timeline blocks
  const phases = [
    { label: "Phase 1", name: "Architecture", color: BLUE,  bg_c: ICE,    effort: "3–4 days", items: ["Decompose App.tsx", "React Error Boundary", "@vscode/webview-ui-toolkit"] },
    { label: "Phase 2", name: "UX",           color: TEAL,  bg_c: "D4EDE7", effort: "2–3 days", items: ["Step progress stepper", "Color-coded preview", "Collapsible cards", "Empty states", "Automation cards"] },
    { label: "Phase 3", name: "Polish",        color: AMBER, bg_c: AMBER_L, effort: "1–2 days", items: ["Copy buttons", "Tab badges", "Layer filter", "Settings groups"] },
  ];

  phases.forEach(({ label, name, color, bg_c, effort, items }, i) => {
    const x = 0.28 + i * 3.22;
    card(s, x, 1.48, 3.0, 5.4, WHITE, LGRAY);
    s.addShape("roundRect", { x, y: 1.48, w: 3.0, h: 0.78, fill: { color: bg_c }, line: { color: LGRAY }, rectRadius: 0.12 });
    s.addText(label, { x: x + 0.14, y: 1.54, w: 1.2, h: 0.32, fontSize: 11, fontFace: "Arial", bold: true, color: color, valign: "middle" });
    s.addText(name,  { x: x + 0.14, y: 1.84, w: 2.72, h: 0.28, fontSize: 14, fontFace: "Arial", bold: true, color: NAVY, valign: "middle" });
    s.addShape("roundRect", { x: x + 0.14, y: 2.36, w: 1.4, h: 0.26, fill: { color }, line: { color }, rectRadius: 0.1 });
    s.addText(effort, { x: x + 0.14, y: 2.36, w: 1.4, h: 0.26, fontSize: 9, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle" });
    items.forEach((item, j) => {
      s.addText("✓  " + item, { x: x + 0.18, y: 2.78 + j * 0.52, w: 2.65, h: 0.44, fontSize: 10.5, fontFace: "Arial", color: DARK, valign: "top" });
    });
  });

  // arrow connectors
  [1, 2].forEach((i) => {
    const x = 0.28 + i * 3.22 - 0.18;
    s.addShape("rightArrow", { x: x - 0.01, y: 3.85, w: 0.35, h: 0.35, fill: { color: LGRAY }, line: { color: LGRAY } });
  });

  // total effort summary
  card(s, 0.28, 7.0, 9.44, 0.55, NAVY, NAVY);
  s.addText("Total Estimated Effort: 6–9 developer days across all three phases", {
    x: 0.42, y: 7.04, w: 9.0, h: 0.44, fontSize: 13, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle"
  });

  footerLine(s);
}

// ── SLIDE 9: RISK & DEPENDENCIES ──────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bg(s, LIGHT);
  slideHeader(s, "Risk & Dependencies", "What to Watch", "All risks are low; mitigations are straightforward and already built into the plan");

  const risks = [
    { risk: "Phase 1 refactor introduces regression", like: "Low", impact: "Medium", mit: "Pure structural split — no logic changes. Run typecheck + build after each file move." },
    { risk: "webview-ui-toolkit visual differences", like: "Low", impact: "Low",    mit: "Toolkit inherits VS Code theme natively. Spot-check light and dark themes post-adoption." },
    { risk: "Increased webview bundle size",          like: "Low", impact: "Low",    mit: "Toolkit is tree-shakeable. Only imported components are bundled." },
    { risk: "Phase 2/3 items without Phase 1 base",  like: "Medium", impact: "Low", mit: "Quick wins (3.4, 2.4, 2.2) can be done independently. All others follow Phase 1." },
  ];

  const headers = ["Risk", "Likelihood", "Impact", "Mitigation"];
  const colW = [3.2, 1.1, 1.1, 3.8];
  const colX = [0.28, 3.52, 4.66, 5.8];
  const rowH = 0.7;
  const startY = 1.5;

  // header row
  headers.forEach((h, i) => {
    s.addShape("rect", { x: colX[i], y: startY, w: colW[i], h: 0.38, fill: { color: BLUE }, line: { color: BLUE } });
    s.addText(h, { x: colX[i] + 0.08, y: startY, w: colW[i] - 0.16, h: 0.38, fontSize: 11, fontFace: "Arial", bold: true, color: WHITE, valign: "middle" });
  });

  const likeColor = (l) => l === "Medium" ? AMBER : GREEN;
  const likeTextColor = (l) => l === "Medium" ? "7A4A00" : "1A6B30";
  const likeBg = (l) => l === "Medium" ? AMBER_L : GREEN_L;

  risks.forEach(({ risk, like, impact, mit }, i) => {
    const y = startY + 0.38 + i * rowH;
    const rowBg = i % 2 === 0 ? WHITE : LIGHT;
    s.addShape("rect", { x: colX[0], y, w: 9.44, h: rowH, fill: { color: rowBg }, line: { color: LGRAY } });
    s.addText(risk, { x: colX[0] + 0.1, y, w: colW[0] - 0.2, h: rowH, fontSize: 10, fontFace: "Arial", color: DARK, valign: "middle" });
    // likelihood badge
    s.addShape("roundRect", { x: colX[1] + 0.1, y: y + 0.22, w: 0.88, h: 0.24, fill: { color: likeBg(like) }, line: { color: likeColor(like) }, rectRadius: 0.08 });
    s.addText(like, { x: colX[1] + 0.1, y: y + 0.22, w: 0.88, h: 0.24, fontSize: 8.5, fontFace: "Arial", bold: true, color: likeTextColor(like), align: "center", valign: "middle" });
    // impact badge
    s.addShape("roundRect", { x: colX[2] + 0.1, y: y + 0.22, w: 0.88, h: 0.24, fill: { color: GREEN_L }, line: { color: GREEN }, rectRadius: 0.08 });
    s.addText(impact, { x: colX[2] + 0.1, y: y + 0.22, w: 0.88, h: 0.24, fontSize: 8.5, fontFace: "Arial", bold: true, color: "1A6B30", align: "center", valign: "middle" });
    s.addText(mit, { x: colX[3] + 0.1, y, w: colW[3] - 0.2, h: rowH, fontSize: 9.5, fontFace: "Arial", color: MED, valign: "middle" });
  });

  // dependency note
  card(s, 0.28, 4.38, 9.44, 2.62, ICE, LGRAY);
  s.addText("Package Dependency", { x: 0.44, y: 4.52, w: 4.0, h: 0.3, fontSize: 13, fontFace: "Arial", bold: true, color: BLUE });
  s.addText("Only one new npm package is required across all three phases:", { x: 0.44, y: 4.82, w: 9.0, h: 0.28, fontSize: 11, fontFace: "Arial", color: MED });
  s.addShape("roundRect", { x: 0.44, y: 5.18, w: 3.2, h: 0.36, fill: { color: BLUE }, line: { color: BLUE }, rectRadius: 0.1 });
  s.addText("@vscode/webview-ui-toolkit", { x: 0.44, y: 5.18, w: 3.2, h: 0.36, fontSize: 11, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle", fontFamily: "Courier New" });
  s.addText("Required for Phase 1.3 only. All other improvements use React and existing utilities — no additional packages.", { x: 0.44, y: 5.62, w: 9.0, h: 0.28, fontSize: 10, fontFace: "Arial", color: MED });
  s.addText("Tree-shakeable: only imported components are bundled. Bundle size impact is negligible.", { x: 0.44, y: 5.9, w: 9.0, h: 0.28, fontSize: 10, fontFace: "Arial", color: MED, italic: true });

  footerLine(s);
}

// ── SLIDE 10: SUCCESS METRICS ────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bg(s, LIGHT);
  slideHeader(s, "Success Metrics", "How We Measure Done", "Objective, verifiable criteria for each phase of improvement");

  const metrics = [
    { phase: "P1", label: "App.tsx line count",       target: "< 200 lines",          current: "1,036 lines",     color: BLUE },
    { phase: "P1", label: "Error Boundary coverage",  target: "All 6 tabs wrapped",   current: "0 boundaries",    color: BLUE },
    { phase: "P1", label: "Theme consistency",         target: "Light / Dark / HC pass",current: "Manual CSS vars", color: BLUE },
    { phase: "P2", label: "Generate All feedback",    target: "Visual stepper active", current: "Text string only",color: TEAL },
    { phase: "P2", label: "Push Preview clarity",     target: "Color-coded rows",      current: "Unicode symbols", color: TEAL },
    { phase: "P2", label: "Empty state guidance",     target: "All 3 tabs with CTA",  current: "Plain text message",color: TEAL },
    { phase: "P3", label: "Copy friction",            target: "1-click copy on all blocks", current: "Manual select-all", color: AMBER },
    { phase: "P3", label: "Tab data visibility",      target: "Count badges on all tabs",current: "Must switch tab", color: AMBER },
  ];

  // column headers
  ["Metric", "Current", "Target", "Phase"].forEach((h, i) => {
    const xs = [0.28, 3.5, 6.1, 9.0];
    const ws = [3.0, 2.4, 2.7, 0.72];
    s.addShape("rect", { x: xs[i], y: 1.5, w: ws[i], h: 0.36, fill: { color: BLUE }, line: { color: BLUE } });
    s.addText(h, { x: xs[i] + 0.1, y: 1.5, w: ws[i] - 0.2, h: 0.36, fontSize: 10, fontFace: "Arial", bold: true, color: WHITE, valign: "middle" });
  });

  metrics.forEach(({ phase, label, target, current, color }, i) => {
    const y = 1.86 + i * 0.6;
    const rowBg = i % 2 === 0 ? WHITE : LIGHT;
    s.addShape("rect", { x: 0.28, y, w: 9.44, h: 0.6, fill: { color: rowBg }, line: { color: LGRAY } });
    s.addText(label,   { x: 0.38, y, w: 2.9, h: 0.6, fontSize: 10, fontFace: "Arial", color: DARK, valign: "middle" });
    s.addText(current, { x: 3.6,  y, w: 2.3, h: 0.6, fontSize: 10, fontFace: "Arial", color: RED,  valign: "middle" });
    s.addText(target,  { x: 6.2,  y, w: 2.6, h: 0.6, fontSize: 10, fontFace: "Arial", color: GREEN, valign: "middle" });
    s.addShape("roundRect", { x: 9.05, y: y + 0.16, w: 0.56, h: 0.26, fill: { color }, line: { color }, rectRadius: 0.08 });
    s.addText(phase, { x: 9.05, y: y + 0.16, w: 0.56, h: 0.26, fontSize: 8.5, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle" });
  });

  footerLine(s);
}

// ── SLIDE 11: CLOSING ─────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bg(s, NAVY);
  s.addShape("rect", { x: 0, y: 0, w: 0.5, h: "100%", fill: { color: TEAL }, line: { color: TEAL } });
  s.addShape("rect", { x: 0.5, y: 0, w: 0.12, h: "100%", fill: { color: TEAL2 }, line: { color: TEAL2 } });

  s.addText("Recommended Next Steps", { x: 0.9, y: 1.2, w: 9.1, h: 0.6, fontSize: 32, fontFace: "Arial", bold: true, color: WHITE, align: "left" });

  const steps = [
    ["01", "Start Quick Wins Today",         "Settings grouping, empty states, push preview colors — all before any architecture work. Immediate visual improvement."],
    ["02", "Plan Phase 1 Sprint",             "Allocate a focused 4-day sprint for App.tsx decomposition, Error Boundaries, and webview-ui-toolkit adoption."],
    ["03", "Phase 2 + 3 in Following Sprint", "Layer the UX and polish improvements on the stable Phase 1 foundation. Estimate 3–5 days combined."],
  ];

  steps.forEach(([num, title, desc], i) => {
    const y = 2.1 + i * 1.55;
    s.addShape("roundRect", { x: 0.9, y, w: 0.6, h: 0.6, fill: { color: TEAL }, line: { color: TEAL }, rectRadius: 0.1 });
    s.addText(num,   { x: 0.9,  y, w: 0.6, h: 0.6, fontSize: 16, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle" });
    s.addText(title, { x: 1.65, y: y + 0.06, w: 8.2, h: 0.32, fontSize: 15, fontFace: "Arial", bold: true, color: TEAL2, valign: "middle" });
    s.addText(desc,  { x: 1.65, y: y + 0.38, w: 8.2, h: 0.44, fontSize: 11, fontFace: "Arial", color: "8AAFC8", valign: "top" });
  });

  s.addShape("rect", { x: 0.9, y: 6.8, w: 9.0, h: 0.04, fill: { color: TEAL2 }, line: { color: TEAL2 } });
  s.addText("TraceLM  |  UI Improvement Proposal  |  Version 1.0  |  June 2026", {
    x: 0.9, y: 6.9, w: 9.0, h: 0.3, fontSize: 9, fontFace: "Arial", color: "5A7A99", align: "left"
  });
}

// ── WRITE ─────────────────────────────────────────────────────────────────────
pptx.writeFile({ fileName: OUT }).then(() => {
  console.log("Generated:", OUT);
});
