import { UUID } from '@libs/types';
import { Currency } from './currency.enum';

export interface ISubAccount {
  accountId: UUID;
  currency?: Currency;
  balance?: number;
  hold?: number;
}
