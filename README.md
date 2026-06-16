# TraceLM

TraceLM is a VS Code extension with a React webview that turns requirements into traceable test assets and pushes manual test cases to Jira/Xray.

## What It Does

- Ingest requirements from free text, files (.txt/.md/.docx/.pdf), or Jira.
- Generate requirement enhancements (gaps, NFRs, risks, clarifying questions).
- Generate test scenarios and test cases with requirement traceability.
- Analyze automation candidates with layer guidance (Unit/API/UI), feasibility, and ROI.
- Preview, validate, deduplicate, batch, and push test cases to Xray.

## Architecture

- Extension host: TypeScript + VS Code API
- UI: React (webview) + Vite
- Build: esbuild (extension) + Vite (webview)
- Tests: Jest + ts-jest

## Prerequisites

- Node.js 20+
- VS Code 1.90+
- Jira Cloud account + API token
- Xray Cloud client ID/secret
- Optional LLM provider key/model (OpenAI, Anthropic, Gemini)

## Setup

1. Install dependencies.
	 - `npm ci`
	 - `npm ci --prefix webview-ui`
2. Build extension and webview.
	 - `npm run build`
3. Start extension development host.
	 - Press `F5` in VS Code
4. Open TraceLM command.
	 - `TraceLM: Open`

## Key Settings

- `tracelm.llmProvider`
- `tracelm.llmModel`
- `tracelm.jiraUrl`
- `tracelm.jiraProjectKey`
- `tracelm.jiraEmail`
- `tracelm.xrayBatchSize`
- `tracelm.xrayBatchDelayMs`
- `tracelm.xrayMaxRetries`

Secrets are stored using VS Code SecretStorage:

- LLM API key
- Jira API token
- Xray client ID and secret

## Xray Push Reliability

- Pre-push validation blocks malformed cases.
- Fingerprint deduplication avoids duplicate push of same case intent.
- Push history is persisted in globalState (survives restarts).
- Batch processing supports large suites.
- Rate-limit backoff handles 429/503 with exponential retry.

## Testing

- Run all tests: `npm test`
- Watch tests: `npm run test:watch`

Current coverage includes:

- Validation tests for required fields
- Fingerprint consistency tests
- Push flow integration tests
- Batch processor retry/pagination tests
- Push history persistence tests

## Troubleshooting

- Jira auth failure:
	- Verify `jiraUrl`, `jiraEmail`, and Jira API token.
	- Ensure URL format is `https://<your-domain>.atlassian.net`.
- Xray auth failure:
	- Verify client ID/secret and that credentials are for Xray Cloud.
- Push produces duplicates:
	- Use Preview Push to inspect dedup status.
	- Use Clear Push History only when you intentionally want to re-push equivalent cases.
- Slow/failed large pushes:
	- Reduce batch size.
	- Increase delay between batches.
	- Increase max retries.

## CI and Packaging

- CI workflow: `.github/workflows/ci.yml`
	- Installs dependencies, builds, and runs tests on push/PR.
- Local VSIX package:
	- `npm run package:vsix`

## Security Notes

- Never commit API tokens or client secrets.
- Prefer workspace-scoped config for non-secret defaults.
- Keep generated outputs reviewed by a human before push.
