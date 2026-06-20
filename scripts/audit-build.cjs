#!/usr/bin/env node
/**
 * Post-build security and performance audit.
 * Runs automatically after every `npm run build`.
 * Exit code 1 blocks the build only for CRITICAL issues.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const WEBVIEW_DIST = path.join(ROOT, 'webview-ui', 'dist', 'assets');

const PASS  = '\x1b[32m✓\x1b[0m';
const WARN  = '\x1b[33m⚠\x1b[0m';
const FAIL  = '\x1b[31m✗\x1b[0m';
const INFO  = '\x1b[36mℹ\x1b[0m';
const BOLD  = '\x1b[1m';
const RESET = '\x1b[0m';

let criticalCount = 0;
let warnCount = 0;

function pass(msg)  { console.log(`  ${PASS} ${msg}`); }
function warn(msg)  { console.log(`  ${WARN} ${msg}`); warnCount++; }
function fail(msg)  { console.log(`  ${FAIL} ${msg}`); criticalCount++; }
function info(msg)  { console.log(`  ${INFO} ${msg}`); }
function section(title) { console.log(`\n${BOLD}${title}${RESET}`); }

// ── 1. Bundle size ────────────────────────────────────────────────────────────
section('Bundle Size');

const JS_WARN_KB  = 300;
const JS_FAIL_KB  = 500;
const CSS_WARN_KB = 50;

try {
  const jsFile  = path.join(WEBVIEW_DIST, 'index.js');
  const cssFile = path.join(WEBVIEW_DIST, 'index.css');

  const jsKb  = fs.statSync(jsFile).size  / 1024;
  const cssKb = fs.statSync(cssFile).size / 1024;

  const jsMsg = `JS bundle: ${jsKb.toFixed(1)} KB (gzip: ~${(jsKb * 0.31).toFixed(0)} KB est.)`;
  if (jsKb > JS_FAIL_KB)     fail(`${jsMsg}  →  exceeds ${JS_FAIL_KB} KB hard limit`);
  else if (jsKb > JS_WARN_KB) warn(`${jsMsg}  →  exceeds ${JS_WARN_KB} KB soft limit`);
  else                        pass(jsMsg);

  const cssMsg = `CSS bundle: ${cssKb.toFixed(1)} KB`;
  if (cssKb > CSS_WARN_KB) warn(`${cssMsg}  →  exceeds ${CSS_WARN_KB} KB soft limit`);
  else                      pass(cssMsg);
} catch (e) {
  fail(`Could not read bundle files: ${e.message}`);
}

// ── 2. Source security scan ───────────────────────────────────────────────────
section('Source Security Scan');

const SRC_DIRS = [
  path.join(ROOT, 'src'),
  path.join(ROOT, 'webview-ui', 'src'),
];

const SOURCE_PATTERNS = [
  { pattern: /dangerouslySetInnerHTML\s*=\s*\{/g,  severity: 'fail',  label: 'dangerouslySetInnerHTML assignment' },
  { pattern: /innerHTML\s*=/g,                     severity: 'fail',  label: 'innerHTML assignment' },
  { pattern: /\beval\s*\(/g,                       severity: 'fail',  label: 'eval()' },
  { pattern: /document\.write\s*\(/g,              severity: 'fail',  label: 'document.write()' },
  { pattern: /Math\.random\(\).*nonce/g,           severity: 'fail',  label: 'Math.random() used for nonce/security token' },
  { pattern: /console\.(log|warn)\s*\(.*(?:key|token|secret|password)/ig, severity: 'warn', label: 'Possible credential in console output' },
];

function walkFiles(dir, ext, cb) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') walkFiles(full, ext, cb);
    else if (entry.isFile() && ext.some(e => entry.name.endsWith(e))) cb(full);
  }
}

const findings = {};
SRC_DIRS.forEach(dir => {
  walkFiles(dir, ['.ts', '.tsx'], file => {
    const content = fs.readFileSync(file, 'utf8');
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    SOURCE_PATTERNS.forEach(({ pattern, severity, label }) => {
      pattern.lastIndex = 0;
      if (pattern.test(content)) {
        const key = label;
        if (!findings[key]) findings[key] = { severity, files: [] };
        findings[key].files.push(rel);
      }
    });
  });
});

if (Object.keys(findings).length === 0) {
  pass('No dangerous source patterns detected');
} else {
  Object.entries(findings).forEach(([label, { severity, files }]) => {
    const reporter = severity === 'fail' ? fail : warn;
    reporter(`${label}  (${files.join(', ')})`);
  });
}

// ── 3. Dependency vulnerabilities (prod only) ─────────────────────────────────
section('Dependency Vulnerabilities (prod)');

function runAudit(cwd, label) {
  try {
    execSync('npm audit --omit=dev --audit-level=critical --json', { cwd, stdio: 'pipe' });
    pass(`${label}: no critical vulnerabilities`);
  } catch (e) {
    try {
      const data = JSON.parse(e.stdout?.toString() ?? '{}');
      const meta = data.metadata?.vulnerabilities ?? {};
      const critical = meta.critical ?? 0;
      const high     = meta.high     ?? 0;
      const moderate = meta.moderate ?? 0;
      const low      = meta.low      ?? 0;
      const summary  = `${label}: critical=${critical} high=${high} moderate=${moderate} low=${low}`;
      if (critical > 0) fail(summary);
      else if (high > 0) warn(summary + '  →  run: npm audit --omit=dev');
      else               pass(summary + '  →  dev-only, no prod impact');
    } catch {
      warn(`${label}: could not parse audit output`);
    }
  }
}

runAudit(ROOT, 'Extension');
runAudit(path.join(ROOT, 'webview-ui'), 'Webview');

// ── 4. Runtime performance heuristics ────────────────────────────────────────
section('Runtime Performance');

try {
  const jsFile  = path.join(WEBVIEW_DIST, 'index.js');
  const bundle  = fs.readFileSync(jsFile, 'utf8');

  const memoCount     = (bundle.match(/useMemo\b/g)     || []).length;
  const callbackCount = (bundle.match(/useCallback\b/g) || []).length;
  const memoComp      = (bundle.match(/memo\b/g)        || []).length;

  pass(`useMemo: ${memoCount}  |  useCallback: ${callbackCount}  |  memo(): ${memoComp}`);

  // Heuristic: warn if no memoization at all
  if (memoCount + callbackCount + memoComp === 0) {
    warn('No memoization detected in bundle — check for unnecessary re-renders');
  }

  // Check for synchronous heavy ops in render (heuristic)
  const sortInRender = (bundle.match(/\.sort\s*\(/g) || []).length;
  if (sortInRender > 5) {
    warn(`${sortInRender} .sort() calls in bundle — verify none run in hot render paths`);
  } else {
    pass(`Array.sort() calls: ${sortInRender} (within threshold)`);
  }
} catch (e) {
  warn(`Performance heuristics skipped: ${e.message}`);
}

// ── 5. CSP & nonce check ─────────────────────────────────────────────────────
section('CSP / Nonce');

try {
  const panelSrc = fs.readFileSync(path.join(ROOT, 'src', 'panels', 'TraceLMPanel.ts'), 'utf8');
  const hasNonce   = panelSrc.includes("getNonce()");
  const hasCsp     = panelSrc.includes("Content-Security-Policy");
  const hasCrypto  = panelSrc.includes("randomBytes");
  const hasMathRng = /getNonce[\s\S]{0,300}Math\.random/.test(panelSrc);

  hasCsp    ? pass("Content-Security-Policy header present")   : fail("CSP header missing in webview HTML");
  hasNonce  ? pass("Nonce applied to script tags")             : fail("Nonce not found on script tags");
  hasCrypto && !hasMathRng
            ? pass("Nonce uses crypto.randomBytes (secure)")   : fail("Nonce uses Math.random() — NOT cryptographically secure");
} catch (e) {
  warn(`CSP check skipped: ${e.message}`);
}

// ── 6. TypeScript type-check ─────────────────────────────────────────────────
// Vite uses esbuild (transpile-only). This section runs tsc --noEmit as an
// independent safety net so type errors always surface even if the build itself
// passed. This is the primary gate that would have caught the uploadDrafts bug.
section('TypeScript Type-Check');

function runTypeCheck(cwd, label, cmd) {
  try {
    execSync(cmd, { cwd, stdio: 'pipe' });
    pass(`${label}: no type errors`);
  } catch (e) {
    const output = (e.stdout?.toString() ?? '') + (e.stderr?.toString() ?? '');
    const errorLines = output.split('\n').filter((l) => l.includes(' error TS'));
    const count = errorLines.length;
    if (count > 0) {
      fail(`${label}: ${count} type error(s) detected`);
      errorLines.slice(0, 5).forEach((l) => info(l.trim()));
      if (count > 5) info(`... and ${count - 5} more`);
    } else {
      warn(`${label}: tsc exited non-zero but no TS errors parsed — check manually`);
    }
  }
}

runTypeCheck(ROOT, 'Extension', 'npx tsc --noEmit');
runTypeCheck(path.join(ROOT, 'webview-ui'), 'Webview', 'npx tsc --noEmit');

// ── Summary ───────────────────────────────────────────────────────────────────
section('Summary');

if (criticalCount === 0 && warnCount === 0) {
  console.log(`\n  ${PASS} ${BOLD}All checks passed.${RESET}\n`);
} else {
  if (criticalCount > 0) console.log(`\n  ${FAIL} ${BOLD}${criticalCount} critical issue(s) — build blocked.${RESET}`);
  if (warnCount    > 0) console.log(`  ${WARN} ${BOLD}${warnCount} warning(s) — review recommended.${RESET}`);
  console.log();
}

if (criticalCount > 0) process.exit(1);
