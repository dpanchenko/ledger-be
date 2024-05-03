import { Cache } from 'cache-manager';
import { Counter } from 'prom-client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { POSTGRESQL_PROVIDER_TOKEN, PostgresqlProvider, DatabaseError } from '@libs/providers';
import { AccountService, TransactionService } from '@domain/services';
import { TransactionRepository } from '@domain/repositories';
import { UUID } from '@libs/types';

@Injectable()
export class TransactionPostgresService extends TransactionService {
  private readonly logger: Logger = new Logger(TransactionPostgresService.name);
  private opsCounters: Record<string, Counter<string>>;

  constructor(
    protected readonly transactionRepository: TransactionRepository,
    protected readonly accountService: AccountService,
    @Inject(POSTGRESQL_PROVIDER_TOKEN)
    private readonly postgresqlProvider: PostgresqlProvider,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super();
    this.opsCounters = {
      process_transaction_success: new Counter({
        name: 'process_transaction_success',
        help: 'Total number of successfully processed transactions',
      }),
      process_transaction_failed: new Counter({
        name: 'process_transaction_failed',
        help: 'Total number of failed processed transactions',
      }),
      consolidate_fee_success: new Counter({
        name: 'consolidate_fee_success',
        help: 'Total number of successfully consolidated transactions',
      }),
      consolidate_fee_failed: new Counter({
        name: 'consolidate_fee_failed',
        help: 'Total number of failed consolidated transactions',
      }),
      create_transaction_success: new Counter({
        name: 'create_transaction_success',
        help: 'Total number of successfully create transactions',
      }),
      create_transaction_failed: new Counter({
        name: 'create_transaction_failed',
        help: 'Total number of failed create transactions',
      }),

      cancel_transaction_success: new Counter({
        name: 'cancel_transaction_success',
        help: 'Total number of successfully cancel transactions',
      }),
      cancel_transaction_failed: new Counter({
        name: 'cancel_transaction_failed',
        help: 'Total number of failed cancel transactions',
      }),
      send_transaction_success: new Counter({
        name: 'send_transaction_success',
        help: 'Total number of successfully send transactions',
      }),
      send_transaction_failed: new Counter({
        name: 'send_transaction_failed',
        help: 'Total number of failed send transactions',
      }),
      fail_transaction_success: new Counter({
        name: 'fail_transaction_success',
        help: 'Total number of fail send transactions',
      }),
      fail_transaction_failed: new Counter({
        name: 'fail_transaction_failed',
        help: 'Total number of failed send transactions',
      }),
    };
  }

  performOperation(key: string): void {
    if (this.opsCounters[key]) {
      this.opsCounters[key].inc();
    }
  }

  async startConsistentOperation(): Promise<UUID> {
    const transactionId = await this.postgresqlProvider.allocateConnection();
    await this.postgresqlProvider.executeQuery(
      'BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;',
      undefined,
      transactionId,
    );

    return transactionId;
  }

  async commitConsistentOperation(transactionId: UUID): Promise<void> {
    await this.postgresqlProvider.executeQuery('COMMIT;', undefined, transactionId);
    await this.postgresqlProvider.releaseConnection(transactionId);
  }

  async rollbackConsistentOperation(transactionId: UUID): Promise<void> {
    await this.postgresqlProvider.executeQuery('ROLLBACK;', undefined, transactionId);
    await this.postgresqlProvider.releaseConnection(transactionId);
  }

  async canConsistentOperationRetry(error: Error): Promise<boolean> {
    const canRetry = error instanceof DatabaseError && error.code === '40001';

    return canRetry;
  }

  async getConsistentOperationRetryCounter(counterKey: string): Promise<number> {
    const retryCounter = await this.cacheManager.get<number>(`transaction-retry-count-${counterKey}`);
    return retryCounter ?? 1;
  }

  async setConsistentOperationRetryCounter(counterKey: string, retryCounter: number): Promise<void> {
    await this.cacheManager.set(`transaction-retry-count-${counterKey}`, retryCounter);
  }
}
