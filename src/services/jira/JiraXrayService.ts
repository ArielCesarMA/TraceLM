export type JiraIssueSummary = {
  key: string;
  summary: string;
  description: string;
};

export type XrayPushResult = {
  key: string;
  id?: string;
  self?: string;
};

export type XrayPushItemStatus = {
  localId: string;
  success: boolean;
  key?: string;
  url?: string;
  message?: string;
  isValidationError?: boolean;
};

export type XrayManualTestCase = {
  id: string;
  title: string;
  scenarioId: string;
  requirementRefs: string[];
  preconditions: string[];
  steps: string[];
  expectedResult: string;
  priority: string;
};

export type TestCaseValidationError = {
  field: string;
  error: string;
};

export class JiraXrayService {
  constructor(
    private readonly jiraUrl: string,
    private readonly jiraEmail: string,
    private readonly jiraApiToken: string,
    private readonly projectKey: string,
    private readonly xrayClientId?: string,
    private readonly xrayClientSecret?: string
  ) {}

  public async getIssue(issueKey: string): Promise<JiraIssueSummary> {
    const issue = await this.request<{
      key: string;
      fields?: { summary?: string; description?: unknown };
    }>(`/rest/api/3/issue/${encodeURIComponent(issueKey)}?fields=summary,description`);

    return {
      key: issue.key,
      summary: issue.fields?.summary ?? '',
      description: this.extractDescription(issue.fields?.description)
    };
  }

  public async getIssues(issueKeys: string[]): Promise<JiraIssueSummary[]> {
    const keys = issueKeys.filter((k) => k.trim().length > 0);
    if (!keys.length) {
      return [];
    }

    const jql = `key in (${keys.map((k) => `\"${k.trim()}\"`).join(',')})`;
    return this.searchByJql(jql);
  }

  public async getEpicChildren(epicKey: string): Promise<JiraIssueSummary[]> {
    const safeEpicKey = epicKey.trim();
    if (!safeEpicKey) {
      return [];
    }

    const jql = `project = \"${this.projectKey}\" AND (\"Epic Link\" = \"${safeEpicKey}\" OR parent = \"${safeEpicKey}\")`;
    return this.searchByJql(jql);
  }

  public async searchStories(query: string): Promise<JiraIssueSummary[]> {
    const q = query.trim();
    const queryPart = q ? ` AND summary ~ \"${q.replace(/\"/g, '\\"')}*\"` : '';
    const jql = `project = \"${this.projectKey}\" AND issuetype in (Story, \"User Story\")${queryPart} ORDER BY updated DESC`;
    return this.searchByJql(jql, 30);
  }

  public async pushManualTestCases(testCases: XrayManualTestCase[]): Promise<XrayPushResult[]> {
    if (!this.projectKey.trim()) {
      throw new Error('Jira project key is required before pushing to Xray.');
    }

    if (!this.xrayClientId?.trim() || !this.xrayClientSecret?.trim()) {
      throw new Error('Xray credentials are incomplete. Set Xray Client ID and Secret in Settings.');
    }

    const token = await this.authenticateXray();

    const payload = testCases.map((testCase) => ({
      testtype: 'Manual',
      fields: {
        project: { key: this.projectKey },
        summary: `[${testCase.id}] ${testCase.title}`,
        description: [
          `Scenario: ${testCase.scenarioId}`,
          `Requirement Refs: ${testCase.requirementRefs.join(', ') || 'N/A'}`,
          `Priority: ${testCase.priority}`,
          `Expected: ${testCase.expectedResult}`
        ].join('\n')
      },
      steps: testCase.steps.map((step, index) => ({
        action: `Step ${index + 1}: ${step}`,
        data: testCase.preconditions.join(' | ') || 'N/A',
        result: testCase.expectedResult || 'Expected result not provided.'
      }))
    }));

    const response = await fetch('https://xray.cloud.getxray.app/api/v2/import/test/bulk', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Xray push failed with status ${response.status}.`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    const data = contentType.includes('application/json')
      ? ((await response.json()) as unknown)
      : ((await response.text()) as unknown);

    return this.normalizeXrayPushResponse(data);
  }

  public async pushManualTestCasesDetailed(
    testCases: XrayManualTestCase[]
  ): Promise<XrayPushItemStatus[]> {
    if (!this.projectKey.trim()) {
      throw new Error('Jira project key is required before pushing to Xray.');
    }

    if (!this.xrayClientId?.trim() || !this.xrayClientSecret?.trim()) {
      throw new Error('Xray credentials are incomplete. Set Xray Client ID and Secret in Settings.');
    }

    const token = await this.authenticateXray();
    const statuses: XrayPushItemStatus[] = [];

    for (const testCase of testCases) {
      try {
        const pushed = await this.pushSingleManualTestCase(token, testCase);
        const first = pushed[0];
        if (first?.key) {
          statuses.push({
            localId: testCase.id,
            success: true,
            key: first.key,
            url: first.self
          });
        } else {
          statuses.push({
            localId: testCase.id,
            success: false,
            message: 'Xray response did not include an issue key.'
          });
        }
      } catch (error) {
        statuses.push({
          localId: testCase.id,
          success: false,
          message: error instanceof Error ? error.message : 'Unknown push error.'
        });
      }
    }

    return statuses;
  }

  public validateTestCase(testCase: XrayManualTestCase): TestCaseValidationError[] {
    const errors: TestCaseValidationError[] = [];

    if (!testCase.id?.trim()) {
      errors.push({ field: 'id', error: 'Test case ID is required.' });
    }

    if (!testCase.title?.trim()) {
      errors.push({ field: 'title', error: 'Test case title is required.' });
    }

    if (!testCase.scenarioId?.trim()) {
      errors.push({ field: 'scenarioId', error: 'Scenario ID is required for traceability.' });
    }

    if (!Array.isArray(testCase.steps) || testCase.steps.length === 0) {
      errors.push({ field: 'steps', error: 'At least one test step is required.' });
    } else if (!testCase.steps.some((step) => step?.trim())) {
      errors.push({ field: 'steps', error: 'Test steps cannot be empty.' });
    }

    if (!testCase.expectedResult?.trim()) {
      errors.push({ field: 'expectedResult', error: 'Expected result is required.' });
    }

    if (!testCase.priority?.trim()) {
      errors.push({ field: 'priority', error: 'Priority is required.' });
    }

    return errors;
  }

  private async searchByJql(jql: string, maxResults = 50): Promise<JiraIssueSummary[]> {
    const response = await this.request<{
      issues?: Array<{ key: string; fields?: { summary?: string; description?: unknown } }>;
    }>('/rest/api/3/search', {
      method: 'POST',
      body: JSON.stringify({
        jql,
        maxResults,
        fields: ['summary', 'description']
      })
    });

    return (response.issues ?? []).map((issue) => ({
      key: issue.key,
      summary: issue.fields?.summary ?? '',
      description: this.extractDescription(issue.fields?.description)
    }));
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.jiraUrl || !this.jiraEmail || !this.jiraApiToken) {
      throw new Error('Jira credentials are incomplete. Set Jira URL, email, and API token in Settings.');
    }

    const base = this.jiraUrl.replace(/\/$/, '');
    const authValue = Buffer.from(`${this.jiraEmail}:${this.jiraApiToken}`).toString('base64');

    const response = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${authValue}`,
        ...(init?.headers ?? {})
      }
    });

    if (!response.ok) {
      throw new Error(`Jira request failed with status ${response.status}.`);
    }

    return (await response.json()) as T;
  }

  private async authenticateXray(): Promise<string> {
    const response = await fetch('https://xray.cloud.getxray.app/api/v2/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        client_id: this.xrayClientId,
        client_secret: this.xrayClientSecret
      })
    });

    if (!response.ok) {
      throw new Error(`Xray authentication failed with status ${response.status}.`);
    }

    const text = await response.text();
    return text.replace(/^"|"$/g, '');
  }

  private async pushSingleManualTestCase(
    token: string,
    testCase: XrayManualTestCase
  ): Promise<XrayPushResult[]> {
    const payload = [
      {
        testtype: 'Manual',
        fields: {
          project: { key: this.projectKey },
          summary: `[${testCase.id}] ${testCase.title}`,
          description: [
            `Scenario: ${testCase.scenarioId}`,
            `Requirement Refs: ${testCase.requirementRefs.join(', ') || 'N/A'}`,
            `Priority: ${testCase.priority}`,
            `Expected: ${testCase.expectedResult}`
          ].join('\n')
        },
        steps: testCase.steps.map((step, index) => ({
          action: `Step ${index + 1}: ${step}`,
          data: testCase.preconditions.join(' | ') || 'N/A',
          result: testCase.expectedResult || 'Expected result not provided.'
        }))
      }
    ];

    const response = await fetch('https://xray.cloud.getxray.app/api/v2/import/test/bulk', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Xray push failed for ${testCase.id} with status ${response.status}.`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    const data = contentType.includes('application/json')
      ? ((await response.json()) as unknown)
      : ((await response.text()) as unknown);

    return this.normalizeXrayPushResponse(data);
  }

  private normalizeXrayPushResponse(data: unknown): XrayPushResult[] {
    if (Array.isArray(data)) {
      const results: XrayPushResult[] = [];
      for (const item of data) {
        if (!item || typeof item !== 'object') {
          continue;
        }
        const value = item as { key?: string; id?: string; self?: string; testKey?: string };
        const key = value.key ?? value.testKey ?? '';
        if (key) {
          results.push({ key, id: value.id, self: value.self });
        }
      }
      return results;
    }

    if (data && typeof data === 'object') {
      const obj = data as { key?: string; id?: string; self?: string; issues?: unknown[] };
      if (obj.key) {
        return [{ key: obj.key, id: obj.id, self: obj.self }];
      }
      if (Array.isArray(obj.issues)) {
        return this.normalizeXrayPushResponse(obj.issues);
      }
    }

    return [];
  }

  private extractDescription(value: unknown): string {
    const chunks: string[] = [];

    const walk = (node: unknown): void => {
      if (!node || typeof node !== 'object') {
        return;
      }

      if (Array.isArray(node)) {
        for (const child of node) {
          walk(child);
        }
        return;
      }

      const record = node as { text?: string; content?: unknown };
      if (record.text) {
        chunks.push(record.text);
      }
      if (record.content) {
        walk(record.content);
      }
    };

    walk(value);
    return chunks.join(' ').replace(/\s+/g, ' ').trim();
  }
}
