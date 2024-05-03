import { IsInt, IsOptional, IsString } from 'class-validator';
import * as process from 'process';

export interface IProcessingConfig {
  env?: string;
  port: number;
}

export class ProcessingConfigValidator implements IProcessingConfig {
  @IsOptional()
  @IsString()
  readonly env?: string;

  @IsInt()
  readonly port!: number;
}

export const getProcessingConfig = (): IProcessingConfig => ({
  env: process.env.NODE_ENV ?? 'local',
  port: parseInt(`${process.env.PROCESSING_PORT || 3333}`, 10),
});
