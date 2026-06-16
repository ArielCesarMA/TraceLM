import { XrayManualTestCase, XrayPushItemStatus } from '../jira/JiraXrayService';

export type BatchProcessConfig = {
  batchSize: number; // How many test cases per batch
  delayBetweenBatchesMs: number; // Delay between batch submissions to avoid rate limiting
  maxRetries: number; // Max retry attempts per batch on rate limit
};

export type BatchProgressEvent = {
  batchIndex: number;
  totalBatches: number;
  batchSize: number;
  attempt: number;
  status: 'started' | 'retrying' | 'completed';
  message: string;
};

export const DEFAULT_BATCH_CONFIG: BatchProcessConfig = {
  batchSize: 10, // Process 10 test cases at a time
  delayBetweenBatchesMs: 1000, // 1 second delay between batches
  maxRetries: 3 // Retry up to 3 times on rate limit
};

/**
 * Batch processor for handling large test case pushes with rate-limiting.
 * Breaks large batches into smaller chunks and adds delays to avoid Xray API limits.
 */
export class BatchProcessor {
  constructor(private config: BatchProcessConfig = DEFAULT_BATCH_CONFIG) {}

  /**
   * Split test cases into batches and yield each batch.
   */
  *getBatches(testCases: XrayManualTestCase[]): Generator<XrayManualTestCase[]> {
    for (let i = 0; i < testCases.length; i += this.config.batchSize) {
      yield testCases.slice(i, i + this.config.batchSize);
    }
  }

  /**
   * Process test cases in batches with delay between submissions.
   * Calls handler for each batch and collects results.
   */
  async processBatchesWithDelay(
    testCases: XrayManualTestCase[],
    handler: (batch: XrayManualTestCase[]) => Promise<XrayPushItemStatus[]>,
    onProgress?: (event: BatchProgressEvent) => void
  ): Promise<XrayPushItemStatus[]> {
    const results: XrayPushItemStatus[] = [];
    const batches = Array.from(this.getBatches(testCases));

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      let lastError: Error | null = null;

      onProgress?.({
        batchIndex: i + 1,
        totalBatches: batches.length,
        batchSize: batch.length,
        attempt: 1,
        status: 'started',
        message: `Starting batch ${i + 1}/${batches.length} (${batch.length} cases).`
      });

      // Retry logic for rate limiting
      for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
        try {
          const batchResults = await handler(batch);
          results.push(...batchResults);
          onProgress?.({
            batchIndex: i + 1,
            totalBatches: batches.length,
            batchSize: batch.length,
            attempt: attempt + 1,
            status: 'completed',
            message: `Completed batch ${i + 1}/${batches.length}.`
          });
          break;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          // Check if it's a rate limit error (429 or similar)
          if (this.isRateLimitError(error)) {
            if (attempt < this.config.maxRetries - 1) {
              // Exponential backoff: 2s, 4s, 8s
              const backoffMs = Math.pow(2, attempt + 1) * 1000;
              onProgress?.({
                batchIndex: i + 1,
                totalBatches: batches.length,
                batchSize: batch.length,
                attempt: attempt + 1,
                status: 'retrying',
                message: `Rate limit hit on batch ${i + 1}/${batches.length}. Retrying in ${
                  backoffMs / 1000
                }s...`
              });
              await this.delay(backoffMs);
              continue;
            }
          }

          // If not rate limit or final attempt, fail immediately
          throw lastError;
        }
      }

      // Add delay before next batch (except after last batch)
      if (i < batches.length - 1) {
        await this.delay(this.config.delayBetweenBatchesMs);
      }
    }

    return results;
  }

  /**
   * Get configuration info for diagnostics.
   */
  getConfig(): BatchProcessConfig {
    return { ...this.config };
  }

  /**
   * Update batch size dynamically (e.g., reduce if hitting rate limits often).
   */
  updateBatchSize(newSize: number): void {
    if (newSize > 0) {
      this.config.batchSize = newSize;
    }
  }

  updateConfig(nextConfig: Partial<BatchProcessConfig>): void {
    this.config = {
      ...this.config,
      ...nextConfig,
      batchSize: Math.max(1, nextConfig.batchSize ?? this.config.batchSize),
      delayBetweenBatchesMs: Math.max(
        0,
        nextConfig.delayBetweenBatchesMs ?? this.config.delayBetweenBatchesMs
      ),
      maxRetries: Math.max(1, nextConfig.maxRetries ?? this.config.maxRetries)
    };
  }

  private isRateLimitError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }
    const msg = error.message.toLowerCase();
    return (
      msg.includes('429') ||
      msg.includes('503') ||
      msg.includes('rate limit') ||
      msg.includes('too many requests') ||
      msg.includes('service unavailable')
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
