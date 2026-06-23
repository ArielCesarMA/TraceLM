"use strict";
const pptxgen = require("pptxgenjs");
const path = require("path");

// ── PALETTE ──────────────────────────────────────────────────────────────────
const NAVY    = "1B2A4A";
const NAVY2   = "243556";
const TEAL    = "028090";
const TEAL2   = "02A8BC";
const ICE     = "E4EEF8";
const WHITE   = "FFFFFF";
const DARK    = "1A1A2E";
const MED     = "4A5568";
const LIGHT   = "F4F7FB";
const AMBER   = "E67E22";
const GREEN   = "27AE60";
const RED     = "C0392B";

const mkShadow = () => ({ type: "outer", color: "000000", blur: 10, offset: 3, angle: 45, opacity: 0.12 });
const mkCardShadow = () => ({ type: "outer", color: "000000", blur: 14, offset: 4, angle: 45, opacity: 0.10 });

const OUT = path.join(
  "C:\\Users\\Ariel Cesar Abaoag\\Documents\\PROJECT7\\TraceLM\\DOCUMENTATION",
  "TraceLM_Executive_Update.pptx"
);

// ── HELPERS ──────────────────────────────────────────────────────────────────
function iconCircle(slide, x, y, r, bg, iconText, iconColor) {
  slide.addShape("ellipse", { x, y, w: r, h: r, fill: { color: bg }, line: { color: bg } });
  slide.addText(iconText, {
    x, y: y + r * 0.18, w: r, h: r * 0.65,
    fontSize: r * 14, fontFace: "Arial", bold: true,
    color: iconColor, align: "center", valign: "middle", margin: 0
  });
}

function sectionTag(slide, x, y, label, bg, fg) {
  slide.addShape("roundRect", { x, y, w: 1.5, h: 0.28, fill: { color: bg }, line: { color: bg }, rectRadius: 0.06 });
  slide.addText(label.toUpperCase(), {
    x, y, w: 1.5, h: 0.28, fontSize: 8, fontFace: "Arial", bold: true,
    color: fg, align: "center", valign: "middle", charSpacing: 1.5, margin: 0
  });
}

function statCard(slide, x, y, w, h, value, label, sub, bg, valueFg, labelFg) {
  slide.addShape("roundRect", { x, y, w, h, fill: { color: bg }, line: { color: bg }, rectRadius: 0.1, shadow: mkCardShadow() });
  slide.addText(value, { x, y: y + 0.18, w, h: 0.65, fontSize: 38, fontFace: "Cambria", bold: true, color: valueFg, align: "center", margin: 0 });
  slide.addText(label, { x, y: y + 0.82, w, h: 0.25, fontSize: 11, fontFace: "Arial", bold: true, color: labelFg, align: "center", margin: 0 });
  if (sub) slide.addText(sub, { x, y: y + 1.06, w, h: 0.2, fontSize: 9, fontFace: "Arial", color: labelFg, align: "center", margin: 0 });
}

function card(slide, x, y, w, h, bg) {
  slide.addShape("roundRect", { x, y, w, h, fill: { color: bg }, line: { color: "D0DAE8" }, rectRadius: 0.1, shadow: mkCardShadow() });
}

function pill(slide, x, y, label, bg, fg) {
  slide.addShape("roundRect", { x, y, w: 1.35, h: 0.26, fill: { color: bg }, line: { color: bg }, rectRadius: 0.12 });
  slide.addText(label, { x, y, w: 1.35, h: 0.26, fontSize: 9, fontFace: "Arial", bold: true, color: fg, align: "center", valign: "middle", margin: 0 });
}

function slideNumber(slide, n) {
  slide.addText(`${n}`, { x: 9.6, y: 5.3, w: 0.3, h: 0.2, fontSize: 8, color: "8898AA", fontFace: "Arial", align: "right" });
}

// ── BUILD PRESENTATION ───────────────────────────────────────────────────────
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "TraceLM Project Team";
pres.title = "TraceLM — Executive Project Update";

// ────────────────────────────────────────────────────────────────────────────
// SLIDE 1 · COVER
// ────────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  // Large teal accent circle (decorative)
  s.addShape("ellipse", { x: 7.2, y: -1.2, w: 5.5, h: 5.5, fill: { color: TEAL, transparency: 82 }, line: { color: TEAL, transparency: 82 } });
  s.addShape("ellipse", { x: 8.5, y: 2.8, w: 3.0, h: 3.0, fill: { color: TEAL2, transparency: 88 }, line: { color: TEAL2, transparency: 88 } });

  // Pre-title tag
  sectionTag(s, 0.6, 1.45, "Executive Update", TEAL, WHITE);

  // Title
  s.addText("TraceLM", {
    x: 0.6, y: 1.85, w: 8.5, h: 1.1,
    fontSize: 64, fontFace: "Cambria", bold: true, color: WHITE
  });
  s.addText("AI-Powered Test Generation & Jira/Xray Automation", {
    x: 0.6, y: 2.9, w: 8.0, h: 0.5,
    fontSize: 18, fontFace: "Arial", color: "A0BDD8", italic: true
  });

  // Divider line
  s.addShape("line", { x: 0.6, y: 3.55, w: 4.5, h: 0, line: { color: TEAL, width: 2 } });

  // Meta row
  s.addText([
    { text: "Version 0.0.4", options: { bold: true } },
    { text: "  ·  June 2026  ·  Confidential  ·  ", options: {} },
    { text: "github.com/ArielCesarMA/TraceLM", options: { color: TEAL2 } }
  ], { x: 0.6, y: 3.75, w: 8.5, h: 0.35, fontSize: 11, fontFace: "Arial", color: "8BAEC8" });

  // Audience tags
  ["Operational Managers", "Directors", "Country Managers", "Regional Leadership"].forEach((t, i) => {
    pill(s, 0.6 + i * 1.5, 4.45, t, "1F3A5F", "A8C8E8");
  });

  s.addNotes("Welcome to the TraceLM Executive Project Update. This deck covers current status, business impact, risks, and roadmap. Version 0.0.4 has been released and merged to main.");
}

// ────────────────────────────────────────────────────────────────────────────
// SLIDE 2 · THE BUSINESS PROBLEM
// ────────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: LIGHT };
  slideNumber(s, 2);

  sectionTag(s, 0.5, 0.3, "Context", NAVY, WHITE);
  s.addText("The Problem We Are Solving", {
    x: 0.5, y: 0.65, w: 9, h: 0.6, fontSize: 30, fontFace: "Cambria", bold: true, color: NAVY
  });

  // Left problem block (dark)
  card(s, 0.5, 1.45, 4.35, 3.75, NAVY);
  s.addText("Today's Manual Reality", {
    x: 0.7, y: 1.65, w: 3.9, h: 0.4, fontSize: 15, fontFace: "Arial", bold: true, color: WHITE
  });
  const problems = [
    ["⏱", "Hours spent manually writing test scenarios from requirements"],
    ["🔗", "Traceability between requirements and test cases is lost or inconsistent"],
    ["🔁", "Same test cases re-pushed to Xray causing duplicates"],
    ["📂", "Context switching between docs, Jira, and Xray slows teams down"],
    ["📉", "Automation candidates chosen subjectively — no feasibility or ROI framework"],
  ];
  problems.forEach(([icon, text], i) => {
    s.addShape("ellipse", { x: 0.7, y: 2.25 + i * 0.59, w: 0.32, h: 0.32, fill: { color: TEAL }, line: { color: TEAL } });
    s.addText(icon, { x: 0.7, y: 2.23 + i * 0.59, w: 0.32, h: 0.32, fontSize: 11, align: "center", valign: "middle", margin: 0 });
    s.addText(text, { x: 1.14, y: 2.22 + i * 0.59, w: 3.55, h: 0.38, fontSize: 11, fontFace: "Arial", color: "CBD8E8", valign: "middle" });
  });

  // Right solution block (light)
  card(s, 5.1, 1.45, 4.35, 3.75, WHITE);
  s.addText("TraceLM Changes This", {
    x: 5.3, y: 1.65, w: 3.9, h: 0.4, fontSize: 15, fontFace: "Arial", bold: true, color: NAVY
  });
  const solutions = [
    ["✓", GREEN, "Requirement-to-Xray in one session"],
    ["✓", GREEN, "Full traceability: requirement → scenario → test case"],
    ["✓", GREEN, "SHA-256 fingerprinting eliminates duplicate pushes"],
    ["✓", GREEN, "Single VS Code panel replaces all context switching"],
    ["✓", GREEN, "Structured A–F automation scoring: feasibility + ROI"],
  ];
  solutions.forEach(([icon, col, text], i) => {
    s.addShape("ellipse", { x: 5.3, y: 2.25 + i * 0.59, w: 0.32, h: 0.32, fill: { color: col }, line: { color: col } });
    s.addText(icon, { x: 5.3, y: 2.23 + i * 0.59, w: 0.32, h: 0.32, fontSize: 11, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(text, { x: 5.74, y: 2.22 + i * 0.59, w: 3.55, h: 0.38, fontSize: 11, fontFace: "Arial", color: MED, valign: "middle" });
  });

  s.addNotes("Emphasize the time cost of manual test writing. The traceability gap is a compliance risk in regulated industries. Highlight that TraceLM does not require leaving VS Code.");
}

// ────────────────────────────────────────────────────────────────────────────
// SLIDE 3 · WHAT IS TRACELM
// ────────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: LIGHT };
  slideNumber(s, 3);

  sectionTag(s, 0.5, 0.3, "Solution Overview", TEAL, WHITE);
  s.addText("What is TraceLM?", {
    x: 0.5, y: 0.65, w: 9, h: 0.6, fontSize: 30, fontFace: "Cambria", bold: true, color: NAVY
  });
  s.addText("A VS Code extension that transforms raw requirements into structured, traceable, Xray-ready test assets using AI — without leaving the development environment.", {
    x: 0.5, y: 1.28, w: 9, h: 0.5, fontSize: 13, fontFace: "Arial", color: MED, italic: true
  });

  // Capability cards 2x3
  const caps = [
    ["📥", "Requirements Ingestion", "Free text, file upload (.txt .md .docx .pdf), Jira pull, or story picker"],
    ["🔍", "Requirement Enhancement", "AI analysis: gaps, NFRs, risks, benchmarks, clarifying questions"],
    ["📋", "Test Scenario Generation", "Structured scenarios with traceability to source requirements"],
    ["✅", "Test Case Generation", "Executable cases with Gherkin BDD, layer, and priority assignment"],
    ["🤖", "Automation Analysis", "A–F assessment: feasibility (1–5) + ROI score (1–10) per case"],
    ["🚀", "Xray Push + Export", "Batch push with deduplication, retry, and 4 export formats"],
  ];

  caps.forEach(([icon, title, desc], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 3.1;
    const y = 1.9 + row * 1.65;
    card(s, x, y, 2.9, 1.48, WHITE);
    s.addShape("ellipse", { x: x + 0.18, y: y + 0.22, w: 0.5, h: 0.5, fill: { color: i < 3 ? ICE : "E8F5F0" }, line: { color: i < 3 ? ICE : "E8F5F0" } });
    s.addText(icon, { x: x + 0.18, y: y + 0.2, w: 0.5, h: 0.5, fontSize: 16, align: "center", valign: "middle", margin: 0 });
    s.addText(title, { x: x + 0.8, y: y + 0.22, w: 2.0, h: 0.35, fontSize: 11, fontFace: "Arial", bold: true, color: NAVY });
    s.addText(desc, { x: x + 0.18, y: y + 0.72, w: 2.6, h: 0.65, fontSize: 10, fontFace: "Arial", color: MED, wrap: true });
  });

  s.addNotes("TraceLM sits inside VS Code — the tool every developer already has open. It chains 6 capabilities in one panel. Stress the 'single workflow' story.");
}

// ────────────────────────────────────────────────────────────────────────────
// SLIDE 4 · END-TO-END WORKFLOW
// ────────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  slideNumber(s, 4);

  sectionTag(s, 0.5, 0.3, "How It Works", TEAL, WHITE);
  s.addText("End-to-End Workflow", {
    x: 0.5, y: 0.65, w: 9, h: 0.55, fontSize: 30, fontFace: "Cambria", bold: true, color: WHITE
  });

  const steps = [
    { n: "1", label: "Configure", sub: "Set LLM provider\n& Jira/Xray keys", col: TEAL },
    { n: "2", label: "Requirements", sub: "Paste, upload,\nor pull from Jira", col: TEAL },
    { n: "3", label: "Enhance", sub: "AI identifies gaps,\nrisks & NFRs", col: TEAL2 },
    { n: "4", label: "Scenarios", sub: "Traceable test\nscenarios generated", col: TEAL2 },
    { n: "5", label: "Test Cases", sub: "Gherkin BDD cases\nwith layer & priority", col: "028090" },
    { n: "6", label: "Automation", sub: "A–F analysis:\nfeasibility & ROI", col: "028090" },
    { n: "7", label: "Push to Xray", sub: "Batch push with\ndedup & retry", col: AMBER },
  ];

  const BOX_W = 1.18, BOX_H = 2.2, START_X = 0.38, Y = 1.55;

  steps.forEach((st, i) => {
    const x = START_X + i * (BOX_W + 0.18);
    // step box
    s.addShape("roundRect", { x, y: Y, w: BOX_W, h: BOX_H, fill: { color: "1F3A5F" }, line: { color: "2A4A72" }, rectRadius: 0.1, shadow: mkShadow() });
    // number circle
    s.addShape("ellipse", { x: x + (BOX_W - 0.42) / 2, y: Y + 0.16, w: 0.42, h: 0.42, fill: { color: st.col }, line: { color: st.col } });
    s.addText(st.n, { x: x + (BOX_W - 0.42) / 2, y: Y + 0.16, w: 0.42, h: 0.42, fontSize: 14, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(st.label, { x, y: Y + 0.68, w: BOX_W, h: 0.32, fontSize: 10.5, fontFace: "Arial", bold: true, color: WHITE, align: "center" });
    s.addText(st.sub, { x, y: Y + 1.02, w: BOX_W, h: 0.95, fontSize: 9, fontFace: "Arial", color: "8BAEC8", align: "center", wrap: true });
    // arrow
    if (i < steps.length - 1) {
      s.addShape("line", { x: x + BOX_W + 0.02, y: Y + BOX_H / 2, w: 0.14, h: 0, line: { color: TEAL, width: 1.5 } });
    }
  });

  // "Generate All" callout
  s.addShape("roundRect", { x: 0.38, y: 4.05, w: 9.24, h: 0.52, fill: { color: "0D3B5E" }, line: { color: TEAL2 }, rectRadius: 0.08 });
  s.addText("⚡  \"Generate All Artifacts\" — triggers steps 2–6 sequentially in one click, with live progress display", {
    x: 0.5, y: 4.08, w: 9.0, h: 0.44, fontSize: 11, fontFace: "Arial", color: TEAL2, bold: true, valign: "middle"
  });

  s.addNotes("The Generate All button chains Enhancement → Scenarios → Test Cases → Automation in sequence. Each step feeds its output directly into the next. Progress is shown live: '(1/4)... (2/4)...' etc.");
}

// ────────────────────────────────────────────────────────────────────────────
// SLIDE 5 · KEY METRICS & BUSINESS VALUE
// ────────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: LIGHT };
  slideNumber(s, 5);

  sectionTag(s, 0.5, 0.3, "Business Value", NAVY, WHITE);
  s.addText("Key Metrics & Business Impact", {
    x: 0.5, y: 0.65, w: 9, h: 0.6, fontSize: 30, fontFace: "Cambria", bold: true, color: NAVY
  });

  // Top stat cards
  const stats = [
    ["v0.0.4", "Current Release", "Live on GitHub", NAVY, WHITE, "8BAEC8"],
    ["3",      "LLM Providers",   "OpenAI · Anthropic · Gemini", TEAL, WHITE, "A0D8D0"],
    ["9",      "Workflow Steps",  "Configure → Push to Xray", "1A6B3A", WHITE, "A0D8A0"],
    ["4",      "Export Formats",  ".feature · CSV · JSON", AMBER, WHITE, "F5CBA0"],
  ];
  stats.forEach(([val, lbl, sub, bg, fg, lf], i) => {
    statCard(s, 0.5 + i * 2.4, 1.35, 2.15, 1.42, val, lbl, sub, bg, fg, lf);
  });

  // Value propositions row
  const props = [
    ["🎯", "Zero Context Switching", "Requirements, generation, and Xray push all happen in one VS Code panel. No tab hopping, no copy-pasting between tools."],
    ["🔐", "Enterprise-Grade Security", "All API keys stored in OS-native SecretStorage. Xray uses OAuth 2.0. No credentials ever committed or logged."],
    ["📊", "Data-Driven Automation", "Every test case receives an objective feasibility score (1–5) and ROI score (1–10). Automation backlog is prioritized, not guessed."],
    ["♻️", "Duplicate Prevention", "SHA-256 fingerprinting ensures the same test case is never pushed twice — even across sessions — saving Xray cleanup time."],
  ];
  props.forEach(([icon, title, desc], i) => {
    const x = 0.5 + (i % 2) * 4.75;
    const y = 3.0 + Math.floor(i / 2) * 1.28;
    card(s, x, y, 4.45, 1.15, WHITE);
    s.addShape("ellipse", { x: x + 0.18, y: y + 0.32, w: 0.5, h: 0.5, fill: { color: ICE }, line: { color: ICE } });
    s.addText(icon, { x: x + 0.18, y: y + 0.3, w: 0.5, h: 0.5, fontSize: 17, align: "center", valign: "middle", margin: 0 });
    s.addText(title, { x: x + 0.82, y: y + 0.14, w: 3.48, h: 0.3, fontSize: 12, fontFace: "Arial", bold: true, color: NAVY });
    s.addText(desc, { x: x + 0.82, y: y + 0.44, w: 3.48, h: 0.62, fontSize: 10, fontFace: "Arial", color: MED, wrap: true });
  });

  s.addNotes("Highlight the ROI story: time saved per sprint multiplied by team size. Even two hours saved per QA engineer per sprint computes quickly. The deduplication story resonates with ops managers who've dealt with Xray cleanup.");
}

// ────────────────────────────────────────────────────────────────────────────
// SLIDE 6 · CURRENT STATUS — v0.0.4
// ────────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: LIGHT };
  slideNumber(s, 6);

  sectionTag(s, 0.5, 0.3, "Current Status", TEAL, WHITE);
  s.addText("Release v0.0.4 — Delivered", {
    x: 0.5, y: 0.65, w: 9, h: 0.6, fontSize: 30, fontFace: "Cambria", bold: true, color: NAVY
  });

  // Status banner
  s.addShape("roundRect", { x: 0.5, y: 1.36, w: 9, h: 0.44, fill: { color: "E8F8F0" }, line: { color: GREEN }, rectRadius: 0.08 });
  s.addText("✅  Version 0.0.4 is merged to main and live on GitHub  ·  CI/CD: All checks passed (build-test ✓ · lint ✓ · typecheck ✓)", {
    x: 0.6, y: 1.38, w: 8.8, h: 0.4, fontSize: 11, fontFace: "Arial", color: "1A6B3A", bold: true, valign: "middle"
  });

  // Delivered features
  const features = [
    ["Sequential Generation Workflow", "\"Generate All Artifacts\" button chains all 4 AI steps in sequence with live progress feedback (1/4 → 4/4). Stale-state bug fixed using React refs."],
    ["Gemini Provider Reliability", "Transient retry logic with exponential backoff (1200ms base + jitter). Automatic fallback to available models on 429/503. Audio/TTS models filtered from dropdown."],
    ["Enhanced CSV Export", "Test cases export with 10 columns including Detailed Steps and Test Data. Automation CSV includes feasibility, ROI, and layer breakdown."],
    ["Responsive UI Layout", "Requirements header reorganised: Generate All button moved to requirements tab for logical flow. Mobile-responsive layout for narrow viewports."],
    ["CLAUDE.md Documentation", "Codebase guidance file added for future developers and AI-assisted development workflows."],
  ];

  features.forEach(([title, desc], i) => {
    const y = 1.98 + i * 0.66;
    card(s, 0.5, y, 9, 0.58, WHITE);
    s.addShape("ellipse", { x: 0.66, y: y + 0.13, w: 0.32, h: 0.32, fill: { color: GREEN }, line: { color: GREEN } });
    s.addText("✓", { x: 0.66, y: y + 0.12, w: 0.32, h: 0.32, fontSize: 11, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(title, { x: 1.1, y: y + 0.06, w: 2.5, h: 0.26, fontSize: 11, fontFace: "Arial", bold: true, color: NAVY });
    s.addText(desc, { x: 1.1, y: y + 0.3, w: 8.2, h: 0.24, fontSize: 10, fontFace: "Arial", color: MED });
  });

  s.addNotes("v0.0.4 was delivered via PR #6 which passed all automated CI checks before merge. The sequential generation fix was the most impactful — the prior version had a stale state bug that caused cascading generation failures.");
}

// ────────────────────────────────────────────────────────────────────────────
// SLIDE 7 · INTEGRATION ECOSYSTEM
// ────────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  slideNumber(s, 7);

  sectionTag(s, 0.5, 0.3, "Integrations", TEAL, WHITE);
  s.addText("Integration Ecosystem", {
    x: 0.5, y: 0.65, w: 9, h: 0.55, fontSize: 30, fontFace: "Cambria", bold: true, color: WHITE
  });

  // TraceLM center
  s.addShape("ellipse", { x: 3.9, y: 1.6, w: 2.2, h: 2.2, fill: { color: TEAL }, line: { color: TEAL2, width: 2 }, shadow: mkShadow() });
  s.addText("TraceLM", { x: 3.9, y: 1.6, w: 2.2, h: 1.1, fontSize: 16, fontFace: "Cambria", bold: true, color: WHITE, align: "center", valign: "bottom", margin: 0 });
  s.addText("VS Code\nExtension", { x: 3.9, y: 2.7, w: 2.2, h: 1.1, fontSize: 9.5, fontFace: "Arial", color: "A0D8D0", align: "center", valign: "top", margin: 0 });

  // LLM providers (left)
  const llms = [
    { name: "OpenAI", sub: "GPT-4o / 4.1", y: 1.3, col: "0A5C2B" },
    { name: "Anthropic", sub: "Claude 3.5 Sonnet", y: 2.35, col: "5B3270" },
    { name: "Google Gemini", sub: "2.5 Flash / Pro", y: 3.4, col: "1A56A3" },
  ];
  llms.forEach((l) => {
    s.addShape("roundRect", { x: 0.35, y: l.y, w: 2.5, h: 0.72, fill: { color: "1F3A5F" }, line: { color: "2A4A72" }, rectRadius: 0.1, shadow: mkShadow() });
    s.addShape("ellipse", { x: 0.5, y: l.y + 0.17, w: 0.38, h: 0.38, fill: { color: l.col }, line: { color: l.col } });
    s.addText(l.name, { x: 1.02, y: l.y + 0.06, w: 1.72, h: 0.28, fontSize: 11, fontFace: "Arial", bold: true, color: WHITE });
    s.addText(l.sub, { x: 1.02, y: l.y + 0.34, w: 1.72, h: 0.24, fontSize: 9, fontFace: "Arial", color: "8BAEC8" });
    // connector
    s.addShape("line", { x: 2.85, y: l.y + 0.36, w: 1.05, h: 0, line: { color: TEAL, width: 1, dashType: "dashDot" } });
  });

  // Jira + Xray (right)
  const jira = [
    { name: "Jira Cloud", sub: "Pull issues & epics", y: 1.5, col: "0052CC" },
    { name: "Xray Cloud", sub: "Push & manage tests", y: 2.7, col: "00875A" },
  ];
  jira.forEach((j) => {
    s.addShape("roundRect", { x: 7.15, y: j.y, w: 2.5, h: 0.72, fill: { color: "1F3A5F" }, line: { color: "2A4A72" }, rectRadius: 0.1, shadow: mkShadow() });
    s.addShape("ellipse", { x: 7.3, y: j.y + 0.17, w: 0.38, h: 0.38, fill: { color: j.col }, line: { color: j.col } });
    s.addText(j.name, { x: 7.82, y: j.y + 0.06, w: 1.72, h: 0.28, fontSize: 11, fontFace: "Arial", bold: true, color: WHITE });
    s.addText(j.sub, { x: 7.82, y: j.y + 0.34, w: 1.72, h: 0.24, fontSize: 9, fontFace: "Arial", color: "8BAEC8" });
    s.addShape("line", { x: 6.1, y: j.y + 0.36, w: 1.05, h: 0, line: { color: TEAL, width: 1, dashType: "dashDot" } });
  });

  // Auth labels
  s.addText("Bearer / API Key", { x: 0.2, y: 4.42, w: 3.0, h: 0.24, fontSize: 9, fontFace: "Arial", color: "6A8FAA", italic: true, align: "center" });
  s.addText("Basic Auth + OAuth 2.0", { x: 6.8, y: 4.42, w: 3.0, h: 0.24, fontSize: 9, fontFace: "Arial", color: "6A8FAA", italic: true, align: "center" });

  // VS Code note
  s.addShape("roundRect", { x: 0.5, y: 4.78, w: 9, h: 0.46, fill: { color: "0D2A44" }, line: { color: "2A4A72" }, rectRadius: 0.08 });
  s.addText("All credentials stored in VS Code SecretStorage (OS-native keychain) — never in config files or source control", {
    x: 0.65, y: 4.8, w: 8.7, h: 0.42, fontSize: 10.5, fontFace: "Arial", color: "8BAEC8", valign: "middle"
  });

  s.addNotes("TraceLM is LLM-agnostic by design. Teams can switch providers based on cost, performance, or compliance without any code changes. Jira uses Basic Auth; Xray uses OAuth 2.0 client credentials — a fresh token per session.");
}

// ────────────────────────────────────────────────────────────────────────────
// SLIDE 8 · SECURITY & COMPLIANCE
// ────────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: LIGHT };
  slideNumber(s, 8);

  sectionTag(s, 0.5, 0.3, "Security", NAVY, WHITE);
  s.addText("Security & Compliance Controls", {
    x: 0.5, y: 0.65, w: 9, h: 0.6, fontSize: 30, fontFace: "Cambria", bold: true, color: NAVY
  });

  const controls = [
    ["🔑", "Credential Isolation", "LLM API key, Jira token, and Xray client ID/secret stored exclusively in VS Code SecretStorage (OS-native keychain). Never in config files or source control.", "1A6B3A", "E8F8F0"],
    ["🛡️", "Webview Content Security Policy", "default-src 'none' — all scripts require a per-load cryptographic nonce. Inline scripts and eval() are blocked. External image loading restricted.", "1A3A6B", "E8F0F8"],
    ["🔐", "Authentication Standards", "Jira: HTTP Basic (email:token). Xray: OAuth 2.0 client credentials — Bearer token per session, never persisted. LLM providers: API keys in Authorization headers.", "5B3270", "F3EEF8"],
    ["✅", "Dependency Security Audit", "npm audit --omit=dev --audit-level=high runs automatically on every CI build and every release workflow. No high-severity vulnerabilities allowed to ship.", "6B3A1A", "F8F0E8"],
    ["📋", "Input Validation & No PII Logging", "Required field checks before every Xray push. HTTPS regex on Jira URLs. File MIME and extension verification. No credentials or personal data in any log or progress message.", "1A5B4A", "E8F5F0"],
  ];

  controls.forEach(([icon, title, desc, textCol, bgCol], i) => {
    const col = i % 2 === 0 ? 0.5 : 5.25;
    const y = 1.42 + Math.floor(i / 2) * 1.35;
    if (i === 4) {
      card(s, 0.5, y, 9, 1.12, bgCol);
      s.addShape("ellipse", { x: 0.68, y: y + 0.3, w: 0.5, h: 0.5, fill: { color: bgCol }, line: { color: textCol } });
      s.addText(icon, { x: 0.68, y: y + 0.28, w: 0.5, h: 0.5, fontSize: 17, align: "center", valign: "middle", margin: 0 });
      s.addText(title, { x: 1.32, y: y + 0.14, w: 7.98, h: 0.32, fontSize: 12, fontFace: "Arial", bold: true, color: textCol });
      s.addText(desc, { x: 1.32, y: y + 0.46, w: 7.98, h: 0.56, fontSize: 10, fontFace: "Arial", color: MED });
    } else {
      card(s, col, y, 4.55, 1.12, bgCol);
      s.addShape("ellipse", { x: col + 0.18, y: y + 0.3, w: 0.5, h: 0.5, fill: { color: bgCol }, line: { color: textCol } });
      s.addText(icon, { x: col + 0.18, y: y + 0.28, w: 0.5, h: 0.5, fontSize: 17, align: "center", valign: "middle", margin: 0 });
      s.addText(title, { x: col + 0.82, y: y + 0.14, w: 3.58, h: 0.32, fontSize: 12, fontFace: "Arial", bold: true, color: textCol });
      s.addText(desc, { x: col + 0.18, y: y + 0.5, w: 4.22, h: 0.56, fontSize: 10, fontFace: "Arial", color: MED });
    }
  });

  s.addNotes("The security story is important for enterprise and regulated environments. Key message: credentials never leave the developer's local OS keychain. No TraceLM server ever receives or stores API keys.");
}

// ────────────────────────────────────────────────────────────────────────────
// SLIDE 9 · CI/CD & ENGINEERING PROCESS
// ────────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: LIGHT };
  slideNumber(s, 9);

  sectionTag(s, 0.5, 0.3, "Engineering Process", TEAL, WHITE);
  s.addText("CI/CD Pipeline & Quality Gates", {
    x: 0.5, y: 0.65, w: 9, h: 0.6, fontSize: 30, fontFace: "Cambria", bold: true, color: NAVY
  });

  // CI pipeline
  s.addText("CI — Every Pull Request", { x: 0.5, y: 1.38, w: 4.3, h: 0.3, fontSize: 13, fontFace: "Arial", bold: true, color: NAVY });
  const ciSteps = ["Install dependencies", "Validate LLM prompts", "Lint (zero warnings)", "TypeScript strict check", "Build (extension + webview)"];
  ciSteps.forEach((step, i) => {
    card(s, 0.5, 1.76 + i * 0.58, 4.3, 0.5, WHITE);
    s.addShape("ellipse", { x: 0.66, y: 1.91 + i * 0.58, w: 0.22, h: 0.22, fill: { color: TEAL }, line: { color: TEAL } });
    s.addText(`${i + 1}`, { x: 0.66, y: 1.9 + i * 0.58, w: 0.22, h: 0.22, fontSize: 8, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(step, { x: 1.02, y: 1.82 + i * 0.58, w: 3.68, h: 0.36, fontSize: 11, fontFace: "Arial", color: MED, valign: "middle" });
  });

  // Release pipeline
  s.addText("Release — On Version Tag Push", { x: 5.2, y: 1.38, w: 4.3, h: 0.3, fontSize: 13, fontFace: "Arial", bold: true, color: NAVY });
  const relSteps = [
    ["Verify tag = package version", GREEN],
    ["Full CI suite re-runs", GREEN],
    ["Security audit (npm audit)", GREEN],
    ["Test suite with coverage", GREEN],
    ["Package VSIX extension file", TEAL],
    ["Generate changelog", TEAL],
    ["Publish GitHub release + VSIX", AMBER],
  ];
  relSteps.forEach(([step, col], i) => {
    card(s, 5.2, 1.76 + i * 0.48, 4.3, 0.41, WHITE);
    s.addShape("ellipse", { x: 5.36, y: 1.87 + i * 0.48, w: 0.2, h: 0.2, fill: { color: col }, line: { color: col } });
    s.addText(step, { x: 5.7, y: 1.8 + i * 0.48, w: 3.68, h: 0.34, fontSize: 10.5, fontFace: "Arial", color: MED, valign: "middle" });
  });

  // Branch protection banner
  s.addShape("roundRect", { x: 0.5, y: 5.08, w: 9, h: 0.38, fill: { color: ICE }, line: { color: "B8CCE0" }, rectRadius: 0.08 });
  s.addText("🔒  Branch protection: all changes to main via pull request  ·  build-test must pass  ·  pre-commit: lint + typecheck on staged files", {
    x: 0.6, y: 5.1, w: 8.8, h: 0.34, fontSize: 10, fontFace: "Arial", color: NAVY, valign: "middle"
  });

  s.addNotes("The pipeline enforces zero-warning lint and strict TypeScript on every PR. No code reaches main without passing all gates. The release workflow additionally packages and publishes the VSIX automatically on tag push.");
}

// ────────────────────────────────────────────────────────────────────────────
// SLIDE 10 · RISKS & KNOWN LIMITATIONS
// ────────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: LIGHT };
  slideNumber(s, 10);

  sectionTag(s, 0.5, 0.3, "Risks & Limitations", NAVY, WHITE);
  s.addText("Current Risks & Known Limitations", {
    x: 0.5, y: 0.65, w: 9, h: 0.6, fontSize: 30, fontFace: "Cambria", bold: true, color: NAVY
  });

  const risks = [
    { impact: "LOW", title: "Streaming not implemented", desc: "All LLM calls are completion-based. For large requirement documents, generation may feel slow. No visible token stream to the user during generation.", mitigation: "Planned for a future release. Current UX shows step-by-step progress labels (1/4 → 4/4) as interim feedback.", col: GREEN, bg: "F0FAF5" },
    { impact: "LOW", title: "Shape-only Jira/Xray validation in Settings", desc: "The Settings 'Test Connection' button validates field shapes but does not make a live API call to verify credentials.", mitigation: "Live API validation is scoped to Phase 6. Teams should verify credentials manually before first use.", col: AMBER, bg: "FEF9EC" },
    { impact: "MEDIUM", title: "Fixed LLM prompt templates", desc: "Prompt files are not user-customizable from within the extension. Teams with domain-specific test standards cannot modify prompt instructions without code changes.", mitigation: "Prompt customization is planned. Interim workaround: edit prompt .txt files in the extension source and rebuild.", col: AMBER, bg: "FEF9EC" },
    { impact: "LOW", title: "No requirement versioning or diff history", desc: "There is no built-in tracking of changes between requirement versions. Re-generating after requirement changes will produce new test cases without comparing to prior runs.", mitigation: "Fingerprint dedup prevents duplicate Xray pushes. Full versioning is a future phase item.", col: GREEN, bg: "F0FAF5" },
    { impact: "LOW", title: "Single permission level (no RBAC)", desc: "All VS Code users with the extension installed share identical capabilities. There is no role-based access control to restrict, for example, Xray push rights.", mitigation: "Acceptable at current team scale. RBAC planned as the user base grows.", col: GREEN, bg: "F0FAF5" },
  ];

  const impactColor = { LOW: GREEN, MEDIUM: AMBER, HIGH: RED };

  risks.forEach((r, i) => {
    const y = 1.42 + i * 0.8;
    card(s, 0.5, y, 9, 0.72, r.bg);
    // impact badge
    s.addShape("roundRect", { x: 0.65, y: y + 0.2, w: 0.85, h: 0.24, fill: { color: impactColor[r.impact] }, line: { color: impactColor[r.impact] }, rectRadius: 0.06 });
    s.addText(r.impact, { x: 0.65, y: y + 0.2, w: 0.85, h: 0.24, fontSize: 8, fontFace: "Arial", bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(r.title, { x: 1.62, y: y + 0.06, w: 4.0, h: 0.28, fontSize: 11, fontFace: "Arial", bold: true, color: NAVY });
    s.addText(r.desc, { x: 1.62, y: y + 0.34, w: 3.8, h: 0.34, fontSize: 9.5, fontFace: "Arial", color: MED });
    // mitigation
    s.addText("Mitigation:", { x: 5.65, y: y + 0.08, w: 0.72, h: 0.2, fontSize: 9, fontFace: "Arial", bold: true, color: TEAL });
    s.addText(r.mitigation, { x: 5.65, y: y + 0.28, w: 3.68, h: 0.4, fontSize: 9.5, fontFace: "Arial", color: MED });
  });

  s.addNotes("Overall risk profile is low. No production blockers. The medium-rated item (fixed prompts) is a convenience gap, not a functionality gap. All mitigations are documented and planned.");
}

// ────────────────────────────────────────────────────────────────────────────
// SLIDE 11 · ROADMAP & NEXT STEPS
// ────────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  slideNumber(s, 11);

  sectionTag(s, 0.5, 0.3, "Roadmap", TEAL, WHITE);
  s.addText("Roadmap & Next Steps", {
    x: 0.5, y: 0.65, w: 9, h: 0.55, fontSize: 30, fontFace: "Cambria", bold: true, color: WHITE
  });

  const phases = [
    {
      phase: "v0.0.5", label: "Near Term", status: "Planned",
      col: TEAL, items: ["Live Jira/Xray API validation in Settings", "Token-streaming for real-time LLM output", "User-customizable prompt templates"]
    },
    {
      phase: "v0.1.0", label: "Mid Term", status: "Scoped",
      col: TEAL2, items: ["Requirement versioning & diff tracking", "Multi-project Xray configuration", "Bulk scenario editing UI"]
    },
    {
      phase: "v1.0", label: "Strategic", status: "Backlog",
      col: AMBER, items: ["Role-based access control (RBAC)", "Analytics dashboard: push history & coverage metrics", "CI/CD integration for automated test generation on PR"]
    },
  ];

  phases.forEach((p, i) => {
    const x = 0.5 + i * 3.2;
    s.addShape("roundRect", { x, y: 1.38, w: 2.95, h: 3.75, fill: { color: "1F3A5F" }, line: { color: "2A4A72" }, rectRadius: 0.12, shadow: mkCardShadow() });
    // header
    s.addShape("roundRect", { x, y: 1.38, w: 2.95, h: 0.7, fill: { color: p.col }, line: { color: p.col }, rectRadius: 0.12 });
    // patch corners
    s.addShape("rectangle", { x, y: 1.68, w: 2.95, h: 0.4, fill: { color: p.col }, line: { color: p.col } });
    s.addText(p.phase, { x, y: 1.4, w: 2.95, h: 0.36, fontSize: 16, fontFace: "Cambria", bold: true, color: WHITE, align: "center" });
    s.addText(p.label, { x, y: 1.74, w: 2.95, h: 0.26, fontSize: 10, fontFace: "Arial", color: "D8EEF0", align: "center" });
    // status pill
    s.addShape("roundRect", { x: x + 0.72, y: 2.2, w: 1.5, h: 0.26, fill: { color: "0D2A44" }, line: { color: p.col }, rectRadius: 0.1 });
    s.addText(p.status, { x: x + 0.72, y: 2.2, w: 1.5, h: 0.26, fontSize: 9, fontFace: "Arial", color: p.col, align: "center", valign: "middle", margin: 0 });
    // items
    p.items.forEach((item, j) => {
      s.addShape("ellipse", { x: x + 0.2, y: 2.62 + j * 0.72, w: 0.22, h: 0.22, fill: { color: p.col }, line: { color: p.col } });
      s.addText(item, { x: x + 0.52, y: 2.57 + j * 0.72, w: 2.32, h: 0.55, fontSize: 10, fontFace: "Arial", color: "CADCFC", wrap: true });
    });
  });

  // Immediate action items
  s.addShape("roundRect", { x: 0.5, y: 5.22, w: 9, h: 0.38, fill: { color: "0D2A44" }, line: { color: TEAL2 }, rectRadius: 0.08 });
  s.addText("⚡  Immediate: Test v0.0.4 in VS Code (F5) → validate Generate All end-to-end → confirm Xray push with live credentials", {
    x: 0.6, y: 5.24, w: 8.8, h: 0.34, fontSize: 10.5, fontFace: "Arial", color: TEAL2, valign: "middle"
  });

  s.addNotes("The immediate action for any team member with VS Code: pull the latest main branch, press F5, and run the full Generate All workflow. This is the fastest way to see the v0.0.4 changes in action.");
}

// ────────────────────────────────────────────────────────────────────────────
// SLIDE 12 · SUSTAINABILITY
// ────────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: "F2F8F4" };
  slideNumber(s, 12);

  const FOREST  = "1A5C38";
  const MOSS    = "2E8B57";
  const SAGE    = "4AAA6F";
  const MINT    = "D4EDE0";
  const MINTDK  = "A8D5BC";

  // Top band
  s.addShape("rectangle", { x: 0, y: 0, w: 10, h: 1.16, fill: { color: FOREST }, line: { color: FOREST } });
  sectionTag(s, 0.5, 0.22, "Responsible AI", SAGE, WHITE);
  s.addText("Sustainability in Our AI Journey", {
    x: 0.5, y: 0.52, w: 7.5, h: 0.52,
    fontSize: 26, fontFace: "Cambria", bold: true, color: WHITE
  });
  // leaf icon (circle + text substitute)
  s.addShape("ellipse", { x: 8.78, y: 0.2, w: 0.76, h: 0.76, fill: { color: MOSS }, line: { color: SAGE } });
  s.addText("🌱", { x: 8.78, y: 0.18, w: 0.76, h: 0.76, fontSize: 22, align: "center", valign: "middle", margin: 0 });

  // Guiding principle banner
  s.addShape("roundRect", { x: 0.5, y: 1.26, w: 9, h: 0.52,
    fill: { color: FOREST }, line: { color: FOREST }, rectRadius: 0.08 });
  s.addText(
    "“Generate only what is needed, when it is needed, using only the context that matters.”",
    { x: 0.65, y: 1.27, w: 8.7, h: 0.5,
      fontSize: 11.5, fontFace: "Cambria", italic: true, bold: true,
      color: MINTDK, valign: "middle" }
  );

  // ── LEFT COLUMN: Actions ─────────────────────────────────────────────────
  s.addText("Actions Implemented", {
    x: 0.5, y: 1.94, w: 4.55, h: 0.3,
    fontSize: 13, fontFace: "Arial", bold: true, color: FOREST
  });

  const actions = [
    ["🎯", "Prompt Optimisation",
      "Refined templates eliminate redundant instructions. Standardised prompts improve response quality with fewer tokens."],
    ["📦", "Selective Context Delivery",
      "Only relevant requirement content is sent to the AI. Unchanged information is never reprocessed."],
    ["♻️", "Artifact Reuse & Deduplication",
      "SHA-256 fingerprinting prevents re-generating identical outputs. Previously generated artifacts are reused across sessions."],
    ["✅", "Validation Gate Before Generation",
      "Users must review and confirm requirements before AI runs, eliminating regeneration from incomplete inputs."],
  ];

  actions.forEach(([icon, title, desc], i) => {
    const y = 2.32 + i * 0.75;
    s.addShape("roundRect", { x: 0.5, y, w: 4.55, h: 0.68,
      fill: { color: WHITE }, line: { color: MINTDK }, rectRadius: 0.09,
      shadow: { type: "outer", color: "000000", blur: 6, offset: 2, angle: 45, opacity: 0.07 } });
    s.addShape("ellipse", { x: 0.64, y: y + 0.18, w: 0.34, h: 0.34,
      fill: { color: MINT }, line: { color: MINT } });
    s.addText(icon, { x: 0.64, y: y + 0.16, w: 0.34, h: 0.34,
      fontSize: 12, align: "center", valign: "middle", margin: 0 });
    s.addText(title, { x: 1.1, y: y + 0.05, w: 3.82, h: 0.24,
      fontSize: 10.5, fontFace: "Arial", bold: true, color: FOREST });
    s.addText(desc, { x: 1.1, y: y + 0.29, w: 3.82, h: 0.36,
      fontSize: 9.5, fontFace: "Arial", color: MED, wrap: true });
  });

  // ── RIGHT COLUMN: More actions + Benefits ────────────────────────────────
  s.addText("Additional Controls", {
    x: 5.3, y: 1.94, w: 4.2, h: 0.3,
    fontSize: 13, fontFace: "Arial", bold: true, color: FOREST
  });

  const moreActions = [
    ["🗂️", "Structured Document Parsing",
      "Tables, metadata, and document structure preserved during parsing — reducing AI effort to reconstruct context."],
    ["🎛️", "Targeted Output Generation",
      "Users request only the artifacts they need (scenarios, test cases, Gherkin) — not all outputs by default."],
    ["🔄", "Session Isolation",
      "Each generation cycle runs with a clean, isolated context. No excessive carry-over between sessions."],
  ];

  moreActions.forEach(([icon, title, desc], i) => {
    const y = 2.32 + i * 0.75;
    s.addShape("roundRect", { x: 5.3, y, w: 4.2, h: 0.68,
      fill: { color: WHITE }, line: { color: MINTDK }, rectRadius: 0.09,
      shadow: { type: "outer", color: "000000", blur: 6, offset: 2, angle: 45, opacity: 0.07 } });
    s.addShape("ellipse", { x: 5.44, y: y + 0.18, w: 0.34, h: 0.34,
      fill: { color: MINT }, line: { color: MINT } });
    s.addText(icon, { x: 5.44, y: y + 0.16, w: 0.34, h: 0.34,
      fontSize: 12, align: "center", valign: "middle", margin: 0 });
    s.addText(title, { x: 5.9, y: y + 0.05, w: 3.46, h: 0.24,
      fontSize: 10.5, fontFace: "Arial", bold: true, color: FOREST });
    s.addText(desc, { x: 5.9, y: y + 0.29, w: 3.46, h: 0.36,
      fontSize: 9.5, fontFace: "Arial", color: MED, wrap: true });
  });

  // Benefits row
  s.addShape("roundRect", { x: 5.3, y: 4.59, w: 4.2, h: 0.88,
    fill: { color: FOREST }, line: { color: FOREST }, rectRadius: 0.1 });
  s.addText("Benefits", {
    x: 5.3, y: 4.62, w: 4.2, h: 0.26,
    fontSize: 11, fontFace: "Arial", bold: true, color: MINTDK, align: "center"
  });
  const benefits = [
    ["↓ Token consumption", "↑ App performance"],
    ["↓ Compute overhead", "↑ Response speed"],
    ["↓ Cost per generation", "↑ Responsible AI use"],
  ];
  benefits.forEach(([left, right], i) => {
    s.addText(`${left}    ${right}`, {
      x: 5.38, y: 4.9 + i * 0.19, w: 4.04, h: 0.2,
      fontSize: 9.5, fontFace: "Arial", color: MINTDK, align: "center"
    });
  });

  s.addNotes(
    "TraceLM is built with sustainable AI consumption as a design principle, not an afterthought. " +
    "Every architectural decision — fingerprint dedup, LLM caching, validation gates, selective context — " +
    "reduces token spend and compute load. This aligns our AI journey with responsible and cost-efficient operation."
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SLIDE 13 · CLOSING
// ────────────────────────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: DARK };

  slideNumber(s, 13);
  s.addShape("ellipse", { x: 6.5, y: -0.8, w: 5.0, h: 5.0, fill: { color: TEAL, transparency: 88 }, line: { color: TEAL, transparency: 88 } });
  s.addShape("ellipse", { x: -1.5, y: 2.5, w: 4.0, h: 4.0, fill: { color: NAVY, transparency: 40 }, line: { color: NAVY, transparency: 40 } });

  sectionTag(s, 3.25, 0.8, "Summary", TEAL, WHITE);

  s.addText("TraceLM is ready.", {
    x: 0.5, y: 1.2, w: 9, h: 0.85, fontSize: 44, fontFace: "Cambria", bold: true, color: WHITE, align: "center"
  });
  s.addText("Requirements → AI Enhancement → Test Cases → Xray", {
    x: 0.5, y: 2.05, w: 9, h: 0.5, fontSize: 17, fontFace: "Arial", color: TEAL2, align: "center", italic: true
  });

  s.addShape("line", { x: 3.0, y: 2.68, w: 4.0, h: 0, line: { color: TEAL, width: 1.5 } });

  const summary = [
    ["✅", "v0.0.4 live on GitHub — CI/CD verified"],
    ["🔗", "3 LLM providers · Jira Cloud · Xray Cloud"],
    ["🛡️", "Enterprise security: OS-native SecretStorage + OAuth 2.0"],
    ["🗺️", "Roadmap defined through v1.0"],
  ];
  summary.forEach(([icon, text], i) => {
    s.addText(`${icon}  ${text}`, {
      x: 1.5, y: 2.92 + i * 0.42, w: 7, h: 0.38,
      fontSize: 13, fontFace: "Arial", color: "CADCFC", align: "center"
    });
  });

  s.addText("github.com/ArielCesarMA/TraceLM", {
    x: 0.5, y: 5.05, w: 9, h: 0.3, fontSize: 11, fontFace: "Arial", color: TEAL2, align: "center", italic: true
  });

  s.addNotes("Close with a call to action: any stakeholder who wants a live demo can schedule a session. The extension installs from a single VSIX file — no server, no deployment, no infrastructure required.");
}

// ── WRITE FILE ───────────────────────────────────────────────────────────────
pres.writeFile({ fileName: OUT })
  .then(() => console.log("Written:", OUT))
  .catch(err => { console.error(err); process.exit(1); });
