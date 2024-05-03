import { UUID } from '@libs/types';

export const CONSISTENT_OPERATION_MAX_RETRY_COUNT = 5;
export const CONSISTENT_OPERATION_RETRY_DELAY = 100;

export abstract class ConsistentOperationService {
  protected abstract startConsistentOperation(): Promise<UUID>;
  protected abstract commitConsistentOperation(transactionId: UUID): Promise<void>;
  protected abstract rollbackConsistentOperation(transactionId: UUID): Promise<void>;
  protected abstract canConsistentOperationRetry(error: Error): Promise<boolean>;
  protected abstract getConsistentOperationRetryCounter(counterKey: string): Promise<number>;
  protected abstract setConsistentOperationRetryCounter(counterKey: string, retryCount: number): Promise<void>;

  protected async delayConsistentOperation(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, CONSISTENT_OPERATION_RETRY_DELAY));
  }

  protected async checkConsistentOperationRetryCount(cacheKey: string): Promise<void> {
    const currentRetryCount = await this.getConsistentOperationRetryCounter(cacheKey);
    if (currentRetryCount >= CONSISTENT_OPERATION_MAX_RETRY_COUNT) {
      throw new Error('Retry amount exceeded, unexpected DB error');
    } else {
      await this.setConsistentOperationRetryCounter(cacheKey, currentRetryCount + 1);
    }
  }
}
