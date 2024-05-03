import { ConsolidateFeeUseCase } from '@application/use-cases';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class FeeWorker {
  private logger: Logger = new Logger(FeeWorker.name);

  constructor(private readonly consolidateFeeUseCase: ConsolidateFeeUseCase) {}

  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'processing-fees' })
  async triggerConsolidateFees(): Promise<void> {
    this.logger.debug('Triggering consolidate fees');
    await this.consolidateFeeUseCase.execute();
  }
}
