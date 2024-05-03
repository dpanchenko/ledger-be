import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AccountWorker {
  private logger: Logger = new Logger(AccountWorker.name);

  @Cron(CronExpression.EVERY_10_SECONDS, { name: 'processing-accounts' })
  async triggerProcessingFees(): Promise<void> {
    this.logger.debug('Triggering processing fees');
  }
}
