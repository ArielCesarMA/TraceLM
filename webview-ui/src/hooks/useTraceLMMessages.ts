import { useEffect, type MutableRefObject, type Dispatch, type SetStateAction } from 'react';
import {
  type Settings,
  type ParsedFile,
  type JiraIssueSummary,
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
} from '../types';

type Refs = {
  generateAllStepRef: MutableRefObject<number>;
  requirementTextRef: MutableRefObject<string>;
  enhancementRef: MutableRefObject<RequirementEnhancement>;
  scenariosRef: MutableRefObject<ScenarioItem[]>;
};

type Setters = {
  setStatus: Dispatch<SetStateAction<string>>;
  setFeedback: Dispatch<SetStateAction<string>>;
  setIsBusy: Dispatch<SetStateAction<boolean>>;
  setSettings: Dispatch<SetStateAction<Settings>>;
  setRequirementText: Dispatch<SetStateAction<string>>;
  setRequirementsReviewed: Dispatch<SetStateAction<boolean>>;
  setParsedFiles: Dispatch<SetStateAction<ParsedFile[]>>;
  setStoryOptions: Dispatch<SetStateAction<JiraIssueSummary[]>>;
  setPulledIssues: Dispatch<SetStateAction<JiraIssueSummary[]>>;
  setEnhancement: Dispatch<SetStateAction<RequirementEnhancement>>;
  setScenarios: Dispatch<SetStateAction<ScenarioItem[]>>;
  setTestCases: Dispatch<SetStateAction<TestCaseItem[]>>;
  setXrayPushedIssues: Dispatch<SetStateAction<XrayPushedIssue[]>>;
  setAutomation: Dispatch<SetStateAction<AutomationAnalysis | null>>;
  setXrayPushPreview: Dispatch<SetStateAction<XrayPushPreview | null>>;
  setXrayPushProgress: Dispatch<SetStateAction<XrayPushProgress | null>>;
  setGenerationProgress: Dispatch<SetStateAction<string>>;
};

type UseTraceLMMessagesParams = Refs & Setters;

type InboundMessage = {
  command?: string;
  text?: string;
  payload?: Record<string, string>;
};

export function useTraceLMMessages(params: UseTraceLMMessagesParams): void {
  const {
    generateAllStepRef, requirementTextRef, enhancementRef, scenariosRef,
    setStatus, setFeedback, setIsBusy, setSettings,
    setRequirementText, setRequirementsReviewed,
    setParsedFiles, setStoryOptions, setPulledIssues,
    setEnhancement, setScenarios, setTestCases,
    setXrayPushedIssues, setAutomation,
    setXrayPushPreview, setXrayPushProgress, setGenerationProgress,
  } = params;

  useEffect(() => {
    const handler = (event: MessageEvent<InboundMessage>) => {
      const payload = event.data.payload ?? {};

      if (event.data.command === 'pong') {
        setStatus(event.data.text ?? 'Connected');

      } else if (event.data.command === 'settings:loaded') {
        const provider = payload.llmProvider ?? defaultSettings.llmProvider;
        const providerModels = getProviderModels(provider);
        const loadedModel = payload.llmModel ?? '';
        setSettings({
          llmProvider: provider,
          llmModel: loadedModel || providerModels[0] || '',
          llmApiKey: payload.llmApiKey ?? '',
          jiraUrl: payload.jiraUrl ?? '',
          jiraProjectKey: payload.jiraProjectKey ?? '',
          jiraEmail: payload.jiraEmail ?? '',
          jiraApiToken: payload.jiraApiToken ?? '',
          xrayClientId: payload.xrayClientId ?? '',
          xrayClientSecret: payload.xrayClientSecret ?? '',
          xrayBatchSize: payload.xrayBatchSize ?? '10',
          xrayBatchDelayMs: payload.xrayBatchDelayMs ?? '1000',
          xrayMaxRetries: payload.xrayMaxRetries ?? '3',
        });

      } else if (event.data.command === 'settings:saved') {
        setIsBusy(false);
        setFeedback('Settings saved successfully.');

      } else if (event.data.command === 'settings:testResult') {
        setIsBusy(false);
        setFeedback(`${payload.target === 'llm' ? 'LLM' : 'Jira/Xray'}: ${payload.message ?? ''}`);

      } else if (event.data.command === 'requirements:filesParsed') {
        setIsBusy(false);
        const files = JSON.parse(payload.files ?? '[]') as ParsedFile[];
        setParsedFiles(files);
        if (payload.combinedText) {
          setRequirementText((prev) => prev ? `${prev}\n\n${payload.combinedText}` : payload.combinedText);
          setRequirementsReviewed(false);
        }
        setFeedback('File parsing complete.');

      } else if (event.data.command === 'requirements:storiesResult') {
        setIsBusy(false);
        const stories = JSON.parse(payload.stories ?? '[]') as JiraIssueSummary[];
        setStoryOptions(stories);
        setFeedback(`Found ${stories.length} stories.`);

      } else if (event.data.command === 'requirements:jiraPulled') {
        setIsBusy(false);
        const issues = JSON.parse(payload.issues ?? '[]') as JiraIssueSummary[];
        setPulledIssues(issues);
        if (payload.combinedText) {
          setRequirementText((prev) => prev ? `${prev}\n\n${payload.combinedText}` : payload.combinedText);
          setRequirementsReviewed(false);
        }
        setFeedback(`Pulled ${issues.length} Jira issue(s).`);

      } else if (event.data.command === 'requirements:enhanced') {
        const parsed = JSON.parse(payload.enhancement ?? '{}') as RequirementEnhancement;
        const normalized = { ...emptyEnhancement, ...parsed };
        setEnhancement(normalized);
        enhancementRef.current = normalized;
        setFeedback('Requirement enhancement complete.');

        if (generateAllStepRef.current === 1) {
          generateAllStepRef.current = 2;
          setGenerationProgress('Test Scenarios (2/4)...');
          window.__TRACELM_VSCODE__?.postMessage({
            command: 'scenarios:generate',
            payload: { requirements: requirementTextRef.current, enhancement: JSON.stringify(normalized) },
          });
        } else {
          setIsBusy(false);
        }

      } else if (event.data.command === 'scenarios:generated') {
        const parsed = JSON.parse(payload.scenarios ?? '[]') as ScenarioItem[];
        setScenarios(parsed);
        scenariosRef.current = parsed;
        setFeedback(`Generated ${parsed.length} scenario(s).`);

        if (generateAllStepRef.current === 2) {
          generateAllStepRef.current = 3;
          setGenerationProgress('Test Cases (3/4)...');
          window.__TRACELM_VSCODE__?.postMessage({
            command: 'testCases:generate',
            payload: { scenarios: JSON.stringify(parsed) },
          });
        } else {
          setIsBusy(false);
        }

      } else if (event.data.command === 'testCases:generated') {
        const parsed = JSON.parse(payload.testCases ?? '[]') as TestCaseItem[];
        setTestCases(parsed);
        setXrayPushedIssues([]);
        setFeedback(`Generated ${parsed.length} test case(s).`);

        if (generateAllStepRef.current === 3) {
          generateAllStepRef.current = 4;
          setGenerationProgress('Automation Analysis (4/4)...');
          window.__TRACELM_VSCODE__?.postMessage({
            command: 'automation:analyze',
            payload: {
              requirements: requirementTextRef.current,
              enhancement: JSON.stringify(enhancementRef.current),
              scenarios: JSON.stringify(scenariosRef.current),
              testCases: JSON.stringify(parsed),
            },
          });
        } else {
          setIsBusy(false);
        }

      } else if (event.data.command === 'automation:analyzed') {
        setIsBusy(false);
        const parsed = JSON.parse(payload.analysis ?? '{}') as AutomationAnalysis;
        setAutomation(parsed);
        if (generateAllStepRef.current === 4) {
          generateAllStepRef.current = 0;
          setGenerationProgress('done');
          setFeedback('All artifacts generated successfully.');
          setTimeout(() => setGenerationProgress(''), 2000);
        } else {
          setFeedback('Automation analysis completed.');
        }

      } else if (event.data.command === 'requirements:error') {
        setIsBusy(false);
        if (generateAllStepRef.current > 0) {
          generateAllStepRef.current = 0;
          setGenerationProgress('');
          setFeedback(`Generate All stopped: ${payload.message ?? 'Unknown error.'}`);
        } else {
          setFeedback(`TraceLM: ${payload.message ?? 'Unknown error.'}`);
        }

      } else if (event.data.command === 'xray:pushed') {
        setIsBusy(false);
        const parsed = JSON.parse(payload.pushed ?? '[]') as Array<{
          localId: string; success: string; key: string; url: string;
          message: string; isValidationError?: boolean;
        }>;
        const statuses: XrayPushedIssue[] = parsed.map((item) => ({
          localId: item.localId,
          success: item.success === 'true',
          key: item.key,
          url: item.url,
          message: item.message,
          isValidationError: item.isValidationError,
        }));
        setXrayPushedIssues((prev) => {
          const map = new Map(prev.map((item) => [item.localId, item]));
          for (const s of statuses) map.set(s.localId, s);
          return Array.from(map.values());
        });
        const successCount = statuses.filter((i) => i.success).length;
        setXrayPushProgress(null);
        setFeedback(`Xray push complete: ${successCount} succeeded, ${statuses.length - successCount} failed.`);

      } else if (event.data.command === 'xray:pushProgress') {
        const next: XrayPushProgress = {
          message: payload.message ?? '',
          batchIndex: Number(payload.batchIndex ?? '0'),
          totalBatches: Number(payload.totalBatches ?? '0'),
          status: (payload.status as XrayPushProgress['status']) ?? 'started',
        };
        setXrayPushProgress(next);
        setFeedback(next.message);

      } else if (event.data.command === 'xray:previewResult') {
        setIsBusy(false);
        const preview = JSON.parse(payload.preview ?? '{}') as XrayPushPreview;
        setXrayPushPreview(preview);
        setFeedback(`Preview ready: ${preview.willPush} to push, ${preview.duplicates} duplicates, ${preview.validationErrors} validation errors.`);

      } else if (event.data.command === 'xray:historyCleared') {
        setIsBusy(false);
        setXrayPushedIssues([]);
        setFeedback(payload.message ?? 'Push history cleared.');
      }
    };

    window.addEventListener('message', handler);
    window.__TRACELM_VSCODE__?.postMessage({ command: 'ping' });
    window.__TRACELM_VSCODE__?.postMessage({ command: 'settings:load' });

    return () => window.removeEventListener('message', handler);
  }, []);
}
