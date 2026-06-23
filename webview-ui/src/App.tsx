import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type Settings,
  type ParsedFile,
  type JiraIssueSummary,
  type UploadDraft,
  type JiraMode,
  type TabKey,
  type RequirementEnhancement,
  type ScenarioItem,
  type TestCaseItem,
  type AutomationAnalysis,
  type XrayPushedIssue,
  type XrayPushPreview,
  type XrayPushProgress,
  defaultSettings,
  emptyEnhancement,
  getProviderModels,
} from './types';
import { downloadFile, escapeCsvCell, inferScenarioType } from './utils';
import { useTraceLMMessages } from './hooks/useTraceLMMessages';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SettingsTab } from './tabs/SettingsTab';
import { RequirementsTab } from './tabs/RequirementsTab';
import { EnhancementTab } from './tabs/EnhancementTab';
import { ScenariosTab } from './tabs/ScenariosTab';
import { TestCasesTab } from './tabs/TestCasesTab';
import { AutomationTab } from './tabs/AutomationTab';

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
  const [enhancementGeneratedAt, setEnhancementGeneratedAt] = useState<Date | null>(null);
  const [scenariosGeneratedAt, setScenariosGeneratedAt] = useState<Date | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);
  const [testCases, setTestCases] = useState<TestCaseItem[]>([]);
  const [automation, setAutomation] = useState<AutomationAnalysis | null>(null);
  const [requirementsReviewed, setRequirementsReviewed] = useState(false);
  const [xrayPushedIssues, setXrayPushedIssues] = useState<XrayPushedIssue[]>([]);
  const [xrayPushPreview, setXrayPushPreview] = useState<XrayPushPreview | null>(null);
  const [xrayPushProgress, setXrayPushProgress] = useState<XrayPushProgress | null>(null);
  const [generationProgress, setGenerationProgress] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  // ── Refs (stable reads inside useCallback, avoids stale-closure deps) ────
  const requirementTextRef = useRef(requirementText);
  const enhancementRef = useRef(enhancement);
  const scenariosRef = useRef(scenarios);
  const testCasesRef = useRef(testCases);
  const settingsRef = useRef(settings);
  const automationRef = useRef(automation);
  const xrayPushedIssuesRef = useRef(xrayPushedIssues);
  const requirementsReviewedRef = useRef(requirementsReviewed);
  const uploadDraftsRef = useRef(uploadDrafts);
  const generateAllStepRef = useRef<number>(0);
  const generateAllWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastGenIdRef = useRef<Record<string, string>>({});

  useEffect(() => { requirementTextRef.current = requirementText; }, [requirementText]);
  useEffect(() => { enhancementRef.current = enhancement; }, [enhancement]);
  useEffect(() => { scenariosRef.current = scenarios; }, [scenarios]);
  useEffect(() => { testCasesRef.current = testCases; }, [testCases]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { automationRef.current = automation; }, [automation]);
  useEffect(() => { xrayPushedIssuesRef.current = xrayPushedIssues; }, [xrayPushedIssues]);
  useEffect(() => { requirementsReviewedRef.current = requirementsReviewed; }, [requirementsReviewed]);
  useEffect(() => { uploadDraftsRef.current = uploadDrafts; }, [uploadDrafts]);

  const availableModels = useMemo(() => getProviderModels(settings.llmProvider), [settings.llmProvider]);

  useEffect(() => {
    if (!availableModels.length) return;
    if (!availableModels.includes(settings.llmModel)) {
      setSettings((prev) => ({ ...prev, llmModel: availableModels[0] }));
    }
  }, [availableModels, settings.llmModel]);

  useTraceLMMessages({
    generateAllStepRef, requirementTextRef, enhancementRef, scenariosRef, lastGenIdRef,
    setStatus, setFeedback, setIsBusy, setSettings,
    setRequirementText, setRequirementsReviewed,
    setParsedFiles, setStoryOptions, setPulledIssues,
    setEnhancement, setScenarios, setTestCases,
    setXrayPushedIssues, setAutomation,
    setXrayPushPreview, setXrayPushProgress, setGenerationProgress,
    onEnhancementReceived: () => setEnhancementGeneratedAt(new Date()),
    onScenariosReceived: () => setScenariosGeneratedAt(new Date()),
    onChainSettled: () => {
      if (generateAllWatchdogRef.current) {
        clearTimeout(generateAllWatchdogRef.current);
        generateAllWatchdogRef.current = null;
      }
    },
  });

  // ── Settings ──────────────────────────────────────────────────────────────

  const updateSettingsField = useCallback((key: keyof Settings, value: string): void => {
    if (key === 'llmProvider') {
      const models = getProviderModels(value);
      setSettings((prev) => ({
        ...prev,
        llmProvider: value,
        llmModel: models.includes(prev.llmModel) ? prev.llmModel : models[0] ?? '',
      }));
      return;
    }
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const saveSettings = useCallback((): void => {
    setIsBusy(true);
    setFeedback('Saving settings...');
    window.__TRACELM_VSCODE__?.postMessage({ command: 'settings:save', payload: settingsRef.current });
  }, []);

  const testLlm = useCallback((): void => {
    setIsBusy(true);
    setFeedback('Validating LLM settings...');
    window.__TRACELM_VSCODE__?.postMessage({ command: 'settings:testLlm', payload: settingsRef.current });
  }, []);

  const testJira = useCallback((): void => {
    setIsBusy(true);
    setFeedback('Validating Jira/Xray settings...');
    window.__TRACELM_VSCODE__?.postMessage({ command: 'settings:testJira', payload: settingsRef.current });
  }, []);

  // ── File & Jira ───────────────────────────────────────────────────────────

  const toBase64 = useCallback(async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }, []);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const next = await Promise.all(
      Array.from(files).map(async (file) => ({
        name: file.name,
        mimeType: file.type,
        contentBase64: await toBase64(file),
      }))
    );
    setUploadDrafts(next);
    setFeedback(`${next.length} file(s) selected.`);
  }, [toBase64]);

  const parseSelectedFiles = useCallback((): void => {
    if (!uploadDraftsRef.current.length) { setFeedback('Select at least one file first.'); return; }
    setIsBusy(true);
    setFeedback('Parsing selected files...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'requirements:parseFiles',
      payload: { files: JSON.stringify(uploadDraftsRef.current) },
    });
  }, []);

  const searchStories = useCallback((): void => {
    setIsBusy(true);
    setFeedback('Searching Jira stories...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'requirements:searchStories',
      payload: { query: storyQuery },
    });
  }, [storyQuery]);

  const pullFromJira = useCallback((): void => {
    setIsBusy(true);
    setFeedback('Pulling Jira requirements...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'requirements:pullJira',
      payload: { mode: jiraMode, singleIssueKey, multipleIssueKeys, epicKey, selectedStoryKeys: selectedStoryKeys.join(',') },
    });
  }, [jiraMode, singleIssueKey, multipleIssueKeys, epicKey, selectedStoryKeys]);

  const toggleStoryKey = useCallback((key: string): void => {
    setSelectedStoryKeys((prev) =>
      prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]
    );
  }, []);

  // ── Generation guards ─────────────────────────────────────────────────────

  const ensureReviewed = useCallback((): boolean => {
    if (!requirementsReviewedRef.current) {
      setFeedback('Review and confirm requirements before running generation.');
      setActiveTab('requirements');
      return false;
    }
    return true;
  }, []);

  const handleRequirementTextChange = useCallback((text: string): void => {
    setRequirementText(text);
    setRequirementsReviewed(false);
  }, []);

  // ── Generation ────────────────────────────────────────────────────────────

  const generateEnhancement = useCallback((): void => {
    if (!requirementTextRef.current.trim()) { setFeedback('Add requirements text before enhancement.'); return; }
    if (!ensureReviewed()) return;
    setIsBusy(true);
    setFeedback('Generating requirement enhancement...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'requirements:enhance',
      payload: { requirements: requirementTextRef.current },
    });
  }, [ensureReviewed]);

  const generateAll = useCallback((): void => {
    if (!requirementTextRef.current.trim()) { setFeedback('Add requirements text before generation.'); return; }
    if (!ensureReviewed()) return;

    if (generateAllWatchdogRef.current) { clearTimeout(generateAllWatchdogRef.current); }
    generateAllWatchdogRef.current = setTimeout(() => {
      if (generateAllStepRef.current > 0) {
        generateAllStepRef.current = 0;
        setGenerationProgress('');
        setIsBusy(false);
        setFeedback('Generate All timed out after 25 minutes. Please try again or use individual generation buttons.');
      }
    }, 1_500_000);

    setIsBusy(true);
    generateAllStepRef.current = 1;
    setGenerationProgress('Requirement Enhancement (1/4)...');
    setFeedback('Generating all artifacts sequentially...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'requirements:enhance',
      payload: { requirements: requirementTextRef.current },
    });
  }, [ensureReviewed]);

  const generateScenarios = useCallback((): void => {
    if (!requirementTextRef.current.trim()) { setFeedback('Add requirements text before scenario generation.'); return; }
    if (!ensureReviewed()) return;
    setIsBusy(true);
    setFeedback('Generating scenarios...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'scenarios:generate',
      payload: { requirements: requirementTextRef.current, enhancement: JSON.stringify(enhancementRef.current) },
    });
  }, [ensureReviewed]);

  const generateTestCases = useCallback((): void => {
    if (!scenariosRef.current.length) { setFeedback('Generate scenarios first.'); return; }
    if (!ensureReviewed()) return;
    setIsBusy(true);
    setFeedback('Generating test cases...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'testCases:generate',
      payload: { scenarios: JSON.stringify(scenariosRef.current) },
    });
  }, [ensureReviewed]);

  // ── Xray ──────────────────────────────────────────────────────────────────

  const pushTestCasesToXray = useCallback((): void => {
    if (!testCasesRef.current.length) { setFeedback('Generate test cases first.'); return; }
    setIsBusy(true);
    setXrayPushProgress(null);
    setFeedback('Pushing test cases to Xray...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'xray:pushTestCases',
      payload: { testCases: JSON.stringify(testCasesRef.current) },
    });
  }, []);

  const retryFailedPushes = useCallback((): void => {
    const failedIds = xrayPushedIssuesRef.current.filter((i) => !i.success).map((i) => i.localId);
    if (!failedIds.length) { setFeedback('No failed Xray pushes to retry.'); return; }
    setIsBusy(true);
    setXrayPushProgress(null);
    setFeedback(`Retrying ${failedIds.length} failed push(es)...`);
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'xray:pushTestCases',
      payload: { testCases: JSON.stringify(testCasesRef.current), retryOnlyIds: failedIds.join(',') },
    });
  }, []);

  const previewXrayPush = useCallback((): void => {
    if (!testCasesRef.current.length) { setFeedback('Generate test cases first.'); return; }
    setIsBusy(true);
    setFeedback('Previewing Xray push...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'xray:previewPush',
      payload: { testCases: JSON.stringify(testCasesRef.current) },
    });
  }, []);

  const clearXrayHistory = useCallback((): void => {
    if (!window.confirm('Clear Xray push history? This will reset deduplication records.')) return;
    setIsBusy(true);
    setFeedback('Clearing push history...');
    window.__TRACELM_VSCODE__?.postMessage({ command: 'xray:clearPushHistory', payload: {} });
  }, []);

  // ── Automation ────────────────────────────────────────────────────────────

  const analyzeAutomation = useCallback((): void => {
    if (!testCasesRef.current.length) { setFeedback('Generate test cases first.'); return; }
    if (!ensureReviewed()) return;
    setIsBusy(true);
    setFeedback('Analyzing automation candidates...');
    window.__TRACELM_VSCODE__?.postMessage({
      command: 'automation:analyze',
      payload: {
        requirements: requirementTextRef.current,
        enhancement: JSON.stringify(enhancementRef.current),
        scenarios: JSON.stringify(scenariosRef.current),
        testCases: JSON.stringify(testCasesRef.current),
      },
    });
  }, [ensureReviewed]);

  // ── Scenario editing ──────────────────────────────────────────────────────

  const updateScenarioField = useCallback((index: number, key: keyof ScenarioItem, value: string): void => {
    setScenarios((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };
      if (key === 'preconditions' || key === 'flow' || key === 'requirementRefs') {
        item[key] = value.split('\n').map((l) => l.trim()).filter(Boolean);
      } else {
        item[key] = value as never;
      }
      // Re-infer type whenever content fields change, unless the user explicitly changed type
      if (key !== 'type' && key !== 'id' && key !== 'requirementRefs' && key !== 'preconditions') {
        const flow = key === 'flow' ? value.split('\n').map((l) => l.trim()).filter(Boolean) : item.flow;
        const outcome = key === 'expectedOutcome' ? value : item.expectedOutcome;
        const title = key === 'title' ? value : item.title;
        item.type = inferScenarioType(title, flow, outcome);
      }
      copy[index] = item;
      return copy;
    });
  }, []);

  const addScenario = useCallback((): void => {
    setScenarios((prev) => {
      const nextNum = prev.length + 1;
      const newItem: ScenarioItem = {
        id: `SCN-${String(nextNum).padStart(3, '0')}`,
        title: '',
        type: inferScenarioType(''),
        requirementRefs: [],
        preconditions: [],
        flow: [],
        expectedOutcome: '',
        priority: 'Medium',
      };
      return [...prev, newItem];
    });
  }, []);

  const deleteScenario = useCallback((index: number): void => {
    setScenarios((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Exports ───────────────────────────────────────────────────────────────

  const exportAutomationJson = useCallback((): void => {
    if (!automationRef.current) return;
    downloadFile(
      'tracelm-automation-analysis.json',
      JSON.stringify(automationRef.current, null, 2),
      'application/json;charset=utf-8'
    );
  }, []);

  const exportAutomationCsv = useCallback((): void => {
    const current = automationRef.current;
    if (!current) return;
    const header = ['TestCaseID', 'ScenarioID', 'RequirementRef', 'Candidate', 'ExclusionReason', 'FeasibilityLevel', 'ROILevel', 'Layer', 'Priority', 'PlaywrightAutomatable', 'PlaywrightScope', 'Blocker', 'Notes'];
    const lines = current.items.map((item) => [
      item.testCaseId, item.scenarioId, item.requirementRef,
      String(item.candidate), item.exclusionReason,
      item.feasibilityLevel, item.roiLevel,
      item.layer, item.priority,
      item.playwrightAutomatable, item.playwrightScope, item.blocker, item.notes,
    ]);
    const csv = [header, ...lines].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
    downloadFile('tracelm-automation-analysis.csv', csv, 'text/csv;charset=utf-8');
  }, []);

  // ── Enhancement item mutations ────────────────────────────────────────────

  const updateEnhancementItem = useCallback((key: keyof RequirementEnhancement, index: number, value: string): void => {
    setEnhancement((prev) => {
      const arr = [...prev[key]];
      arr[index] = value;
      return { ...prev, [key]: arr };
    });
  }, []);

  const deleteEnhancementItem = useCallback((key: keyof RequirementEnhancement, index: number): void => {
    setEnhancement((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  const enhancementTotal = useMemo(
    () => Object.values(enhancement).reduce((sum, arr) => sum + arr.length, 0),
    [enhancement]
  );

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'settings',     label: 'Settings',                count: 0 },
    { key: 'requirements', label: 'Requirements',            count: 0 },
    { key: 'enhancement',  label: 'Requirement Enhancement', count: enhancementTotal },
    { key: 'scenarios',    label: 'Test Scenarios',          count: scenarios.length },
    { key: 'testCases',    label: 'Test Cases',              count: testCases.length },
    { key: 'automation',   label: 'Automation Candidates',   count: automation?.items.length ?? 0 },
  ];

  return (
    <main>
      <h1>TraceLM</h1>
      <p>{status}</p>

      <div className="tab-row">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            className={activeTab === key ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(key)}
          >
            {label}
            {count > 0 && <span className="tab-count">{count}</span>}
          </button>
        ))}
      </div>

      {activeTab === 'settings' && (
        <ErrorBoundary tabName="Settings">
          <SettingsTab
            settings={settings}
            availableModels={availableModels}
            isBusy={isBusy}
            feedback={feedback}
            onFieldChange={updateSettingsField}
            onSave={saveSettings}
            onTestLlm={testLlm}
            onTestJira={testJira}
          />
        </ErrorBoundary>
      )}

      {activeTab === 'requirements' && (
        <ErrorBoundary tabName="Requirements">
          <RequirementsTab
            requirementText={requirementText}
            requirementsReviewed={requirementsReviewed}
            generationProgress={generationProgress}
            parsedFiles={parsedFiles}
            uploadDrafts={uploadDrafts}
            jiraMode={jiraMode}
            singleIssueKey={singleIssueKey}
            multipleIssueKeys={multipleIssueKeys}
            epicKey={epicKey}
            storyQuery={storyQuery}
            storyOptions={storyOptions}
            selectedStoryKeys={selectedStoryKeys}
            pulledIssues={pulledIssues}
            isBusy={isBusy}
            feedback={feedback}
            onRequirementTextChange={handleRequirementTextChange}
            onReviewedChange={setRequirementsReviewed}
            onGenerateAll={generateAll}
            onFileChange={handleFileChange}
            onParseFiles={parseSelectedFiles}
            onJiraModeChange={setJiraMode}
            onSingleKeyChange={setSingleIssueKey}
            onMultipleKeysChange={setMultipleIssueKeys}
            onEpicKeyChange={setEpicKey}
            onStoryQueryChange={setStoryQuery}
            onSearchStories={searchStories}
            onToggleStoryKey={toggleStoryKey}
            onPullJira={pullFromJira}
          />
        </ErrorBoundary>
      )}

      {activeTab === 'enhancement' && (
        <ErrorBoundary tabName="Requirement Enhancement">
          <EnhancementTab
            enhancement={enhancement}
            isBusy={isBusy}
            feedback={feedback}
            generatedAt={enhancementGeneratedAt}
            onGenerate={generateEnhancement}
            onUpdateItem={updateEnhancementItem}
            onDeleteItem={deleteEnhancementItem}
          />
        </ErrorBoundary>
      )}

      {activeTab === 'scenarios' && (
        <ErrorBoundary tabName="Test Scenarios">
          <ScenariosTab
            scenarios={scenarios}
            isBusy={isBusy}
            feedback={feedback}
            generatedAt={scenariosGeneratedAt}
            onGenerate={generateScenarios}
            onUpdateField={updateScenarioField}
            onAddScenario={addScenario}
            onDeleteScenario={deleteScenario}
          />
        </ErrorBoundary>
      )}

      {activeTab === 'testCases' && (
        <ErrorBoundary tabName="Test Cases">
          <TestCasesTab
            testCases={testCases}
            xrayPushPreview={xrayPushPreview}
            xrayPushProgress={xrayPushProgress}
            xrayPushedIssues={xrayPushedIssues}
            isBusy={isBusy}
            feedback={feedback}
            onGenerateTestCases={generateTestCases}
            onPreviewPush={previewXrayPush}
            onPushToXray={pushTestCasesToXray}
            onRetryFailed={retryFailedPushes}
            onClearHistory={clearXrayHistory}
          />
        </ErrorBoundary>
      )}

      {activeTab === 'automation' && (
        <ErrorBoundary tabName="Automation Candidates">
          <AutomationTab
            automation={automation}
            isBusy={isBusy}
            feedback={feedback}
            onAnalyze={analyzeAutomation}
            onExportJson={exportAutomationJson}
            onExportCsv={exportAutomationCsv}
          />
        </ErrorBoundary>
      )}
    </main>
  );
}

export default App;
