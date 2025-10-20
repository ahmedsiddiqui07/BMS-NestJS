import { BaseEntity } from 'src/common/entities/base.entity';
import { Role } from 'src/database/entities/role.entity';
import { BookRequest } from 'src/modules/bookRequest/entities/bookRequest.entity';
import { Borrow } from 'src/modules/borrow/entities/borrow.entity';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { Message } from 'src/modules/message/entities/message.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ length: 50 })
  name: string;

  @Column({ length: 50, unique: true })
  email: string;

  @Column({ length: 100, nullable: true })
  password?: string;

  @ManyToOne(() => Role, (role) => role.users, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'provider_id', length: 255, nullable: true })
  providerId?: string;

  @Column({ name: 'oauth_provider', length: 255, nullable: true })
  oauthProvider?: string;

  @OneToMany(() => Borrow, (borrow) => borrow.user)
  borrows: Borrow[];

  @OneToMany(() => BookRequest, (bookRequest) => bookRequest.user)
  bookRequests: BookRequest[];

  @OneToMany(() => Message, (message) => message.senderId)
  sentMessages: Message[];

  @OneToMany(() => Chat, (chat) => chat.fromId)
  sentChats: Chat[];

  @OneToMany(() => Chat, (chat) => chat.toId)
  receivedChats: Chat[];
}
