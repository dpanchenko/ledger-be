import { UseCaseResult } from './use-case-result.class';

export abstract class AbstractUseCase<Request, Response> {
  abstract action(params: Request): Promise<Response>;

  async execute(params: Request): Promise<UseCaseResult<Response | Error>> {
    try {
      const result = await this.action(params);

      return new UseCaseResult(result as Response);
    } catch (error: unknown) {
      return new UseCaseResult(error as Error);
    }
  }
}
