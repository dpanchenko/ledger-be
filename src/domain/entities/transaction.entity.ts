import { generateUuid } from '@libs/helpers';
import { UUID } from '@libs/types';
import { Currency, ITransaction, TransactionStatus, TransactionType } from '../types';

export class TransactionEntity implements ITransaction {
  public id: UUID;
  public type: TransactionType;
  public status: TransactionStatus;
  public debitAccount: UUID;
  public creditAccount: UUID;
  public amount: number;
  public currency: Currency;
  public createdAt: Date;
  public updatedAt: Date | null;

  constructor(params: ITransaction) {
    this.id = params.id ?? generateUuid();
    this.type = params.type;
    this.status = params.status ?? TransactionStatus.Initiated;
    this.debitAccount = params.debitAccount;
    this.creditAccount = params.creditAccount;
    this.amount = params.amount;
    this.currency = params.currency;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? null;
  }

  toJSON(): Required<ITransaction> {
    return {
      id: this.id,
      type: this.type,
      status: this.status,
      debitAccount: this.debitAccount,
      creditAccount: this.creditAccount,
      amount: this.amount,
      currency: this.currency,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
