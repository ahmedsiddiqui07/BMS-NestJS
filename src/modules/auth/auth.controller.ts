import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Request } from 'express';
import { SanitizeResponse } from 'src/common/decorators/sanitize.decorator';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { AuthGoogleResponse, AuthLoginResponse, JwtPayload } from './types/interface';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    return { message: 'Redirecting to Google...' };
  }
  @SanitizeResponse()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request): Promise<AuthGoogleResponse> {
    const payload = req.user as JwtPayload;
    const tokens = await this.authService.generateTokens(payload);

    return {
      message: 'Google login successful',
      payload,
      tokens,
    };
  }

  @Post('login')
  @SanitizeResponse()
  async login(@Body() loginDto: LoginDto): Promise<AuthLoginResponse> {
    try {
      const { email, password } = loginDto;
      const user = await this.userService.login(email, password);
      const payload: JwtPayload = { id: user.id, role: user.role?.name ?? 'user' };
      const tokens = await this.authService.generateTokens(payload);
      return {
        message: 'Login Successful',
        user,
        tokens,
      };
    } catch (err) {
      console.log('Error in Login Api', err);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Post('register')
  @SanitizeResponse()
  async register(@Body() registerDto: RegisterDto): Promise<AuthLoginResponse> {
    try {
      const { name, email, password } = registerDto;
      const user = await this.userService.register(name, email, password);
      const payload: JwtPayload = { id: user.id, role: user.role?.name ?? 'user' };
      const tokens = await this.authService.generateTokens(payload);
      return {
        message: 'Login Successful',
        user,
        tokens,
      };
    } catch (err) {
      console.log('Error in Register Api', err);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
