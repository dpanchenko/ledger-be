import { generateUuid } from '@libs/helpers';
import { UUID } from '@libs/types';
import { AccountType, IAccount } from '../types';

export class AccountEntity implements IAccount {
  public id: UUID;
  public type: AccountType;
  public createdAt: Date;

  constructor(params: IAccount) {
    this.id = params.id ?? generateUuid();
    this.type = params.type;
    this.createdAt = params.createdAt ?? new Date();
  }

  toJSON(): Required<IAccount> {
    return {
      id: this.id,
      type: this.type,
      createdAt: this.createdAt,
    };
  }
}
