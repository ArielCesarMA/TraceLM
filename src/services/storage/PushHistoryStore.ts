import * as vscode from 'vscode';

export type XrayPushRecord = {
  fingerprint: string;
  key: string;
  url: string;
  pushedAt: string;
};

/**
 * Manages persistence of Xray push history across VS Code sessions.
 * Uses globalState for durability and extensionContext secrets for sensitive data.
 */
export class PushHistoryStore {
  private static readonly GLOBAL_STATE_KEY = 'tracelm.xrayPushHistory';
  private static readonly MAX_RECORDS = 5000; // Prevent unbounded growth

  constructor(private readonly globalState: vscode.Memento) {}

  /**
   * Get all push records from persistent storage.
   */
  getAll(): Record<string, XrayPushRecord> {
    return this.globalState.get<Record<string, XrayPushRecord>>(
      PushHistoryStore.GLOBAL_STATE_KEY,
      {}
    );
  }

  /**
   * Get a specific push record by fingerprint.
   */
  get(fingerprint: string): XrayPushRecord | undefined {
    const all = this.getAll();
    return all[fingerprint];
  }

  /**
   * Add or update a push record.
   */
  async put(fingerprint: string, record: XrayPushRecord): Promise<void> {
    const all = this.getAll();
    all[fingerprint] = {
      ...record,
      pushedAt: record.pushedAt || new Date().toISOString()
    };

    // Trim old records if exceeding max
    if (Object.keys(all).length > PushHistoryStore.MAX_RECORDS) {
      const sorted = Object.entries(all).sort(
        ([, a], [, b]) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()
      );
      const trimmed = Object.fromEntries(sorted.slice(0, PushHistoryStore.MAX_RECORDS));
      await this.globalState.update(PushHistoryStore.GLOBAL_STATE_KEY, trimmed);
    } else {
      await this.globalState.update(PushHistoryStore.GLOBAL_STATE_KEY, all);
    }
  }

  /**
   * Batch add multiple records efficiently.
   */
  async putBatch(records: Array<[string, XrayPushRecord]>): Promise<void> {
    const all = this.getAll();
    for (const [fingerprint, record] of records) {
      all[fingerprint] = {
        ...record,
        pushedAt: record.pushedAt || new Date().toISOString()
      };
    }

    // Trim if needed
    if (Object.keys(all).length > PushHistoryStore.MAX_RECORDS) {
      const sorted = Object.entries(all).sort(
        ([, a], [, b]) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()
      );
      const trimmed = Object.fromEntries(sorted.slice(0, PushHistoryStore.MAX_RECORDS));
      await this.globalState.update(PushHistoryStore.GLOBAL_STATE_KEY, trimmed);
    } else {
      await this.globalState.update(PushHistoryStore.GLOBAL_STATE_KEY, all);
    }
  }

  /**
   * Clear all push history.
   */
  async clear(): Promise<void> {
    await this.globalState.update(PushHistoryStore.GLOBAL_STATE_KEY, {});
  }

  /**
   * Get statistics about stored push history.
   */
  getStats(): { totalRecords: number; oldestPush?: string; newestPush?: string } {
    const all = this.getAll();
    const records = Object.values(all);
    if (records.length === 0) {
      return { totalRecords: 0 };
    }

    const sorted = records.sort(
      (a, b) => new Date(a.pushedAt).getTime() - new Date(b.pushedAt).getTime()
    );
    return {
      totalRecords: records.length,
      oldestPush: sorted[0].pushedAt,
      newestPush: sorted[sorted.length - 1].pushedAt
    };
  }
}
