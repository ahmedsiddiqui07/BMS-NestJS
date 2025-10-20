import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from 'src/modules/user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/modules/auth/types/interface';
import { customTokenExtractor } from '../utils/extractor.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([customTokenExtractor]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secretKey') as string,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.validateUser(payload.id);
    return { id: user.id, role: user.role?.name };
  }
}
