Run the TraceLM post-build audit (`scripts/audit-build.cjs`) and report the results.

Execute the following command and display the full output to the user:

```bash
node scripts/audit-build.cjs
```

The audit covers six sections:
1. **Bundle Size** — JS and CSS bundle sizes vs thresholds
2. **Source Security Scan** — dangerous patterns (innerHTML, eval, Math.random nonce, etc.)
3. **Dependency Vulnerabilities** — prod-only `npm audit` at critical level
4. **Runtime Performance** — useMemo / useCallback / memo() counts, Array.sort frequency
5. **CSP / Nonce** — Content-Security-Policy header and crypto.randomBytes usage
6. **TypeScript Type-Check** — `tsc --noEmit` on both extension and webview

If any critical issues are found (exit code 1), summarize what failed and suggest next steps.
If all checks pass, confirm the build is clean.
