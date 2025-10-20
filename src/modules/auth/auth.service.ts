import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { appConfig } from 'src/config/app.config';
import { JwtPayload, TokenResponse } from './types/interface';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateTokens(payload: JwtPayload): Promise<TokenResponse> {
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: appConfig.jwt.refreshTokenSecret,
      expiresIn: appConfig.jwt.refreshExpires,
    });
    return { accessToken, refreshToken };
  }

  async verifyToken(token: string) {
    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token);
      return payload;
    } catch (err) {
      console.error('[AuthService] Token invalid:', err.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
