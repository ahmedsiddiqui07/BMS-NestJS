import { Body, Controller, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import type { RequestWithUser } from 'src/common/types/interface';
import { SendMessageDto } from './dto/send.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { ROLES } from 'src/common/constants/constant';
import { UpdateMessageDto } from './dto/update.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Roles(ROLES.USER, ROLES.LIBRARIAN)
  @Post('/')
  async sendMessage(@Req() req: RequestWithUser, @Body() sendMessageDto: SendMessageDto) {
    const senderId = req.user.id;
    const result = await this.messageService.sendMessage(senderId, sendMessageDto);
    return {
      message: 'Message Sent successfully',
      result,
    };
  }

  @Roles(ROLES.USER, ROLES.LIBRARIAN)
  @Patch('/:id')
  async updateMessage(
    @Req() req: RequestWithUser,
    @Body() updateMessageDto: UpdateMessageDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const senderId = req.user.id;
    const messageId = id;
    const { message } = updateMessageDto;
    const result = await this.messageService.updateMessage({
      senderId,
      messageId,
      message,
    });

    return {
      message: 'Message Updated Successfully',
      result,
    };
  }
}
