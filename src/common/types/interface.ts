import { Request } from 'express';
import { JwtPayload } from 'src/modules/auth/types/interface';
import { JwtExpires } from 'src/modules/auth/types/type';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  host: string;
}

export interface DatabaseConfig {
  user: string;
  host: string;
  name: string;
  password: string;
  port: number;
}

export interface JWTConfig {
  secretKey: string;
  expires: JwtExpires;
  refreshTokenSecret: string;
  refreshExpires: JwtExpires;
}

export interface MailConfig {
  host: string;
  port: number;
  from: string;
  auth: string | null;
}

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

export interface Config {
  app: AppConfig;
  database: DatabaseConfig;
  jwt: JWTConfig;
  mail: MailConfig;
  google: GoogleConfig;
}

export interface ExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
  path: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

export interface Error {
  message: string;
  name: string;
  status: number;
  stack?: string;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
export interface AuthUtilResponse {
  token: string;
  id: number;
}
