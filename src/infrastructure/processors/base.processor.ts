import { Job } from 'bull';
import {
  OnQueueActive,
  OnQueueCleaned,
  OnQueueCompleted,
  OnQueueDrained,
  OnQueueError,
  OnQueueFailed,
  OnQueuePaused,
  OnQueueRemoved,
  OnQueueResumed,
  OnQueueStalled,
  OnQueueWaiting,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { parseError } from '@libs/errors';

export abstract class BaseProcessor {
  protected logger: Logger = new Logger(BaseProcessor.name);

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`);
  }

  @OnQueueError()
  onError(error: Error) {
    this.logger.error(`Queue error: ${JSON.stringify(parseError(error))}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}. Error: ${JSON.stringify(parseError(error))}`,
    );
  }

  @OnQueueWaiting()
  onWaiting(job: Job) {
    this.logger.debug(`Waiting job ${job.id} of type ${job.name} with data ${job.data}...`);
  }

  @OnQueueStalled()
  onStalled(job: Job) {
    this.logger.debug(`Stalled job ${job.id} of type ${job.name} with data ${job.data}...`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.debug(
      `Completed job ${job.id} of type ${job.name} with data ${job.data}. Result: ${JSON.stringify(result)}`,
    );
  }

  @OnQueuePaused()
  onPaused() {
    this.logger.debug(`Paused processing...`);
  }

  @OnQueueResumed()
  onResumed() {
    this.logger.debug(`Resumed processing...`);
  }

  @OnQueueCleaned()
  onCleaned(jobs: Job[], type: string) {
    this.logger.debug(`Cleaned ${jobs.length} jobs with type ${type}...`);
  }

  @OnQueueDrained()
  onDrained() {
    this.logger.debug(`Queue is drained, no jobs pending`);
  }

  @OnQueueRemoved()
  onRemove(job: Job) {
    this.logger.debug(`Job ${job.id} of type ${job.name} with data ${job.data} successfully removed...`);
  }
}
