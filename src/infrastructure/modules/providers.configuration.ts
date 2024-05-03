import { ConfigService } from '@nestjs/config';
import { IPostgresConfig } from '@config/index';
import { POSTGRESQL_PROVIDER_TOKEN, PostgresqlProvider } from '@libs/providers';

export default {
  providers: [
    {
      provide: POSTGRESQL_PROVIDER_TOKEN,
      useFactory: (configService: ConfigService): PostgresqlProvider => {
        const postgresConfig: IPostgresConfig = configService.get<IPostgresConfig>('postgres');

        return new PostgresqlProvider(postgresConfig);
      },
      inject: [ConfigService],
    },
  ],
};
