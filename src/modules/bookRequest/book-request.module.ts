import { Module } from '@nestjs/common';
import { BookRequestService } from './book-request.service';
import { BookRequestController } from './book-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookRequest } from './entities/bookRequest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookRequest])],
  controllers: [BookRequestController],
  providers: [BookRequestService],
})
export class BookRequestModule {}
