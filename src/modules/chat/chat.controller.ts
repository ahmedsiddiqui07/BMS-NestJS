import { Controller, Post, Get, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import type { RequestWithUser } from 'src/common/types/interface';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { ROLES } from 'src/common/constants/constant';

@Controller('chats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post(':id')
  @Roles(ROLES.LIBRARIAN, ROLES.USER)
  async createChat(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    const result = await this.chatService.createChat(req.user, id);
    return {
      message: 'Chat created successfully',
      result,
    };
  }

  @Get(':id')
  @Roles(ROLES.LIBRARIAN, ROLES.USER)
  async getChatById(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    const currentUser = req.user;
    const result = await this.chatService.getChatById(currentUser.id, id);
    return {
      message: 'Chat fetched successfully',
      result,
    };
  }
}
