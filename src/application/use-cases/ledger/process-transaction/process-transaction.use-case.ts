import { AbstractUseCase } from '@libs/base';
import { TransactionService } from '@domain/services';

import { ProcessTransactionRequestDto } from './process-transaction.request.dto';
import { ProcessTransactionResponseDto } from './process-transaction.response.dto';

export class ProcessTransactionUseCase extends AbstractUseCase<
  ProcessTransactionRequestDto,
  ProcessTransactionResponseDto
> {
  constructor(private readonly transactionService: TransactionService) {
    super();
  }

  async action(params: ProcessTransactionRequestDto): Promise<ProcessTransactionResponseDto> {
    const transactionEntity = await this.transactionService.processTransaction(params.id);

    return transactionEntity.id;
  }
}
