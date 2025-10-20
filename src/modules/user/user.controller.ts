import { Body, Controller, Delete, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { PositiveIntPipe } from 'src/common/pipes/positive-int.pipe';
import type { RequestWithUser } from 'src/common/types/interface';
import { UpdateProfileDto } from './dto/update.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { ROLES } from 'src/common/constants/constant';
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async updateProfile(@Req() req: RequestWithUser, @Body() updateProfileDto: UpdateProfileDto) {
    const result = await this.userService.updateProfile(req.user.id, updateProfileDto);
    return {
      message: 'Profile updated Successfully',
      result,
    };
  }

  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async getUserById(@Req() req: RequestWithUser, @Param('id', PositiveIntPipe) id: number) {
    const result = await this.userService.getUserById(req.user, id);
    return {
      message: 'User fetched successfully',
      result,
    };
  }

  // @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Get()
  // async getAllUsers(
  //   @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  //   @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  //   @Query('search') search?: string,
  // ) {
  //   const result = await this.userService.getAllUsers({ page, limit, search: search || '' });
  //   return {
  //     message: 'Users fetched successfully',
  //     pagination: { page, limit },
  //     result,
  //   };
  // }
}
