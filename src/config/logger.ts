import { IsString } from 'class-validator';

export interface ILoggerConfig {
  logLevel: string;
}

export class LoggerConfigValidator implements ILoggerConfig {
  @IsString()
  readonly logLevel!: 'log' | 'error' | 'warn' | 'debug' | 'verbose';
}

export const getLoggerConfig = (): ILoggerConfig => ({
  logLevel: process.env.LOGGER_LEVEL ?? 'verbose',
});
