import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Render,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import type { RequestWithUser } from 'src/common/types/interface';
import { UpdateProfileDto } from './dto/update.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { ROLES } from 'src/common/constants/constant';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('web/profile')
  @Render('users/profile')
  async getProfile(@Req() req: Request) {
    try {
      const token = req.cookies?.['access_token'] as string;
      if (!token) {
        throw new Error('No token found');
      }
      const payload = await this.authService.verifyToken(token);
      const user = await this.userService.validateUser(payload.id);

      return {
        title: 'User Profile',
        user,
      };
    } catch (err) {
      console.error('Profile error:', err);
      throw err;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Delete(':id')
  async deleteAccount(@Req() req: RequestWithUser, @Param('id', PositiveIntPipe) id: number) {
    const userId = req.user.id;
    const targetId = id;
    const result = await this.userService.deleteAccount(userId, targetId);
    return {
      message: 'Account Deleted Successfully',
      result,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.USER)
  @Patch('/')
  async updateProfile(@Req() req: RequestWithUser, @Body() updateProfileDto: UpdateProfileDto) {
    const result = await this.userService.updateProfile(req.user.id, updateProfileDto);
    return {
      message: 'Profile updated Successfully',
      result,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Get(':id')
  async getUserById(@Req() req: RequestWithUser, @Param('id', PositiveIntPipe) id: number) {
    const result = await this.userService.getUserById(req.user, id);
    return {
      message: 'User fetched successfully',
      result,
    };
  }
}
