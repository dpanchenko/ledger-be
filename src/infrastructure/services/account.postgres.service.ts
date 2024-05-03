import { Cache } from 'cache-manager';
import { Counter } from 'prom-client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { AccountService } from '@domain/services';
import { POSTGRESQL_PROVIDER_TOKEN, PostgresqlProvider, DatabaseError } from '@libs/providers';
import { UUID } from '@libs/types';
import { AccountRepository, SubAccountRepository, TransactionRepository } from '@domain/repositories';

@Injectable()
export class AccountPostgresService extends AccountService {
  private opsCounters: Record<string, Counter<string>>;

  constructor(
    protected readonly accountRepository: AccountRepository,
    protected readonly subAccountRepository: SubAccountRepository,
    protected readonly transactionRepository: TransactionRepository,
    @Inject(POSTGRESQL_PROVIDER_TOKEN)
    protected readonly postgresqlProvider: PostgresqlProvider,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super();
    this.opsCounters = {
      create_account_success: new Counter({
        name: 'account_created',
        help: 'Total number of created accounts',
      }),
      create_account_failed: new Counter({
        name: 'account_failed',
        help: 'Total number of failed accounts',
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
    const retryCounter = await this.cacheManager.get<number>(`account-retry-count-${counterKey}`);
    return retryCounter ?? 1;
  }

  async setConsistentOperationRetryCounter(counterKey: string, retryCounter: number): Promise<void> {
    await this.cacheManager.set(`account-retry-count-${counterKey}`, retryCounter);
  }
}
