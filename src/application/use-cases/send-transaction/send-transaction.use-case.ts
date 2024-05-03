import { AbstractUseCase } from '@libs/base';
import { TransactionService } from '@domain/services';

import { SendTransactionRequestDto } from './send-transaction.request.dto';
import { SendTransactionResponseDto } from './send-transaction.response.dto';

export class SendTransactionUseCase extends AbstractUseCase<SendTransactionRequestDto, SendTransactionResponseDto> {
  constructor(private readonly transactionService: TransactionService) {
    super();
  }

  async action(params: SendTransactionRequestDto): Promise<SendTransactionResponseDto> {
    const transactionEntity = await this.transactionService.sendTransaction(params.id);

    return transactionEntity.id;
  }
}
