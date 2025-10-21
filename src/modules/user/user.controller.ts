import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
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
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Roles(ROLES.USER)
  @Patch('/')
  async updateProfile(@Req() req: RequestWithUser, @Body() updateProfileDto: UpdateProfileDto) {
    try {
      const result = await this.userService.updateProfile(req.user.id, updateProfileDto);
      return {
        message: 'Profile updated Successfully',
        result,
      };
    } catch (err) {
      console.log('Error in update profile Api', err);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Get(':id')
  async getUserById(@Req() req: RequestWithUser, @Param('id', PositiveIntPipe) id: number) {
    try {
      const result = await this.userService.getUserById(req.user, id);
      return {
        message: 'User fetched successfully',
        result,
      };
    } catch (err) {
      console.log('Error in get user by id Api', err);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
