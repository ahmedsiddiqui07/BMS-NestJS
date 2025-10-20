import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayload } from '../auth/types/interface';
import { UserService } from '../user/user.service';
import { allowedPairs } from 'src/common/constants/constant';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
    private readonly userService: UserService,
  ) {}

  async createChat(currentUser: JwtPayload, toId: number): Promise<Chat> {
    const fromId = currentUser.id;
    if (fromId === toId)
      throw new ForbiddenException('Forbidden: Cannot create chat with yourself');

    const user = await this.userService.validateUser(toId);
    const fromRole = currentUser.role;
    const toRole = user.role?.name;
    if (!allowedPairs.some(([a, b]) => fromRole === a && toRole === b)) {
      throw new ForbiddenException('Chat not allowed');
    }
    const existingChat = await this.chatRepo.findOne({
      where: [
        { fromId: { id: fromId }, toId: { id: toId } },
        { fromId: { id: toId }, toId: { id: fromId } },
      ],
      relations: ['fromId', 'toId'],
    });
    if (existingChat) throw new BadRequestException('Chat already exists');

    const chat = this.chatRepo.create({
      fromId: { id: fromId },
      toId: { id: toId },
    });
    await this.chatRepo.save(chat);
    return chat;
  }

  async getChatById(userId: number, chatId: number) {
    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
      relations: ['fromId', 'toId'],
    });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    const isParticipant = chat.fromId.id === userId || chat.toId.id === userId;
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    return chat;
  }
}
