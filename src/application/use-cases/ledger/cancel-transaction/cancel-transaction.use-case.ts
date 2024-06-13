import { AbstractUseCase } from '@libs/base';
import { TransactionService } from '@domain/services';

import { CancelTransactionRequestDto } from './cancel-transaction.request.dto';
import { CancelTransactionResponseDto } from './cancel-transaction.response.dto';

export class CancelTransactionUseCase extends AbstractUseCase<
  CancelTransactionRequestDto,
  CancelTransactionResponseDto
> {
  constructor(private readonly transactionService: TransactionService) {
    super();
  }

  async action(params: CancelTransactionRequestDto): Promise<CancelTransactionResponseDto> {
    const transactionEntity = await this.transactionService.cancelTransaction(params.id);

    return transactionEntity.id;
  }
}
