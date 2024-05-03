import { UUID } from '@libs/types';
import { AccountType } from './account-type.enum';
import { Currency } from './currency.enum';

export interface IAccountPlain {
  id: UUID;
  type: AccountType;
  createdAt: Date;
  currency: Currency;
  currentBalance: number;
}
