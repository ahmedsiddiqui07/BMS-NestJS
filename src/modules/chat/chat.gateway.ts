import { Logger, Injectable, Inject, forwardRef } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../message/message.service';
import { SendMessageDto } from '../message/dto/send.dto';
import { AuthService } from '../auth/auth.service';
import { ChatService } from './chat.service';
import { ChatEvents } from 'src/common/constants/enum/chat.enum';

@WebSocketGateway({
  cors: true,
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);
  private readonly userSockets = new Map<number, Set<string>>();

  constructor(
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    const raw =
      (client.handshake?.auth?.token as string) || client.handshake?.headers?.authorization || '';

    const token = typeof raw === 'string' ? raw.replace(/^Bearer\s+/i, '').trim() : null;

    if (!token) {
      this.logger.warn(`Missing token for socket: ${client.id}`);
      client.emit(ChatEvents.ERROR, 'Missing auth token');
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.authService.verifyToken(token);
      client.data.user = payload;
      const userId = payload.id;
      const set = this.userSockets.get(userId) ?? new Set<string>();
      console.log('before set', set);
      set.add(client.id);
      console.log('after set', set);
      this.userSockets.set(userId, set);
      console.log('userset', this.userSockets);
      this.logger.log(`User ${userId} connected (${client.id})`);
    } catch (error) {
      this.logger.error(`Invalid token for socket: ${client.id} | ${error.message}`);
      client.emit(ChatEvents.ERROR, 'Unauthorized: Invalid token');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.user?.id as number;
    if (!userId) {
      this.logger.error(`[Gateway] Missing User Id`);
      return;
    }
    const set = this.userSockets.get(userId);
    console.log('before set', set);
    if (!set) return;
    set.delete(client.id);
    console.log('after set', set);
    if (set.size === 0) this.userSockets.delete(userId);
    else this.userSockets.set(userId, set);
    this.logger.log(`User ${userId} disconnected (${client.id})`);
  }

  emitToUser(userId: number, event: string, payload: any) {
    const set = this.userSockets.get(userId);
    if (!set) {
      this.logger.warn(`[Gateway] No active sockets for user ${userId}`);
      return;
    }
    for (const sid of set) {
      this.server.to(sid).emit(event, payload);
    }
  }
  emitToRoom(roomId: string, event: string, payload: any) {
    console.log(`[Gateway] emitToRoom -> ${event} for room ${roomId}`);
    this.server.to(roomId).emit(event, payload);
  }
  @SubscribeMessage(ChatEvents.JOIN_ROOM)
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId: number },
  ) {
    const user = client.data.user as { id: number };
    if (!user?.id || !payload.chatId) {
      this.logger.error('[Gateway] Missing user or chatId');
      client.emit(ChatEvents.ERROR, 'Invalid joinRoom data');
      return;
    }
    await this.chatService.getChatById(user.id, payload.chatId);
    const roomId = `chat_${payload.chatId}`;
    await client.join(roomId);
    this.logger.log(`User ${user.id} joined ${roomId}`);
    client.emit(ChatEvents.JOINED_ROOM, { chatId: payload.chatId });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() dto: SendMessageDto) {
    try {
      const sender = client.data.user as { id: number };
      if (!sender?.id) {
        this.logger.error('[Gateway] Missing sender ID');
        client.emit(ChatEvents.ERROR, 'Unauthorized socket');
        return;
      }
      const message = await this.messageService.sendMessage(sender.id, dto);
      const roomId = `chat_${dto.chatId}`;
      this.server.to(roomId).emit(ChatEvents.NEW_MESSAGE, message);
      this.logger.log(`User ${sender.id} sent message to ${roomId}`);
    } catch (error: any) {
      this.logger.error('Error sending message', error.stack);
      client.emit(ChatEvents.ERROR, error.message);
    }
  }
}
