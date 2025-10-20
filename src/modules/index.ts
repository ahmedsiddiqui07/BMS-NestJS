import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookModule } from './book/book.module';
import { BorrowModule } from './borrow/borrow.module';
import { MessageModule } from './message/message.module';
import { ChatModule } from './chat/chat.module';
import { BookRequestModule } from './bookRequest/book-request.module';
import { DatabaseModule } from 'src/database/database.module';

export const FeatureModules = [
  AuthModule,
  UserModule,
  BookModule,
  BorrowModule,
  MessageModule,
  ChatModule,
  BookRequestModule,
  DatabaseModule,
];
