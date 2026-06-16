import { BatchProcessor } from '../BatchProcessor';
import { XrayManualTestCase } from '../JiraXrayService';

function createCase(id: string): XrayManualTestCase {
  return {
    id,
    title: `Title ${id}`,
    scenarioId: `SCN-${id}`,
    requirementRefs: ['REQ-1'],
    preconditions: ['Ready'],
    steps: ['Step 1'],
    expectedResult: 'Done',
    priority: 'High'
  };
}

describe('BatchProcessor', () => {
  it('splits and processes cases by configured batch size', async () => {
    const processor = new BatchProcessor({
      batchSize: 2,
      delayBetweenBatchesMs: 0,
      maxRetries: 1
    });

    const calls: number[] = [];
    const statuses = await processor.processBatchesWithDelay(
      [createCase('1'), createCase('2'), createCase('3')],
      async (batch) => {
        calls.push(batch.length);
        return batch.map((item) => ({ localId: item.id, success: true, key: `XRAY-${item.id}` }));
      }
    );

    expect(calls).toEqual([2, 1]);
    expect(statuses).toHaveLength(3);
  });

  it('retries on rate-limit errors and eventually succeeds', async () => {
    const processor = new BatchProcessor({
      batchSize: 1,
      delayBetweenBatchesMs: 0,
      maxRetries: 2
    });

    // Avoid real sleep in unit tests.
    (processor as unknown as { delay: (ms: number) => Promise<void> }).delay =
      async () => Promise.resolve();

    let attempts = 0;
    const statuses = await processor.processBatchesWithDelay([createCase('1')], async (batch) => {
      attempts += 1;
      if (attempts === 1) {
        throw new Error('Xray failed with status 429');
      }
      return batch.map((item) => ({ localId: item.id, success: true, key: `XRAY-${item.id}` }));
    });

    expect(attempts).toBe(2);
    expect(statuses[0].success).toBe(true);
  });

  it('throws immediately for non-rate-limit errors', async () => {
    const processor = new BatchProcessor({
      batchSize: 1,
      delayBetweenBatchesMs: 0,
      maxRetries: 3
    });

    await expect(
      processor.processBatchesWithDelay([createCase('1')], async () => {
        throw new Error('Unauthorized 401');
      })
    ).rejects.toThrow('Unauthorized 401');
  });
});
