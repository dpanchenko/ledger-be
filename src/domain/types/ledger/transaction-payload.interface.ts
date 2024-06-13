import { UUID } from '@libs/types';
import { Currency } from './currency.enum';

export interface ITransactionPayload {
  debitAccount: UUID;
  creditAccount: UUID;
  amount: number;
  currency: Currency;
}
