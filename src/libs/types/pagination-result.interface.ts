import { IPagination } from './pagination.interface';

export interface IPaginationResult<T> extends IPagination {
  total: number;
  items: T[];
}
