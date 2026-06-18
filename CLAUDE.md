# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

TraceLM is a VS Code extension that converts software requirements into Xray test cases using LLMs. It supports OpenAI, Anthropic, and Google Gemini providers, parses documents (.txt, .md, .docx, .pdf), generates test cases, and pushes them to Jira/Xray via their REST APIs.

# Context from Previous Work
- This app was originally bootstrapped using VS Code and GitHub Copilot.
- Preferred tech stack: TypeScript 5.5, React 18 (webview UI), VS Code Extension API, esbuild (extension bundler), Vite 5 (webview bundler), Node.js 20+
- Build command: npm run build
- Test command: npm test

## Commands

```bash
# Build both extension and webview
npm run build

# Build individually
npm run build:extension   # esbuild → dist/extension.js
npm run build:webview     # Vite → webview-ui/dist/

# Watch mode (extension only)
npm run watch

# Tests
npm test                  # Jest
npm run test:watch
npm run test:coverage

# Linting & type checking
npm run lint
npm run lint:fix
npm run typecheck:all     # Both extension and webview

# Package as .vsix
npm run package:vsix

# Validate LLM prompt files
npm run validate:prompts
```

## Architecture

Two-process architecture typical of VS Code extensions:

**Extension Host** (`src/`) — Node.js process with VS Code API access:
- `src/extension.ts` — Registers the `tracelm.open` command
- `src/panels/TraceLMPanel.ts` — Central orchestrator (~49KB). Manages webview lifecycle, routes all `postMessage` calls from the UI to services, and sends results back
- `src/services/llm/` — Multi-provider LLM abstraction (`LLMProvider` interface, `LLMService` dispatcher, provider implementations)
- `src/services/jira/` — Jira/Xray REST client + `BatchProcessor` for rate-limit handling and retry logic
- `src/services/document/DocumentParser.ts` — Parses .txt/.md/.docx/.pdf into plain text
- `src/services/storage/PushHistoryStore.ts` — Dedup via fingerprints stored in VS Code `globalState`
- `src/utils/fingerprintUtil.ts` — Deterministic fingerprint generation per test case
- `src/prompts/` — Text files containing LLM system prompts (validated by `validate:prompts` script)

**React Webview** (`webview-ui/`) — Vite/React 18 bundle loaded in a VS Code WebviewPanel:
- `webview-ui/src/App.tsx` — Single large component (~45KB) holding all UI state and message handlers
- Communication is exclusively via `vscode.postMessage()` / `window.addEventListener('message', ...)`

**Data flow:** `App.tsx` → `postMessage` → `TraceLMPanel.ts` → services → `postMessage` back → `App.tsx`

**Secrets** (API keys) are stored in VS Code `SecretStorage`; push history uses `globalState`.

## Key Conventions

- The extension and webview are compiled independently (separate `tsconfig.json` files, separate build commands). Shared type definitions live in `src/types/index.ts` — the webview imports these via path alias.
- Prompt files in `src/prompts/` are loaded at runtime with `fs.readFileSync`. Keep them as plain `.txt` files; the `validate:prompts` script checks they parse correctly.
- `TraceLMPanel.ts` is the seam between UI and services — all new features require adding a message type in `src/types/index.ts`, a handler in `TraceLMPanel.ts`, and UI in `App.tsx`.
- Tests live in `src/**/__tests__/`. The coverage threshold is 5–15% (intentionally low; integration tests dominate).
- Git hooks (Husky + lint-staged) run lint and type-check on staged files before commit.
