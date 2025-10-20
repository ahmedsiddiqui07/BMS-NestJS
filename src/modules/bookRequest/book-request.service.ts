import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookRequest } from './entities/bookRequest.entity';
import { QueryRunner, Repository } from 'typeorm';
import { RequestStatus } from 'src/common/constants/enum/req-status.enum';

@Injectable()
export class BookRequestService {
  constructor(
    @InjectRepository(BookRequest) private readonly bookRequestRepo: Repository<BookRequest>,
  ) {}

  async createBookRequest(
    userId: number,
    bookId: number,
    title: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const request = queryRunner.manager.create(BookRequest, {
      user: { id: userId },
      book: { id: bookId },
      title,
    });
    await queryRunner.manager.save(request);
  }
  async updateBookRequest(id: number, status: RequestStatus): Promise<Partial<BookRequest>> {
    const existing = await this.bookRequestRepo.findOne({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Book request not found');
    }

    existing.status = status;
    existing.updatedAt = new Date();

    const updated = await this.bookRequestRepo.save(existing);
    return {
      id: updated.id,
      title: updated.title,
      status: updated.status,
      updatedAt: updated.updatedAt,
    };
  }
  async getBookRequestById(id: number): Promise<BookRequest> {
    const bookRequest = await this.bookRequestRepo.findOne({
      where: { id },
      relations: ['user', 'book'],
    });

    if (!bookRequest) {
      throw new NotFoundException('Book request not found');
    }

    return bookRequest;
  }
}
