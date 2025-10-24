import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateBookDto } from './dto/create.dto';
import { UpdateBookInput } from './types/interface';
import { ROLES } from 'src/common/constants/constant';

@Injectable()
export class BookService {
  constructor(@InjectRepository(Book) private readonly bookRepo: Repository<Book>) {}

  async createBook({ title, author, stock }: CreateBookDto): Promise<Book> {
    const existingBook = await this.bookRepo.findOne({
      where: { title, author, isActive: true },
    });
    if (existingBook) {
      throw new ConflictException('Book with this title already exists');
    }
    const newBook = this.bookRepo.create({
      title,
      author,
      stock,
      isActive: true,
      isAvailable: true,
    });
    const book = await this.bookRepo.save(newBook);
    return book;
  }

  async updateBook({ id, updateBookDto, role }: UpdateBookInput) {
    const book = await this.getBookById(id);

    if (role === ROLES.LIBRARIAN) {
      if (updateBookDto.title || updateBookDto.author || updateBookDto.is_active) {
        throw new ForbiddenException('Librarian cannot update restricted fields');
      }

      if (updateBookDto.stock !== undefined) book.stock = updateBookDto.stock;
      if (updateBookDto.is_available !== undefined) book.isAvailable = updateBookDto.is_available;
    }

    if (role === ROLES.ADMIN) {
      if (updateBookDto.title !== undefined) book.title = updateBookDto.title;
      if (updateBookDto.author !== undefined) book.author = updateBookDto.author;
      if (updateBookDto.stock !== undefined) book.stock = updateBookDto.stock;
      if (updateBookDto.is_available !== undefined) book.isAvailable = updateBookDto.is_available;
      if (updateBookDto.is_active !== undefined) book.isActive = updateBookDto.is_active;
    }

    if (role === ROLES.USER) {
      throw new ForbiddenException('User cannot update');
    }
    return await this.bookRepo.save(book);
  }

  async getBookById(id: number): Promise<Book> {
    const book = await this.bookRepo.findOne({ where: { id, isActive: true } });
    if (!book) {
      throw new NotFoundException('Book Not found');
    }
    return book;
  }

  async updateStock(bookId: number, action: 'increase' | 'decrease', queryRunner: QueryRunner) {
    const book = await queryRunner.manager.findOne(Book, { where: { id: bookId } });
    if (!book) throw new NotFoundException('Book not found');

    if (action === 'decrease') {
      if (book.stock <= 0) throw new BadRequestException('Book out of stock');
      book.stock -= 1;
    } else if (action === 'increase') {
      book.stock += 1;
    }
    await queryRunner.manager.save(book);
    return book;
  }
}
