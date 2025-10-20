import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { SafeBody } from '../types/type';
import { Error } from '../types/interface';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    const request = context.switchToHttp().getRequest<Request<any, any, SafeBody>>();
    const { method, url, ip, headers } = request;
    const body = request.body;

    const safeHeaders = {
      'content-type': headers['content-type'],
      'user-agent': headers['user-agent'],
    };

    this.logger.log(`➡️ [${method}] ${url} - IP: ${ip}`);
    this.logger.debug(`Headers: ${JSON.stringify(safeHeaders)}`);
    if (body && Object.keys(body).length > 0) {
      this.logger.debug(`Request Body: ${JSON.stringify(body)}`);
    } else {
      this.logger.debug('No Request Body');
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.logger.log(`⬅️ [${method}] ${url} - ${Date.now() - now}ms - ✅ SUCCESS`);
          this.logger.debug(`Response: ${JSON.stringify(data)}`);
        },
        error: (err: Error) => {
          this.logger.error(
            `❌ [${method}] ${url} - ${Date.now() - now}ms`,
            JSON.stringify({
              message: err.message,
              name: err.name,
              status: err.status ?? 500,
              stack: err.stack?.split('\n')[0],
            }),
          );
        },
      }),
    );
  }
}
