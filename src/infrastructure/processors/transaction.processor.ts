import { Job } from 'bull';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ProcessTransactionUseCase } from '@application/use-cases';
import { IId } from '@domain/types';
import { BaseProcessor } from './base.processor';

@Processor('transaction')
export class TransactionProcessor extends BaseProcessor {
  protected logger: Logger = new Logger(TransactionProcessor.name);

  constructor(private readonly processTransactionUseCase: ProcessTransactionUseCase) {
    super();
  }

  @Process('process-transaction')
  async handleCreateAccount(job: Job<IId>) {
    this.logger.debug('Start process transaction...');

    const result = await this.processTransactionUseCase.execute(job.data);

    this.logger.debug(`Success: ${result.isSuccess()}`);
    this.logger.debug(`Result: ${result.getResult()}`);
    this.logger.debug(`Error: ${result.getError()}`);

    this.logger.debug('Process transaction completed');
  }
}
