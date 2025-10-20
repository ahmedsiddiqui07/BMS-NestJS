import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { Request } from 'express';
import { UserService } from 'src/modules/user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get('google.clientId') as string,
      clientSecret: configService.get('google.clientSecret') as string,
      callbackURL: configService.get<string>('google.callbackUrl'),
      passReqToCallback: true,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const payload = await this.userService.googleLogin(profile);
      done(null, payload);
    } catch (error) {
      done(error, false);
    }
  }
}
