import { Module } from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { BorrowController } from './borrow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../book/entities/book.entity';
import { Borrow } from './entities/borrow.entity';
import { Fine } from 'src/database/entities/fine.entity';
import { BookService } from '../book/book.service';
import { BookRequestService } from '../bookRequest/book-request.service';
import { BookRequest } from '../bookRequest/entities/bookRequest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Borrow, Book, Fine, BookRequest])],
  controllers: [BorrowController],
  providers: [BorrowService, BookService, BookRequestService],
})
export class BorrowModule {}
