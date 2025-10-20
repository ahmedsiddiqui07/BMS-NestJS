import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { sanitizeResponse } from '../utils/sanitize.util';
import { SANITIZE_RESPONSE } from '../decorators/sanitize.decorator';

@Injectable()
export class TransformInterceptor<T = unknown> implements NestInterceptor<T, any> {
  constructor(private readonly reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    const shouldSanitize = this.reflector.get<boolean>(SANITIZE_RESPONSE, context.getHandler());
    return next.handle().pipe(
      map((data) => {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();
        const responseData = shouldSanitize ? sanitizeResponse(data) : data;
        return {
          success: true,
          data: responseData,
          statusCode: response.statusCode,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
