"use strict";
const pptxgen = require("pptxgenjs");
const path    = require("path");
const fs      = require("fs");

const OUT_DIR = path.join("C:\\Users\\Ariel Cesar Abaoag\\Documents\\PROJECT7\\TraceLM\\DOCUMENTATION\\ARCHITECTURE");
fs.mkdirSync(OUT_DIR, { recursive: true });
const OUT = path.join(OUT_DIR, "TraceLM_Architecture_Proposal.pptx");

// ── PALETTE ───────────────────────────────────────────────────────────────────
const NAVY    = "1B2A4A";
const NAVY2   = "243556";
const TEAL    = "028090";
const TEAL2   = "02A8BC";
const WHITE   = "FFFFFF";
const ICE     = "E8F4F8";
const LIGHT   = "F4F7FB";
const DARK    = "1A1A2E";
const MED     = "4A5568";
const AMBER   = "E67E22";
const GREEN   = "27AE60";
const RED     = "C0392B";
const PURPLE  = "6C3483";
const LGRAY   = "ECF0F1";
const DKGRAY  = "7F8C8D";

const prs = new pptxgen();
prs.layout = "LAYOUT_WIDE"; // 13.33" × 7.5"
const W = 13.33, H = 7.5;

// ── HELPERS ───────────────────────────────────────────────────────────────────
function bg(slide, color = LIGHT) {
  slide.addShape(prs.ShapeType.rect, { x:0, y:0, w:W, h:H, fill:{ color }, line:{ color } });
}
function topBar(slide, accent = TEAL) {
  slide.addShape(prs.ShapeType.rect, { x:0, y:0, w:W, h:0.65, fill:{ color:NAVY }, line:{ color:NAVY } });
  slide.addShape(prs.ShapeType.rect, { x:0, y:0.65, w:W, h:0.05, fill:{ color:accent }, line:{ color:accent } });
}
function slideTitle(slide, title, subtitle="") {
  slide.addText(title, { x:0.4, y:0.09, w:W-1.5, h:0.46, fontSize:21, bold:true, color:WHITE, fontFace:"Arial", valign:"middle" });
  if (subtitle) slide.addText(subtitle, { x:0.4, y:0.66, w:W-0.8, h:0.28, fontSize:10, color:TEAL2, fontFace:"Arial", italic:true });
}
function chip(slide, x, y, label, bg_color, fg_color=WHITE, w=1.4, h=0.28) {
  slide.addShape(prs.ShapeType.roundRect, { x, y, w, h, fill:{ color:bg_color }, line:{ color:bg_color }, rectRadius:0.08 });
  slide.addText(label, { x, y, w, h, fontSize:9, bold:true, color:fg_color, align:"center", valign:"middle", fontFace:"Arial" });
}
function scoreCard(slide, x, y, score, label, color) {
  slide.addShape(prs.ShapeType.roundRect, { x, y, w:2.1, h:1.4, fill:{ color:NAVY2 }, line:{ color:TEAL }, rectRadius:0.1,
    shadow:{ type:"outer", color:"000000", blur:12, offset:3, angle:45, opacity:0.15 } });
  slide.addText(score, { x, y:y+0.12, w:2.1, h:0.72, fontSize:42, bold:true, color, align:"center", fontFace:"Cambria" });
  slide.addText("/10", { x, y:y+0.72, w:2.1, h:0.22, fontSize:13, color:DKGRAY, align:"center", fontFace:"Arial" });
  slide.addText(label, { x, y:y+0.98, w:2.1, h:0.34, fontSize:10, bold:true, color:WHITE, align:"center", fontFace:"Arial", wrap:true });
}
function sectionBox(slide, x, y, w, h, title, items, titleBg=NAVY, itemColor=DARK) {
  // Container card
  slide.addShape(prs.ShapeType.roundRect, { x, y, w, h, fill:{ color:WHITE }, line:{ color:"D0DAE8" }, rectRadius:0.08,
    shadow:{ type:"outer", color:"000000", blur:10, offset:2, angle:45, opacity:0.10 } });
  // Header band
  slide.addShape(prs.ShapeType.roundRect, { x, y, w, h:0.38, fill:{ color:titleBg }, line:{ color:titleBg }, rectRadius:0.08 });
  slide.addShape(prs.ShapeType.rect, { x, y:y+0.22, w, h:0.16, fill:{ color:titleBg }, line:{ color:titleBg } });
  slide.addText(title, { x:x+0.14, y:y+0.05, w:w-0.24, h:0.28, fontSize:9.5, bold:true, color:WHITE, fontFace:"Arial" });
  // Numbered item rows — fixed row height so they never overflow
  const rowH   = (h - 0.48) / Math.max(items.length, 1);
  const clampH = Math.min(rowH, 0.52);
  items.forEach((item, idx) => {
    const iy  = y + 0.44 + idx * clampH;
    const rowBg = idx % 2 === 0 ? WHITE : "F0F5FB";
    slide.addShape(prs.ShapeType.rect, { x:x+0.06, y:iy, w:w-0.12, h:clampH-0.02,
      fill:{ color:rowBg }, line:{ color:"E4EAF3" } });
    // number badge
    slide.addShape(prs.ShapeType.roundRect, { x:x+0.1, y:iy+0.05, w:0.24, h:clampH-0.12,
      fill:{ color:titleBg }, line:{ color:titleBg }, rectRadius:0.04 });
    slide.addText(String(idx+1), { x:x+0.1, y:iy+0.05, w:0.24, h:clampH-0.12,
      fontSize:8, bold:true, color:WHITE, align:"center", valign:"middle", fontFace:"Arial" });
    // item text
    slide.addText(item, { x:x+0.4, y:iy+0.02, w:w-0.5, h:clampH-0.04,
      fontSize:9, color:itemColor, fontFace:"Arial", valign:"middle", wrap:true });
  });
}
function phaseBar(slide, x, y, w, phase, titleLine1, titleLine2, color, items) {
  const cardH = 4.2;
  const hdrH  = 0.82;
  slide.addShape(prs.ShapeType.roundRect, { x, y, w, h:cardH, fill:{ color:WHITE }, line:{ color }, rectRadius:0.08,
    shadow:{ type:"outer", color:"000000", blur:8, offset:2, angle:45, opacity:0.10 } });
  // colored header band
  slide.addShape(prs.ShapeType.roundRect, { x, y, w, h:hdrH, fill:{ color }, line:{ color }, rectRadius:0.08 });
  slide.addShape(prs.ShapeType.rect, { x, y:y+hdrH-0.18, w, h:0.18, fill:{ color }, line:{ color } });
  // Phase label (e.g. "Phase 1")
  slide.addText(phase, { x:x+0.08, y:y+0.06, w:w-0.16, h:0.28, fontSize:10, bold:true, color:WHITE, fontFace:"Arial", align:"center" });
  // Title line 1 (e.g. "Foundation")
  slide.addText(titleLine1, { x:x+0.08, y:y+0.32, w:w-0.16, h:0.22, fontSize:9, bold:true, color:WHITE, fontFace:"Arial", align:"center" });
  // Title line 2 (e.g. "Weeks 1–6")
  slide.addText(titleLine2, { x:x+0.08, y:y+0.52, w:w-0.16, h:0.22, fontSize:8, color:WHITE, fontFace:"Arial", italic:true, align:"center" });
  // Bullet items
  items.forEach((item, idx) => {
    const iy = y + hdrH + 0.1 + idx * 0.52;
    const rowBg = idx % 2 === 0 ? "EFF3F9" : WHITE;
    slide.addShape(prs.ShapeType.rect, { x:x+0.06, y:iy, w:w-0.12, h:0.46, fill:{ color:rowBg }, line:{ color:"E4EAF3" } });
    // small colored dot
    slide.addShape(prs.ShapeType.ellipse, { x:x+0.14, y:iy+0.16, w:0.1, h:0.1, fill:{ color }, line:{ color } });
    slide.addText(item, { x:x+0.28, y:iy+0.04, w:w-0.38, h:0.38, fontSize:8, color:DARK, fontFace:"Arial", wrap:true, valign:"middle" });
  });
}
function arrowRight(slide, x, y) {
  slide.addText("▶", { x, y, w:0.22, h:0.3, fontSize:11, color:TEAL, align:"center", fontFace:"Arial" });
}
function rowTable(slide, x, y, w, rows, hdrBg=NAVY, colWidths=[]) {
  const rh = 0.3;
  rows.forEach((row, ri) => {
    const isHdr = ri === 0;
    const rowBg = isHdr ? hdrBg : (ri%2===0 ? WHITE : ICE);
    let cx = x;
    row.forEach((cell, ci) => {
      const cw = colWidths[ci] || w/row.length;
      slide.addShape(prs.ShapeType.rect, { x:cx, y:y+ri*rh, w:cw, h:rh, fill:{ color:rowBg }, line:{ color:"D0DAE8", pt:0.5 } });
      slide.addText(String(cell), { x:cx+0.05, y:y+ri*rh, w:cw-0.1, h:rh, fontSize:isHdr?9:8.5, bold:isHdr,
        color:isHdr?WHITE:DARK, fontFace:"Arial", valign:"middle" });
      cx += cw;
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — TITLE
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  // Full navy background
  s.addShape(prs.ShapeType.rect, { x:0, y:0, w:W, h:H, fill:{ color:NAVY }, line:{ color:NAVY } });
  // Teal accent diagonal band
  s.addShape(prs.ShapeType.rect, { x:0, y:5.8, w:W, h:0.06, fill:{ color:TEAL }, line:{ color:TEAL } });
  s.addShape(prs.ShapeType.rect, { x:0, y:5.86, w:W, h:1.64, fill:{ color:NAVY2 }, line:{ color:NAVY2 } });
  // Logo text
  s.addText("TraceLM", { x:0.5, y:1.1, w:8, h:1.0, fontSize:54, bold:true, color:WHITE, fontFace:"Cambria" });
  s.addText("AI-Powered Test Intelligence Platform", { x:0.5, y:2.05, w:9, h:0.5, fontSize:22, color:TEAL2, fontFace:"Arial", italic:true });
  // Divider
  s.addShape(prs.ShapeType.rect, { x:0.5, y:2.65, w:5, h:0.05, fill:{ color:TEAL }, line:{ color:TEAL } });
  // Subtitle
  s.addText("Architecture Review & Strategic Implementation Plan", { x:0.5, y:2.85, w:10, h:0.55, fontSize:18, color:ICE, fontFace:"Arial" });
  s.addText("Proposed Roadmap to Enterprise-Grade SaaS Platform", { x:0.5, y:3.38, w:10, h:0.4, fontSize:14, color:DKGRAY, fontFace:"Arial", italic:true });
  // Meta
  s.addText("Presented to: Directors · Operations Managers · Department Heads", { x:0.5, y:6.0, w:10, h:0.3, fontSize:11, color:DKGRAY, fontFace:"Arial" });
  s.addText("June 2026  |  Principal Architect Assessment  |  Confidential", { x:0.5, y:6.35, w:10, h:0.28, fontSize:10, color:DKGRAY, fontFace:"Arial" });
  // Version chip
  chip(s, W-1.6, 6.1, "v 0.0.5 → Enterprise", TEAL, WHITE, 1.5, 0.32);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — AGENDA
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  bg(s, LIGHT);
  topBar(s);
  slideTitle(s, "Agenda", "What we will cover in this session");

  const items = [
    ["01", "Executive Scorecard",          "Where TraceLM stands today across 4 dimensions"],
    ["02", "What TraceLM Does Well",       "Current strengths and unique differentiators"],
    ["03", "Critical Gaps & Risks",        "What must be addressed before production"],
    ["04", "Market Position",              "How TraceLM compares to Xray, Zephyr, TestRail, qTest"],
    ["05", "Target Architecture",          "Where we need to go — the proposed future state"],
    ["06", "5-Phase Implementation Plan",  "Phased roadmap with timelines and ownership"],
    ["07", "Investment & Effort Summary",  "What it takes to get there"],
    ["08", "Recommendation & Next Steps",  "Ask of this leadership team"],
  ];

  items.forEach(([num, title, desc], i) => {
    const x = i < 4 ? 0.4 : 6.9;
    const y = 1.1 + (i % 4) * 1.35;
    s.addShape(prs.ShapeType.roundRect, { x, y, w:6.1, h:1.15, fill:{ color:WHITE }, line:{ color:"D0DAE8" }, rectRadius:0.08,
      shadow:{ type:"outer", color:"000000", blur:8, offset:2, angle:45, opacity:0.08 } });
    s.addShape(prs.ShapeType.roundRect, { x, y, w:0.52, h:1.15, fill:{ color:NAVY }, line:{ color:NAVY }, rectRadius:0.08 });
    s.addShape(prs.ShapeType.rect, { x:x+0.32, y, w:0.2, h:1.15, fill:{ color:NAVY }, line:{ color:NAVY } });
    s.addText(num, { x, y:y+0.3, w:0.52, h:0.55, fontSize:16, bold:true, color:TEAL2, align:"center", fontFace:"Cambria" });
    s.addText(title, { x:x+0.62, y:y+0.12, w:5.35, h:0.36, fontSize:12, bold:true, color:DARK, fontFace:"Arial" });
    s.addText(desc,  { x:x+0.62, y:y+0.5,  w:5.35, h:0.54, fontSize:10, color:MED,  fontFace:"Arial", wrap:true });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — EXECUTIVE SCORECARD
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  bg(s, LIGHT);
  topBar(s);
  slideTitle(s, "Executive Scorecard", "Current maturity assessment — TraceLM v0.0.5");

  // ── LEFT COLUMN: 2×2 score card grid ──────────────────────────────────────
  // Card positions: 2 columns × 2 rows, each 2.55 wide × 1.55 tall
  const scoreData = [
    ["3", "Architecture Maturity",   RED,   0.3,  1.05],
    ["4", "Product Maturity",        AMBER, 3.05, 1.05],
    ["2", "Security Maturity",       RED,   0.3,  2.75],
    ["1", "Scalability Readiness",   RED,   3.05, 2.75],
  ];
  scoreData.forEach(([score, label, color, x, y]) => {
    s.addShape(prs.ShapeType.roundRect, { x, y, w:2.55, h:1.55, fill:{ color:NAVY2 }, line:{ color },
      rectRadius:0.1, shadow:{ type:"outer", color:"000000", blur:10, offset:3, angle:45, opacity:0.15 } });
    // colored top accent bar
    s.addShape(prs.ShapeType.roundRect, { x, y, w:2.55, h:0.08, fill:{ color }, line:{ color }, rectRadius:0.1 });
    s.addShape(prs.ShapeType.rect, { x, y:y+0.04, w:2.55, h:0.04, fill:{ color }, line:{ color } });
    s.addText(score, { x, y:y+0.1, w:2.55, h:0.82, fontSize:44, bold:true, color, align:"center", fontFace:"Cambria" });
    s.addText("/10", { x, y:y+0.88, w:2.55, h:0.22, fontSize:12, color:DKGRAY, align:"center", fontFace:"Arial" });
    s.addText(label, { x, y:y+1.12, w:2.55, h:0.36, fontSize:9.5, bold:true, color:WHITE, align:"center", fontFace:"Arial" });
  });

  // Technical Debt note under the 2×2 grid
  s.addShape(prs.ShapeType.roundRect, { x:0.3, y:4.42, w:5.3, h:1.12, fill:{ color:WHITE }, line:{ color:"D0DAE8" }, rectRadius:0.08 });
  s.addShape(prs.ShapeType.roundRect, { x:0.3, y:4.42, w:5.3, h:0.28, fill:{ color:AMBER }, line:{ color:AMBER }, rectRadius:0.08 });
  s.addShape(prs.ShapeType.rect, { x:0.3, y:4.56, w:5.3, h:0.14, fill:{ color:AMBER }, line:{ color:AMBER } });
  s.addText("TECHNICAL DEBT  ·  MEDIUM — Manageable", { x:0.42, y:4.44, w:5.0, h:0.24, fontSize:9, bold:true, color:WHITE, fontFace:"Arial" });
  s.addText("TraceLMPanel.ts is 1,300+ lines and App.tsx is 600+ lines — both need decomposition before Phase 2 work can begin safely.",
    { x:0.42, y:4.74, w:5.06, h:0.7, fontSize:9, color:MED, fontFace:"Arial", wrap:true, valign:"top" });

  // ── RIGHT COLUMN: legend + bottom line ────────────────────────────────────
  s.addText("WHAT THE SCORES MEAN", { x:6.05, y:1.0, w:7.0, h:0.28, fontSize:10, bold:true, color:NAVY, fontFace:"Arial" });
  [
    [RED,   "1–3",  "Pre-production. Not suitable for enterprise deployment."],
    [AMBER, "4–6",  "Emerging. Functional for single users; gaps for teams."],
    [GREEN, "7–8",  "Production-ready. Meets most enterprise requirements."],
    [TEAL,  "9–10", "Enterprise-grade. SOC2, RBAC, SLA, full observability."],
  ].forEach(([color, range, desc], i) => {
    const ry = 1.38 + i * 0.78;
    s.addShape(prs.ShapeType.roundRect, { x:6.05, y:ry, w:7.0, h:0.66, fill:{ color:WHITE }, line:{ color:"E0E0E0" }, rectRadius:0.06 });
    s.addShape(prs.ShapeType.roundRect, { x:6.05, y:ry, w:0.6,  h:0.66, fill:{ color }, line:{ color }, rectRadius:0.06 });
    s.addShape(prs.ShapeType.rect,      { x:6.38, y:ry, w:0.27, h:0.66, fill:{ color }, line:{ color } });
    s.addText(range, { x:6.06, y:ry+0.14, w:0.58, h:0.38, fontSize:11, bold:true, color:WHITE, align:"center", fontFace:"Cambria" });
    s.addText(desc,  { x:6.72, y:ry+0.06, w:6.24, h:0.54, fontSize:10, color:DARK, fontFace:"Arial", valign:"middle" });
  });

  // Bottom line — full width
  s.addShape(prs.ShapeType.roundRect, { x:0.3, y:5.65, w:12.73, h:1.6, fill:{ color:NAVY2 }, line:{ color:TEAL }, rectRadius:0.08,
    shadow:{ type:"outer", color:"000000", blur:10, offset:2, angle:45, opacity:0.10 } });
  s.addText("BOTTOM LINE", { x:0.55, y:5.72, w:2.5, h:0.28, fontSize:10, bold:true, color:TEAL2, fontFace:"Arial" });
  s.addText(
    "TraceLM has a genuinely differentiated AI core — multi-provider LLM generation, automation candidate analysis, and Playwright classification are unique in the market. " +
    "The constraint is architecture: built as a single-user VS Code extension, that constraint permeates every layer. " +
    "The gap between current state and enterprise-ready is real — but closeable in ~32 weeks with the right investment.",
    { x:0.55, y:6.02, w:12.28, h:1.15, fontSize:10, color:WHITE, fontFace:"Arial", wrap:true, valign:"top" });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — WHAT TRACELM DOES WELL
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  bg(s, LIGHT);
  topBar(s, GREEN);
  slideTitle(s, "What TraceLM Does Well", "Strengths and unique market differentiators");

  const strengths = [
    ["🤖", "Multi-Provider AI",         "Supports OpenAI, Anthropic, and Gemini behind a clean provider interface. Unique in the TMS market — no competitor offers this.",        GREEN],
    ["🎯", "Post-Generation Validator", "A second LLM call validates and corrects every generation before the UI sees it. Architecturally forward-thinking quality gate.",         TEAL],
    ["🔧", "Automation Analysis",       "Classifies test cases as P1–P4 automation candidates with Playwright scope, ROI level, and feasibility. No direct competitor.",          NAVY],
    ["📤", "Native Xray Push",          "Batch push with fingerprint deduplication, retry, and rate-limit handling. Production-quality Xray integration no other tool has.",      PURPLE],
    ["📝", "Externalized Prompts",      "All LLM prompts are plain text files — non-developers can iterate on prompt quality without code changes. Enables rapid improvement.",   AMBER],
    ["✅", "Prompt Taxonomy",           "HP/AF/EC/EG/BR scenario types and Functional/Negative/Edge/Integration test types enforce ISTQB-aligned classification automatically.", TEAL],
  ];

  strengths.forEach(([icon, title, desc, color], i) => {
    const x = i % 3 < 1 ? 0.4 : i % 3 < 2 ? 4.72 : 9.04;
    const y = i < 3 ? 1.1 : 4.0;
    s.addShape(prs.ShapeType.roundRect, { x, y, w:4.0, h:2.7, fill:{ color:WHITE }, line:{ color:"D0DAE8" }, rectRadius:0.1,
      shadow:{ type:"outer", color:"000000", blur:10, offset:2, angle:45, opacity:0.08 } });
    s.addShape(prs.ShapeType.roundRect, { x, y, w:4.0, h:0.06, fill:{ color }, line:{ color }, rectRadius:0.1 });
    s.addText(icon,  { x:x+0.15, y:y+0.18, w:0.5, h:0.5, fontSize:22, align:"center" });
    s.addText(title, { x:x+0.7,  y:y+0.18, w:3.15, h:0.48, fontSize:12, bold:true, color:DARK, fontFace:"Arial", valign:"middle" });
    s.addText(desc,  { x:x+0.15, y:y+0.72, w:3.7, h:1.85, fontSize:9.5, color:MED, fontFace:"Arial", wrap:true, valign:"top" });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — CRITICAL GAPS & RISKS
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  bg(s, LIGHT);
  topBar(s, RED);
  slideTitle(s, "Critical Gaps & Risks", "What must be addressed before enterprise deployment");

  const gaps = [
    ["🔐", "No Authentication or RBAC",  "Anyone with the extension can access all data. No roles, no permissions, no tenant isolation.",          RED],
    ["📋", "No Audit Trail",             "Zero record of who generated what, who edited what, or what was pushed to Jira. Compliance failure.",    RED],
    ["💾", "No Persistent Storage",      "All generation data lives in React state. Lost on reload. VS Code uninstall = total data loss.",          RED],
    ["🔒", "No Prompt Injection Guard",  "A malicious requirements document could manipulate LLM output. No input sanitization exists.",           AMBER],
    ["📊", "No Traceability Matrix",      "No view linking requirement → scenario → test case → Xray. Core TMS feature, completely missing.",      AMBER],
    ["💰", "No Cost Governance",         "No token budget, no per-org key management, no LLM cost visibility. Cost explosion risk at scale.",      AMBER],
  ];

  gaps.forEach(([icon, title, desc, color], i) => {
    const x = i % 2 === 0 ? 0.4 : 6.9;
    const y = 1.05 + Math.floor(i / 2) * 1.9;
    s.addShape(prs.ShapeType.roundRect, { x, y, w:6.1, h:1.7, fill:{ color:WHITE }, line:{ color }, rectRadius:0.08,
      shadow:{ type:"outer", color:"000000", blur:8, offset:2, angle:45, opacity:0.08 } });
    s.addShape(prs.ShapeType.roundRect, { x, y, w:0.5, h:1.7, fill:{ color }, line:{ color }, rectRadius:0.08 });
    s.addShape(prs.ShapeType.rect, { x:x+0.3, y, w:0.2, h:1.7, fill:{ color }, line:{ color } });
    s.addText(icon,  { x:x+0.02, y:y+0.55, w:0.46, h:0.6, fontSize:18, align:"center" });
    s.addText(title, { x:x+0.62, y:y+0.18, w:5.35, h:0.38, fontSize:12, bold:true, color:DARK, fontFace:"Arial" });
    s.addText(desc,  { x:x+0.62, y:y+0.58, w:5.35, h:1.0,  fontSize:9.5, color:MED, fontFace:"Arial", wrap:true });
  });

  chip(s, 0.4, 6.82, "● CRITICAL", RED, WHITE, 1.3);
  chip(s, 1.8, 6.82, "● HIGH",     AMBER, WHITE, 1.3);
  s.addText("Critical = must fix before any production deployment.  High = must fix before enterprise pilot.",
    { x:3.3, y:6.82, w:9.6, h:0.28, fontSize:9, color:DKGRAY, fontFace:"Arial", italic:true });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — MARKET POSITION
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  bg(s, LIGHT);
  topBar(s, TEAL);
  slideTitle(s, "Market Position", "TraceLM vs. enterprise test management platforms");

  rowTable(s, 0.3, 1.0, 12.7,
    [
      ["Capability",                  "TraceLM",      "Xray",   "Zephyr", "TestRail", "qTest"],
      ["AI test generation",          "✓  Core",      "Partial","No",     "No",       "Partial"],
      ["Multi-provider LLM support",  "✓  UNIQUE",    "No",     "No",     "No",       "No"],
      ["Automation candidate analysis","✓  UNIQUE",   "No",     "No",     "No",       "No"],
      ["Post-generation validation",  "✓  UNIQUE",    "No",     "No",     "No",       "No"],
      ["Native Xray push integration","✓  UNIQUE",    "N/A",    "No",     "No",       "No"],
      ["Requirement traceability",    "Partial",      "✓",      "✓",      "✓",        "✓"],
      ["Test execution tracking",     "✗  MISSING",   "✓",      "✓",      "✓",        "✓"],
      ["Multi-user collaboration",    "✗  MISSING",   "✓",      "✓",      "✓",        "✓"],
      ["RBAC / SSO / SAML",          "✗  MISSING",   "✓",      "✓",      "✓",        "✓"],
      ["Audit trail",                 "✗  MISSING",   "✓",      "✓",      "✓",        "✓"],
      ["Analytics dashboard",         "✗  MISSING",   "✓",      "✓",      "✓",        "✓"],
    ],
    NAVY, [3.5, 2.1, 1.8, 1.8, 1.8, 1.7]
  );

  s.addShape(prs.ShapeType.roundRect, { x:0.3, y:5.65, w:12.7, h:1.55, fill:{ color:NAVY2 }, line:{ color:TEAL }, rectRadius:0.08 });
  s.addText("STRATEGIC INSIGHT", { x:0.6, y:5.75, w:3, h:0.3, fontSize:10, bold:true, color:TEAL2, fontFace:"Arial" });
  s.addText(
    "TraceLM holds 4 unique capabilities no competitor has. The AI generation quality, multi-provider support, automation analysis, and Xray integration are genuine differentiators. " +
    "The critical gap is everything else — collaboration, RBAC, audit, analytics. Closing those gaps in 32 weeks positions TraceLM as the only AI-native enterprise TMS with Xray-native integration.",
    { x:0.6, y:6.08, w:12.3, h:1.0, fontSize:10, color:WHITE, fontFace:"Arial", wrap:true });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — TARGET ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  bg(s, LIGHT);
  topBar(s, NAVY2);
  slideTitle(s, "Proposed Target Architecture", "From VS Code extension to enterprise SaaS platform");

  // Architecture layers
  const layers = [
    { label:"CLIENT LAYER",     color:TEAL,   items:["VS Code Extension (webview)","Web Application (React SPA)","Mobile (future)"], y:1.0 },
    { label:"API GATEWAY",      color:NAVY,   items:["Auth middleware","Rate limiting","Request routing","Logging"], y:2.15 },
    { label:"SERVICE LAYER",    color:PURPLE, items:["Auth Service (OAuth/SAML)","Generation Service (LLM Orchestrator)","Push Service (Xray/Jira)","Notification Service"], y:3.3 },
    { label:"ASYNC / QUEUE",    color:AMBER,  items:["Job Queue (BullMQ)","LLM Worker Pool","Validator Workers","Audit Logger"], y:4.45 },
    { label:"DATA LAYER",       color:GREEN,  items:["PostgreSQL (primary store)","Redis (cache + queues)","Prompt Registry","AI Audit Log"], y:5.6 },
  ];

  layers.forEach(({ label, color, items, y }) => {
    s.addShape(prs.ShapeType.roundRect, { x:0.3, y, w:12.7, h:0.9, fill:{ color:WHITE }, line:{ color:"D0DAE8" }, rectRadius:0.06 });
    s.addShape(prs.ShapeType.roundRect, { x:0.3, y, w:2.2, h:0.9, fill:{ color }, line:{ color }, rectRadius:0.06 });
    s.addShape(prs.ShapeType.rect, { x:2.1, y, w:0.4, h:0.9, fill:{ color }, line:{ color } });
    s.addText(label, { x:0.35, y:y+0.25, w:2.1, h:0.4, fontSize:8.5, bold:true, color:WHITE, fontFace:"Arial", align:"center" });
    items.forEach((item, i) => {
      const ix = 2.65 + i * 2.56;
      s.addShape(prs.ShapeType.roundRect, { x:ix, y:y+0.12, w:2.35, h:0.65, fill:{ color:ICE }, line:{ color }, rectRadius:0.06 });
      s.addText(item, { x:ix+0.05, y:y+0.12, w:2.25, h:0.65, fontSize:9, color:DARK, fontFace:"Arial", align:"center", valign:"middle", wrap:true });
    });
    if (y < 5.6) {
      s.addText("↕", { x:6.5, y:y+0.9, w:0.4, h:0.25, fontSize:13, color:TEAL, align:"center" });
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 8 — IMPLEMENTATION ROADMAP (OVERVIEW)
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  bg(s, LIGHT);
  topBar(s, TEAL);
  slideTitle(s, "5-Phase Implementation Roadmap", "Phased approach from stable extension to enterprise SaaS");

  // Card width=2.44, gap=0.08 → 5×2.44 + 4×0.08 = 12.52, start at 0.4 → end at 12.92 ✓
  const CARD_W = 2.44;
  const GAP    = 0.08;
  const START  = 0.4;

  const phases = [
    { phase:"Phase 1", t1:"Foundation",    t2:"Weeks 1–6",   color:RED,
      items:["Decompose TraceLMPanel.ts","Append-only audit log","Session history store","Push approval gate","Traceability Matrix","LLM cost display"] },
    { phase:"Phase 2", t1:"Core Platform", t2:"Weeks 7–18",  color:AMBER,
      items:["NestJS + PostgreSQL + Redis","Async BullMQ pipeline","WebSocket streaming","Analytics dashboard","AI audit log API","Playwright E2E suite"] },
    { phase:"Phase 3", t1:"Enterprise",    t2:"Weeks 19–34", color:PURPLE,
      items:["RBAC (6 roles)","OAuth 2.0 / SAML SSO","Multi-tenant RLS","Cloud (AWS/Azure)","Approval workflow","Notification system"] },
    { phase:"Phase 4", t1:"AI Governance", t2:"Weeks 35–44", color:TEAL,
      items:["Prompt Registry + A/B","Org-level key vault","Token budget limits","Multi-model evaluation","Execution tracking","Prompt regression tests"] },
    { phase:"Phase 5", t1:"Scale",         t2:"Weeks 45+",   color:GREEN,
      items:["Kubernetes + autoscaling","SOC2 Type II","Web app (browser)","Public API + docs","Penetration testing","SLA 99.9% uptime"] },
  ];

  phases.forEach(({ phase, t1, t2, color, items }, i) => {
    const x = START + i * (CARD_W + GAP);
    phaseBar(s, x, 1.0, CARD_W, phase, t1, t2, color, items);
    // arrow in the gap between cards
    if (i < 4) {
      const ax = x + CARD_W + GAP * 0.1;
      s.addText("▶", { x:ax, y:2.85, w:GAP * 0.8, h:0.28, fontSize:10, color:TEAL, align:"center", fontFace:"Arial" });
    }
  });

  // Timeline bar at bottom
  const TL_Y = 5.35;
  s.addShape(prs.ShapeType.rect, { x:START, y:TL_Y+0.08, w:12.52, h:0.05, fill:{ color:DKGRAY }, line:{ color:DKGRAY } });
  ["Wk 1","Wk 7","Wk 19","Wk 35","Wk 45","Wk 45+"].forEach((label, i) => {
    const tx = START + i * (CARD_W + GAP);
    s.addShape(prs.ShapeType.ellipse, { x:tx-0.07, y:TL_Y+0.03, w:0.14, h:0.14, fill:{ color:NAVY }, line:{ color:NAVY } });
    s.addText(label, { x:tx-0.32, y:TL_Y+0.2, w:0.72, h:0.2, fontSize:7.5, color:NAVY, fontFace:"Arial", align:"center" });
  });

  // Team / duration chips under each card
  const meta = [["1–2 devs · 4–6 wks"],["2 devs · 8–12 wks"],["3 devs · 12–16 wks"],["2 devs · 8–10 wks"],["3+ devs · Ongoing"]];
  meta.forEach(([txt], i) => {
    const x = START + i * (CARD_W + GAP);
    s.addText(txt, { x, y:5.62, w:CARD_W, h:0.24, fontSize:8, color:MED, fontFace:"Arial", align:"center", italic:true });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 9 — PHASE 1 DETAIL
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  bg(s, LIGHT);
  topBar(s, RED);
  slideTitle(s, "Phase 1 — Foundation  (Weeks 1–6)", "Make the current extension production-stable for individual and team use");

  chip(s, 0.4, 0.72, "1–2 Developers", NAVY, WHITE, 1.7);
  chip(s, 2.2, 0.72, "4–6 Weeks",      RED,  WHITE, 1.3);
  chip(s, 3.65, 0.72, "~15 Person-Days", TEAL, WHITE, 1.8);

  const tasks = [
    ["1.1", "Decompose TraceLMPanel.ts",   "3 days", "Critical", "Split god object into LLM Orchestrator, Push Service, Session Service. Foundation for everything else."],
    ["1.2", "Add audit logging",           "2 days", "Critical", "Append-only log of every generate, edit, delete, push action. Compliance prerequisite."],
    ["1.3", "Prompt injection guard",      "1 day",  "Critical", "Sanitize and escape all document input before LLM calls."],
    ["1.4", "Session/generation history",  "3 days", "High",     "Save last 10 generations with timestamps. Reload without regenerating. Eliminates data loss on reload."],
    ["1.5", "Approval gate before push",   "2 days", "High",     "QA confirmation with change summary before any test case is pushed to Xray."],
    ["1.6", "Requirement Traceability Matrix","3 days","High",   "View linking requirement → scenario → test case → Xray key. Core TMS parity feature."],
    ["1.7", "LLM token/cost tracking",     "1 day",  "High",     "Display tokens in/out and estimated cost per generation."],
    ["1.8", "Provider fallback chain",     "2 days", "Medium",   "Auto-route to secondary provider if primary LLM call fails."],
  ];

  rowTable(s, 0.3, 1.15, 12.7,
    [["#", "Task", "Effort", "Priority", "What it delivers"],
    ...tasks],
    NAVY, [0.5, 2.8, 0.9, 1.1, 7.4]
  );

  s.addShape(prs.ShapeType.roundRect, { x:0.3, y:6.2, w:12.7, h:1.0, fill:{ color:ICE }, line:{ color:TEAL }, rectRadius:0.06 });
  s.addText("Phase 1 Exit Criteria: TraceLMPanel decomposed · audit log active · session history working · push approval in place · traceability matrix visible", {
    x:0.5, y:6.3, w:12.3, h:0.8, fontSize:9.5, color:NAVY, fontFace:"Arial", wrap:true, italic:true });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 10 — PHASE 2 & 3 DETAIL
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  bg(s, LIGHT);
  topBar(s, AMBER);
  slideTitle(s, "Phase 2 & 3 — Core Platform + Enterprise  (Weeks 7–34)", "Backend service, multi-tenancy, RBAC, and cloud deployment");

  sectionBox(s, 0.3, 1.0, 6.1, 5.8, "PHASE 2 — CORE PLATFORM  (Wks 7–18)", [
    "Bootstrap NestJS backend + PostgreSQL + Redis (Docker Compose)",
    "Design and implement PostgreSQL schema (orgs, workspaces, users, artifacts, audit_log)",
    "Migrate push history from globalState to PostgreSQL",
    "Implement async generation pipeline — BullMQ job queue + LLM worker pool",
    "WebSocket / SSE streaming — real-time progress to VS Code webview",
    "Redis LLM response cache with configurable TTL",
    "AI audit log — every LLM request logged with prompt hash and cost",
    "Analytics API + dashboard (coverage metrics, push history, quality trends)",
    "E2E test suite (Playwright) for critical generation workflows",
    "2 developers · 8–12 weeks",
  ], AMBER, DARK);

  sectionBox(s, 6.8, 1.0, 6.1, 5.8, "PHASE 3 — ENTERPRISE FEATURES  (Wks 19–34)", [
    "Organization → Workspace → Member hierarchy in DB and API",
    "RBAC — 6 roles: Org Admin, Workspace Admin, QA Lead, Test Analyst, Developer, Viewer",
    "OAuth 2.0 authentication (Google, Microsoft, GitHub)",
    "SAML SSO for enterprise IdPs (Okta, Azure AD, Ping)",
    "Cloud deployment — API Gateway, ECS/AKS, RDS, ElastiCache",
    "PostgreSQL row-level security for multi-tenant isolation",
    "Workspace admin UI — manage members, roles, LLM keys, Jira settings",
    "Notification system — email, Slack webhook, in-app",
    "Approval workflow — QA Lead must approve before Xray push",
    "3 developers · 12–16 weeks",
  ], PURPLE, DARK);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 11 — PHASE 4 & 5 DETAIL
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  bg(s, LIGHT);
  topBar(s, TEAL);
  slideTitle(s, "Phase 4 & 5 — AI Governance + Scale  (Weeks 35+)", "AI quality framework, compliance, and enterprise-grade reliability");

  sectionBox(s, 0.3, 1.0, 6.1, 5.8, "PHASE 4 — AI & AUTOMATION  (Wks 35–44)", [
    "Prompt Registry — versioned prompts in DB with A/B testing and rollback",
    "Organization-level LLM key vault (HashiCorp Vault / AWS Secrets Manager)",
    "Per-workspace token budget and cost alerts",
    "Multi-model evaluation framework — run same prompt on 3 models, compare quality",
    "Human feedback pipeline — thumbs up/down aggregated per prompt version per model",
    "Prompt regression test suite — automated quality checks on prompt changes",
    "Feature flags for safe model/prompt rollout",
    "Test execution tracking — record test run results against generated test cases",
    "Defect linking — link Jira bug issues to test cases that surfaced them",
    "2 developers · 8–10 weeks",
  ], TEAL, DARK);

  sectionBox(s, 6.8, 1.0, 6.1, 5.8, "PHASE 5 — SCALE & OPTIMIZATION  (Wks 45+)", [
    "Kubernetes deployment — horizontal scaling for all services",
    "Event-driven architecture — Kafka/EventBridge for audit and analytics pipeline",
    "CDN for webview assets (CloudFront / Vercel Edge)",
    "SOC2 Type II compliance readiness — controls, policies, audit evidence",
    "Penetration testing + remediation",
    "SLA definition and monitoring (99.9% uptime, alerting, on-call)",
    "Web application (browser-native) in addition to VS Code extension",
    "Public API + developer documentation for integration partners",
    "Ongoing · 3+ developers",
  ], GREEN, DARK);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 12 — INVESTMENT & EFFORT SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  bg(s, LIGHT);
  topBar(s, NAVY);
  slideTitle(s, "Investment & Effort Summary", "What it takes to reach enterprise-grade SaaS");

  rowTable(s, 0.3, 1.0, 12.7,
    [
      ["Phase","Description","Duration","Team Size","Key Milestone","Cumulative Weeks"],
      ["Phase 1","Foundation — stable extension",  "4–6 weeks",  "1–2 devs","Audit log · RTM · Session history","Wk 6"],
      ["Phase 2","Core Platform — backend service","8–12 weeks", "2 devs",  "PostgreSQL · Async · Analytics",   "Wk 18"],
      ["Phase 3","Enterprise — RBAC + cloud",      "12–16 weeks","3 devs",  "RBAC · SSO · Multi-tenant · Cloud","Wk 34"],
      ["Phase 4","AI Governance",                  "8–10 weeks", "2 devs",  "Prompt registry · Model eval",     "Wk 44"],
      ["Phase 5","Scale & Compliance",             "Ongoing",    "3+ devs", "SOC2 · Kubernetes · Web app",      "Wk 45+"],
    ],
    NAVY, [1.0, 3.2, 1.4, 1.3, 3.6, 2.2]
  );

  // Summary cards
  const summary = [
    ["~32–34 weeks", "To Phase 3\n(Enterprise Ready)", TEAL],
    ["~44 weeks",    "To Phase 4\n(AI Governance)",    NAVY],
    ["6–8 developers", "Total team needed\nacross all phases", PURPLE],
    ["Phase 1 only", "Deployable in\n4–6 weeks today", GREEN],
  ];
  summary.forEach(([value, label, color], i) => {
    s.addShape(prs.ShapeType.roundRect, { x:0.3+i*3.28, y:4.1, w:2.9, h:1.6, fill:{ color:WHITE }, line:{ color }, rectRadius:0.1,
      shadow:{ type:"outer", color:"000000", blur:10, offset:2, angle:45, opacity:0.1 } });
    s.addShape(prs.ShapeType.roundRect, { x:0.3+i*3.28, y:4.1, w:2.9, h:0.06, fill:{ color }, line:{ color }, rectRadius:0.1 });
    s.addText(value, { x:0.3+i*3.28, y:4.22, w:2.9, h:0.7, fontSize:18, bold:true, color, fontFace:"Cambria", align:"center" });
    s.addText(label, { x:0.3+i*3.28, y:4.9,  w:2.9, h:0.7, fontSize:9.5, color:MED, fontFace:"Arial", align:"center", wrap:true });
  });

  s.addShape(prs.ShapeType.roundRect, { x:0.3, y:5.85, w:12.7, h:1.35, fill:{ color:NAVY2 }, line:{ color:TEAL }, rectRadius:0.08 });
  s.addText("KEY INVESTMENT PRINCIPLE", { x:0.6, y:5.95, w:5, h:0.3, fontSize:10, bold:true, color:TEAL2, fontFace:"Arial" });
  s.addText(
    "Phase 1 is the highest ROI investment: 15 person-days of work removes the 4 most critical blockers (no audit log, data loss, no approval gate, no traceability). " +
    "Every subsequent phase builds on this foundation. Skipping Phase 1 makes Phases 2–5 significantly riskier and more expensive.",
    { x:0.6, y:6.28, w:12.1, h:0.85, fontSize:10, color:WHITE, fontFace:"Arial", wrap:true });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 13 — RISK SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  bg(s, LIGHT);
  topBar(s, RED);
  slideTitle(s, "Risk Assessment", "Top risks and mitigations by phase");

  rowTable(s, 0.3, 1.0, 12.7,
    [
      ["Risk",                                       "Prob.", "Impact",   "Phase Fix", "Mitigation"],
      ["Data loss on VS Code uninstall",             "High",  "Critical", "Phase 1",   "Session history + persistent export"],
      ["No audit log — compliance failure",          "High",  "Critical", "Phase 1",   "2-day implementation removes this entirely"],
      ["Prompt injection via malicious document",    "Med",   "High",     "Phase 1",   "Input sanitization before LLM calls"],
      ["LLM cost overrun — no budget cap",           "Med",   "High",     "Phase 1–4", "Phase 1: token display. Phase 4: org budget enforcement"],
      ["Enterprise rejection — no SSO/RBAC",         "High",  "Critical", "Phase 3",   "RBAC + SAML SSO is Phase 3 deliverable"],
      ["Competitor releases AI generation feature",  "Med",   "High",     "Ongoing",   "Accelerate RTM + collaboration to widen lead"],
      ["TraceLMPanel regression during refactor",    "High",  "Medium",   "Phase 1",   "Add integration tests before decomposition starts"],
      ["Prompt quality regression on prompt changes","Med",   "High",     "Phase 4",   "Prompt Registry + regression test suite"],
      ["Security audit fails",                       "High",  "Critical", "Phase 1–3", "Audit log (Ph1) + RBAC (Ph3) + pen test (Ph5)"],
      ["Single-tenant architecture blocks growth",   "High",  "Critical", "Phase 3",   "Multi-tenant PostgreSQL RLS migration"],
    ],
    NAVY, [3.8, 0.85, 1.1, 1.3, 5.65]
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 14 — RECOMMENDATION & ASK
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  bg(s, NAVY);
  s.addShape(prs.ShapeType.rect, { x:0, y:0, w:W, h:H, fill:{ color:NAVY }, line:{ color:NAVY } });
  s.addShape(prs.ShapeType.rect, { x:0, y:H-0.5, w:W, h:0.5, fill:{ color:NAVY2 }, line:{ color:NAVY2 } });
  s.addShape(prs.ShapeType.rect, { x:0, y:H-0.56, w:W, h:0.06, fill:{ color:TEAL }, line:{ color:TEAL } });

  s.addText("Recommendation & Ask", { x:0.5, y:0.4, w:12, h:0.65, fontSize:28, bold:true, color:WHITE, fontFace:"Cambria" });
  s.addShape(prs.ShapeType.rect, { x:0.5, y:1.1, w:3.5, h:0.05, fill:{ color:TEAL }, line:{ color:TEAL } });

  const asks = [
    ["Approve Phase 1 immediately",    "15 person-days. Removes 4 critical risks. Can start this sprint. No new infrastructure required.", GREEN],
    ["Allocate Phase 2 budget",        "2 developers for 8–12 weeks. Delivers the backend foundation every future feature depends on.",      TEAL],
    ["Commit to Phase 3 roadmap",      "RBAC + SSO + cloud deployment. This is the gate to enterprise sales. Needed within 34 weeks.",       AMBER],
    ["Endorse the AI differentiation", "TraceLM's AI stack is unique in the market. Invest in the Prompt Registry and evaluation framework to protect that lead.", PURPLE],
  ];

  asks.forEach(([title, desc, color], i) => {
    s.addShape(prs.ShapeType.roundRect, { x:0.5, y:1.3+i*1.35, w:12.3, h:1.2, fill:{ color:"1E3A5A" }, line:{ color }, rectRadius:0.08 });
    s.addShape(prs.ShapeType.roundRect, { x:0.5, y:1.3+i*1.35, w:0.4, h:1.2, fill:{ color }, line:{ color }, rectRadius:0.08 });
    s.addShape(prs.ShapeType.rect, { x:0.7, y:1.3+i*1.35, w:0.2, h:1.2, fill:{ color }, line:{ color } });
    s.addText(`0${i+1}`, { x:0.5, y:1.4+i*1.35, w:0.4, h:1.0, fontSize:14, bold:true, color:WHITE, align:"center", fontFace:"Cambria" });
    s.addText(title, { x:1.05, y:1.38+i*1.35, w:11.5, h:0.42, fontSize:13, bold:true, color:WHITE, fontFace:"Arial" });
    s.addText(desc,  { x:1.05, y:1.78+i*1.35, w:11.5, h:0.62, fontSize:10.5, color:"BDC3C7", fontFace:"Arial", wrap:true });
  });

  s.addText("The product vision is strong. The architecture needs to catch up to it. Phase 1 starts that journey.",
    { x:0.5, y:H-0.48, w:12.3, h:0.38, fontSize:10, color:TEAL2, fontFace:"Arial", italic:true, align:"center" });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 15 — THANK YOU
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  s.addShape(prs.ShapeType.rect, { x:0, y:0, w:W, h:H, fill:{ color:NAVY }, line:{ color:NAVY } });
  s.addShape(prs.ShapeType.rect, { x:0, y:H/2-0.03, w:W, h:0.06, fill:{ color:TEAL }, line:{ color:TEAL } });
  s.addText("TraceLM", { x:1, y:1.8, w:11, h:1.1, fontSize:58, bold:true, color:WHITE, fontFace:"Cambria", align:"center" });
  s.addText("From AI-Powered Extension to Enterprise Test Intelligence Platform", { x:1, y:2.9, w:11, h:0.55, fontSize:16, color:TEAL2, fontFace:"Arial", align:"center", italic:true });
  s.addShape(prs.ShapeType.rect, { x:3.5, y:3.55, w:6.3, h:0.05, fill:{ color:TEAL }, line:{ color:TEAL } });
  s.addText("Thank You", { x:1, y:3.75, w:11, h:0.8, fontSize:38, bold:true, color:WHITE, fontFace:"Cambria", align:"center" });
  s.addText("Questions & Discussion", { x:1, y:4.55, w:11, h:0.45, fontSize:16, color:DKGRAY, fontFace:"Arial", align:"center" });
  s.addText("June 2026  ·  Principal Architect Assessment  ·  Confidential", { x:1, y:6.9, w:11, h:0.3, fontSize:9, color:DKGRAY, fontFace:"Arial", align:"center" });
}

// ── SAVE ──────────────────────────────────────────────────────────────────────
prs.writeFile({ fileName: OUT }).then(() => {
  console.log(`✓ PowerPoint saved → ${OUT}`);
});
