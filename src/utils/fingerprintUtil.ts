import { createHash } from 'crypto';

export interface TestCaseFingerprinting {
  scenarioId: string;
  title: string;
  steps: string[];
}

/**
 * Generate a deterministic fingerprint for a test case for deduplication.
 * Uses scenarioId, title, and steps (normalized and lowercased) as the basis.
 */
export function buildTestCaseFingerprint(testCase: TestCaseFingerprinting): string {
  const normalized = {
    scenarioId: testCase.scenarioId.trim().toLowerCase(),
    title: testCase.title.trim().toLowerCase(),
    steps: testCase.steps.map((step) => step.trim().toLowerCase())
  };
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}
