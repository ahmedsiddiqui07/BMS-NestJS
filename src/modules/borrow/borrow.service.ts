import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Borrow } from './entities/borrow.entity';
import { DataSource, Repository } from 'typeorm';
import { BookRequestService } from '../bookRequest/book-request.service';
import { BookService } from '../book/book.service';
import { Fine } from 'src/database/entities/fine.entity';
import { finePerDay, msPerDay, ReturnDays } from 'src/common/constants/constant';
import { BorrowStatus } from 'src/common/constants/enum/borrow-status.enum';

@Injectable()
export class BorrowService {
  constructor(
    @InjectRepository(Borrow) private readonly borrowRepo: Repository<Borrow>,
    @InjectRepository(Fine) private readonly fineRepo: Repository<Fine>,
    private readonly dataSource: DataSource,
    private readonly bookService: BookService,
    private readonly bookRequestService: BookRequestService,
  ) {}

  async borrowBook(userId: number, bookId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const book = await this.bookService.getBookById(bookId);
      if (book.stock > 0) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + ReturnDays);
        const borrow = queryRunner.manager.create(Borrow, {
          user: { id: userId },
          book: { id: bookId },
          dueDate,
          status: BorrowStatus.BORROWED,
        });
        const savedBorrow = await queryRunner.manager.save(borrow);
        await this.bookService.updateStock(bookId, 'decrease', queryRunner);

        await queryRunner.commitTransaction();
        return { type: 'borrowed', borrowedBook: savedBorrow };
      }
      await this.bookRequestService.createBookRequest(userId, bookId, book.title, queryRunner);

      await queryRunner.commitTransaction();
      return { type: 'requested' };
    } catch (error) {
      console.log('Error in borrow book api', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async returnBook(userId: number, bookId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const borrowRecord = await queryRunner.manager.findOne(Borrow, {
        where: { user: { id: userId }, book: { id: bookId }, status: BorrowStatus.BORROWED },
        relations: ['book'],
      });

      if (!borrowRecord) throw new NotFoundException('Borrow record not found');
      const returnDate = new Date();
      let newStatus: BorrowStatus = BorrowStatus.RETURNED;
      if (returnDate > borrowRecord.dueDate) {
        newStatus = BorrowStatus.LATE;
        const daysLate = Math.ceil(
          (returnDate.getTime() - borrowRecord.dueDate.getTime()) / msPerDay,
        );
        const fineAmount = daysLate * finePerDay;
        const fine = queryRunner.manager.create(Fine, {
          borrow: { id: borrowRecord.id },
          amount: fineAmount,
          status: 'unpaid',
        });

        await queryRunner.manager.save(fine);
      }

      borrowRecord.returnDate = returnDate;
      borrowRecord.status = newStatus;
      await queryRunner.manager.save(borrowRecord);

      await this.bookService.updateStock(bookId, 'increase', queryRunner);

      await queryRunner.commitTransaction();
      return borrowRecord;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getBorrowById(id: number) {
    const borrow = await this.borrowRepo.findOne({ where: { id }, relations: ['book', 'user'] });
    if (!borrow) throw new NotFoundException('Borrow Record not found');
    return borrow;
  }
}
