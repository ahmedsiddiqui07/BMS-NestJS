import helmet from 'helmet';
import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const helmetConfig = () =>
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
    hidePoweredBy: true,
    referrerPolicy: { policy: 'no-referrer' },
  });

export const corsConfig: CorsOptions = {
  origin: ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      ttl: 60000,
      limit: 10,
    },
  ],
};
