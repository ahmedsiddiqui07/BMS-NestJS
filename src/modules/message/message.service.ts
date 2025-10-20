import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { SendMessageDto } from './dto/send.dto';
import { UpdateMessageInput } from './types/interface';
import { ChatService } from '../chat/chat.service';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatEvents } from 'src/common/constants/enum/chat.enum';
@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
    private readonly chatService: ChatService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  async sendMessage(senderId: number, bodyDto: SendMessageDto): Promise<Message> {
    const { chatId, message } = bodyDto;
    const chat = await this.chatService.getChatById(senderId, chatId);
    const newMessage = this.messageRepo.create({
      chatId: { id: chat.id },
      senderId: { id: senderId },
      message,
      isRead: false,
    });
    await this.messageRepo.save(newMessage);
    const receiverId = chat.fromId.id === senderId ? chat.toId.id : chat.fromId.id;
    this.chatGateway.emitToUser(receiverId, ChatEvents.RECEIVE_MESSAGE, newMessage);
    this.chatGateway.emitToUser(senderId, ChatEvents.MESSAGE_SENT, newMessage);
    this.chatGateway.emitToRoom(`chat_${chat.id}`, ChatEvents.NEW_MESSAGE, newMessage);
    return newMessage;
  }

  async updateMessage({ senderId, messageId, message }: UpdateMessageInput): Promise<Message> {
    const existingMessage = await this.getMessageById(messageId, senderId);
    existingMessage.message = message;
    existingMessage.updatedAt = new Date();
    const updatedMessage = await this.messageRepo.save(existingMessage);
    this.chatGateway.emitToRoom(
      `chat_${existingMessage.chatId.id}`,
      ChatEvents.MESSAGE_UPDATED,
      updatedMessage,
    );
    return updatedMessage;
  }

  async getMessageById(messageId: number, senderId: number): Promise<Message> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId, senderId: { id: senderId } },
      relations: ['senderId'],
    });

    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId.id !== senderId) {
      throw new ForbiddenException('Forbidden: You cannot edit this message');
    }

    return message;
  }
}
