import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Processing')
@ApiBearerAuth()
@Controller('processing')
export class ProcessingController {
  constructor(
    @InjectQueue('account') private readonly accountQueue: Queue,
    @InjectQueue('transaction') private readonly transactionQueue: Queue,
  ) {}

  @Post('account/pause')
  @ApiOperation({ summary: 'Pause account processing' })
  @ApiResponse({
    status: 201,
    description: 'Account processing paused',
  })
  async pauseAccountProcessing(): Promise<void> {
    await this.accountQueue.pause();
  }

  @Post('account/resume')
  @ApiOperation({ summary: 'Resume account processing' })
  @ApiResponse({
    status: 201,
    description: 'Account processing resumed',
  })
  async resumeAccountProcessing(): Promise<void> {
    await this.accountQueue.resume();
  }

  @Post('transaction/pause')
  @ApiOperation({ summary: 'Pause transaction processing' })
  @ApiResponse({
    status: 201,
    description: 'Transaction processing paused',
  })
  async pauseTransactionProcessing(): Promise<void> {
    await this.transactionQueue.pause();
  }

  @Post('transaction/resume')
  @ApiOperation({ summary: 'Resume transaction processing' })
  @ApiResponse({
    status: 201,
    description: 'Transaction processing resumed',
  })
  async resumeTransactionProcessing(): Promise<void> {
    await this.transactionQueue.resume();
  }
}
