import { UUID } from '@libs/types';
import { TransactionEntity } from '../entities';
import { ITransactionPayload, TransactionStatus, TransactionType } from '../types';
import { TransactionRepository } from '../repositories';
import { TransactionError } from '@domain/errors';
import { AccountService } from './account.service';
import { CURRENCIES, PAYMENT_FEE_PERCENT } from '@domain/constants';
import { ConsistentOperationService } from './consistent-operation.service';
import { generateUuid } from '@libs/helpers';

const PROCESS_CACHE_KEY = 'process-trx';
const CREATE_CACHE_KEY = 'create-trx';
const CANCEL_CACHE_KEY = 'cancel-trx';
const SEND_CACHE_KEY = 'send-trx';
const FAIL_CACHE_KEY = 'fail-trx';
const CONSOLIDATE_CACHE_KEY = 'consolidate-fee-trx';

export abstract class TransactionService extends ConsistentOperationService {
  protected abstract transactionRepository: TransactionRepository;
  protected abstract accountService: AccountService;

  protected abstract performOperation(key: string): void;

  protected calculateTransactionFee(transactionEntity: TransactionEntity): number {
    const paymentFee = Math.round((transactionEntity.amount / 100) * PAYMENT_FEE_PERCENT);

    return paymentFee;
  }

  protected async getTransactionById(id: UUID): Promise<TransactionEntity> {
    const entity = await this.transactionRepository.getById(id);

    if (!entity) {
      throw new TransactionError(`Transaction not exist`, { id });
    }

    return entity;
  }

  protected async transactionErrorHandler(
    error: Error,
    errorPayload: any,
    errorMessage: string,
    retryHandler: () => Promise<TransactionEntity>,
    transactionId?: UUID,
  ): Promise<TransactionEntity> {
    if (transactionId) {
      await this.rollbackConsistentOperation(transactionId);
    }

    const canRetry = await this.canConsistentOperationRetry(error);

    if (canRetry) {
      await this.delayConsistentOperation();
      return retryHandler();
    }

    if (error instanceof TransactionError) {
      throw error;
    }

    throw new TransactionError(`${errorMessage}: ${error.message}`, errorPayload, error);
  }

  public async processTransaction(id: UUID): Promise<TransactionEntity> {
    let transactionId;
    let entity = await this.getTransactionById(id);

    try {
      await this.checkConsistentOperationRetryCount(`${PROCESS_CACHE_KEY}:${id}`);
    } catch (err: unknown) {
      await this.failTransaction(id);

      throw new TransactionError(`Process transaction failed: ${(err as Error).message}`, entity.toJSON());
    }

    try {
      transactionId = await this.startConsistentOperation();

      if (entity.type !== TransactionType.Payment) {
        throw new TransactionError(
          `Process transaction failed: only payment transaction can be processed by processor`,
          entity.toJSON(),
        );
      }

      if (entity.status !== TransactionStatus.Pending) {
        throw new TransactionError(`Process transaction failed: transaction has wrong state`, entity.toJSON());
      }

      const debitAccountAggregate = await this.accountService.getAccountById(entity.debitAccount, transactionId);
      const feeAmount = this.calculateTransactionFee(entity);
      const currentBalance = debitAccountAggregate.toPlainJson(entity.currency).currentBalance;

      if (currentBalance < feeAmount) {
        throw new TransactionError(`Process transaction failed: insufficient balance`, entity.toJSON());
      }

      entity.status = TransactionStatus.Done;
      entity = await this.transactionRepository.save(entity, transactionId);

      const transitAccount = await this.accountService.getTransitAccount(transactionId);
      const feeTransactionEntity = await this.transactionRepository.save(
        new TransactionEntity({
          type: TransactionType.Fee,
          status: TransactionStatus.Done,
          debitAccount: entity.debitAccount,
          creditAccount: transitAccount.accountEntity.id,
          amount: feeAmount,
          currency: entity.currency,
        }),
        transactionId,
      );

      if (!feeTransactionEntity) {
        throw new TransactionError(`Process transaction failed: error create fee transaction`, entity.toJSON());
      }

      await Promise.all([
        this.accountService.releaseAmount(entity.debitAccount, entity.currency, Number(entity.amount), transactionId),
        this.accountService.creditAmount(
          entity.debitAccount,
          entity.currency,
          Number(entity.amount) + feeAmount,
          transactionId,
        ),
        this.accountService.debitAmount(entity.creditAccount, entity.currency, Number(entity.amount), transactionId),
        this.accountService.debitAmount(
          transitAccount.accountEntity.id,
          entity.currency,
          Number(feeAmount),
          transactionId,
        ),
      ]);

      await this.commitConsistentOperation(transactionId);

      this.performOperation('process_transaction_success');

      return entity;
    } catch (err: unknown) {
      this.performOperation('process_transaction_failed');
      return this.transactionErrorHandler(
        err as Error,
        entity.toJSON(),
        'Process transaction failed',
        () => this.processTransaction(id),
        transactionId,
      );
    }
  }

  public async consolidateFee(uuid?: UUID): Promise<TransactionEntity> {
    let transactionId;
    let consolidateTransactionEntity;
    uuid = uuid ?? generateUuid();

    try {
      await this.checkConsistentOperationRetryCount(`${CONSOLIDATE_CACHE_KEY}:${uuid}`);
    } catch (err: unknown) {
      throw new TransactionError(`Consolidate fee transaction failed: ${(err as Error).message}`, {});
    }

    try {
      transactionId = await this.startConsistentOperation();

      const [transitAccount, balanceAccount] = await Promise.all([
        this.accountService.getTransitAccount(transactionId),
        this.accountService.getBalanceAccount(transactionId),
      ]);

      if (!transitAccount) {
        throw new TransactionError(`Consolidate fee transaction failed: transit account not found`, { transactionId });
      }
      if (!balanceAccount) {
        throw new TransactionError(`Consolidate fee transaction failed: balance account not found`, { transactionId });
      }

      await Promise.all(
        CURRENCIES.map(async (currency) => {
          const transitAccountPlain = transitAccount.toPlainJson(currency);

          if (Number(transitAccountPlain.currentBalance) === 0) {
            return;
          }

          consolidateTransactionEntity = new TransactionEntity({
            type: TransactionType.Payment,
            status: TransactionStatus.Done,
            debitAccount: transitAccountPlain.id,
            creditAccount: balanceAccount.accountEntity.id,
            amount: Number(transitAccountPlain.currentBalance),
            currency,
          });

          return Promise.all([
            this.transactionRepository.save(consolidateTransactionEntity, transactionId),
            this.accountService.creditAmount(
              transitAccountPlain.id,
              currency,
              Number(transitAccountPlain.currentBalance),
              transactionId,
            ),
            this.accountService.debitAmount(
              balanceAccount.accountEntity.id,
              currency,
              Number(transitAccountPlain.currentBalance),
              transactionId,
            ),
          ]);
        }),
      );

      await this.commitConsistentOperation(transactionId);

      this.performOperation('consolidate_fee_success');

      return consolidateTransactionEntity;
    } catch (err: unknown) {
      this.performOperation('consolidate_fee_failed');
      this.transactionErrorHandler(
        err as Error,
        {},
        'Consolidate fee transaction failed',
        () => this.consolidateFee(uuid),
        transactionId,
      );
    }
  }

  public async createTransaction(params: ITransactionPayload): Promise<TransactionEntity> {
    let transactionId;
    let entity = new TransactionEntity({
      type: TransactionType.Payment,
      status: TransactionStatus.Initiated,
      ...params,
    });

    try {
      await this.checkConsistentOperationRetryCount(`${CREATE_CACHE_KEY}:${entity.id}`);
    } catch (err: unknown) {
      throw new TransactionError(`Create transaction failed: ${(err as Error).message}`, entity.toJSON());
    }

    try {
      transactionId = await this.startConsistentOperation();

      const debitAccountAggregate = await this.accountService.getAccountById(entity.debitAccount, transactionId);

      const feeAmount = this.calculateTransactionFee(entity);
      const transactionAmount = entity.amount;
      const currentBalance = debitAccountAggregate.toPlainJson(entity.currency).currentBalance;

      if (currentBalance < transactionAmount + feeAmount) {
        throw new TransactionError(`Create transaction failed: insufficient balance`, entity.toJSON());
      }

      entity = await this.transactionRepository.save(entity, transactionId);
      await this.accountService.holdAmount(entity.debitAccount, entity.currency, entity.amount);

      await this.commitConsistentOperation(transactionId);
      this.performOperation('create_transaction_success');

      return entity;
    } catch (err: unknown) {
      this.performOperation('create_transaction_failed');
      return this.transactionErrorHandler(
        err as Error,
        params,
        'Create transaction failed',
        () => this.createTransaction(params),
        transactionId,
      );
    }
  }

  public async cancelTransaction(id: UUID): Promise<TransactionEntity> {
    let transactionId;
    let entity = await this.getTransactionById(id);

    try {
      await this.checkConsistentOperationRetryCount(`${CANCEL_CACHE_KEY}:${entity.id}`);
    } catch (err: unknown) {
      throw new TransactionError(`Cancel transaction failed: ${(err as Error).message}`, entity.toJSON());
    }

    try {
      transactionId = await this.startConsistentOperation();

      if (entity.status !== TransactionStatus.Initiated) {
        throw new TransactionError(`Cancel transaction failed: transaction has wrong state`, entity.toJSON());
      }

      entity.status = TransactionStatus.Cancelled;
      entity = await this.transactionRepository.save(entity, transactionId);
      await this.accountService.releaseAmount(entity.debitAccount, entity.currency, entity.amount, transactionId);

      entity = await this.transactionRepository.save(entity, transactionId);

      await this.commitConsistentOperation(transactionId);
      this.performOperation('cancel_transaction_success');

      return entity;
    } catch (err: unknown) {
      this.performOperation('cancel_transaction_failed');
      return this.transactionErrorHandler(
        err as Error,
        entity.toJSON(),
        'Cancel transaction failed',
        () => this.cancelTransaction(id),
        transactionId,
      );
    }
  }

  public async sendTransaction(id: UUID): Promise<TransactionEntity> {
    let entity = await this.getTransactionById(id);

    try {
      await this.checkConsistentOperationRetryCount(`${SEND_CACHE_KEY}:${entity.id}`);
    } catch (err: unknown) {
      throw new TransactionError(`Send transaction failed: ${(err as Error).message}`, entity.toJSON());
    }

    try {
      if (entity.status !== TransactionStatus.Initiated) {
        throw new TransactionError(`Send transaction failed: transaction has wrong state`, entity.toJSON());
      }

      entity.status = TransactionStatus.Pending;
      entity = await this.transactionRepository.save(entity);
      this.performOperation('send_transaction_success');

      return entity;
    } catch (err: unknown) {
      this.performOperation('send_transaction_failed');
      return this.transactionErrorHandler(err as Error, entity.toJSON(), 'Send transaction failed', () =>
        this.sendTransaction(id),
      );
    }
  }

  public async failTransaction(id: UUID): Promise<TransactionEntity> {
    let entity = await this.getTransactionById(id);

    try {
      await this.checkConsistentOperationRetryCount(`${FAIL_CACHE_KEY}:${entity.id}`);
    } catch (err: unknown) {
      throw new TransactionError(`Send transaction failed: ${(err as Error).message}`, entity.toJSON());
    }

    try {
      entity.status = TransactionStatus.Failed;

      entity = await this.transactionRepository.save(entity);

      this.performOperation('fail_transaction_success');
      return entity;
    } catch (err: unknown) {
      this.performOperation('fail_transaction_failed');
      return this.transactionErrorHandler(err as Error, entity.toJSON(), 'Fail transaction failed', () =>
        this.failTransaction(id),
      );
    }
  }
}
