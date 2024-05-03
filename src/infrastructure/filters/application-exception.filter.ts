import { Request, Response } from 'express';
import { ExceptionFilter, Catch, ArgumentsHost, Logger, HttpException } from '@nestjs/common';
import { parseError } from '@libs/errors';

@Catch(Error)
export class ApplicationExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(ApplicationExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = 400;
    const errorData = parseError(exception);

    if (exception instanceof HttpException) {
      statusCode = (exception as HttpException).getStatus();
    }

    if (statusCode >= 400) {
      this.logger.error(exception);
    } else {
      this.logger.log(exception);
    }

    response.status(statusCode).json({
      ...errorData,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
