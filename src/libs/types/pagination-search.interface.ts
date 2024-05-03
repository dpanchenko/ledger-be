import { IPagination } from './pagination.interface';

export interface IPaginationSearch extends IPagination {
  search?: string;
}
