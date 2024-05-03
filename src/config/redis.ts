import { IsNumber, IsOptional, IsString } from 'class-validator';

export interface IRedisConfig {
  host: string;
  port: number;
  password?: string;
  database: number;
}

export class RedisConfigValidator implements IRedisConfig {
  @IsString()
  readonly host!: string;

  @IsNumber()
  readonly port!: number;

  @IsString()
  @IsOptional()
  readonly password?: string;

  @IsNumber()
  readonly database!: number;
}

export const getRedisConfig = (): IRedisConfig => ({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD,
  database: process.env.REDIS_DATABASE ? parseInt(process.env.REDIS_DATABASE) : 0,
});
