import { Currency } from './currency.enum';

export interface IRate {
  currency: Currency;
  rate: number;
}
