import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Borrow } from '../borrow/entities/borrow.entity';
import { BookRequest } from '../bookRequest/entities/bookRequest.entity';
import { BookController } from './book.controller';
import { Book } from './entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Borrow, BookRequest, Book])],
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
