import { BaseEntity } from 'src/common/entities/base.entity';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'messages' })
export class Message extends BaseEntity {
  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'is_read', default: false, type: 'boolean' })
  isRead: boolean;

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chatId: Chat;

  @ManyToOne(() => User, (user) => user.sentMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  senderId: User;
}
