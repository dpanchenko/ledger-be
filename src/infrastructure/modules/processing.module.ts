import * as cacheManagerIoredis from 'cache-manager-ioredis';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ICacheConfig, IRedisConfig, getConfig } from '@config/index';

import { AppLoggerMiddleware } from '../middlewares';

import ControllersConfiguration from './controllers-processing.configuration';
import WorkersConfiguration from './workers.configuration';
import ProvidersConfiguration from './providers.configuration';
import RepositoriesConfiguration from './repositories.configuration';
import ServicesConfiguration from './services.configuration';
import ProcessorsConfiguration from './processors.configuration';

import UseCasesConfiguration from './use-cases.configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [getConfig],
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const redisConfig: IRedisConfig = configService.get<IRedisConfig>('redis');
        const cacheConfig: ICacheConfig = configService.get<ICacheConfig>('cache');

        return {
          store: cacheManagerIoredis,
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password,
          db: redisConfig.database,
          ttl: cacheConfig.defaultTtl,
        };
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'ledger_processing_',
        },
      },
    }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<IRedisConfig>('redis').host,
          port: configService.get<IRedisConfig>('redis').port,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'account',
    }),
    BullModule.registerQueue({
      name: 'transaction',
    }),
  ],
  controllers: [...ControllersConfiguration.controllers],
  providers: [
    ...(ProvidersConfiguration.providers as Provider[]),
    ...(RepositoriesConfiguration.providers as Provider[]),
    ...(ServicesConfiguration.providers as Provider[]),
    ...(UseCasesConfiguration.providers as Provider[]),
    ...(WorkersConfiguration.providers as Provider[]),
    ...(ProcessorsConfiguration.providers as Provider[]),
  ],
})
export class ProcessingModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
