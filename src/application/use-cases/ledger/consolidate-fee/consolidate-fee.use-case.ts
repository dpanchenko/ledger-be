import { AbstractUseCase } from '@libs/base';
import { TransactionService } from '@domain/services';

export class ConsolidateFeeUseCase extends AbstractUseCase<void, void> {
  constructor(private readonly transactionService: TransactionService) {
    super();
  }

  async action(): Promise<void> {
    await this.transactionService.consolidateFee();
  }
}
