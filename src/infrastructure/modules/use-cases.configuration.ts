import {
  CancelTransactionUseCase,
  ConsolidateFeeUseCase,
  MakeTransactionUseCase,
  OpenAccountUseCase,
  ProcessTransactionUseCase,
  SendTransactionUseCase,
} from '@application/use-cases';
import { AccountService, TransactionService } from '@domain/services';

export default {
  providers: [
    {
      provide: CancelTransactionUseCase,
      useFactory: (transactionService: TransactionService) => new CancelTransactionUseCase(transactionService),
      inject: [TransactionService],
    },
    {
      provide: ConsolidateFeeUseCase,
      useFactory: (transactionService: TransactionService) => new ConsolidateFeeUseCase(transactionService),
      inject: [TransactionService],
    },
    {
      provide: MakeTransactionUseCase,
      useFactory: (transactionService: TransactionService) => new MakeTransactionUseCase(transactionService),
      inject: [TransactionService],
    },
    {
      provide: OpenAccountUseCase,
      useFactory: (accountService: AccountService) => new OpenAccountUseCase(accountService),
      inject: [AccountService],
    },
    {
      provide: ProcessTransactionUseCase,
      useFactory: (transactionService: TransactionService) => new ProcessTransactionUseCase(transactionService),
      inject: [TransactionService],
    },
    {
      provide: SendTransactionUseCase,
      useFactory: (transactionService: TransactionService) => new SendTransactionUseCase(transactionService),
      inject: [TransactionService],
    },
  ],
};
