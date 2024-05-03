import { UUID } from '@libs/types';
import { AccountType } from './account-type.enum';

export interface IAccount {
  id?: UUID;
  type: AccountType;
  createdAt?: Date;
}
