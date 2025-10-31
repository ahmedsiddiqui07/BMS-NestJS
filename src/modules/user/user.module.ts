import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from 'src/database/entities/role.entity';
import { Message } from '../message/entities/message.entity';
import { Borrow } from '../borrow/entities/borrow.entity';
import { BookRequest } from '../bookRequest/entities/bookRequest.entity';
import { Chat } from '../chat/entities/chat.entity';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Message, Borrow, BookRequest, Chat])],
  controllers: [UserController],
  providers: [UserService, AuthService, JwtService],
  exports: [UserService],
})
export class UserModule {}
