import { Currency } from './currency.enum';

export interface IAmountPayload {
  amount: number;
  currency: Currency;
}
