import { buildTestCaseFingerprint } from '../../utils/fingerprintUtil';

describe('buildTestCaseFingerprint', () => {
  it('should generate the same fingerprint for identical test cases', () => {
    const testCase = {
      scenarioId: 'SCN-001',
      title: 'Test Case Title',
      steps: ['Step 1', 'Step 2', 'Step 3']
    };

    const fingerprint1 = buildTestCaseFingerprint(testCase);
    const fingerprint2 = buildTestCaseFingerprint(testCase);

    expect(fingerprint1).toBe(fingerprint2);
  });

  it('should generate different fingerprints for different scenarios', () => {
    const testCase1 = {
      scenarioId: 'SCN-001',
      title: 'Test Case Title',
      steps: ['Step 1', 'Step 2']
    };

    const testCase2 = {
      scenarioId: 'SCN-002',
      title: 'Test Case Title',
      steps: ['Step 1', 'Step 2']
    };

    expect(buildTestCaseFingerprint(testCase1)).not.toBe(buildTestCaseFingerprint(testCase2));
  });

  it('should generate different fingerprints for different titles', () => {
    const testCase1 = {
      scenarioId: 'SCN-001',
      title: 'Test Case Title A',
      steps: ['Step 1']
    };

    const testCase2 = {
      scenarioId: 'SCN-001',
      title: 'Test Case Title B',
      steps: ['Step 1']
    };

    expect(buildTestCaseFingerprint(testCase1)).not.toBe(buildTestCaseFingerprint(testCase2));
  });

  it('should generate different fingerprints for different steps', () => {
    const testCase1 = {
      scenarioId: 'SCN-001',
      title: 'Test Case',
      steps: ['Step 1', 'Step 2']
    };

    const testCase2 = {
      scenarioId: 'SCN-001',
      title: 'Test Case',
      steps: ['Step 1', 'Step 3']
    };

    expect(buildTestCaseFingerprint(testCase1)).not.toBe(buildTestCaseFingerprint(testCase2));
  });

  it('should be case-insensitive', () => {
    const testCase1 = {
      scenarioId: 'SCN-001',
      title: 'Test Case',
      steps: ['Step 1', 'Step 2']
    };

    const testCase2 = {
      scenarioId: 'scn-001',
      title: 'TEST CASE',
      steps: ['step 1', 'STEP 2']
    };

    expect(buildTestCaseFingerprint(testCase1)).toBe(buildTestCaseFingerprint(testCase2));
  });

  it('should ignore leading/trailing whitespace', () => {
    const testCase1 = {
      scenarioId: 'SCN-001',
      title: 'Test Case',
      steps: ['Step 1', 'Step 2']
    };

    const testCase2 = {
      scenarioId: '  SCN-001  ',
      title: '  Test Case  ',
      steps: ['  Step 1  ', '  Step 2  ']
    };

    expect(buildTestCaseFingerprint(testCase1)).toBe(buildTestCaseFingerprint(testCase2));
  });
});
