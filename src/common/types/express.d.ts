import { JwtPayload } from 'src/modules/auth/types/interface';

declare namespace Express {
  export interface Request {
    cookies: Record<string, any>;
    user: JwtPayload;
  }
}
