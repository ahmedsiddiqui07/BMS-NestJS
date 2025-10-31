// src/common/interceptors/transform.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { SANITIZE_RESPONSE } from '../decorators/sanitize.decorator';
import { sanitizeResponse } from '../utils/sanitize.util';

@Injectable()
export class TransformInterceptor<T = any> implements NestInterceptor<T, any> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    if (request.url.includes('/web')) {
      return next.handle();
    }

    const shouldSanitize = this.reflector.get<boolean>(SANITIZE_RESPONSE, context.getHandler());

    return next.handle().pipe(
      map((data) => {
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
