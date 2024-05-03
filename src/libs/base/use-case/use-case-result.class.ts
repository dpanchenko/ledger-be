import { IUseCaseResult } from './use-case-result.interface';

export class UseCaseResult<T> implements IUseCaseResult<T> {
  public success: boolean;
  public result: T | null;
  public error: Error | null;

  constructor(result: T | Error) {
    this.success = !(result instanceof Error);
    this.result = result instanceof Error ? null : (result as T);
    this.error = result instanceof Error ? (result as Error) : null;
  }

  isSuccess(): boolean {
    return this.success;
  }

  getResult(): T | null {
    return this.result as T;
  }

  getError(): Error | null {
    return this.error as Error;
  }
}
