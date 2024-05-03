import { HttpStatus, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, baseUrl } = request;

    response.on('close', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      if (statusCode < HttpStatus.BAD_REQUEST) {
        this.logger.log(`${method} ${baseUrl} ${statusCode} ${contentLength}`);
      } else {
        this.logger.warn(`${method} ${baseUrl} ${statusCode} ${contentLength}`);
      }
    });

    next();
  }
}
