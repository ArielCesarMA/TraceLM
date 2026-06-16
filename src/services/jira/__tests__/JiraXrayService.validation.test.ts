import { JiraXrayService, XrayManualTestCase } from '../JiraXrayService';

describe('JiraXrayService.validateTestCase', () => {
  const service = new JiraXrayService(
    'https://test.atlassian.net',
    'test@example.com',
    'token123',
    'PROJ',
    'xray-client',
    'xray-secret'
  );

  describe('valid test case', () => {
    it('should pass validation with all required fields', () => {
      const testCase: XrayManualTestCase = {
        id: 'TC-001',
        title: 'Valid test case',
        scenarioId: 'SCN-001',
        requirementRefs: ['REQ-001'],
        preconditions: ['Precondition 1'],
        steps: ['Step 1', 'Step 2'],
        expectedResult: 'Expected outcome',
        priority: 'High'
      };

      const errors = service.validateTestCase(testCase);
      expect(errors).toHaveLength(0);
    });
  });

  describe('missing required fields', () => {
    it('should fail when id is empty', () => {
      const testCase: XrayManualTestCase = {
        id: '',
        title: 'Test',
        scenarioId: 'SCN-001',
        requirementRefs: [],
        preconditions: [],
        steps: ['Step 1'],
        expectedResult: 'Result',
        priority: 'High'
      };

      const errors = service.validateTestCase(testCase);
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'id',
        error: expect.stringContaining('required')
      }));
    });

    it('should fail when title is empty', () => {
      const testCase: XrayManualTestCase = {
        id: 'TC-001',
        title: '',
        scenarioId: 'SCN-001',
        requirementRefs: [],
        preconditions: [],
        steps: ['Step 1'],
        expectedResult: 'Result',
        priority: 'High'
      };

      const errors = service.validateTestCase(testCase);
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'title',
        error: expect.stringContaining('required')
      }));
    });

    it('should fail when scenarioId is empty', () => {
      const testCase: XrayManualTestCase = {
        id: 'TC-001',
        title: 'Test',
        scenarioId: '',
        requirementRefs: [],
        preconditions: [],
        steps: ['Step 1'],
        expectedResult: 'Result',
        priority: 'High'
      };

      const errors = service.validateTestCase(testCase);
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'scenarioId',
        error: expect.stringContaining('required')
      }));
    });

    it('should fail when steps is empty', () => {
      const testCase: XrayManualTestCase = {
        id: 'TC-001',
        title: 'Test',
        scenarioId: 'SCN-001',
        requirementRefs: [],
        preconditions: [],
        steps: [],
        expectedResult: 'Result',
        priority: 'High'
      };

      const errors = service.validateTestCase(testCase);
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'steps',
        error: expect.stringContaining('required')
      }));
    });

    it('should fail when expectedResult is empty', () => {
      const testCase: XrayManualTestCase = {
        id: 'TC-001',
        title: 'Test',
        scenarioId: 'SCN-001',
        requirementRefs: [],
        preconditions: [],
        steps: ['Step 1'],
        expectedResult: '',
        priority: 'High'
      };

      const errors = service.validateTestCase(testCase);
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'expectedResult',
        error: expect.stringContaining('required')
      }));
    });

    it('should fail when priority is empty', () => {
      const testCase: XrayManualTestCase = {
        id: 'TC-001',
        title: 'Test',
        scenarioId: 'SCN-001',
        requirementRefs: [],
        preconditions: [],
        steps: ['Step 1'],
        expectedResult: 'Result',
        priority: ''
      };

      const errors = service.validateTestCase(testCase);
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'priority',
        error: expect.stringContaining('required')
      }));
    });
  });

  describe('whitespace-only fields', () => {
    it('should fail when id is whitespace only', () => {
      const testCase: XrayManualTestCase = {
        id: '   ',
        title: 'Test',
        scenarioId: 'SCN-001',
        requirementRefs: [],
        preconditions: [],
        steps: ['Step 1'],
        expectedResult: 'Result',
        priority: 'High'
      };

      const errors = service.validateTestCase(testCase);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail when steps contain only empty/whitespace strings', () => {
      const testCase: XrayManualTestCase = {
        id: 'TC-001',
        title: 'Test',
        scenarioId: 'SCN-001',
        requirementRefs: [],
        preconditions: [],
        steps: ['   ', ''],
        expectedResult: 'Result',
        priority: 'High'
      };

      const errors = service.validateTestCase(testCase);
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'steps'
      }));
    });
  });

  describe('multiple validation errors', () => {
    it('should report all missing required fields', () => {
      const testCase: XrayManualTestCase = {
        id: '',
        title: '',
        scenarioId: '',
        requirementRefs: [],
        preconditions: [],
        steps: [],
        expectedResult: '',
        priority: ''
      };

      const errors = service.validateTestCase(testCase);
      expect(errors.length).toBeGreaterThan(1);
      const fields = errors.map(e => e.field);
      expect(fields).toContain('id');
      expect(fields).toContain('title');
      expect(fields).toContain('scenarioId');
      expect(fields).toContain('steps');
      expect(fields).toContain('expectedResult');
      expect(fields).toContain('priority');
    });
  });
});
