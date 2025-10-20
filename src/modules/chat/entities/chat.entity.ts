import { BaseEntity } from 'src/common/entities/base.entity';
import { Message } from 'src/modules/message/entities/message.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'chats' })
export class Chat extends BaseEntity {
  @ManyToOne(() => User, (user) => user.sentChats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'from_id' })
  fromId: User;

  @ManyToOne(() => User, (user) => user.receivedChats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to_id' })
  toId: User;

  @OneToMany(() => Message, (message) => message.chatId)
  messages: Message[];
}
