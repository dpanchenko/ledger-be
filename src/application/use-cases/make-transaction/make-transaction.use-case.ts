import { AbstractUseCase } from '@libs/base';
import { TransactionService } from '@domain/services';

import { MakeTransactionRequestDto } from './make-transaction.request.dto';
import { MakeTransactionResponseDto } from './make-transaction.response.dto';

export class MakeTransactionUseCase extends AbstractUseCase<MakeTransactionRequestDto, MakeTransactionResponseDto> {
  constructor(private readonly transactionService: TransactionService) {
    super();
  }

  async action(params: MakeTransactionRequestDto): Promise<MakeTransactionResponseDto> {
    const transactionEntity = await this.transactionService.createTransaction(params);

    return transactionEntity.id;
  }
}
