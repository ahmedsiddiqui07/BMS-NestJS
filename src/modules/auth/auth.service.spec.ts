import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: 'JWT_MODULE_OPTIONS',
          useValue: {
            secret: 'test-secret',
            signOptions: { expiresIn: '1h' },
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should generate valid tokens and verify them correctly', async () => {
    const mockPayload = {
      id: 1,
      role: 'user',
    };
    const { accessToken, refreshToken } = await authService.generateTokens(mockPayload);

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();

    const decodedAccess = await authService.verifyToken(accessToken);
    const decodedRefresh = await authService.verifyToken(refreshToken);
    expect(decodedAccess.id).toBe(mockPayload.id);
    expect(decodedAccess.role).toBe(mockPayload.role);

    expect(decodedRefresh.id).toBe(mockPayload.id);
    expect(decodedRefresh.role).toBe(mockPayload.role);
  });

  it('should throw UnauthorizedException for invalid token', async () => {
    await expect(authService.verifyToken('invalid.token')).rejects.toThrow(UnauthorizedException);
  });
});
