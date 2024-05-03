import * as dotenv from 'dotenv';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiConfigValidator, getApiConfig, IApiConfig } from './api';
import { CacheConfigValidator, getCacheConfig, ICacheConfig } from './cache';
import { getLoggerConfig, ILoggerConfig, LoggerConfigValidator } from './logger';
import { IPostgresConfig, PostgresConfigValidator, getPostgresConfig } from './postgres';
import { IProcessingConfig, ProcessingConfigValidator, getProcessingConfig } from './processing';
import { RedisConfigValidator, getRedisConfig, IRedisConfig } from './redis';
import { validate } from './validate';

dotenv.config();

export interface IConfig {
  api: IApiConfig;
  cache: ICacheConfig;
  logger: ILoggerConfig;
  postgres: IPostgresConfig;
  processing: IProcessingConfig;
  redis: IRedisConfig;
}

export class ConfigValidator implements IConfig {
  @ValidateNested()
  @Type(() => ApiConfigValidator)
  readonly api!: ApiConfigValidator;

  @ValidateNested()
  @Type(() => CacheConfigValidator)
  readonly cache!: CacheConfigValidator;

  @ValidateNested()
  @Type(() => LoggerConfigValidator)
  readonly logger!: LoggerConfigValidator;

  @ValidateNested()
  @Type(() => PostgresConfigValidator)
  readonly postgres!: PostgresConfigValidator;

  @ValidateNested()
  @Type(() => ProcessingConfigValidator)
  readonly processing!: ProcessingConfigValidator;

  @ValidateNested()
  @Type(() => RedisConfigValidator)
  readonly redis!: RedisConfigValidator;
}

export const getConfig = (): IConfig => {
  const config: IConfig = {
    api: getApiConfig(),
    cache: getCacheConfig(),
    logger: getLoggerConfig(),
    postgres: getPostgresConfig(),
    processing: getProcessingConfig(),
    redis: getRedisConfig(),
  };

  return validate<IConfig, ConfigValidator>(config, ConfigValidator);
};
