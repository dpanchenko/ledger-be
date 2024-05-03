import { Currency, IAccountAggregate, IAccountPlain } from '@domain/types';
import { AccountEntity, SubAccountEntity } from '../entities';
import { AccountError } from '@domain/errors';

export class AccountAggregate {
  public accountEntity: AccountEntity;
  public subAccountEntities: SubAccountEntity[];

  constructor(params: IAccountAggregate) {
    this.accountEntity = new AccountEntity(params.account);
    this.subAccountEntities = params.subAccounts.map((subAccount) => new SubAccountEntity(subAccount));
  }

  toJSON(): IAccountAggregate {
    return {
      account: this.accountEntity.toJSON(),
      subAccounts: this.subAccountEntities.map((subAccountEntity) => subAccountEntity.toJSON()),
    };
  }

  toPlainJson(currency: Currency): IAccountPlain {
    const subAccountEntity = this.subAccountEntities.find((entity) => entity.currency === currency);

    if (!subAccountEntity) {
      throw new AccountError(`Sub account for currency not exist`, { account: this.toJSON(), currency });
    }
    return {
      id: this.accountEntity.id,
      type: this.accountEntity.type,
      createdAt: this.accountEntity.createdAt,
      currency: subAccountEntity.currency,
      currentBalance: subAccountEntity.balance - subAccountEntity.hold,
    };
  }
}
