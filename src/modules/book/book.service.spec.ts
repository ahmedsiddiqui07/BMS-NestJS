/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { BookService } from './book.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ROLES } from 'src/common/constants/constant';

describe('BookService', () => {
  let service: BookService;
  let bookRepo: jest.Mocked<Repository<Book>>;

  const mockBookRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockQueryRunner = {
    manager: {
      findOne: jest.fn(),
      save: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: getRepositoryToken(Book),
          useValue: mockBookRepo,
        },
      ],
    }).compile();

    service = module.get<BookService>(BookService);
    bookRepo = module.get(getRepositoryToken(Book));
    jest.clearAllMocks();
  });

  describe('createBook', () => {
    it('Should create a new book', async () => {
      console.log('\n🟡 TEST: Create Book');

      const dto = { title: 'Test', author: 'Author', stock: 5 };
      console.log('📥 Incoming:', dto);

      const savedBook = { id: 1, ...dto, isActive: true, isAvailable: true };

      bookRepo.findOne.mockResolvedValue(null);
      bookRepo.create.mockReturnValue(savedBook as Book);
      bookRepo.save.mockResolvedValue(savedBook as Book);

      const result = await service.createBook(dto);

      console.log('📌 Repo Calls:', bookRepo.save.mock.calls);
      console.log('📤 Outgoing:', result);

      expect(result).toEqual(expect.objectContaining({ title: dto.title, isActive: true }));
      expect(bookRepo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if book already exists', async () => {
      console.log('\n🟡 TEST: Create Book Conflict Case');

      bookRepo.findOne.mockResolvedValue({ id: 1 } as Book);
      await expect(
        service.createBook({ title: 'Test', author: 'Author', stock: 5 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getBookById', () => {
    it('should return a book', async () => {
      console.log('\n🟡 TEST: Get Book By Id');

      const book = { id: 1, title: 'Test', isActive: true };
      bookRepo.findOne.mockResolvedValue(book as Book);

      const result = await service.getBookById(1);

      console.log('📌 Repo Calls:', bookRepo.findOne.mock.calls);
      console.log('📤 Outgoing:', result);

      expect(result).toHaveProperty('id', 1);
    });

    it('should throw NotFoundException if book not found', async () => {
      console.log('\n🟡 TEST: Get Book Not Found Case');

      bookRepo.findOne.mockResolvedValue(null);
      await expect(service.getBookById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBook', () => {
    const existingBook = {
      id: 1,
      title: 'Old',
      author: 'Old Author',
      stock: 5,
      isActive: true,
      isAvailable: true,
    };

    beforeEach(() => {
      jest.spyOn(service, 'getBookById').mockResolvedValue({ ...existingBook } as Book);
      bookRepo.save.mockImplementation((updatedBook) => Promise.resolve(updatedBook as Book));
    });

    it('should allow LIBRARIAN to update only stock/isAvailable', async () => {
      console.log('\n🟡 TEST: Librarian Allowed Update');
      const dto = { stock: 10 };
      console.log('📥 Incoming:', dto);

      const result = await service.updateBook({ id: 1, updateBookDto: dto, role: ROLES.LIBRARIAN });

      console.log('📌 Repo Calls:', bookRepo.save.mock.calls);
      console.log('📤 Outgoing:', result);

      expect(result).toEqual(expect.objectContaining({ stock: 10 }));
      expect(result).not.toHaveProperty('title', 'New');
    });

    it('should forbid LIBRARIAN from updating restricted fields', async () => {
      console.log('\n🟡 TEST: Librarian Forbidden Update');
      await expect(
        service.updateBook({ id: 1, updateBookDto: { title: 'x' }, role: ROLES.LIBRARIAN }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to update all fields', async () => {
      console.log('\n🟡 TEST: Admin Full Update');
      const dto = { title: 'New', author: 'New A', stock: 8, is_available: true, is_active: false };
      console.log('📥 Incoming:', dto);

      const result = await service.updateBook({ id: 1, updateBookDto: dto, role: ROLES.ADMIN });

      console.log('📌 Repo Calls:', bookRepo.save.mock.calls);
      console.log('📤 Outgoing:', result);

      expect(result).toEqual(expect.objectContaining({ title: 'New', stock: 8, isActive: false }));
    });

    it('should forbid USER role', async () => {
      console.log('\n🟡 TEST: User Forbidden Update');

      await expect(
        service.updateBook({ id: 1, updateBookDto: {}, role: ROLES.USER }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ✅ UPDATE STOCK TESTS
  describe('updateStock', () => {
    it('should increase stock', async () => {
      console.log('\n🟡 TEST: Increase Stock');

      const book = { id: 1, stock: 2 };
      mockQueryRunner.manager.findOne.mockResolvedValue(book);

      const result = await service.updateStock(1, 'increase', mockQueryRunner as any);
      console.log('📤 Outgoing:', result);

      expect(result.stock).toBe(3);
    });

    it('should decrease stock', async () => {
      console.log('\n🟡 TEST: Decrease Stock');

      const book = { id: 1, stock: 2 };
      mockQueryRunner.manager.findOne.mockResolvedValue(book);

      const result = await service.updateStock(1, 'decrease', mockQueryRunner as any);
      console.log('📤 Outgoing:', result);

      expect(result.stock).toBe(1);
    });

    it('should throw if decreasing below 0', async () => {
      console.log('\n🟡 TEST: Decrease Stock Error');

      const book = { id: 1, stock: 0 };
      mockQueryRunner.manager.findOne.mockResolvedValue(book);

      await expect(service.updateStock(1, 'decrease', mockQueryRunner as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if book not found', async () => {
      console.log('\n🟡 TEST: Stock Book Not Found');

      mockQueryRunner.manager.findOne.mockResolvedValue(null);
      await expect(service.updateStock(1, 'increase', mockQueryRunner as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
