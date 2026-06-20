import { memo, useMemo } from 'react';
import { type JiraIssueSummary, type JiraMode, type ParsedFile, type UploadDraft } from '../types';
import { StepStepper } from '../components/StepStepper';

type Props = {
  requirementText: string;
  requirementsReviewed: boolean;
  generationProgress: string;
  parsedFiles: ParsedFile[];
  uploadDrafts: UploadDraft[];
  jiraMode: JiraMode;
  singleIssueKey: string;
  multipleIssueKeys: string;
  epicKey: string;
  storyQuery: string;
  storyOptions: JiraIssueSummary[];
  selectedStoryKeys: string[];
  pulledIssues: JiraIssueSummary[];
  isBusy: boolean;
  feedback: string;
  onRequirementTextChange: (text: string) => void;
  onReviewedChange: (reviewed: boolean) => void;
  onGenerateAll: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onParseFiles: () => void;
  onJiraModeChange: (mode: JiraMode) => void;
  onSingleKeyChange: (key: string) => void;
  onMultipleKeysChange: (keys: string) => void;
  onEpicKeyChange: (key: string) => void;
  onStoryQueryChange: (query: string) => void;
  onSearchStories: () => void;
  onToggleStoryKey: (key: string) => void;
  onPullJira: () => void;
};

export const RequirementsTab = memo(function RequirementsTab({
  requirementText, requirementsReviewed, generationProgress,
  parsedFiles, uploadDrafts, jiraMode, singleIssueKey, multipleIssueKeys,
  epicKey, storyQuery, storyOptions, selectedStoryKeys,
  pulledIssues, isBusy, feedback,
  onRequirementTextChange, onReviewedChange, onGenerateAll,
  onFileChange, onParseFiles, onJiraModeChange,
  onSingleKeyChange, onMultipleKeysChange, onEpicKeyChange,
  onStoryQueryChange, onSearchStories, onToggleStoryKey, onPullJira,
}: Props): JSX.Element {
  const selectedStoryKeySet = useMemo(() => new Set(selectedStoryKeys), [selectedStoryKeys]);

  const activeStep = useMemo(() => {
    if (generationProgress === 'done') return 5;
    const match = generationProgress.match(/\((\d)\/4\)/);
    return match ? parseInt(match[1], 10) : 0;
  }, [generationProgress]);

  return (
    <section className="panel">
      <h2>Requirements</h2>
      <div className="requirements-header">
        <label htmlFor="requirementsText">Free Text Input</label>
        <div className="requirements-header-actions">
          <button type="button" onClick={onGenerateAll} disabled={isBusy}>Generate All Artifacts</button>
        </div>
      </div>
      <div className="field-stack">
        <textarea
          id="requirementsText"
          className="requirements-text"
          value={requirementText}
          onChange={(e) => onRequirementTextChange(e.target.value)}
          placeholder="Paste requirement text, user stories, BRD/SRS content, or pulled Jira details..."
        />
      </div>
      <div className="review-box">
        <label className="story-item">
          <input
            type="checkbox"
            checked={requirementsReviewed}
            onChange={(e) => onReviewedChange(e.target.checked)}
          />
          <span>I reviewed the requirements and they are ready for generation.</span>
        </label>
      </div>

      <StepStepper activeStep={activeStep} />

      <hr />
      <h3>File Upload Parsing</h3>
      <div className="button-row">
        <input type="file" multiple accept=".txt,.md,.docx,.pdf" onChange={onFileChange} disabled={isBusy} />
        <button type="button" onClick={onParseFiles} disabled={isBusy || !uploadDrafts.length}>Parse Selected Files</button>
      </div>
      {!!uploadDrafts.length && !parsedFiles.length && (
        <div className="upload-drafts">
          <span className="upload-drafts-label">Staged ({uploadDrafts.length}):</span>
          {uploadDrafts.map((f) => (
            <span key={f.name} className="upload-draft-chip">{f.name}</span>
          ))}
        </div>
      )}
      {!!parsedFiles.length && (
        <ul className="list">
          {parsedFiles.map((file) => (
            <li key={file.name}>{file.name}: {file.error ? `Error - ${file.error}` : 'Parsed'}</li>
          ))}
        </ul>
      )}

      <hr />
      <h3>Pull from Jira</h3>
      <div className="field-row">
        <label htmlFor="jiraMode">Mode</label>
        <select id="jiraMode" value={jiraMode} onChange={(e) => onJiraModeChange(e.target.value as JiraMode)}>
          <option value="single">Single Issue</option>
          <option value="multiple">Multiple Issues (comma-separated)</option>
          <option value="epic">Epic Children</option>
          <option value="multiStory">Multi-Story Picker</option>
        </select>
      </div>
      {jiraMode === 'single' && (
        <div className="field-row">
          <label htmlFor="singleIssueKey">Issue Key</label>
          <input id="singleIssueKey" type="text" placeholder="PROJ-123" value={singleIssueKey} onChange={(e) => onSingleKeyChange(e.target.value)} />
        </div>
      )}
      {jiraMode === 'multiple' && (
        <div className="field-stack">
          <label htmlFor="multipleIssueKeys">Issue Keys</label>
          <textarea id="multipleIssueKeys" className="small-text" placeholder="PROJ-101, PROJ-102, PROJ-103" value={multipleIssueKeys} onChange={(e) => onMultipleKeysChange(e.target.value)} />
        </div>
      )}
      {jiraMode === 'epic' && (
        <div className="field-row">
          <label htmlFor="epicKey">Epic Key</label>
          <input id="epicKey" type="text" placeholder="PROJ-EPIC-1" value={epicKey} onChange={(e) => onEpicKeyChange(e.target.value)} />
        </div>
      )}
      {jiraMode === 'multiStory' && (
        <>
          <div className="button-row">
            <input type="text" placeholder="Search stories by summary" value={storyQuery} onChange={(e) => onStoryQueryChange(e.target.value)} disabled={isBusy} />
            <button type="button" onClick={onSearchStories} disabled={isBusy}>Search Stories</button>
          </div>
          <div className="story-list">
            {storyOptions.map((story) => (
              <label key={story.key} className="story-item">
                <input type="checkbox" checked={selectedStoryKeySet.has(story.key)} onChange={() => onToggleStoryKey(story.key)} />
                <span>{story.key}: {story.summary}</span>
              </label>
            ))}
          </div>
        </>
      )}
      <div className="button-row">
        <button type="button" onClick={onPullJira} disabled={isBusy}>Pull Jira Requirements</button>
      </div>
      {!!pulledIssues.length && (
        <ul className="list">
          {pulledIssues.map((issue) => <li key={issue.key}>{issue.key}: {issue.summary}</li>)}
        </ul>
      )}
      <p className="feedback">{feedback}</p>
    </section>
  );
});
