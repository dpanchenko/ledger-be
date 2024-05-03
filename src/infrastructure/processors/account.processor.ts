import { Job } from 'bull';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { OpenAccountUseCase } from '@application/use-cases';
import { IAmountPayload } from '@domain/types';
import { BaseProcessor } from './base.processor';

@Processor('account')
export class AccountProcessor extends BaseProcessor {
  protected logger: Logger = new Logger(AccountProcessor.name);

  constructor(private readonly openAccountUseCase: OpenAccountUseCase) {
    super();
  }

  @Process('create-account')
  async handleCreateAccount(job: Job<IAmountPayload>) {
    this.logger.debug('Start create account...');

    const result = await this.openAccountUseCase.execute(job.data);

    this.logger.debug(`Success: ${result.isSuccess()}`);
    this.logger.debug(`Result: ${result.getResult()}`);
    this.logger.debug(`Error: ${result.getError()}`);

    // if (!result.isSuccess()) {
    //   throw result.getError();
    // }

    this.logger.debug('Create account completed');
  }
}
