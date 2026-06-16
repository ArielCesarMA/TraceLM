import { useEffect, useMemo, useState } from 'react';

type Settings = {
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

type ParsedFile = {
  name: string;
  text: string;
  error?: string;
};

type JiraIssueSummary = {
  key: string;
  summary: string;
  description: string;
};

type UploadDraft = {
  name: string;
  mimeType: string;
  contentBase64: string;
};

type JiraMode = 'single' | 'multiple' | 'epic' | 'multiStory';
type TabKey =
  | 'settings'
  | 'requirements'
  | 'enhancement'
  | 'scenarios'
  | 'testCases'
  | 'automation';

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
  testData: string;
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

type XrayPushedIssue = {
  localId: string;
  success: boolean;
  key: string;
  url: string;
  message: string;
  isValidationError?: boolean;
};

type XrayPushPreview = {
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

type XrayPushProgress = {
  message: string;
  batchIndex: number;
  totalBatches: number;
  status: 'started' | 'retrying' | 'completed';
};

const defaultSettings: Settings = {
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
  xrayMaxRetries: '3'
};

const emptyEnhancement: RequirementEnhancement = {
  missingFunctional: [],
  missingNonFunctional: [],
  bestPractices: [],
  marketBenchmark: [],
  risks: [],
  clarifyingQuestions: []
};

const llmModelsByProvider: Record<string, string[]> = {
  OpenAI: ['gpt-4o', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4o-mini'],
  Anthropic: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'],
  Gemini: [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-lite-001'
  ]
};

const getProviderModels = (provider: string): string[] => llmModelsByProvider[provider] ?? [];

function App(): JSX.Element {
  const [status, setStatus] = useState('Waiting for extension host...');
  const [feedback, setFeedback] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('settings');

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [requirementText, setRequirementText] = useState('');
  const [uploadDrafts, setUploadDrafts] = useState<UploadDraft[]>([]);
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);

  const [jiraMode, setJiraMode] = useState<JiraMode>('single');
  const [singleIssueKey, setSingleIssueKey] = useState('');
  const [multipleIssueKeys, setMultipleIssueKeys] = useState('');
  const [epicKey, setEpicKey] = useState('');
  const [storyQuery, setStoryQuery] = useState('');
  const [storyOptions, setStoryOptions] = useState<JiraIssueSummary[]>([]);
  const [selectedStoryKeys, setSelectedStoryKeys] = useState<string[]>([]);
  const [pulledIssues, setPulledIssues] = useState<JiraIssueSummary[]>([]);

  const [enhancement, setEnhancement] = useState<RequirementEnhancement>(emptyEnhancement);
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);
  const [testCases, setTestCases] = useState<TestCaseItem[]>([]);
  const [automation, setAutomation] = useState<AutomationAnalysis | null>(null);
  const [requirementsReviewed, setRequirementsReviewed] = useState(false);
  const [xrayPushedIssues, setXrayPushedIssues] = useState<XrayPushedIssue[]>([]);
  const [xrayPushPreview, setXrayPushPreview] = useState<XrayPushPreview | null>(null);
  const [xrayPushProgress, setXrayPushProgress] = useState<XrayPushProgress | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const availableModels = useMemo(() => getProviderModels(settings.llmProvider), [settings.llmProvider]);

  useEffect(() => {
    const handler = (
      event: MessageEvent<{ command?: string; text?: string; payload?: Record<string, string> }>
    ) => {
      const payload = event.data.payload ?? {};

      if (event.data.command === 'pong') {
        setStatus(event.data.text ?? 'Connected');
      } else if (event.data.command === 'settings:loaded') {
        const provider = payload.llmProvider ?? defaultSettings.llmProvider;
        const providerModels = getProviderModels(provider);
        const loadedModel = payload.llmModel ?? '';
        const nextModel = loadedModel || providerModels[0] || '';

        setSettings({
          llmProvider: provider,
          llmModel: nextModel,
          llmApiKey: payload.llmApiKey ?? '',
          jiraUrl: payload.jiraUrl ?? '',
          jiraProjectKey: payload.jiraProjectKey ?? '',
          jiraEmail: payload.jiraEmail ?? '',
          jiraApiToken: payload.jiraApiToken ?? '',
          xrayClientId: payload.xrayClientId ?? '',
          xrayClientSecret: payload.xrayClientSecret ?? '',
          xrayBatchSize: payload.xrayBatchSize ?? '10',
          xrayBatchDelayMs: payload.xrayBatchDelayMs ?? '1000',
          xrayMaxRetries: payload.xrayMaxRetries ?? '3'
        });
      } else if (event.data.command === 'settings:saved') {
        setFeedback('Settings saved successfully.');
      } else if (event.data.command === 'settings:testResult') {
        setFeedback(`${payload.target === 'llm' ? 'LLM' : 'Jira/Xray'}: ${payload.message ?? ''}`);
      } else if (event.data.command === 'requirements:filesParsed') {
        const files = JSON.parse(payload.files ?? '[]') as ParsedFile[];
        setParsedFiles(files);
        if (payload.combinedText) {
          setRequirementText((prev) => (prev ? `${prev}\n\n${payload.combinedText}` : payload.combinedText));
          setRequirementsReviewed(false);
        }
        setFeedback('File parsing complete.');
      } else if (event.data.command === 'requirements:storiesResult') {
        const stories = JSON.parse(payload.stories ?? '[]') as JiraIssueSummary[];
        setStoryOptions(stories);
        setFeedback(`Found ${stories.length} stories.`);
      } else if (event.data.command === 'requirements:jiraPulled') {
        const issues = JSON.parse(payload.issues ?? '[]') as JiraIssueSummary[];
        setPulledIssues(issues);
        if (payload.combinedText) {
          setRequirementText((prev) => (prev ? `${prev}\n\n${payload.combinedText}` : payload.combinedText));
          setRequirementsReviewed(false);
        }
        setFeedback(`Pulled ${issues.length} Jira issue(s).`);
      } else if (event.data.command === 'requirements:enhanced') {
        const parsed = JSON.parse(payload.enhancement ?? '{}') as RequirementEnhancement;
        setEnhancement({ ...emptyEnhancement, ...parsed });
        setFeedback('Requirement enhancement complete.');
      } else if (event.data.command === 'scenarios:generated') {
        const parsed = JSON.parse(payload.scenarios ?? '[]') as ScenarioItem[];
        setScenarios(parsed);
        setFeedback(`Generated ${parsed.length} scenario(s).`);
      } else if (event.data.command === 'testCases:generated') {
        const parsed = JSON.parse(payload.testCases ?? '[]') as TestCaseItem[];
        setTestCases(parsed);
        setXrayPushedIssues([]);
        setFeedback(`Generated ${parsed.length} test case(s).`);
      } else if (event.data.command === 'automation:analyzed') {
        const parsed = JSON.parse(payload.analysis ?? '{}') as AutomationAnalysis;
        setAutomation(parsed);
        setFeedback('Automation analysis completed.');
      } else if (event.data.command === 'requirements:error') {
        setFeedback(`TraceLM: ${payload.message ?? 'Unknown error.'}`);
      } else if (event.data.command === 'xray:pushed') {
        const parsed = JSON.parse(payload.pushed ?? '[]') as Array<{
          localId: string;
          success: string;
          key: string;
          url: string;
          message: string;
          isValidationError?: boolean;
        }>;
        const statuses: XrayPushedIssue[] = parsed.map((item) => ({
          localId: item.localId,
          success: item.success === 'true',
          key: item.key,
          url: item.url,
          message: item.message,
          isValidationError: item.isValidationError
        }));

        setXrayPushedIssues((prev) => {
          const map = new Map(prev.map((item) => [item.localId, item]));
          for (const status of statuses) {
            map.set(status.localId, status);
          }
          return Array.from(map.values());
        });

        const successCount = statuses.filter((item) => item.success).length;
        const failCount = statuses.length - successCount;
        setXrayPushProgress(null);
        setFeedback(`Xray push complete: ${successCount} succeeded, ${failCount} failed.`);
      } else if (event.data.command === 'xray:pushProgress') {
        const nextProgress: XrayPushProgress = {
          message: payload.message ?? '',
          batchIndex: Number(payload.batchIndex ?? '0'),
          totalBatches: Number(payload.totalBatches ?? '0'),
          status: (payload.status as XrayPushProgress['status']) ?? 'started'
        };
        setXrayPushProgress(nextProgress);
        setFeedback(nextProgress.message);
      } else if (event.data.command === 'xray:previewResult') {
        const preview = JSON.parse(payload.preview ?? '{}') as XrayPushPreview;
        setXrayPushPreview(preview);
        setFeedback(`Preview ready: ${preview.willPush} to push, ${preview.duplicates} duplicates, ${preview.validationErrors} validation errors.`);
      } else if (event.data.command === 'xray:historyCleared') {
        setXrayPushedIssues([]);
        setFeedback(payload.message ?? 'Push history cleared.');
      }
    };

    window.addEventListener('message', handler);
    window.__TRACELM_VSCODE__?.postMessage({ command: 'ping' });
    window.__TRACELM_VSCODE__?.postMessage({ command: 'settings:load' });

    return () => {
      window.removeEventListener('message', handler);
    };
  }, []);

  useEffect(() => {
    if (!availableModels.length) {
      return;
    }
    if (!availableModels.includes(settings.llmModel)) {
      setSettings((prev) => ({ ...prev, llmModel: availableModels[0] }));
    }
  }, [availableModels, settings.llmModel]);

  const updateSettingsField = (key: keyof Settings, value: string): void => {
    if (key === 'llmProvider') {
      const providerModels = getProviderModels(value);
      setSettings((prev) => ({
        ...prev,
        llmProvider: value,
        llmModel: providerModels.includes(prev.llmModel) ? prev.llmModel : providerModels[0] ?? ''
      }));
      return;
    }

    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = (): void => {
    setFeedback('Saving settings...');
    window.__TRACELM_VSCODE__?.postMessage({ command: 'settings:save', payload: settings });
  };

  const testLlm = (): void => {
    setFeedback('Validating LLM settings...');
    window.__TRACELM_VSCODE__?.postMessage({ command: 'settings:testLlm', payload: settings });
  };

  const testJira = (): void => {
    setFeedback('Validating Jira/Xray settings...');
    window.__TRACELM_VSCODE__?.postMessage({ command: 'settings:testJira', payload: settings });
  };

  const toBase64 = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const next = await Promise.all(
      Array.from(files).map(async (file) => ({
        name: file.name,
        mimeType: file.type,
        contentBase64: await toBase64(file)
      }))
    );
    setUploadDrafts(next);
    setFeedback(`${next.length} file(s) selected.`);
  };

  const parseSelectedFiles = (): void => {
    if (!uploadDrafts.length) {
      setFeedback('Select at least one file first.');
      return;
    }
    setFeedback('Parsing selected files...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'requirements:parseFiles',
      payload: { files: JSON.stringify(uploadDrafts) }
    });
  };

  const searchStories = (): void => {
    setFeedback('Searching Jira stories...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'requirements:searchStories',
      payload: { query: storyQuery }
    });
  };

  const pullFromJira = (): void => {
    setFeedback('Pulling Jira requirements...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'requirements:pullJira',
      payload: {
        mode: jiraMode,
        singleIssueKey,
        multipleIssueKeys,
        epicKey,
        selectedStoryKeys: selectedStoryKeys.join(',')
      }
    });
  };

  const toggleStoryKey = (key: string): void => {
    setSelectedStoryKeys((prev) =>
      prev.includes(key) ? prev.filter((value) => value !== key) : [...prev, key]
    );
  };

  const ensureReviewed = (): boolean => {
    if (!requirementsReviewed) {
      setFeedback('Review and confirm requirements before running generation.');
      setActiveTab('requirements');
      return false;
    }
    return true;
  };

  const generateEnhancement = (): void => {
    if (!requirementText.trim()) {
      setFeedback('Add requirements text before enhancement.');
      return;
    }
    if (!ensureReviewed()) {
      return;
    }
    setFeedback('Generating requirement enhancement...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'requirements:enhance',
      payload: { requirements: requirementText }
    });
  };

  const generateAll = (): void => {
    if (!requirementText.trim()) {
      setFeedback('Add requirements text before generation.');
      return;
    }
    if (!ensureReviewed()) {
      return;
    }

    setGenerationProgress('Starting enhancement...');
    setFeedback('Generating all artifacts sequentially...');

    let currentStep = 0;
    const steps = [
      {
        name: 'Requirement Enhancement',
        command: 'requirements:enhance',
        payload: { requirements: requirementText }
      },
      {
        name: 'Test Scenarios',
        command: 'scenarios:generate',
        payload: { requirements: requirementText, enhancement: JSON.stringify(enhancement) }
      },
      {
        name: 'Test Cases',
        command: 'testCases:generate',
        payload: { scenarios: JSON.stringify(scenarios) }
      },
      {
        name: 'Automation Analysis',
        command: 'automation:analyze',
        payload: {
          requirements: requirementText,
          enhancement: JSON.stringify(enhancement),
          scenarios: JSON.stringify(scenarios),
          testCases: JSON.stringify(testCases)
        }
      }
    ];

    const executeStep = (): void => {
      if (currentStep >= steps.length) {
        setGenerationProgress('');
        setFeedback('All artifacts generated successfully!');
        return;
      }

      const step = steps[currentStep];
      setGenerationProgress(`${step.name} (${currentStep + 1}/${steps.length})...`);
      currentStep += 1;

      window.__TRACELM_VSCODE__?.postMessage({
        command: step.command,
        payload: step.payload
      });
    };

    executeStep();
  };

  const generateScenarios = (): void => {
    if (!requirementText.trim()) {
      setFeedback('Add requirements text before scenario generation.');
      return;
    }
    if (!ensureReviewed()) {
      return;
    }
    setFeedback('Generating scenarios...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'scenarios:generate',
      payload: {
        requirements: requirementText,
        enhancement: JSON.stringify(enhancement)
      }
    });
  };

  const generateTestCases = (): void => {
    if (!scenarios.length) {
      setFeedback('Generate scenarios first.');
      return;
    }
    if (!ensureReviewed()) {
      return;
    }
    setFeedback('Generating test cases...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'testCases:generate',
      payload: { scenarios: JSON.stringify(scenarios) }
    });
  };

  const pushTestCasesToXray = (): void => {
    if (!testCases.length) {
      setFeedback('Generate test cases first.');
      return;
    }
    setXrayPushProgress(null);
    setFeedback('Pushing test cases to Xray...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'xray:pushTestCases',
      payload: { testCases: JSON.stringify(testCases) }
    });
  };

  const retryFailedPushes = (): void => {
    const failedIds = xrayPushedIssues.filter((item) => !item.success).map((item) => item.localId);
    if (!failedIds.length) {
      setFeedback('No failed Xray pushes to retry.');
      return;
    }

    setXrayPushProgress(null);
    setFeedback(`Retrying ${failedIds.length} failed push(es)...`);
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'xray:pushTestCases',
      payload: {
        testCases: JSON.stringify(testCases),
        retryOnlyIds: failedIds.join(',')
      }
    });
  };

  const previewXrayPush = (): void => {
    if (!testCases.length) {
      setFeedback('Generate test cases first.');
      return;
    }
    setFeedback('Previewing Xray push...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'xray:previewPush',
      payload: { testCases: JSON.stringify(testCases) }
    });
  };

  const clearXrayHistory = (): void => {
    if (!window.confirm('Clear Xray push history? This will reset deduplication records.')) {
      return;
    }
    setFeedback('Clearing push history...');
    window.__TRACELM_VSCODE__?.postMessage({ command: 'xray:clearPushHistory', payload: {} });
  };

  const analyzeAutomation = (): void => {
    if (!testCases.length) {
      setFeedback('Generate test cases first.');
      return;
    }
    if (!ensureReviewed()) {
      return;
    }
    setFeedback('Analyzing automation candidates...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'automation:analyze',
      payload: {
        requirements: requirementText,
        enhancement: JSON.stringify(enhancement),
        scenarios: JSON.stringify(scenarios),
        testCases: JSON.stringify(testCases)
      }
    });
  };

  const updateScenarioField = (index: number, key: keyof ScenarioItem, value: string): void => {
    setScenarios((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };
      if (key === 'preconditions' || key === 'flow' || key === 'requirementRefs') {
        item[key] = value
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
      } else {
        item[key] = value as never;
      }
      copy[index] = item;
      return copy;
    });
  };

  const downloadFile = (fileName: string, content: string, mimeType: string): void => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const escapeCsvCell = (value: string): string => {
    const escaped = value.replace(/"/g, '""');
    return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
  };

  const exportTestCasesGherkin = (): void => {
    const content = testCases.map((item) => item.gherkin).join('\n\n');
    downloadFile('tracelm-test-cases.feature', content, 'text/plain;charset=utf-8');
  };

  const exportTestCasesCsv = (): void => {
    const lines = testCases.map((item) => [
      item.id,
      item.title,
      item.scenarioId,
      item.requirementRefs.join(' | '),
      item.layer,
      item.priority,
      item.preconditions.join(' | '),
      item.steps.join(' | '),
      item.expectedResult,
      item.testData
    ]);
    const headerWithTrace = [
      'ID',
      'Title',
      'ScenarioID',
      'RequirementRefs',
      'Layer',
      'Priority',
      'Preconditions',
      'Detailed Steps',
      'ExpectedResult',
      'Test Data'
    ];
    const csv = [headerWithTrace, ...lines]
      .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
      .join('\n');
    downloadFile('tracelm-test-cases.csv', csv, 'text/csv;charset=utf-8');
  };

  const exportAutomationJson = (): void => {
    if (!automation) {
      return;
    }
    downloadFile(
      'tracelm-automation-analysis.json',
      JSON.stringify(automation, null, 2),
      'application/json;charset=utf-8'
    );
  };

  const exportAutomationCsv = (): void => {
    if (!automation) {
      return;
    }
    const header = [
      'TestCaseID',
      'Candidate',
      'ExclusionReason',
      'Feasibility',
      'ROI',
      'Layer',
      'Priority',
      'Notes'
    ];
    const lines = automation.items.map((item) => [
      item.testCaseId,
      String(item.candidate),
      item.exclusionReason,
      String(item.feasibility),
      String(item.roiScore),
      item.layer,
      item.priority,
      item.notes
    ]);
    const csv = [header, ...lines]
      .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
      .join('\n');
    downloadFile('tracelm-automation-analysis.csv', csv, 'text/csv;charset=utf-8');
  };

  const automationByLayer = useMemo(() => {
    const groups: Record<'Unit' | 'API' | 'UI', AutomationCandidateItem[]> = {
      Unit: [],
      API: [],
      UI: []
    };
    for (const item of automation?.items ?? []) {
      groups[item.layer].push(item);
    }
    return groups;
  }, [automation]);

  const Tip = ({ text }: { text: string }): JSX.Element => (
    <span className="help-tip" title={text} aria-label={text}>
      ?
    </span>
  );

  return (
    <main>
      <h1>TraceLM</h1>
      <p>{status}</p>

      <div className="tab-row">
        <button type="button" className={activeTab === 'settings' ? 'tab active' : 'tab'} onClick={() => setActiveTab('settings')}>Settings</button>
        <button type="button" className={activeTab === 'requirements' ? 'tab active' : 'tab'} onClick={() => setActiveTab('requirements')}>Requirements</button>
        <button type="button" className={activeTab === 'enhancement' ? 'tab active' : 'tab'} onClick={() => setActiveTab('enhancement')}>Requirement Enhancement</button>
        <button type="button" className={activeTab === 'scenarios' ? 'tab active' : 'tab'} onClick={() => setActiveTab('scenarios')}>Test Scenarios</button>
        <button type="button" className={activeTab === 'testCases' ? 'tab active' : 'tab'} onClick={() => setActiveTab('testCases')}>Test Cases</button>
        <button type="button" className={activeTab === 'automation' ? 'tab active' : 'tab'} onClick={() => setActiveTab('automation')}>Automation Candidates</button>
      </div>

      {activeTab === 'settings' && (
        <section className="panel">
          <h2>Settings</h2>

          <div className="field-row"><label htmlFor="llmProvider">LLM Provider <Tip text="Provider used for requirement enhancement and generation." /></label><select id="llmProvider" value={settings.llmProvider} onChange={(e) => updateSettingsField('llmProvider', e.target.value)}><option value="OpenAI">OpenAI</option><option value="Anthropic">Anthropic</option><option value="Gemini">Gemini</option></select></div>
          <div className="field-row"><label htmlFor="llmModel">Model</label><select id="llmModel" value={settings.llmModel} onChange={(e) => updateSettingsField('llmModel', e.target.value)}>{availableModels.map((model) => <option key={model} value={model}>{model}</option>)}</select></div>
          <div className="field-row"><label htmlFor="llmApiKey">LLM API Key</label><input id="llmApiKey" type="password" value={settings.llmApiKey} onChange={(e) => updateSettingsField('llmApiKey', e.target.value)} /></div>
          <div className="field-row"><label htmlFor="jiraUrl">Jira URL</label><input id="jiraUrl" type="text" placeholder="https://your-domain.atlassian.net" value={settings.jiraUrl} onChange={(e) => updateSettingsField('jiraUrl', e.target.value)} /></div>
          <div className="field-row"><label htmlFor="jiraProjectKey">Jira Project Key</label><input id="jiraProjectKey" type="text" placeholder="PROJ" value={settings.jiraProjectKey} onChange={(e) => updateSettingsField('jiraProjectKey', e.target.value)} /></div>
          <div className="field-row"><label htmlFor="jiraEmail">Jira Email</label><input id="jiraEmail" type="text" placeholder="user@company.com" value={settings.jiraEmail} onChange={(e) => updateSettingsField('jiraEmail', e.target.value)} /></div>
          <div className="field-row"><label htmlFor="jiraApiToken">Jira API Token</label><input id="jiraApiToken" type="password" value={settings.jiraApiToken} onChange={(e) => updateSettingsField('jiraApiToken', e.target.value)} /></div>
          <div className="field-row"><label htmlFor="xrayClientId">Xray Client ID</label><input id="xrayClientId" type="password" value={settings.xrayClientId} onChange={(e) => updateSettingsField('xrayClientId', e.target.value)} /></div>
          <div className="field-row"><label htmlFor="xrayClientSecret">Xray Client Secret</label><input id="xrayClientSecret" type="password" value={settings.xrayClientSecret} onChange={(e) => updateSettingsField('xrayClientSecret', e.target.value)} /></div>
          <hr />
          <h3>Xray Push Controls</h3>
          <div className="field-row"><label htmlFor="xrayBatchSize">Batch Size <Tip text="How many test cases to push per batch. Lower values reduce timeout/rate-limit risk." /></label><input id="xrayBatchSize" type="number" min={1} max={100} value={settings.xrayBatchSize} onChange={(e) => updateSettingsField('xrayBatchSize', e.target.value)} /></div>
          <div className="field-row"><label htmlFor="xrayBatchDelayMs">Delay Between Batches (ms) <Tip text="Wait time between batch submissions to avoid API saturation." /></label><input id="xrayBatchDelayMs" type="number" min={0} max={30000} value={settings.xrayBatchDelayMs} onChange={(e) => updateSettingsField('xrayBatchDelayMs', e.target.value)} /></div>
          <div className="field-row"><label htmlFor="xrayMaxRetries">Max Retries <Tip text="Retry attempts for 429/503 rate-limit and service-unavailable responses." /></label><input id="xrayMaxRetries" type="number" min={1} max={10} value={settings.xrayMaxRetries} onChange={(e) => updateSettingsField('xrayMaxRetries', e.target.value)} /></div>

          <div className="button-row"><button type="button" onClick={saveSettings}>Save Settings</button><button type="button" onClick={testLlm}>Test LLM</button><button type="button" onClick={testJira}>Test Jira/Xray</button></div>
          <p className="feedback">{feedback}</p>
        </section>
      )}

      {activeTab === 'requirements' && (
        <section className="panel">
          <h2>Requirements</h2>
          <div className="field-stack"><label htmlFor="requirementsText">Free Text Input</label><textarea id="requirementsText" className="requirements-text" value={requirementText} onChange={(e) => { setRequirementText(e.target.value); setRequirementsReviewed(false); }} placeholder="Paste requirement text, user stories, BRD/SRS content, or pulled Jira details..." /></div>
          <div className="review-box">
            <label className="story-item">
              <input
                type="checkbox"
                checked={requirementsReviewed}
                onChange={(e) => setRequirementsReviewed(e.target.checked)}
              />
              <span>I reviewed the requirements and they are ready for generation.</span>
            </label>
          </div>
          <hr />
          <h3>File Upload Parsing</h3>
          <div className="button-row"><input type="file" multiple accept=".txt,.md,.docx,.pdf" onChange={handleFileChange} /><button type="button" onClick={parseSelectedFiles}>Parse Selected Files</button></div>
          {!!parsedFiles.length && <ul className="list">{parsedFiles.map((file) => <li key={file.name}>{file.name}: {file.error ? `Error - ${file.error}` : 'Parsed'}</li>)}</ul>}
          <hr />
          <h3>Pull from Jira</h3>
          <div className="field-row"><label htmlFor="jiraMode">Mode</label><select id="jiraMode" value={jiraMode} onChange={(e) => setJiraMode(e.target.value as JiraMode)}><option value="single">Single Issue</option><option value="multiple">Multiple Issues (comma-separated)</option><option value="epic">Epic Children</option><option value="multiStory">Multi-Story Picker</option></select></div>
          {jiraMode === 'single' && <div className="field-row"><label htmlFor="singleIssueKey">Issue Key</label><input id="singleIssueKey" type="text" placeholder="PROJ-123" value={singleIssueKey} onChange={(e) => setSingleIssueKey(e.target.value)} /></div>}
          {jiraMode === 'multiple' && <div className="field-stack"><label htmlFor="multipleIssueKeys">Issue Keys</label><textarea id="multipleIssueKeys" className="small-text" placeholder="PROJ-101, PROJ-102, PROJ-103" value={multipleIssueKeys} onChange={(e) => setMultipleIssueKeys(e.target.value)} /></div>}
          {jiraMode === 'epic' && <div className="field-row"><label htmlFor="epicKey">Epic Key</label><input id="epicKey" type="text" placeholder="PROJ-EPIC-1" value={epicKey} onChange={(e) => setEpicKey(e.target.value)} /></div>}
          {jiraMode === 'multiStory' && (
            <>
              <div className="button-row"><input type="text" placeholder="Search stories by summary" value={storyQuery} onChange={(e) => setStoryQuery(e.target.value)} /><button type="button" onClick={searchStories}>Search Stories</button></div>
              <div className="story-list">{storyOptions.map((story) => <label key={story.key} className="story-item"><input type="checkbox" checked={selectedStoryKeys.includes(story.key)} onChange={() => toggleStoryKey(story.key)} /><span>{story.key}: {story.summary}</span></label>)}</div>
            </>
          )}
          <div className="button-row"><button type="button" onClick={pullFromJira}>Pull Jira Requirements</button></div>
          {!!pulledIssues.length && <ul className="list">{pulledIssues.map((issue) => <li key={issue.key}>{issue.key}: {issue.summary}</li>)}</ul>}
          <p className="feedback">{feedback}</p>
        </section>
      )}

      {activeTab === 'enhancement' && (
        <section className="panel">
          <h2>Requirement Enhancement</h2>
          <p className="helper-text">Analyze requirements for missing requirements, non-functional gaps, and market-aligned best practices.</p>
          <div className="button-row"><button type="button" onClick={generateEnhancement}>Generate Enhancement</button><button type="button" onClick={() => setActiveTab('requirements')}>Go To Requirements</button></div>
          <div className="enhancement-grid">
            <article className="enh-card"><h3>Missing Functional</h3><ul className="list">{enhancement.missingFunctional.map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article className="enh-card"><h3>Missing Non-Functional</h3><ul className="list">{enhancement.missingNonFunctional.map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article className="enh-card"><h3>Best Practices</h3><ul className="list">{enhancement.bestPractices.map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article className="enh-card"><h3>Market Benchmark</h3><ul className="list">{enhancement.marketBenchmark.map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article className="enh-card"><h3>Risks</h3><ul className="list">{enhancement.risks.map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article className="enh-card"><h3>Clarifying Questions</h3><ul className="list">{enhancement.clarifyingQuestions.map((item) => <li key={item}>{item}</li>)}</ul></article>
          </div>
          <p className="feedback">{feedback}</p>
        </section>
      )}

      {activeTab === 'scenarios' && (
        <section className="panel">
          <h2>Test Scenarios</h2>
          <p className="helper-text">Generate and refine scenarios from requirements and enhancement output.</p>
          <div className="button-row"><button type="button" onClick={generateScenarios}>Generate Scenarios</button></div>
          {!scenarios.length ? (
            <p className="helper-text">No scenarios generated yet.</p>
          ) : (
            <div className="scenario-list">
              {scenarios.map((scenario, index) => (
                <article key={scenario.id} className="scenario-card">
                  <div className="field-row"><label htmlFor={`id-${scenario.id}`}>ID</label><input id={`id-${scenario.id}`} type="text" value={scenario.id} onChange={(e) => updateScenarioField(index, 'id', e.target.value)} /></div>
                  <div className="field-row"><label htmlFor={`title-${scenario.id}`}>Title</label><input id={`title-${scenario.id}`} type="text" value={scenario.title} onChange={(e) => updateScenarioField(index, 'title', e.target.value)} /></div>
                  <div className="field-row"><label htmlFor={`priority-${scenario.id}`}>Priority</label><input id={`priority-${scenario.id}`} type="text" value={scenario.priority} onChange={(e) => updateScenarioField(index, 'priority', e.target.value)} /></div>
                  <div className="field-stack"><label htmlFor={`refs-${scenario.id}`}>Requirement Refs (one per line)</label><textarea id={`refs-${scenario.id}`} className="small-text" value={scenario.requirementRefs.join('\n')} onChange={(e) => updateScenarioField(index, 'requirementRefs', e.target.value)} /></div>
                  <div className="field-stack"><label htmlFor={`pre-${scenario.id}`}>Preconditions (one per line)</label><textarea id={`pre-${scenario.id}`} className="small-text" value={scenario.preconditions.join('\n')} onChange={(e) => updateScenarioField(index, 'preconditions', e.target.value)} /></div>
                  <div className="field-stack"><label htmlFor={`flow-${scenario.id}`}>Flow (one per line)</label><textarea id={`flow-${scenario.id}`} className="small-text" value={scenario.flow.join('\n')} onChange={(e) => updateScenarioField(index, 'flow', e.target.value)} /></div>
                  <div className="field-stack"><label htmlFor={`outcome-${scenario.id}`}>Expected Outcome</label><textarea id={`outcome-${scenario.id}`} className="small-text" value={scenario.expectedOutcome} onChange={(e) => updateScenarioField(index, 'expectedOutcome', e.target.value)} /></div>
                </article>
              ))}
            </div>
          )}
          <p className="feedback">{feedback}</p>
        </section>
      )}

      {activeTab === 'testCases' && (
        <section className="panel">
          <h2>Test Cases</h2>
          <p className="helper-text">Generate test cases from scenarios with Gherkin and structured table output.</p>
          <div className="button-row">
            <button type="button" onClick={generateAll} disabled={generationProgress.length > 0}>Generate All Artifacts</button>
            {generationProgress && <span className="progress-message">{generationProgress}</span>}
          </div>
          <div className="button-row">
            <button type="button" onClick={generateTestCases}>Generate Test Cases</button>
            <button type="button" onClick={exportTestCasesGherkin} disabled={!testCases.length}>Export .feature</button>
            <button type="button" onClick={exportTestCasesCsv} disabled={!testCases.length}>Export CSV</button>
            <button type="button" onClick={previewXrayPush} disabled={!testCases.length}>Preview Push</button>
            <button type="button" onClick={pushTestCasesToXray} disabled={!testCases.length}>Push to Xray</button>
            <button type="button" onClick={retryFailedPushes} disabled={!xrayPushedIssues.some((i) => !i.success)}>Retry Failed Push</button>
            <button type="button" onClick={clearXrayHistory} disabled={!xrayPushedIssues.length}>Clear Push History</button>
          </div>

          {!testCases.length ? (
            <p className="helper-text">No test cases generated yet.</p>
          ) : (
            <div className="testcase-grid">
              <article className="enh-card">
                <h3>Gherkin View</h3>
                {testCases.map((testCase) => (
                  <pre key={testCase.id} className="gherkin-block">{testCase.gherkin}</pre>
                ))}
              </article>
              <article className="enh-card">
                <h3>Structured Cases</h3>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr><th>ID</th><th>Title</th><th>Scenario</th><th>Requirement Refs</th><th>Layer</th><th>Priority</th><th>Expected Result</th></tr>
                    </thead>
                    <tbody>
                      {testCases.map((testCase) => (
                        <tr key={testCase.id}>
                          <td>{testCase.id}</td>
                          <td>{testCase.title}</td>
                          <td>{testCase.scenarioId}</td>
                          <td>{testCase.requirementRefs.join(', ')}</td>
                          <td>{testCase.layer}</td>
                          <td>{testCase.priority}</td>
                          <td>{testCase.expectedResult}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          )}

          {!!xrayPushPreview && (
            <article className="enh-card">
              <h3>Xray Push Preview</h3>
              <p><strong>Summary:</strong> {xrayPushPreview.willPush} to push, {xrayPushPreview.duplicates} duplicates, {xrayPushPreview.validationErrors} validation errors (of {xrayPushPreview.totalCases} total)</p>
              <ul className="list">
                {xrayPushPreview.details.map((detail) => (
                  <li key={detail.id}>
                    <strong>{detail.id}</strong> - {detail.status === 'valid' ? '✓ Ready' : detail.status === 'duplicate' ? '⊘ Duplicate' : '✗ Error'}
                    <br />
                    {detail.title}
                    {detail.message ? <> ({detail.message})</> : null}
                  </li>
                ))}
              </ul>
            </article>
          )}

          {!!xrayPushProgress && (
            <article className="enh-card">
              <h3>Push Progress</h3>
              <p>
                Batch {xrayPushProgress.batchIndex} of {xrayPushProgress.totalBatches} -{' '}
                {xrayPushProgress.status}
              </p>
              <p>{xrayPushProgress.message}</p>
            </article>
          )}

          {!!xrayPushedIssues.length && (
            <article className="enh-card">
              <h3>Pushed Xray Issues</h3>
              <ul className="list">
                {xrayPushedIssues.map((issue) => (
                  <li key={issue.localId}>
                    <strong>{issue.localId}</strong> - {issue.isValidationError ? '[Validation Error]' : issue.success ? 'Success' : 'Failed'}
                    {issue.success && issue.key && issue.url ? (
                      <>
                        {' '}
                        <a href={issue.url}>{issue.key}</a>
                      </>
                    ) : null}
                    {issue.message ? <> ({issue.message})</> : null}
                  </li>
                ))}
              </ul>
            </article>
          )}
          <p className="feedback">{feedback}</p>
        </section>
      )}

      {activeTab === 'automation' && (
        <section className="panel">
          <h2>Automation Candidates</h2>
          <p className="helper-text">Run A–F automation analysis with feasibility, ROI, and layer-based prioritization.</p>
          <div className="button-row">
            <button type="button" onClick={analyzeAutomation}>Analyze Automation Candidates</button>
            <button type="button" onClick={exportAutomationJson} disabled={!automation}>Export JSON</button>
            <button type="button" onClick={exportAutomationCsv} disabled={!automation}>Export CSV</button>
          </div>

          {!automation ? (
            <p className="helper-text">No automation analysis yet.</p>
          ) : (
            <>
              <p>{automation.summary}</p>
              <p><strong>Recommended Layer Order:</strong> {automation.recommendedOrder.join(' -> ')}</p>
              <div className="automation-grid">
                {(['Unit', 'API', 'UI'] as const).map((layer) => (
                  <article key={layer} className="enh-card">
                    <h3>{layer}</h3>
                    <ul className="list">
                      {automationByLayer[layer].map((item) => (
                        <li key={item.testCaseId}>
                          {item.testCaseId} | {item.priority} | ROI {item.roiScore} | Feasibility {item.feasibility}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </>
          )}
          <p className="feedback">{feedback}</p>
        </section>
      )}
    </main>
  );
}

export default App;
