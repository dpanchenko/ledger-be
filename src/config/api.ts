import { IsInt, IsOptional, IsString } from 'class-validator';
import * as process from 'process';

export interface IApiConfig {
  env?: string;
  port: number;
}

export class ApiConfigValidator implements IApiConfig {
  @IsOptional()
  @IsString()
  readonly env?: string;

  @IsInt()
  readonly port!: number;
}

export const getApiConfig = (): IApiConfig => ({
  env: process.env.NODE_ENV ?? 'local',
  port: parseInt(`${process.env.API_PORT || 3333}`, 10),
});
