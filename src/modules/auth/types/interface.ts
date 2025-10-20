import { User } from 'src/modules/user/entities/user.entity';

export interface JwtPayload {
  id: number;
  role: string;
}
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthLoginResponse {
  message: string;
  user: User;
  tokens: TokenResponse;
}

export interface AuthGoogleResponse {
  message: string;
  payload: JwtPayload;
  tokens: TokenResponse;
}
