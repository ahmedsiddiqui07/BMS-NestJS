import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Profile } from 'passport-google-oauth20';
import { comparePassword, hashPassword } from 'src/common/helper/helper';
import { JwtPayload } from '../auth/types/interface';
import { AccountDeletionResponse } from './types/user.interface';
import { UpdateProfileDto } from './dto/update.dto';
import { ROLES } from 'src/common/constants/constant';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async validateUser(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user || !user.isActive) throw new NotFoundException('User not found');
    if (!user.role?.isActive) throw new NotFoundException('Role not found');
    return user;
  }

  async googleLogin(profile: Profile): Promise<JwtPayload> {
    let user = await this.userRepo.findOne({
      where: { providerId: profile.id },
      relations: ['role'],
    });

    if (!user) {
      user = this.userRepo.create({
        providerId: profile.id,
        oauthProvider: 'google',
        name: profile.displayName,
        email: profile.emails?.[0]?.value ?? '',
        role: { id: 4 },
        isActive: true,
      });
      user = await this.userRepo.save(user);
    }

    return {
      id: user.id,
      role: user.role?.name ?? 'user',
    };
  }

  async login(email: string, password: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email }, relations: ['role'] });
    if (!user || !user.isActive) throw new NotFoundException('User not found or inactive');
    if (!user.password) throw new BadRequestException('User password not set');
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new BadRequestException('Invalid email or password');
    return user;
  }

  async register(name: string, email: string, password: string): Promise<User> {
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) throw new BadRequestException('User with this email already exist');
    const hashedPassword = await hashPassword(password);
    const newUser = this.userRepo.create({
      name,
      email,
      password: hashedPassword,
      isActive: true,
      role: { id: 4 },
    });
    const saved = await this.userRepo.save(newUser);

    const userWithRole = await this.userRepo.findOne({
      where: { id: saved.id },
      relations: ['role'],
    });

    if (!userWithRole) {
      throw new InternalServerErrorException('Failed to load user after registration');
    }
    return userWithRole;
  }

  async deleteAccount(
    currentUserId: number,
    targetedUserId: number,
  ): Promise<AccountDeletionResponse> {
    if (currentUserId === targetedUserId)
      throw new BadRequestException('You cannot delete your own account');

    const existingUser = await this.userRepo.findOne({
      where: { id: targetedUserId, isActive: true },
      relations: ['role'],
    });

    if (!existingUser) throw new NotFoundException('User Not found');
    if ([ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(existingUser.role!.name)) {
      throw new ForbiddenException('Forbidden: Insufficient role');
    }
    existingUser.isActive = false;
    await this.userRepo.save(existingUser);
    return { id: targetedUserId, deleted: true };
  }

  async updateProfile(userId: number, bodyDto: UpdateProfileDto): Promise<User> {
    const { name, email, password } = bodyDto;
    const user = await this.userRepo.findOne({ where: { id: userId, isActive: true } });
    if (!user) throw new NotFoundException('User not found');
    if (email && email !== user?.email) {
      const existingEmailUser = await this.userRepo.findOne({ where: { email } });
      if (existingEmailUser) throw new BadRequestException('User with this email already exists');
      user.email = email;
    }

    if (name) user.name = name.trim();
    if (password) {
      user.password = await hashPassword(password);
    }

    const updatedUser = await this.userRepo.save(user);
    return updatedUser;
  }

  async getUserById(currentAdmin: JwtPayload, userId: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: userId, isActive: true },
      relations: ['role'],
    });

    if (!user) throw new NotFoundException('User not found');
    const targetRole = user.role?.name as string;
    if (
      currentAdmin.role === ROLES.ADMIN &&
      currentAdmin.id !== userId &&
      [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(targetRole)
    ) {
      throw new ForbiddenException('Forbidden: Insufficient role to access this user');
    }
    return user;
  }
}
