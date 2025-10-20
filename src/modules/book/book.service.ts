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

  async updateBook({ id, updateBookDto, role }: UpdateBookInput): Promise<Book> {
    const { author, is_active, is_available, stock, title } = updateBookDto;
    const existingBook = await this.getBookById(id);
    if (role === ROLES.LIBRARIAN) {
      if (title !== undefined || author !== undefined || is_active !== undefined) {
        throw new ForbiddenException('Forbidden: Insufficient Role');
      }
      existingBook.stock = stock ?? existingBook.stock;
      existingBook.isAvailable = is_available ?? existingBook.isAvailable;
    } else if ([ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(role)) {
      existingBook.title = title ?? existingBook.title;
      existingBook.author = author ?? existingBook.author;
      existingBook.stock = stock ?? existingBook.stock;
      existingBook.isAvailable = is_available ?? existingBook.isAvailable;
      existingBook.isActive = is_active ?? existingBook.isActive;
    } else {
      throw new ForbiddenException('Forbidden: Insufficient Role');
    }
    const book = await this.bookRepo.save(existingBook);

    return book;
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
