import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { comparePassword, hashPassword } from 'src/common/helper/helper';
import { ROLES } from 'src/common/constants/constant';

jest.mock('src/common/helper/helper', () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
}));
describe('UserService', () => {
  let service: UserService;
  let userRepo: jest.Mocked<Repository<User>>;
  const mockUserRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));
  });

  describe('validateUser', () => {
    it('should return user if valid', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        isActive: true,
        role: { name: ROLES.USER, isActive: true },
      };
      userRepo.findOne.mockResolvedValue(mockUser as User);

      const result = await service.validateUser(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw if user not found or inactive', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.validateUser(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw if role is inactive', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        isActive: true,
        role: { name: ROLES.USER, isActive: false },
      } as User);

      await expect(service.validateUser(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('login', () => {
    it('should return user on success', async () => {
      const mockUser = {
        id: 1,
        email: 'test@mail.com',
        password: 'hashed',
        isActive: true,
      };
      userRepo.findOne.mockResolvedValue(mockUser as User);
      (comparePassword as jest.Mock).mockResolvedValue(true);

      const result = await service.login('test@mail.com', 'pass');
      expect(result).toEqual(mockUser);
    });

    it('should throw if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.login('x@mail.com', 'pass')).rejects.toThrow(NotFoundException);
    });

    it('should throw if password mismatch', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        isActive: true,
        password: 'hashed',
        role: {},
      } as User);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(service.login('x@mail.com', 'pass')).rejects.toThrow(BadRequestException);
    });
  });

  describe('register', () => {
    it('should create user successfully', async () => {
      userRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 10, role: { name: ROLES.USER } } as any);
      (hashPassword as jest.Mock).mockResolvedValue('hashedPass');
      userRepo.create.mockReturnValue({ id: 10 } as any);
      userRepo.save.mockResolvedValue({ id: 10 } as any);
      const result = await service.register('ahmed', 'a@mail.com', 'pass');
      expect(result).toEqual({ id: 10, role: { name: ROLES.USER } });
    });

    it('should throw if email exists', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1 } as any);

      await expect(service.register('ah', 'a@mail.com', 'pass')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteAccount', () => {
    it('should delete user', async () => {
      const existingUser = { id: 3, role: { name: ROLES.USER }, isActive: true };
      userRepo.findOne.mockResolvedValue(existingUser as User);
      userRepo.save.mockResolvedValue({ ...existingUser, isActive: false } as User);

      const result = await service.deleteAccount(1, 3);
      expect(result).toEqual({ id: 3, deleted: true });
    });

    it('should forbid deleting admin', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 2,
        role: { name: ROLES.ADMIN },
        isActive: true,
      } as any);

      await expect(service.deleteAccount(1, 2)).rejects.toThrow(ForbiddenException);
    });
  });

  // -----------------------------------
  // updateProfile()
  // -----------------------------------
  describe('updateProfile', () => {
    it('should update profile', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1, name: 'old', isActive: true } as any);
      userRepo.save.mockResolvedValue({ id: 1, name: 'new' } as any);

      const result = await service.updateProfile(1, { name: 'new' });
      expect(result).toEqual({ id: 1, name: 'new' });
    });
  });

  // -----------------------------------
  // getUserById()
  // -----------------------------------
  describe('getUserById', () => {
    it('should return user', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 2,
        isActive: true,
        role: { name: ROLES.USER },
      } as User);

      const result = await service.getUserById({ id: 1, role: ROLES.ADMIN }, 2);
      expect(result.id).toBe(2);
    });
  });
});
