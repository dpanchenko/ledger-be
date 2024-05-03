import { AccountRepository, SubAccountRepository, TransactionRepository } from '@domain/repositories';
import {
  AccountPostgresRepository,
  SubAccountPostgresRepository,
  TransactionPostgresRepository,
} from '../repositories';

export default {
  providers: [
    {
      provide: AccountRepository,
      useClass: AccountPostgresRepository,
    },
    {
      provide: SubAccountRepository,
      useClass: SubAccountPostgresRepository,
    },
    {
      provide: TransactionRepository,
      useClass: TransactionPostgresRepository,
    },
  ],
};
