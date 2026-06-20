export type Settings = {
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

export type ParsedFile = {
  name: string;
  text: string;
  error?: string;
};

export type JiraIssueSummary = {
  key: string;
  summary: string;
  description: string;
};

export type UploadDraft = {
  name: string;
  mimeType: string;
  contentBase64: string;
};

export type JiraMode = 'single' | 'multiple' | 'epic' | 'multiStory';

export type TabKey =
  | 'settings'
  | 'requirements'
  | 'enhancement'
  | 'scenarios'
  | 'testCases'
  | 'automation';

export type RequirementEnhancement = {
  missingFunctional: string[];
  missingNonFunctional: string[];
  bestPractices: string[];
  marketBenchmark: string[];
  risks: string[];
  clarifyingQuestions: string[];
};

export type ScenarioItem = {
  id: string;
  title: string;
  requirementRefs: string[];
  preconditions: string[];
  flow: string[];
  expectedOutcome: string;
  priority: string;
};

export type TestCaseItem = {
  id: string;
  title: string;
  scenarioId: string;
  requirementRefs: string[];
  gherkin: string;
  preconditions: string[];
  steps: string[];
  expectedResult: string;
  testData: string;
  layer: 'Unit' | 'API' | 'UI';
  priority: string;
};

export type AutomationCandidateItem = {
  testCaseId: string;
  candidate: boolean;
  exclusionReason: string;
  feasibility: number;
  roiScore: number;
  layer: 'Unit' | 'API' | 'UI';
  priority: 'Automate First' | 'Automate Second' | 'Manual/Deferred';
  notes: string;
};

export type AutomationAnalysis = {
  summary: string;
  recommendedOrder: string[];
  items: AutomationCandidateItem[];
};

export type XrayPushedIssue = {
  localId: string;
  success: boolean;
  key: string;
  url: string;
  message: string;
  isValidationError?: boolean;
};

export type XrayPushPreview = {
  totalCases: number;
  validationErrors: number;
  duplicates: number;
  willPush: number;
  details: Array<{
    id: string;
    title: string;
    status: 'valid' | 'validation-error' | 'duplicate';
    message: string;
  }>;
};

export type XrayPushProgress = {
  message: string;
  batchIndex: number;
  totalBatches: number;
  status: 'started' | 'retrying' | 'completed';
};

export const defaultSettings: Settings = {
  llmProvider: 'OpenAI',
  llmModel: '',
  llmApiKey: '',
  jiraUrl: '',
  jiraProjectKey: '',
  jiraEmail: '',
  jiraApiToken: '',
  xrayClientId: '',
  xrayClientSecret: '',
  xrayBatchSize: '10',
  xrayBatchDelayMs: '1000',
  xrayMaxRetries: '3',
};

export const emptyEnhancement: RequirementEnhancement = {
  missingFunctional: [],
  missingNonFunctional: [],
  bestPractices: [],
  marketBenchmark: [],
  risks: [],
  clarifyingQuestions: [],
};

export const llmModelsByProvider: Record<string, string[]> = {
  OpenAI: ['gpt-4o', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4o-mini'],
  Anthropic: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'],
  Gemini: [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-lite-001',
  ],
};

export const getProviderModels = (provider: string): string[] =>
  llmModelsByProvider[provider] ?? [];
