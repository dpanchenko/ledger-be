import { AccountAggregate } from '@domain/aggregates';
import { CURRENCIES } from '@domain/constants';
import { AccountError } from '@domain/errors';
import { TransactionEntity } from '../entities';
import { AccountRepository, SubAccountRepository, TransactionRepository } from '../repositories';
import { AccountType, Currency, IAmountPayload, TransactionStatus, TransactionType } from '../types';
import { ConsistentOperationService } from './consistent-operation.service';
import { UUID } from '@libs/types';
import { generateUuid } from '@libs/helpers';

export abstract class AccountService extends ConsistentOperationService {
  protected abstract accountRepository: AccountRepository;
  protected abstract subAccountRepository: SubAccountRepository;
  protected abstract transactionRepository: TransactionRepository;

  protected abstract performOperation(key: string): void;

  protected async getAccountByType(type: AccountType, transactionId?: UUID): Promise<AccountAggregate> {
    const accounts = await this.accountRepository.getByType(type, transactionId);

    if (!accounts.length) {
      throw new AccountError(`Get account by type failed`, { type });
    }

    const subAccountEntities = await this.subAccountRepository.getByAccountId(accounts[0].id, transactionId);

    const accountAggregate = new AccountAggregate({
      account: accounts[0].toJSON(),
      subAccounts: subAccountEntities.map((entity) => entity.toJSON()),
    });

    return accountAggregate;
  }

  protected async accountErrorHandler(
    error: Error,
    errorPayload: any,
    errorMessage: string,
    retryHandler: () => Promise<AccountAggregate>,
    transactionId?: UUID,
  ): Promise<AccountAggregate> {
    await this.rollbackConsistentOperation(transactionId);

    const canRetry = await this.canConsistentOperationRetry(error);

    if (canRetry) {
      await this.delayConsistentOperation();
      return retryHandler();
    }

    if (error instanceof AccountError) {
      throw error;
    }

    throw new AccountError(`${errorMessage}: ${error.message}`, errorPayload, error);
  }

  async createAccount(type: AccountType, amountPayload?: IAmountPayload, uuid?: UUID): Promise<AccountAggregate> {
    let transactionId;
    uuid = uuid ?? generateUuid();

    try {
      await this.checkConsistentOperationRetryCount(`create-acc:${uuid}`);
    } catch (err: unknown) {
      throw new AccountError(`Failed create account: ${(err as Error).message}`, { type });
    }

    try {
      transactionId = await this.startConsistentOperation();
      const accountEntity = await this.accountRepository.create(type, CURRENCIES, transactionId);

      if (!accountEntity) {
        throw new AccountError(`Failed create account`, { type });
      }

      if (amountPayload) {
        const balanceAccount = await this.getBalanceAccount(transactionId);

        await this.transactionRepository.save(
          new TransactionEntity({
            type: TransactionType.Payment,
            status: TransactionStatus.Done,
            debitAccount: balanceAccount.accountEntity.id,
            creditAccount: accountEntity.id,
            amount: amountPayload.amount,
            currency: amountPayload.currency,
          }),
          transactionId,
        );

        await Promise.all([
          this.creditAmount(
            balanceAccount.accountEntity.id,
            amountPayload.currency,
            amountPayload.amount,
            transactionId,
          ),
          this.debitAmount(accountEntity.id, amountPayload.currency, amountPayload.amount, transactionId),
        ]);
      }

      const accountAggregate = new AccountAggregate({
        account: accountEntity.toJSON(),
        subAccounts: (await this.subAccountRepository.getByAccountId(accountEntity.id, transactionId)).map((entity) =>
          entity.toJSON(),
        ),
      });

      await this.commitConsistentOperation(transactionId);
      this.performOperation('account_created');

      return accountAggregate;
    } catch (err: unknown) {
      this.performOperation('account_failed');
      return this.accountErrorHandler(
        err as Error,
        { type, amountPayload },
        'Failed create account',
        () => this.createAccount(type, amountPayload, uuid),
        transactionId,
      );
    }
  }

  async getAccountById(accountId: UUID, transactionId?: UUID): Promise<AccountAggregate> {
    const [accountEntity, subAccountEntities] = await Promise.all([
      this.accountRepository.getById(accountId, transactionId),
      this.subAccountRepository.getByAccountId(accountId, transactionId),
    ]);

    if (!accountEntity) {
      throw new AccountError(`Failed validate account: account not exist`, {
        transactionId,
        accountId,
      });
    }

    if (subAccountEntities.length !== CURRENCIES.length) {
      throw new AccountError(`Failed validate account: currency sub accounts not match to currencies list`, {
        transactionId,
        accountId,
      });
    }

    const accountAggregate = new AccountAggregate({
      account: accountEntity.toJSON(),
      subAccounts: subAccountEntities.map((entity) => entity.toJSON()),
    });

    return accountAggregate;
  }

  async getTransitAccount(transactionId?: UUID): Promise<AccountAggregate> {
    return this.getAccountByType(AccountType.Transit, transactionId);
  }

  async getBalanceAccount(transactionId?: UUID): Promise<AccountAggregate> {
    return this.getAccountByType(AccountType.Balance, transactionId);
  }

  async holdAmount(
    accountId: UUID,
    currency: Currency,
    amount: number,
    transactionId?: UUID,
  ): Promise<AccountAggregate> {
    const result = await this.subAccountRepository.holdForAmount(accountId, currency, amount, transactionId);

    if (!result) {
      throw new AccountError(`Failed hold amount`, {
        transactionId,
        accountId,
        currency,
        amount,
      });
    }

    return this.getAccountById(accountId, transactionId);
  }

  async releaseAmount(
    accountId: UUID,
    currency: Currency,
    amount: number,
    transactionId?: UUID,
  ): Promise<AccountAggregate> {
    const result = await this.subAccountRepository.releaseForAmount(accountId, currency, amount, transactionId);

    if (!result) {
      throw new AccountError(`Failed release amount`, {
        transactionId,
        accountId,
        currency,
        amount,
      });
    }

    return this.getAccountById(accountId, transactionId);
  }

  async debitAmount(
    accountId: UUID,
    currency: Currency,
    amount: number,
    transactionId?: UUID,
  ): Promise<AccountAggregate> {
    const result = await this.subAccountRepository.debitForAmount(accountId, currency, amount, transactionId);

    if (!result) {
      throw new AccountError(`Failed debit amount`, {
        transactionId,
        accountId,
        currency,
        amount,
      });
    }

    return this.getAccountById(accountId, transactionId);
  }

  async creditAmount(
    accountId: UUID,
    currency: Currency,
    amount: number,
    transactionId?: UUID,
  ): Promise<AccountAggregate> {
    const result = await this.subAccountRepository.creditForAmount(accountId, currency, amount, transactionId);

    if (!result) {
      throw new AccountError(`Failed credit amount`, {
        transactionId,
        accountId,
        currency,
        amount,
      });
    }

    return this.getAccountById(accountId, transactionId);
  }
}
