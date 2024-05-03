import { UUID } from '@libs/types';
import { Currency, ISubAccount } from '../types';
import { DEFAULT_CURRENCY } from '@domain/constants';

export class SubAccountEntity implements ISubAccount {
  public accountId: UUID;
  public currency: Currency;
  public balance: number;
  public hold: number;

  constructor(params: ISubAccount) {
    this.accountId = params.accountId;
    this.currency = params.currency ?? DEFAULT_CURRENCY;
    this.balance = params.balance ?? 0;
    this.hold = params.hold ?? 0;
  }

  toJSON(): Required<ISubAccount> {
    return {
      accountId: this.accountId,
      currency: this.currency,
      balance: this.balance,
      hold: this.hold,
    };
  }
}
