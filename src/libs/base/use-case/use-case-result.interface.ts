export interface IUseCaseResult<T> {
  success: boolean;
  result?: T;
  error?: Error | null;
}
