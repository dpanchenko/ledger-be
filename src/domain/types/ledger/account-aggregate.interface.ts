import { IAccount } from './account.interface';
import { ISubAccount } from './sub-account.interface';

export interface IAccountAggregate {
  account: IAccount;
  subAccounts: ISubAccount[];
}
