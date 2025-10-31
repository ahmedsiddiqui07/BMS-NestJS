import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, TokenResponse } from './types/interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: JwtPayload): Promise<TokenResponse> {
    const refreshSecret = this.configService.get<string>('jwt.refreshTokenSecret');
    const refreshExpires = this.configService.get<string>('jwt.refreshExpires');
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpires,
    });
    return { accessToken, refreshToken };
  }

  async verifyToken(token: string) {
    try {
      const secret = this.configService.get<string>('jwt.secretKey');
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, { secret });
      return payload;
    } catch (err) {
      console.error('[AuthService] Token invalid:', err.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
