import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';

import { UUID } from '@libs/types';
import { IdPayloadDto, TransactionPayloadDto } from '@infrastructure/dto';
import {
  CancelTransactionUseCase,
  MakeTransactionUseCase,
  ProcessTransactionUseCase,
  SendTransactionUseCase,
} from '@application/use-cases';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(
    @InjectQueue('transaction') private readonly transactionQueue: Queue,
    private readonly cancelTransactionUseCase: CancelTransactionUseCase,
    private readonly makeTransactionUseCase: MakeTransactionUseCase,
    private readonly processTransactionUseCase: ProcessTransactionUseCase,
    private readonly sendTransactionUseCase: SendTransactionUseCase,
  ) {}

  @Post('create')
  @ApiOperation({ summary: 'Make transaction' })
  @ApiBody({ type: TransactionPayloadDto })
  @ApiResponse({
    status: 201,
    description: 'Create transaction',
  })
  async makeTransaction(@Body() body: TransactionPayloadDto): Promise<IdPayloadDto> {
    const makeTransactionResult = await this.makeTransactionUseCase.execute(body);

    if (!makeTransactionResult.isSuccess()) {
      throw makeTransactionResult.getError();
    }

    const transactionId = makeTransactionResult.getResult() as UUID;
    const payload = { id: transactionId };

    setTimeout(async () => {
      const sendTransactionResult = await this.sendTransactionUseCase.execute(payload);
      if (sendTransactionResult.isSuccess()) {
        await this.transactionQueue.add('process-transaction', payload);
      }
    }, 1000);

    return payload;
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel transaction' })
  @ApiBody({ type: IdPayloadDto })
  @ApiResponse({
    status: 201,
    description: 'Cancel transaction',
  })
  async cancelTransaction(@Body() body: IdPayloadDto): Promise<IdPayloadDto> {
    const cancelTransactionResult = await this.cancelTransactionUseCase.execute(body);

    if (!cancelTransactionResult.isSuccess()) {
      throw cancelTransactionResult.getError();
    }

    return {
      id: cancelTransactionResult.getResult() as UUID,
    };
  }

  @Post('send')
  @ApiOperation({ summary: 'Manual send transaction for processing' })
  @ApiBody({ type: IdPayloadDto })
  @ApiResponse({
    status: 201,
    description: 'Send transaction',
  })
  async sendTransaction(@Body() body: IdPayloadDto): Promise<IdPayloadDto> {
    const sendTransactionResult = await this.sendTransactionUseCase.execute(body);

    if (!sendTransactionResult.isSuccess()) {
      throw sendTransactionResult.getError();
    }

    return {
      id: sendTransactionResult.getResult() as UUID,
    };
  }

  @Post('process')
  @ApiOperation({ summary: 'Manual process transaction' })
  @ApiBody({ type: IdPayloadDto })
  @ApiResponse({
    status: 201,
    type: IdPayloadDto,
    description: 'Processed transaction',
  })
  async processTransaction(@Body() body: IdPayloadDto): Promise<IdPayloadDto> {
    const processTransactionResult = await this.processTransactionUseCase.execute(body);

    if (!processTransactionResult.isSuccess()) {
      throw processTransactionResult.getError();
    }

    return {
      id: processTransactionResult.getResult() as UUID,
    };
  }
}
