import { JiraXrayService, XrayManualTestCase, XrayPushItemStatus } from '../../services/jira/JiraXrayService';
import { buildTestCaseFingerprint } from '../../utils/fingerprintUtil';

/**
 * Mock JiraXrayService for testing push flows without hitting real Xray APIs.
 */
class MockJiraXrayService extends JiraXrayService {
  private pushFailures: Set<string> = new Set();
  private shouldThrowOnAuth: boolean = false;

  constructor() {
    super('https://test.atlassian.net', 'test@example.com', 'token', 'PROJ', 'client', 'secret');
  }

  /**
   * Configure which test case IDs should fail during push.
   */
  setPushFailures(ids: string[]): void {
    this.pushFailures = new Set(ids);
  }

  /**
   * Simulate authentication failure.
   */
  setShouldThrowOnAuth(shouldThrow: boolean): void {
    this.shouldThrowOnAuth = shouldThrow;
  }

  /**
   * Override to control behavior in tests.
   */
  override async pushManualTestCasesDetailed(
    testCases: XrayManualTestCase[]
  ): Promise<XrayPushItemStatus[]> {
    if (this.shouldThrowOnAuth) {
      throw new Error('Xray authentication failed with status 401.');
    }

    const statuses: XrayPushItemStatus[] = [];

    for (const testCase of testCases) {
      if (this.pushFailures.has(testCase.id)) {
        statuses.push({
          localId: testCase.id,
          success: false,
          message: `Simulated failure for ${testCase.id}`
        });
      } else {
        const mockKey = `TEST-${Math.floor(Math.random() * 10000)}`;
        statuses.push({
          localId: testCase.id,
          success: true,
          key: mockKey,
          url: `https://test.atlassian.net/browse/${mockKey}`
        });
      }
    }

    return statuses;
  }
}

describe('Xray Push Flow Integration Tests', () => {
  describe('all success scenario', () => {
    it('should push all test cases successfully and record fingerprints', async () => {
      const service = new MockJiraXrayService();
      const testCases: XrayManualTestCase[] = [
        {
          id: 'TC-001',
          title: 'Login Flow',
          scenarioId: 'SCN-001',
          requirementRefs: ['REQ-001'],
          preconditions: ['App is open'],
          steps: ['Enter email', 'Enter password', 'Click login'],
          expectedResult: 'User is logged in',
          priority: 'High'
        },
        {
          id: 'TC-002',
          title: 'Logout Flow',
          scenarioId: 'SCN-002',
          requirementRefs: ['REQ-002'],
          preconditions: ['User is logged in'],
          steps: ['Click logout button'],
          expectedResult: 'User is logged out',
          priority: 'Medium'
        }
      ];

      const results = await service.pushManualTestCasesDetailed(testCases);

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.success)).toBe(true);
      expect(results[0].key).toBeTruthy();
      expect(results[1].key).toBeTruthy();
      expect(results[0].url).toContain('browse');
      expect(results[1].url).toContain('browse');
    });
  });

  describe('partial failure scenario', () => {
    it('should handle mixed success and failure in single push', async () => {
      const service = new MockJiraXrayService();
      service.setPushFailures(['TC-002']);

      const testCases: XrayManualTestCase[] = [
        {
          id: 'TC-001',
          title: 'Test 1',
          scenarioId: 'SCN-001',
          requirementRefs: [],
          preconditions: [],
          steps: ['Step 1'],
          expectedResult: 'Pass',
          priority: 'High'
        },
        {
          id: 'TC-002',
          title: 'Test 2',
          scenarioId: 'SCN-002',
          requirementRefs: [],
          preconditions: [],
          steps: ['Step 2'],
          expectedResult: 'Pass',
          priority: 'High'
        },
        {
          id: 'TC-003',
          title: 'Test 3',
          scenarioId: 'SCN-003',
          requirementRefs: [],
          preconditions: [],
          steps: ['Step 3'],
          expectedResult: 'Pass',
          priority: 'High'
        }
      ];

      const results = await service.pushManualTestCasesDetailed(testCases);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].message).toContain('Simulated failure');
      expect(results[2].success).toBe(true);
    });
  });

  describe('duplicate detection via fingerprint', () => {
    it('should detect and skip cases with matching fingerprints', () => {
      const testCase1 = {
        scenarioId: 'SCN-001',
        title: 'Test Case',
        steps: ['Step A', 'Step B']
      };

      const testCase2 = {
        scenarioId: 'SCN-001',
        title: 'Test Case',
        steps: ['Step A', 'Step B']
      };

      const testCase3 = {
        scenarioId: 'SCN-002',
        title: 'Different',
        steps: ['Step C']
      };

      const fp1 = buildTestCaseFingerprint(testCase1);
      const fp2 = buildTestCaseFingerprint(testCase2);
      const fp3 = buildTestCaseFingerprint(testCase3);

      expect(fp1).toBe(fp2);
      expect(fp1).not.toBe(fp3);
    });

    it('should track and persist push records by fingerprint', () => {
      const pushRecords: Record<string, { key: string; url: string; updatedAt: string }> = {};
      const testCase = {
        id: 'TC-001',
        title: 'Login',
        scenarioId: 'SCN-001',
        requirementRefs: [],
        preconditions: [],
        steps: ['Step 1', 'Step 2'],
        expectedResult: 'Success',
        priority: 'High'
      };

      const fingerprint = buildTestCaseFingerprint(testCase);
      pushRecords[fingerprint] = {
        key: 'TEST-123',
        url: 'https://example.com/browse/TEST-123',
        updatedAt: new Date().toISOString()
      };

      // Later, when same test case is pushed again, it should be detected
      const sameTestCaseFingerprint = buildTestCaseFingerprint({
        scenarioId: testCase.scenarioId,
        title: testCase.title,
        steps: testCase.steps
      });

      expect(pushRecords[sameTestCaseFingerprint]).toBeDefined();
      expect(pushRecords[sameTestCaseFingerprint].key).toBe('TEST-123');
    });
  });

  describe('validation error filtering', () => {
    it('should validate and skip invalid test cases before push', async () => {
      const service = new MockJiraXrayService();

      const testCases: XrayManualTestCase[] = [
        {
          id: 'TC-001',
          title: 'Valid Case',
          scenarioId: 'SCN-001',
          requirementRefs: [],
          preconditions: [],
          steps: ['Step 1'],
          expectedResult: 'Pass',
          priority: 'High'
        },
        {
          id: 'TC-002',
          title: '',
          scenarioId: 'SCN-002',
          requirementRefs: [],
          preconditions: [],
          steps: ['Step 2'],
          expectedResult: 'Pass',
          priority: 'High'
        },
        {
          id: 'TC-003',
          title: 'Another Valid',
          scenarioId: 'SCN-003',
          requirementRefs: [],
          preconditions: [],
          steps: [],
          expectedResult: 'Pass',
          priority: 'High'
        }
      ];

      const validationResults = testCases.map((tc) => ({
        id: tc.id,
        valid: service.validateTestCase(tc).length === 0
      }));

      expect(validationResults[0].valid).toBe(true);
      expect(validationResults[1].valid).toBe(false);
      expect(validationResults[2].valid).toBe(false);

      // Only push valid cases
      const validCasesToPush = testCases.filter((tc) => service.validateTestCase(tc).length === 0);
      expect(validCasesToPush).toHaveLength(1);
      expect(validCasesToPush[0].id).toBe('TC-001');
    });
  });

  describe('mixed scenario: validation + duplicates + new cases + failures', () => {
    it('should handle complex mix of validation errors, duplicates, and push results', async () => {
      const service = new MockJiraXrayService();
      service.setPushFailures(['TC-004']);

      // Simulated push records from previous runs
      const pushRecords: Record<string, { key: string; url: string; updatedAt: string }> = {
        [buildTestCaseFingerprint({
          scenarioId: 'SCN-002',
          title: 'Duplicate Case',
          steps: ['Step A', 'Step B']
        })]: {
          key: 'PREV-456',
          url: 'https://example.com/browse/PREV-456',
          updatedAt: new Date().toISOString()
        }
      };

      const testCases: XrayManualTestCase[] = [
        // Valid, new case → should push successfully
        {
          id: 'TC-001',
          title: 'New Test',
          scenarioId: 'SCN-001',
          requirementRefs: [],
          preconditions: [],
          steps: ['Step 1'],
          expectedResult: 'Pass',
          priority: 'High'
        },
        // Duplicate → should skip
        {
          id: 'TC-002',
          title: 'Duplicate Case',
          scenarioId: 'SCN-002',
          requirementRefs: [],
          preconditions: [],
          steps: ['Step A', 'Step B'],
          expectedResult: 'Pass',
          priority: 'High'
        },
        // Validation error (empty title) → should be rejected before push
        {
          id: 'TC-003',
          title: '',
          scenarioId: 'SCN-003',
          requirementRefs: [],
          preconditions: [],
          steps: ['Step 3'],
          expectedResult: 'Pass',
          priority: 'High'
        },
        // Valid but will fail during push
        {
          id: 'TC-004',
          title: 'Will Fail',
          scenarioId: 'SCN-004',
          requirementRefs: [],
          preconditions: [],
          steps: ['Step 4'],
          expectedResult: 'Pass',
          priority: 'High'
        }
      ];

      const results: XrayPushItemStatus[] = [];

      // Step 1: Filter validation errors
      const validationErrors: XrayPushItemStatus[] = [];
      const validCases: XrayManualTestCase[] = [];

      for (const tc of testCases) {
        const errors = service.validateTestCase(tc);
        if (errors.length > 0) {
          validationErrors.push({
            localId: tc.id,
            success: false,
            message: errors.map((e) => e.error).join(' | '),
            isValidationError: true
          });
        } else {
          validCases.push(tc);
        }
      }

      results.push(...validationErrors);
      expect(validationErrors).toHaveLength(1);
      expect(validationErrors[0].localId).toBe('TC-003');

      // Step 2: Check for duplicates
      const fingerprintByLocalId = new Map<string, string>();
      const casesToPush: XrayManualTestCase[] = [];
      const dedupResults: XrayPushItemStatus[] = [];

      for (const tc of validCases) {
        const fp = buildTestCaseFingerprint(tc);
        if (pushRecords[fp]) {
          dedupResults.push({
            localId: tc.id,
            success: true,
            key: pushRecords[fp].key,
            url: pushRecords[fp].url,
            message: 'Skipped duplicate: matching test case fingerprint already pushed.'
          });
        } else {
          fingerprintByLocalId.set(tc.id, fp);
          casesToPush.push(tc);
        }
      }

      results.push(...dedupResults);
      expect(dedupResults).toHaveLength(1);
      expect(dedupResults[0].localId).toBe('TC-002');

      // Step 3: Push remaining valid new cases
      const pushResults = await service.pushManualTestCasesDetailed(casesToPush);
      results.push(...pushResults);

      // Verify final results
      expect(results).toHaveLength(4);

      const byId = new Map(results.map((r) => [r.localId, r]));
      expect(byId.get('TC-001')?.success).toBe(true);
      expect(byId.get('TC-002')?.success).toBe(true);
      expect(byId.get('TC-002')?.message).toContain('duplicate');
      expect(byId.get('TC-003')?.isValidationError).toBe(true);
      expect(byId.get('TC-004')?.success).toBe(false);
      expect(byId.get('TC-004')?.message).toContain('Simulated failure');
    });
  });

  describe('retry-failed-only logic', () => {
    it('should retry only failed cases in a second push attempt', async () => {
      const service = new MockJiraXrayService();
      service.setPushFailures(['TC-002']);

      const testCases: XrayManualTestCase[] = [
        {
          id: 'TC-001',
          title: 'Test 1',
          scenarioId: 'SCN-001',
          requirementRefs: [],
          preconditions: [],
          steps: ['Step 1'],
          expectedResult: 'Pass',
          priority: 'High'
        },
        {
          id: 'TC-002',
          title: 'Test 2',
          scenarioId: 'SCN-002',
          requirementRefs: [],
          preconditions: [],
          steps: ['Step 2'],
          expectedResult: 'Pass',
          priority: 'High'
        }
      ];

      // First push
      const firstResults = await service.pushManualTestCasesDetailed(testCases);
      expect(firstResults).toHaveLength(2);
      expect(firstResults[0].success).toBe(true);
      expect(firstResults[1].success).toBe(false);

      // Extract failed IDs
      const failedIds = firstResults.filter((r) => !r.success).map((r) => r.localId);
      expect(failedIds).toEqual(['TC-002']);

      // Second push with only failed cases
      const failedCases = testCases.filter((tc) => failedIds.includes(tc.id));
      expect(failedCases).toHaveLength(1);
      expect(failedCases[0].id).toBe('TC-002');

      // Now make TC-002 succeed on retry
      service.setPushFailures([]);

      const retryResults = await service.pushManualTestCasesDetailed(failedCases);
      expect(retryResults).toHaveLength(1);
      expect(retryResults[0].success).toBe(true);
      expect(retryResults[0].localId).toBe('TC-002');
    });
  });

  describe('authentication failure handling', () => {
    it('should propagate auth errors before attempting push', async () => {
      const service = new MockJiraXrayService();
      service.setShouldThrowOnAuth(true);

      const testCases: XrayManualTestCase[] = [
        {
          id: 'TC-001',
          title: 'Test',
          scenarioId: 'SCN-001',
          requirementRefs: [],
          preconditions: [],
          steps: ['Step 1'],
          expectedResult: 'Pass',
          priority: 'High'
        }
      ];

      await expect(service.pushManualTestCasesDetailed(testCases)).rejects.toThrow(
        'authentication failed'
      );
    });
  });
});
