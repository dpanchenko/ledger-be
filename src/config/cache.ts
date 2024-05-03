import { IsInt } from 'class-validator';

export interface ICacheConfig {
  defaultTtl: number;
}

export class CacheConfigValidator implements ICacheConfig {
  @IsInt()
  readonly defaultTtl!: number;
}

export const getCacheConfig = (): ICacheConfig => ({
  defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL, 10),
});
