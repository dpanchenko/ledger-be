import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export interface IPostgresConfig {
  host: string;
  user: string;
  password?: string;
  port: number;
  database: string;
  dropSchema: boolean;
  migrationsRun: boolean;
}

export class PostgresConfigValidator implements IPostgresConfig {
  @IsString()
  readonly host!: string;

  @IsString()
  readonly user!: string;

  @IsString()
  @IsOptional()
  readonly password?: string;

  @IsNumber()
  readonly port!: number;

  @IsString()
  readonly database!: string;

  @IsBoolean()
  readonly dropSchema!: boolean;

  @IsBoolean()
  readonly migrationsRun!: boolean;
}

export const getPostgresConfig = (): IPostgresConfig => ({
  host: process.env.POSTGRES_HOST ?? 'localhost',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432,
  database: process.env.POSTGRES_DATABASE,
  dropSchema: process.env.POSTGRES_DROP_SCHEMA === 'true',
  migrationsRun: process.env.POSTGRES_MIGRATION_RUN === 'true',
});
