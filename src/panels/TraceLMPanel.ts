import * as vscode from 'vscode';
import { DocumentParser, UploadedFilePayload } from '../services/document/DocumentParser';
import {
  JiraIssueSummary,
  JiraXrayService,
  XrayPushItemStatus
} from '../services/jira/JiraXrayService';
import { BatchProcessor, DEFAULT_BATCH_CONFIG } from '../services/jira/BatchProcessor';
import { LLMService } from '../services/llm/LLMService';
import { LLMProviderName } from '../types';
import { buildTestCaseFingerprint } from '../utils/fingerprintUtil';
import { PushHistoryStore, type XrayPushRecord } from '../services/storage/PushHistoryStore';

type WebviewMessage = {
  command?: string;
  payload?: Record<string, string>;
};

type SettingsPayload = {
  llmProvider: string;
  llmModel: string;
  llmApiKey: string;
  jiraUrl: string;
  jiraProjectKey: string;
  jiraEmail: string;
  jiraApiToken: string;
  xrayClientId: string;
  xrayClientSecret: string;
  xrayBatchSize: string;
  xrayBatchDelayMs: string;
  xrayMaxRetries: string;
};

type RequirementEnhancement = {
  missingFunctional: string[];
  missingNonFunctional: string[];
  bestPractices: string[];
  marketBenchmark: string[];
  risks: string[];
  clarifyingQuestions: string[];
};

type ScenarioItem = {
  id: string;
  title: string;
  requirementRefs: string[];
  preconditions: string[];
  flow: string[];
  expectedOutcome: string;
  priority: string;
};

type TestCaseItem = {
  id: string;
  title: string;
  scenarioId: string;
  requirementRefs: string[];
  gherkin: string;
  preconditions: string[];
  steps: string[];
  expectedResult: string;
  layer: 'Unit' | 'API' | 'UI';
  priority: string;
};

type AutomationCandidateItem = {
  testCaseId: string;
  candidate: boolean;
  exclusionReason: string;
  feasibility: number;
  roiScore: number;
  layer: 'Unit' | 'API' | 'UI';
  priority: 'Automate First' | 'Automate Second' | 'Manual/Deferred';
  notes: string;
};

type AutomationAnalysis = {
  summary: string;
  recommendedOrder: string[];
  items: AutomationCandidateItem[];
};

const SECRET_KEYS = {
  llmApiKey: 'tracelm.llmApiKey',
  jiraApiToken: 'tracelm.jiraApiToken',
  xrayClientId: 'tracelm.xrayClientId',
  xrayClientSecret: 'tracelm.xrayClientSecret'
} as const;

export class TraceLMPanel {
  public static currentPanel: TraceLMPanel | undefined;

  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private readonly extensionContext: vscode.ExtensionContext;
  private readonly documentParser: DocumentParser;
  private readonly pushHistoryStore: PushHistoryStore;
  private readonly batchProcessor: BatchProcessor;
  private readonly jiraPullCache = new Map<string, JiraIssueSummary[]>();
  private readonly llmCache = new Map<string, string>();
  private disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionContext: vscode.ExtensionContext): void {
    const extensionUri = extensionContext.extensionUri;
    const column = vscode.window.activeTextEditor?.viewColumn;

    if (TraceLMPanel.currentPanel) {
      TraceLMPanel.currentPanel.panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'tracelm',
      'TraceLM',
      column ?? vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'media'),
          vscode.Uri.joinPath(extensionUri, 'webview-ui', 'dist')
        ]
      }
    );

    TraceLMPanel.currentPanel = new TraceLMPanel(panel, extensionContext);
  }

  private constructor(panel: vscode.WebviewPanel, extensionContext: vscode.ExtensionContext) {
    this.panel = panel;
    this.extensionContext = extensionContext;
    this.extensionUri = extensionContext.extensionUri;
    this.documentParser = new DocumentParser();
    this.pushHistoryStore = new PushHistoryStore(extensionContext.globalState);
    this.batchProcessor = new BatchProcessor(DEFAULT_BATCH_CONFIG);

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      async (message: WebviewMessage) => {
        if (message.command === 'ping') {
          this.panel.webview.postMessage({
            command: 'pong',
            text: 'TraceLM extension host is connected.'
          });
          return;
        }

        if (message.command === 'settings:load') {
          const settings = await this.getSettings();
          this.panel.webview.postMessage({ command: 'settings:loaded', payload: settings });
          return;
        }

        if (message.command === 'settings:save') {
          const payload = this.normalizePayload(message.payload);
          await this.saveSettings(payload);
          this.panel.webview.postMessage({ command: 'settings:saved' });
          return;
        }

        if (message.command === 'settings:testLlm') {
          const payload = this.normalizePayload(message.payload);
          const ok = Boolean(payload.llmApiKey.trim()) && Boolean(payload.llmModel.trim());
          this.panel.webview.postMessage({
            command: 'settings:testResult',
            payload: {
              target: 'llm',
              ok: ok ? 'true' : 'false',
              message: ok
                ? 'LLM configuration looks valid. API call integration comes in Phase 3.'
                : 'LLM API key and model are required.'
            }
          });
          return;
        }

        if (message.command === 'settings:testJira') {
          const payload = this.normalizePayload(message.payload);
          const urlOk = /^https:\/\/.+/i.test(payload.jiraUrl.trim());
          const projectOk = Boolean(payload.jiraProjectKey.trim());
          const emailOk = Boolean(payload.jiraEmail.trim());
          const jiraApiTokenOk = Boolean(payload.jiraApiToken.trim());
          const xrayOk =
            Boolean(payload.xrayClientId.trim()) && Boolean(payload.xrayClientSecret.trim());
          const ok = urlOk && projectOk && emailOk && jiraApiTokenOk && xrayOk;

          this.panel.webview.postMessage({
            command: 'settings:testResult',
            payload: {
              target: 'jira',
              ok: ok ? 'true' : 'false',
              message: ok
                ? 'Jira/Xray settings shape looks valid. Live API validation is planned in Phase 6.'
                : 'Provide Jira URL, project key, Jira email/token, and Xray credentials.'
            }
          });
          return;
        }

        if (message.command === 'requirements:parseFiles') {
          const files = (message.payload?.files ?? '[]') as string;
          const parsed = await this.documentParser.parseFiles(
            JSON.parse(files) as UploadedFilePayload[]
          );
          const combinedText = parsed
            .filter((f) => !f.error)
            .map((f) => `Source: ${f.name}\n${f.text}`)
            .join('\n\n');

          this.panel.webview.postMessage({
            command: 'requirements:filesParsed',
            payload: {
              combinedText,
              files: JSON.stringify(parsed)
            }
          });
          return;
        }

        if (message.command === 'requirements:searchStories') {
          try {
            const settings = await this.getSettings();
            const service = this.createJiraService(settings);
            const query = message.payload?.query ?? '';
            const cacheKey = this.buildCacheKey('searchStories', {
              jiraUrl: settings.jiraUrl,
              jiraProjectKey: settings.jiraProjectKey,
              query
            });
            const stories = this.jiraPullCache.get(cacheKey) ?? (await service.searchStories(query));
            if (!this.jiraPullCache.has(cacheKey)) {
              this.jiraPullCache.set(cacheKey, stories);
            }
            this.panel.webview.postMessage({
              command: 'requirements:storiesResult',
              payload: { stories: JSON.stringify(stories) }
            });
          } catch (error) {
            this.panel.webview.postMessage({
              command: 'requirements:error',
              payload: {
                message: error instanceof Error ? error.message : 'Failed to search Jira stories.'
              }
            });
          }
          return;
        }

        if (message.command === 'requirements:pullJira') {
          try {
            const settings = await this.getSettings();
            const service = this.createJiraService(settings);
            const mode = message.payload?.mode ?? 'single';
            const pullCacheKey = this.buildCacheKey('pullJira', {
              jiraUrl: settings.jiraUrl,
              jiraProjectKey: settings.jiraProjectKey,
              mode,
              payload: message.payload ?? {}
            });
            const issues =
              this.jiraPullCache.get(pullCacheKey) ??
              (await this.resolveJiraPull(mode, message.payload, service));
            if (!this.jiraPullCache.has(pullCacheKey)) {
              this.jiraPullCache.set(pullCacheKey, issues);
            }
            const combinedText = issues
              .map(
                (issue) =>
                  `[${issue.key}] ${issue.summary}\n${issue.description || 'No description provided.'}`
              )
              .join('\n\n');

            this.panel.webview.postMessage({
              command: 'requirements:jiraPulled',
              payload: {
                issues: JSON.stringify(issues),
                combinedText
              }
            });
          } catch (error) {
            this.panel.webview.postMessage({
              command: 'requirements:error',
              payload: {
                message: error instanceof Error ? error.message : 'Failed to pull Jira issues.'
              }
            });
          }
          return;
        }

        if (message.command === 'requirements:enhance') {
          try {
            const settings = await this.getSettings();
            const requirements = message.payload?.requirements ?? '';
            const enhancement = await this.generateRequirementEnhancement(requirements, settings);

            this.panel.webview.postMessage({
              command: 'requirements:enhanced',
              payload: {
                enhancement: JSON.stringify(enhancement)
              }
            });
          } catch (error) {
            this.panel.webview.postMessage({
              command: 'requirements:error',
              payload: {
                message:
                  error instanceof Error ? error.message : 'Failed to generate requirement enhancement.'
              }
            });
          }
          return;
        }

        if (message.command === 'scenarios:generate') {
          try {
            const settings = await this.getSettings();
            const requirements = message.payload?.requirements ?? '';
            const enhancementRaw = message.payload?.enhancement ?? '{}';
            const enhancement = this.safeJsonParse<RequirementEnhancement>(enhancementRaw, {
              missingFunctional: [],
              missingNonFunctional: [],
              bestPractices: [],
              marketBenchmark: [],
              risks: [],
              clarifyingQuestions: []
            });
            const scenarios = await this.generateScenarios(requirements, enhancement, settings);

            this.panel.webview.postMessage({
              command: 'scenarios:generated',
              payload: {
                scenarios: JSON.stringify(scenarios)
              }
            });
          } catch (error) {
            this.panel.webview.postMessage({
              command: 'requirements:error',
              payload: {
                message: error instanceof Error ? error.message : 'Failed to generate scenarios.'
              }
            });
          }
          return;
        }

        if (message.command === 'testCases:generate') {
          try {
            const settings = await this.getSettings();
            const scenariosRaw = message.payload?.scenarios ?? '[]';
            const scenarios = this.safeJsonParse<ScenarioItem[]>(scenariosRaw, []);
            const testCases = await this.generateTestCases(scenarios, settings);

            this.panel.webview.postMessage({
              command: 'testCases:generated',
              payload: {
                testCases: JSON.stringify(testCases)
              }
            });
          } catch (error) {
            this.panel.webview.postMessage({
              command: 'requirements:error',
              payload: {
                message: error instanceof Error ? error.message : 'Failed to generate test cases.'
              }
            });
          }
          return;
        }

        if (message.command === 'automation:analyze') {
          try {
            const settings = await this.getSettings();
            const requirements = message.payload?.requirements ?? '';
            const enhancement = this.safeJsonParse<RequirementEnhancement>(
              message.payload?.enhancement ?? '{}',
              {
                missingFunctional: [],
                missingNonFunctional: [],
                bestPractices: [],
                marketBenchmark: [],
                risks: [],
                clarifyingQuestions: []
              }
            );
            const scenarios = this.safeJsonParse<ScenarioItem[]>(message.payload?.scenarios ?? '[]', []);
            const testCases = this.safeJsonParse<TestCaseItem[]>(message.payload?.testCases ?? '[]', []);

            const analysis = await this.analyzeAutomationCandidates(
              requirements,
              enhancement,
              scenarios,
              testCases,
              settings
            );

            this.panel.webview.postMessage({
              command: 'automation:analyzed',
              payload: {
                analysis: JSON.stringify(analysis)
              }
            });
          } catch (error) {
            this.panel.webview.postMessage({
              command: 'requirements:error',
              payload: {
                message:
                  error instanceof Error ? error.message : 'Failed to analyze automation candidates.'
              }
            });
          }
          return;
        }

        if (message.command === 'xray:pushTestCases') {
          try {
            const settings = await this.getSettings();
            const testCases = this.safeJsonParse<TestCaseItem[]>(message.payload?.testCases ?? '[]', []);
            const retryOnlyIds = (message.payload?.retryOnlyIds ?? '')
              .split(',')
              .map((item) => item.trim())
              .filter((item) => item.length > 0);

            if (testCases.length === 0) {
              throw new Error('Generate test cases before pushing to Xray.');
            }

            const selectedTestCases =
              retryOnlyIds.length > 0
                ? testCases.filter((item) => retryOnlyIds.includes(item.id))
                : testCases;

            if (selectedTestCases.length === 0) {
              throw new Error('No test cases matched retry selection.');
            }

            const service = this.createJiraService(settings);
            this.batchProcessor.updateConfig({
              batchSize: Number(settings.xrayBatchSize) || DEFAULT_BATCH_CONFIG.batchSize,
              delayBetweenBatchesMs:
                Number(settings.xrayBatchDelayMs) || DEFAULT_BATCH_CONFIG.delayBetweenBatchesMs,
              maxRetries: Number(settings.xrayMaxRetries) || DEFAULT_BATCH_CONFIG.maxRetries
            });
            const pushRecords = this.getXrayPushRecords();
            const fingerprintByLocalId = new Map<string, string>();
            const casesToPush: TestCaseItem[] = [];
            const validationAndDedupStatuses: XrayPushItemStatus[] = [];

            for (const testCase of selectedTestCases) {
              // Check for validation errors first
              const validationErrors = service.validateTestCase({
                id: testCase.id,
                title: testCase.title,
                scenarioId: testCase.scenarioId,
                requirementRefs: testCase.requirementRefs,
                preconditions: testCase.preconditions,
                steps: testCase.steps,
                expectedResult: testCase.expectedResult,
                priority: testCase.priority
              });

              if (validationErrors.length > 0) {
                validationAndDedupStatuses.push({
                  localId: testCase.id,
                  success: false,
                  message: `Validation failed: ${validationErrors.map((e) => e.error).join(' | ')}`,
                  isValidationError: true
                });
                continue;
              }

              // Check for duplicate push fingerprint
              const fingerprint = buildTestCaseFingerprint(testCase);
              const existing = pushRecords[fingerprint];

              if (existing?.key) {
                validationAndDedupStatuses.push({
                  localId: testCase.id,
                  success: true,
                  key: existing.key,
                  url: existing.url,
                  message: 'Skipped duplicate: matching test case fingerprint already pushed.'
                });
                continue;
              }

              fingerprintByLocalId.set(testCase.id, fingerprint);
              casesToPush.push(testCase);
            }

            const pushedStatuses =
              casesToPush.length > 0
                ? await this.batchProcessor.processBatchesWithDelay(
                    casesToPush.map((item) => ({
                      id: item.id,
                      title: item.title,
                      scenarioId: item.scenarioId,
                      requirementRefs: item.requirementRefs,
                      preconditions: item.preconditions,
                      steps: item.steps,
                      expectedResult: item.expectedResult,
                      priority: item.priority
                    })),
                    (batch) => service.pushManualTestCasesDetailed(batch),
                    (event) => {
                      this.panel.webview.postMessage({
                        command: 'xray:pushProgress',
                        payload: {
                          message: event.message,
                          batchIndex: String(event.batchIndex),
                          totalBatches: String(event.totalBatches),
                          status: event.status
                        }
                      });
                    }
                  )
                : [];

            for (const status of pushedStatuses) {
              if (!status.success || !status.key) {
                continue;
              }
              const fingerprint = fingerprintByLocalId.get(status.localId);
              if (!fingerprint) {
                continue;
              }
              const base = settings.jiraUrl.replace(/\/$/, '');
              const resolvedUrl = status.url || (base ? `${base}/browse/${status.key}` : '');
              pushRecords[fingerprint] = {
                fingerprint,
                key: status.key,
                url: resolvedUrl,
                pushedAt: new Date().toISOString()
              };
            }

            await this.saveXrayPushRecords(pushRecords);

            const statuses = [...validationAndDedupStatuses, ...pushedStatuses];

            const results = this.toXrayPushStatuses(statuses, settings.jiraUrl);
            this.panel.webview.postMessage({
              command: 'xray:pushed',
              payload: {
                pushed: JSON.stringify(results)
              }
            });
          } catch (error) {
            this.panel.webview.postMessage({
              command: 'requirements:error',
              payload: {
                message: error instanceof Error ? error.message : 'Failed to push test cases to Xray.'
              }
            });
          }
        }

        if (message.command === 'xray:previewPush') {
          try {
            const testCases = this.safeJsonParse<TestCaseItem[]>(message.payload?.testCases ?? '[]', []);
            if (testCases.length === 0) {
              throw new Error('Generate test cases before previewing Xray push.');
            }

            const service = this.createJiraService(await this.getSettings());
            const pushRecords = this.getXrayPushRecords();
            const preview = {
              totalCases: testCases.length,
              validationErrors: 0,
              duplicates: 0,
              willPush: 0,
              details: [] as Array<{
                id: string;
                title: string;
                status: 'valid' | 'validation-error' | 'duplicate';
                message: string;
              }>
            };

            for (const testCase of testCases) {
              const validationErrors = service.validateTestCase({
                id: testCase.id,
                title: testCase.title,
                scenarioId: testCase.scenarioId,
                requirementRefs: testCase.requirementRefs,
                preconditions: testCase.preconditions,
                steps: testCase.steps,
                expectedResult: testCase.expectedResult,
                priority: testCase.priority
              });

              if (validationErrors.length > 0) {
                preview.validationErrors += 1;
                preview.details.push({
                  id: testCase.id,
                  title: testCase.title,
                  status: 'validation-error',
                  message: validationErrors.map((e) => e.error).join(' | ')
                });
                continue;
              }

              const fingerprint = buildTestCaseFingerprint(testCase);
              if (pushRecords[fingerprint]) {
                preview.duplicates += 1;
                preview.details.push({
                  id: testCase.id,
                  title: testCase.title,
                  status: 'duplicate',
                  message: `Already pushed with Xray key: ${pushRecords[fingerprint].key}`
                });
              } else {
                preview.willPush += 1;
                preview.details.push({
                  id: testCase.id,
                  title: testCase.title,
                  status: 'valid',
                  message: 'Ready to push'
                });
              }
            }

            this.panel.webview.postMessage({
              command: 'xray:previewResult',
              payload: { preview: JSON.stringify(preview) }
            });
          } catch (error) {
            this.panel.webview.postMessage({
              command: 'requirements:error',
              payload: {
                message: error instanceof Error ? error.message : 'Failed to preview Xray push.'
              }
            });
          }
          return;
        }

        if (message.command === 'xray:clearPushHistory') {
          try {
            await this.pushHistoryStore.clear();
            this.panel.webview.postMessage({
              command: 'xray:historyCleared',
              payload: { message: 'Xray push history cleared.' }
            });
          } catch (error) {
            this.panel.webview.postMessage({
              command: 'requirements:error',
              payload: {
                message: error instanceof Error ? error.message : 'Failed to clear push history.'
              }
            });
          }
          return;
        }
      },
      null,
      this.disposables
    );

    this.update();
  }

  public dispose(): void {
    TraceLMPanel.currentPanel = undefined;

    this.panel.dispose();
    while (this.disposables.length) {
      const d = this.disposables.pop();
      d?.dispose();
    }
  }

  private update(): void {
    this.panel.webview.html = this.getHtmlForWebview(this.panel.webview);
  }

  private async getSettings(): Promise<SettingsPayload> {
    const config = vscode.workspace.getConfiguration('tracelm');
    const llmApiKey = (await this.extensionContext.secrets.get(SECRET_KEYS.llmApiKey)) ?? '';
    const jiraApiToken =
      (await this.extensionContext.secrets.get(SECRET_KEYS.jiraApiToken)) ?? '';
    const xrayClientId = (await this.extensionContext.secrets.get(SECRET_KEYS.xrayClientId)) ?? '';
    const xrayClientSecret =
      (await this.extensionContext.secrets.get(SECRET_KEYS.xrayClientSecret)) ?? '';

    return {
      llmProvider: config.get<string>('llmProvider', 'OpenAI'),
      llmModel: config.get<string>('llmModel', ''),
      jiraUrl: config.get<string>('jiraUrl', ''),
      jiraProjectKey: config.get<string>('jiraProjectKey', ''),
      jiraEmail: config.get<string>('jiraEmail', ''),
      llmApiKey,
      jiraApiToken,
      xrayClientId,
      xrayClientSecret,
      xrayBatchSize: String(config.get<number>('xrayBatchSize', DEFAULT_BATCH_CONFIG.batchSize)),
      xrayBatchDelayMs: String(
        config.get<number>('xrayBatchDelayMs', DEFAULT_BATCH_CONFIG.delayBetweenBatchesMs)
      ),
      xrayMaxRetries: String(config.get<number>('xrayMaxRetries', DEFAULT_BATCH_CONFIG.maxRetries))
    };
  }

  private async saveSettings(payload: SettingsPayload): Promise<void> {
    const config = vscode.workspace.getConfiguration('tracelm');

    await Promise.all([
      config.update('llmProvider', payload.llmProvider, vscode.ConfigurationTarget.Workspace),
      config.update('llmModel', payload.llmModel, vscode.ConfigurationTarget.Workspace),
      config.update('jiraUrl', payload.jiraUrl, vscode.ConfigurationTarget.Workspace),
      config.update('jiraProjectKey', payload.jiraProjectKey, vscode.ConfigurationTarget.Workspace),
      config.update('jiraEmail', payload.jiraEmail, vscode.ConfigurationTarget.Workspace),
      config.update(
        'xrayBatchSize',
        Math.max(1, Number(payload.xrayBatchSize) || DEFAULT_BATCH_CONFIG.batchSize),
        vscode.ConfigurationTarget.Workspace
      ),
      config.update(
        'xrayBatchDelayMs',
        Math.max(0, Number(payload.xrayBatchDelayMs) || DEFAULT_BATCH_CONFIG.delayBetweenBatchesMs),
        vscode.ConfigurationTarget.Workspace
      ),
      config.update(
        'xrayMaxRetries',
        Math.max(1, Number(payload.xrayMaxRetries) || DEFAULT_BATCH_CONFIG.maxRetries),
        vscode.ConfigurationTarget.Workspace
      ),
      this.extensionContext.secrets.store(SECRET_KEYS.llmApiKey, payload.llmApiKey),
      this.extensionContext.secrets.store(SECRET_KEYS.jiraApiToken, payload.jiraApiToken),
      this.extensionContext.secrets.store(SECRET_KEYS.xrayClientId, payload.xrayClientId),
      this.extensionContext.secrets.store(SECRET_KEYS.xrayClientSecret, payload.xrayClientSecret)
    ]);
  }

  private normalizePayload(payload: Record<string, string> | undefined): SettingsPayload {
    return {
      llmProvider: payload?.llmProvider ?? 'OpenAI',
      llmModel: payload?.llmModel ?? '',
      llmApiKey: payload?.llmApiKey ?? '',
      jiraUrl: payload?.jiraUrl ?? '',
      jiraProjectKey: payload?.jiraProjectKey ?? '',
      jiraEmail: payload?.jiraEmail ?? '',
      jiraApiToken: payload?.jiraApiToken ?? '',
      xrayClientId: payload?.xrayClientId ?? '',
      xrayClientSecret: payload?.xrayClientSecret ?? '',
      xrayBatchSize: payload?.xrayBatchSize ?? String(DEFAULT_BATCH_CONFIG.batchSize),
      xrayBatchDelayMs:
        payload?.xrayBatchDelayMs ?? String(DEFAULT_BATCH_CONFIG.delayBetweenBatchesMs),
      xrayMaxRetries: payload?.xrayMaxRetries ?? String(DEFAULT_BATCH_CONFIG.maxRetries)
    };
  }

  private createJiraService(settings: SettingsPayload): JiraXrayService {
    return new JiraXrayService(
      settings.jiraUrl,
      settings.jiraEmail,
      settings.jiraApiToken,
      settings.jiraProjectKey,
      settings.xrayClientId,
      settings.xrayClientSecret
    );
  }

  private toXrayPushStatuses(
    statuses: XrayPushItemStatus[],
    jiraUrl: string
  ): Array<{ localId: string; success: string; key: string; url: string; message: string; isValidationError?: boolean }> {
    const base = jiraUrl.replace(/\/$/, '');
    return statuses.map((item) => ({
      localId: item.localId,
      success: item.success ? 'true' : 'false',
      key: item.key ?? '',
      url: item.url || (item.key && base ? `${base}/browse/${item.key}` : ''),
      message: item.message ?? '',
      isValidationError: item.isValidationError
    }));
  }

  private getXrayPushRecords(): Record<string, XrayPushRecord> {
    return this.pushHistoryStore.getAll();
  }

  private async saveXrayPushRecords(records: Record<string, XrayPushRecord>): Promise<void> {
    const entries = Object.entries(records);
    if (entries.length > 0) {
      await this.pushHistoryStore.putBatch(entries);
    }
  }

  private async resolveJiraPull(
    mode: string,
    payload: Record<string, string> | undefined,
    service: JiraXrayService
  ): Promise<JiraIssueSummary[]> {
    if (mode === 'single') {
      const key = payload?.singleIssueKey?.trim() ?? '';
      return key ? [await service.getIssue(key)] : [];
    }

    if (mode === 'multiple') {
      const raw = payload?.multipleIssueKeys ?? '';
      const keys = raw
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      return service.getIssues(keys);
    }

    if (mode === 'epic') {
      const epicKey = payload?.epicKey?.trim() ?? '';
      return service.getEpicChildren(epicKey);
    }

    if (mode === 'multiStory') {
      const selected = payload?.selectedStoryKeys ?? '';
      const keys = selected
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      return service.getIssues(keys);
    }

    return [];
  }

  private async generateRequirementEnhancement(
    requirements: string,
    settings: SettingsPayload
  ): Promise<RequirementEnhancement> {
    if (!requirements.trim()) {
      throw new Error('Provide requirements text before running enhancement.');
    }

    const prompt = `Analyze the requirements below and return strict JSON with keys: missingFunctional, missingNonFunctional, bestPractices, marketBenchmark, risks, clarifyingQuestions.\\n\\nRequirements:\\n${requirements}`;
    const responseText = await this.completeWithCache(settings, prompt);
    if (responseText) {
      const parsed = this.tryParseEnhancementFromText(responseText);
      if (parsed) {
        return parsed;
      }
    }

    return {
      missingFunctional: [
        'Define user roles and permission boundaries for creating and editing test artifacts.',
        'Add versioning requirement for generated scenarios and test cases.'
      ],
      missingNonFunctional: [
        'Performance target for generation response time under normal load.',
        'Audit logging requirement for generated and pushed artifacts.'
      ],
      bestPractices: [
        'Require requirement quality checks before generation to reduce ambiguous outputs.',
        'Introduce reusable scenario templates for common workflows.'
      ],
      marketBenchmark: [
        'Competitor tools usually provide traceability links from requirement to test case.',
        'Market standard includes API-first export for ALM integration.'
      ],
      risks: [
        'Ambiguous requirements can produce low-quality scenarios.',
        'Missing Jira credentials can block automated pull workflows.'
      ],
      clarifyingQuestions: [
        'Should generated cases default to BDD style for all projects?',
        'What severity mapping should be used for prioritization?'
      ]
    };
  }

  private async generateScenarios(
    requirements: string,
    enhancement: RequirementEnhancement,
    settings: SettingsPayload
  ): Promise<ScenarioItem[]> {
    if (!requirements.trim()) {
      throw new Error('Provide requirements text before generating scenarios.');
    }

    const prompt = `Generate test scenarios as strict JSON array with fields id,title,requirementRefs,preconditions,flow,expectedOutcome,priority. requirementRefs must map each scenario to one or more requirement identifiers.\\n\\nRequirements:\\n${requirements}\\n\\nEnhancement:\\n${JSON.stringify(enhancement, null, 2)}`;
    const responseText = await this.completeWithCache(settings, prompt);
    if (responseText) {
      const parsed = this.tryParseScenariosFromText(responseText);
      if (parsed.length > 0) {
        return parsed;
      }
    }

    return [
      {
        id: 'SCN-001',
        title: 'Capture and validate requirements input',
        requirementRefs: ['REQ-INPUT', 'REQ-QUALITY'],
        preconditions: ['User opened TraceLM Requirements tab'],
        flow: ['Enter requirements text', 'Submit for enhancement analysis'],
        expectedOutcome: 'System stores requirements and prepares enhancement suggestions.',
        priority: 'High'
      },
      {
        id: 'SCN-002',
        title: 'Generate test scenarios from reviewed requirements',
        requirementRefs: ['REQ-SCENARIO-GEN'],
        preconditions: ['Requirements are available', 'Enhancement suggestions reviewed'],
        flow: ['Run scenario generation', 'Inspect generated scenario list'],
        expectedOutcome: 'Traceable scenarios are produced with priorities.',
        priority: 'High'
      },
      {
        id: 'SCN-003',
        title: 'Pull requirements from Jira in multiple modes',
        requirementRefs: ['REQ-JIRA-PULL'],
        preconditions: ['Jira credentials configured in settings'],
        flow: ['Select mode (single, multiple, epic, multi-story)', 'Pull issue content'],
        expectedOutcome: 'Requirements text is enriched from Jira issue data.',
        priority: 'Medium'
      }
    ];
  }

  private async generateTestCases(
    scenarios: ScenarioItem[],
    settings: SettingsPayload
  ): Promise<TestCaseItem[]> {
    if (scenarios.length === 0) {
      throw new Error('Generate or provide scenarios before generating test cases.');
    }

    const prompt = `Generate test cases in strict JSON array with fields id,title,scenarioId,requirementRefs,gherkin,preconditions,steps,expectedResult,layer,priority.\\n\\nScenarios:\\n${JSON.stringify(
        scenarios,
        null,
        2
      )}`;
    const responseText = await this.completeWithCache(settings, prompt);
    if (responseText) {
      const parsed = this.tryParseTestCasesFromText(responseText);
      if (parsed.length > 0) {
        return parsed;
      }
    }

    return scenarios.map((scenario, index) => {
      const id = `TC-${String(index + 1).padStart(3, '0')}`;
      const gherkin = [
        `Feature: ${scenario.title}`,
        `Scenario: ${scenario.title}`,
        `  Given ${scenario.preconditions[0] ?? 'required preconditions are met'}`,
        `  When ${scenario.flow[0] ?? 'the scenario steps are executed'}`,
        `  Then ${scenario.expectedOutcome || 'the expected result is achieved'}`
      ].join('\n');

      return {
        id,
        title: `${scenario.title} - Test Case`,
        scenarioId: scenario.id,
        requirementRefs: scenario.requirementRefs,
        gherkin,
        preconditions: scenario.preconditions,
        steps: scenario.flow,
        expectedResult: scenario.expectedOutcome,
        layer: index % 3 === 0 ? 'API' : index % 3 === 1 ? 'UI' : 'Unit',
        priority: scenario.priority || 'Medium'
      };
    });
  }

  private async analyzeAutomationCandidates(
    requirements: string,
    enhancement: RequirementEnhancement,
    scenarios: ScenarioItem[],
    testCases: TestCaseItem[],
    settings: SettingsPayload
  ): Promise<AutomationAnalysis> {
    if (testCases.length === 0) {
      throw new Error('Generate test cases before running automation analysis.');
    }

    const prompt = `Analyze automation candidates and return strict JSON object with keys summary,recommendedOrder,items.\\nItems fields: testCaseId,candidate,exclusionReason,feasibility,roiScore,layer,priority,notes.\\n\\nRequirements:\\n${requirements}\\n\\nEnhancement:\\n${JSON.stringify(
        enhancement,
        null,
        2
      )}\\n\\nScenarios:\\n${JSON.stringify(
        scenarios,
        null,
        2
      )}\\n\\nTestCases:\\n${JSON.stringify(testCases, null, 2)}`;
    const responseText = await this.completeWithCache(settings, prompt);
    if (responseText) {
      const parsed = this.tryParseAutomationFromText(responseText);
      if (parsed) {
        return parsed;
      }
    }

    const items: AutomationCandidateItem[] = testCases.map((testCase, index) => {
      const layer = testCase.layer;
      const feasibility = layer === 'API' ? 5 : layer === 'Unit' ? 4 : 3;
      const roiScore = layer === 'API' ? 9 : layer === 'Unit' ? 8 : 6;
      const candidate = roiScore >= 7;

      return {
        testCaseId: testCase.id,
        candidate,
        exclusionReason: candidate ? '' : 'Low ROI compared to maintenance overhead.',
        feasibility,
        roiScore,
        layer,
        priority:
          roiScore >= 8 ? 'Automate First' : roiScore >= 6 ? 'Automate Second' : 'Manual/Deferred',
        notes:
          index % 2 === 0
            ? 'Stable path and repeatable data setup.'
            : 'Requires environment control for deterministic runs.'
      };
    });

    return {
      summary:
        'Automation analysis completed using feasibility and ROI heuristics across Unit/API/UI layers.',
      recommendedOrder: ['API', 'Unit', 'UI'],
      items
    };
  }

  private tryParseEnhancementFromText(text: string): RequirementEnhancement | null {
    const parsed = this.extractJsonObject<Record<string, unknown>>(text);
    if (!parsed) {
      return null;
    }

    return {
      missingFunctional: this.asStringArray(parsed.missingFunctional),
      missingNonFunctional: this.asStringArray(parsed.missingNonFunctional),
      bestPractices: this.asStringArray(parsed.bestPractices),
      marketBenchmark: this.asStringArray(parsed.marketBenchmark),
      risks: this.asStringArray(parsed.risks),
      clarifyingQuestions: this.asStringArray(parsed.clarifyingQuestions)
    };
  }

  private tryParseScenariosFromText(text: string): ScenarioItem[] {
    const array = this.extractJsonArray<Record<string, unknown>>(text);
    if (!array) {
      return [];
    }

    return array
      .map((item, index) => ({
        id: this.asString(item.id) || `SCN-${String(index + 1).padStart(3, '0')}`,
        title: this.asString(item.title),
        requirementRefs: this.asStringArray(item.requirementRefs),
        preconditions: this.asStringArray(item.preconditions),
        flow: this.asStringArray(item.flow),
        expectedOutcome: this.asString(item.expectedOutcome),
        priority: this.asString(item.priority) || 'Medium'
      }))
      .filter((item) => item.title.length > 0)
      .map((item) => ({
        ...item,
        requirementRefs: item.requirementRefs.length > 0 ? item.requirementRefs : [item.id]
      }));
  }

  private tryParseTestCasesFromText(text: string): TestCaseItem[] {
    const array = this.extractJsonArray<Record<string, unknown>>(text);
    if (!array) {
      return [];
    }

    return array
      .map((item, index) => {
        const layerValue = this.asString(item.layer).toUpperCase();
        const layer: 'Unit' | 'API' | 'UI' =
          layerValue === 'UNIT' ? 'Unit' : layerValue === 'UI' ? 'UI' : 'API';
        return {
          id: this.asString(item.id) || `TC-${String(index + 1).padStart(3, '0')}`,
          title: this.asString(item.title),
          scenarioId: this.asString(item.scenarioId) || `SCN-${String(index + 1).padStart(3, '0')}`,
          requirementRefs: this.asStringArray(item.requirementRefs),
          gherkin: this.asString(item.gherkin),
          preconditions: this.asStringArray(item.preconditions),
          steps: this.asStringArray(item.steps),
          expectedResult: this.asString(item.expectedResult),
          layer,
          priority: this.asString(item.priority) || 'Medium'
        };
      })
      .filter((item) => item.title.length > 0)
      .map((item) => ({
        ...item,
        requirementRefs: item.requirementRefs.length > 0 ? item.requirementRefs : [item.scenarioId]
      }));
  }

  private tryParseAutomationFromText(text: string): AutomationAnalysis | null {
    const parsed = this.extractJsonObject<Record<string, unknown>>(text);
    if (!parsed) {
      return null;
    }

    const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
    const items: AutomationCandidateItem[] = rawItems
      .map((item) => {
        const record = item as Record<string, unknown>;
        const layerValue = this.asString(record.layer).toUpperCase();
        const layer: 'Unit' | 'API' | 'UI' =
          layerValue === 'UNIT' ? 'Unit' : layerValue === 'UI' ? 'UI' : 'API';

        const priorityValue = this.asString(record.priority);
        const priority: 'Automate First' | 'Automate Second' | 'Manual/Deferred' =
          priorityValue === 'Automate First' ||
          priorityValue === 'Automate Second' ||
          priorityValue === 'Manual/Deferred'
            ? priorityValue
            : 'Automate Second';

        const feasibilityNumber = Number(record.feasibility);
        const roiNumber = Number(record.roiScore);

        return {
          testCaseId: this.asString(record.testCaseId),
          candidate: Boolean(record.candidate),
          exclusionReason: this.asString(record.exclusionReason),
          feasibility: Number.isFinite(feasibilityNumber) ? feasibilityNumber : 1,
          roiScore: Number.isFinite(roiNumber) ? roiNumber : 1,
          layer,
          priority,
          notes: this.asString(record.notes)
        };
      })
      .filter((item) => item.testCaseId.length > 0);

    return {
      summary: this.asString(parsed.summary),
      recommendedOrder: this.asStringArray(parsed.recommendedOrder),
      items
    };
  }

  private asString(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private asStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
  }

  private async completeWithCache(settings: SettingsPayload, prompt: string): Promise<string | null> {
    if (!settings.llmApiKey.trim() || !settings.llmModel.trim()) {
      return null;
    }

    const cacheKey = this.buildCacheKey('llm', {
      provider: settings.llmProvider,
      model: settings.llmModel,
      prompt
    });

    const cached = this.llmCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const llm = new LLMService(settings.llmProvider as LLMProviderName, settings.llmApiKey);
    const response = await llm.complete({
      model: settings.llmModel,
      prompt,
      temperature: 0.2
    });

    this.llmCache.set(cacheKey, response.text);
    if (this.llmCache.size > 30) {
      const oldestKey = this.llmCache.keys().next().value as string | undefined;
      if (oldestKey) {
        this.llmCache.delete(oldestKey);
      }
    }

    return response.text;
  }

  private buildCacheKey(scope: string, value: unknown): string {
    return `${scope}:${this.stableStringify(value)}`;
  }

  private stableStringify(value: unknown): string {
    if (value === null || typeof value !== 'object') {
      return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
      return `[${value.map((item) => this.stableStringify(item)).join(',')}]`;
    }
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${this.stableStringify(record[key])}`)
      .join(',')}}`;
  }

  private extractJsonObject<T>(text: string): T | null {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start < 0 || end <= start) {
      return null;
    }
    try {
      return JSON.parse(text.slice(start, end + 1)) as T;
    } catch {
      return null;
    }
  }

  private extractJsonArray<T>(text: string): T[] | null {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start < 0 || end <= start) {
      return null;
    }
    try {
      return JSON.parse(text.slice(start, end + 1)) as T[];
    } catch {
      return null;
    }
  }

  private safeJsonParse<T>(text: string, fallback: T): T {
    try {
      return JSON.parse(text) as T;
    } catch {
      return fallback;
    }
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'webview-ui', 'dist', 'assets', 'index.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'webview-ui', 'dist', 'assets', 'index.css')
    );

    const nonce = TraceLMPanel.getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'none'; img-src ${webview.cspSource} https:; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';"
  />
  <link rel="stylesheet" href="${styleUri}" />
  <title>TraceLM</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}">
    window.__TRACELM_VSCODE__ = acquireVsCodeApi();
  </script>
  <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
</body>
</html>`;
  }

  private static getNonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let value = '';
    for (let i = 0; i < 32; i += 1) {
      value += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return value;
  }
}
