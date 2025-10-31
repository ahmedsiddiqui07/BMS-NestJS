/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Controller, Get, Post, Render, Res, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { SanitizeResponse } from 'src/common/decorators/sanitize.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { Request, Response } from 'express';
import { JwtPayload, AuthGoogleResponse, AuthLoginResponse } from './types/interface';

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
    const { email, password } = loginDto;
    const user = await this.userService.login(email, password);
    const payload: JwtPayload = { id: user.id, role: user.role?.name ?? 'user' };
    const tokens = await this.authService.generateTokens(payload);
    return {
      message: 'Login Successful',
      user,
      tokens,
    };
  }

  @Post('register')
  @SanitizeResponse()
  async register(@Body() registerDto: RegisterDto): Promise<AuthLoginResponse> {
    const { name, email, password } = registerDto;
    const user = await this.userService.register(name, email, password);
    const payload: JwtPayload = { id: user.id, role: user.role?.name ?? 'user' };
    const tokens = await this.authService.generateTokens(payload);
    return {
      message: 'Login Successful',
      user,
      tokens,
    };
  }

  // ---- Login Page ----
  @Get('web/login')
  @Render('auth/login')
  loginPage() {
    return {
      title: 'Login Page',
    };
  }

  // ---- Register Page ----
  @Get('web/register')
  @Render('auth/register')
  registerPage() {
    return {
      title: 'Register Page',
    };
  }

  // ---- Login Action ----
  @Post('web/login')
  async weblogin(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const { email, password } = loginDto;
      const user = await this.userService.login(email, password);
      const payload: JwtPayload = { id: user.id, role: user.role?.name ?? 'user' };
      const tokens = await this.authService.generateTokens(payload);
      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.redirect('/api/v1/users/web/profile');
    } catch (err) {
      console.error(err);
      return res.render('auth/login', {
        title: 'Login Page',
        err: 'Invalid email or password',
      });
    }
  }

  // ---- Register Action ----
  @Post('web/register')
  async webregister(@Body() registerDto: RegisterDto, @Res() res: Response) {
    try {
      const { name, email, password } = registerDto;
      const user = await this.userService.register(name, email, password);
      const payload: JwtPayload = { id: user.id, role: user.role?.name ?? 'user' };
      const tokens = await this.authService.generateTokens(payload);

      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return res.redirect('/api/v1/users/web/profile');
    } catch (error) {
      console.error(error);
      return res.render('auth/register', {
        title: 'Register Page',
        error: error.message || 'Failed to register user',
      });
    }
  }
  // ---- Logout ----
  @Get('web/logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token');
    res.redirect('/api/v1/auth/web/login');
  }
}
