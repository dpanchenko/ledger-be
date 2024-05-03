import { AccountService, TransactionService } from '@domain/services';
import { AccountPostgresService, TransactionPostgresService } from '../services';

export default {
  providers: [
    {
      provide: AccountService,
      useClass: AccountPostgresService,
    },
    {
      provide: TransactionService,
      useClass: TransactionPostgresService,
    },
  ],
};
